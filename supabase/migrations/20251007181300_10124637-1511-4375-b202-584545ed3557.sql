-- Drop the security definer view and recreate without security definer
DROP VIEW IF EXISTS specialist_analytics;

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

-- Grant select on view to authenticated users
GRANT SELECT ON specialist_analytics TO authenticated;