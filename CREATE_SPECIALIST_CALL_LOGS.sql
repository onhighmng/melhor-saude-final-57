-- ========================================
-- CREATE: specialist_call_logs table
-- ========================================

CREATE TABLE IF NOT EXISTS specialist_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  specialist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  call_status TEXT CHECK (call_status IN ('pending', 'completed', 'missed', 'scheduled')),
  call_notes TEXT,
  session_booked BOOLEAN DEFAULT false,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_specialist_call_logs_chat_session 
  ON specialist_call_logs(chat_session_id);

CREATE INDEX IF NOT EXISTS idx_specialist_call_logs_user 
  ON specialist_call_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_specialist_call_logs_specialist 
  ON specialist_call_logs(specialist_id);

CREATE INDEX IF NOT EXISTS idx_specialist_call_logs_status 
  ON specialist_call_logs(call_status);

-- Enable RLS
ALTER TABLE specialist_call_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Specialists can see their own logs
CREATE POLICY "Specialists can view their own call logs"
  ON specialist_call_logs
  FOR SELECT
  USING (
    specialist_id = auth.uid()
    OR auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  );

-- Specialists can insert their own logs
CREATE POLICY "Specialists can create call logs"
  ON specialist_call_logs
  FOR INSERT
  WITH CHECK (
    specialist_id = auth.uid()
    OR auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'prestador'))
  );

-- Specialists can update their own logs
CREATE POLICY "Specialists can update their own call logs"
  ON specialist_call_logs
  FOR UPDATE
  USING (
    specialist_id = auth.uid()
    OR auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  );

-- Users can see logs about themselves
CREATE POLICY "Users can view their own call logs"
  ON specialist_call_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Verify table was created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'specialist_call_logs') as column_count
FROM information_schema.tables 
WHERE table_name = 'specialist_call_logs';




