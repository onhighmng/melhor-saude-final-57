-- Update chat_sessions table with new fields for specialist workflow
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS phone_escalation_reason TEXT,
ADD COLUMN IF NOT EXISTS phone_contact_made BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS session_booked_by_specialist UUID REFERENCES auth.users(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_pillar ON chat_sessions(pillar);

-- Create function to update chat_sessions when call is logged
CREATE OR REPLACE FUNCTION update_chat_session_on_call()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions
  SET 
    phone_contact_made = true,
    status = CASE 
      WHEN NEW.outcome = 'resolved_by_phone' THEN 'resolved'
      WHEN NEW.outcome = 'session_booked' THEN 'resolved'
      ELSE status
    END,
    ended_at = CASE 
      WHEN NEW.outcome IN ('resolved_by_phone', 'session_booked') THEN now()
      ELSE ended_at
    END
  WHERE id = NEW.chat_session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_specialist_call_logged ON specialist_call_logs;
CREATE TRIGGER on_specialist_call_logged
AFTER INSERT OR UPDATE ON specialist_call_logs
FOR EACH ROW
EXECUTE FUNCTION update_chat_session_on_call();

-- Create analytics view for dashboard
CREATE OR REPLACE VIEW specialist_analytics AS
SELECT
  pillar,
  COUNT(*) as total_chats,
  COUNT(*) FILTER (WHERE ai_resolution = true) as ai_resolved,
  COUNT(*) FILTER (WHERE phone_escalation_reason IS NOT NULL) as phone_escalated,
  COUNT(*) FILTER (WHERE session_booked_by_specialist IS NOT NULL) as sessions_booked,
  COUNT(*) FILTER (WHERE satisfaction_rating = 'satisfied') as satisfied_users,
  COUNT(*) FILTER (WHERE satisfaction_rating = 'unsatisfied') as unsatisfied_users,
  DATE_TRUNC('day', created_at) as date
FROM chat_sessions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY pillar, DATE_TRUNC('day', created_at);