-- Fix security definer views by adding security_invoker option

-- Drop and recreate specialist_analytics view with security_invoker
DROP VIEW IF EXISTS specialist_analytics CASCADE;

CREATE VIEW specialist_analytics 
WITH (security_invoker = true) AS
SELECT 
  pillar,
  count(*) AS total_chats,
  count(*) FILTER (WHERE ai_resolution = true) AS ai_resolved,
  count(*) FILTER (WHERE phone_escalation_reason IS NOT NULL) AS phone_escalated,
  count(*) FILTER (WHERE session_booked_by_specialist IS NOT NULL) AS sessions_booked,
  count(*) FILTER (WHERE satisfaction_rating = 'satisfied') AS satisfied_users,
  count(*) FILTER (WHERE satisfaction_rating = 'unsatisfied') AS unsatisfied_users,
  date_trunc('day', created_at) AS date
FROM chat_sessions
WHERE created_at >= now() - interval '30 days'
GROUP BY pillar, date_trunc('day', created_at);

-- Drop and recreate user_profile_with_roles view with security_invoker
DROP VIEW IF EXISTS user_profile_with_roles CASCADE;

CREATE VIEW user_profile_with_roles 
WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.role,
  p.company_name,
  p.department,
  p.is_active,
  p.created_at,
  p.updated_at,
  p.company_id,
  array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL) AS roles,
  bool_or(ur.role = 'admin') AS is_admin,
  bool_or(ur.role = 'hr') AS is_hr,
  bool_or(ur.role = 'prestador') AS is_prestador,
  bool_or(ur.role = 'specialist') AS is_specialist,
  bool_or(ur.role = 'user') AS is_user
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
GROUP BY p.id;