-- Create RPC function to get comprehensive company monthly metrics
-- Date: 2025-11-02

CREATE OR REPLACE FUNCTION get_company_monthly_metrics(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH company_stats AS (
    SELECT
      c.name AS company_name,
      c.employee_seats,
      c.sessions_allocated,
      c.sessions_used,
      -- Active employees (have profile with company_id and role 'user')
      (SELECT COUNT(*) 
       FROM profiles 
       WHERE company_id = p_company_id 
         AND is_active = true 
         AND role = 'user') AS active_employees,
      -- Pending invites
      (SELECT COUNT(*) 
       FROM invites 
       WHERE company_id = p_company_id 
         AND status = 'pending') AS pending_invites
    FROM companies c
    WHERE c.id = p_company_id
  ),
  pillar_usage AS (
    SELECT
      b.pillar,
      COUNT(*) AS session_count
    FROM bookings b
    WHERE b.company_id = p_company_id
      AND b.status = 'completed'
      AND b.booking_date BETWEEN p_start_date AND p_end_date
    GROUP BY b.pillar
  ),
  satisfaction_metrics AS (
    SELECT
      AVG(b.rating)::NUMERIC(3,2) AS avg_rating,
      COUNT(CASE WHEN b.rating >= 8 THEN 1 END) AS high_satisfaction_count,
      COUNT(*) AS rated_sessions
    FROM bookings b
    WHERE b.company_id = p_company_id
      AND b.status = 'completed'
      AND b.rating IS NOT NULL
      AND b.booking_date BETWEEN p_start_date AND p_end_date
  ),
  top_pillar AS (
    SELECT pillar, session_count
    FROM pillar_usage
    ORDER BY session_count DESC
    LIMIT 1
  ),
  sessions_in_period AS (
    SELECT COUNT(*) AS period_sessions_used
    FROM bookings b
    WHERE b.company_id = p_company_id
      AND b.status = 'completed'
      AND b.booking_date BETWEEN p_start_date AND p_end_date
  )
  SELECT json_build_object(
    'company_name', cs.company_name,
    'date_range', json_build_object(
      'start', p_start_date,
      'end', p_end_date
    ),
    'subscription', json_build_object(
      'employee_seats', cs.employee_seats,
      'sessions_allocated', cs.sessions_allocated,
      'sessions_used', cs.sessions_used,
      'period_sessions_used', (SELECT period_sessions_used FROM sessions_in_period),
      'utilization_rate', 
        CASE WHEN cs.sessions_allocated > 0 
          THEN ROUND((cs.sessions_used::NUMERIC / cs.sessions_allocated) * 100, 2)
          ELSE 0 
        END
    ),
    'employees', json_build_object(
      'active', cs.active_employees,
      'pending_invites', cs.pending_invites,
      'total', cs.active_employees + cs.pending_invites,
      'seats_available', cs.employee_seats - (cs.active_employees + cs.pending_invites)
    ),
    'pillar_breakdown', COALESCE((
      SELECT json_agg(json_build_object(
        'pillar', pillar,
        'sessions', session_count,
        'percentage', ROUND((session_count::NUMERIC / NULLIF((SELECT period_sessions_used FROM sessions_in_period), 0)) * 100, 2)
      ))
      FROM pillar_usage
    ), '[]'::json),
    'top_pillar', json_build_object(
      'name', COALESCE((SELECT pillar FROM top_pillar), 'N/A'),
      'sessions', COALESCE((SELECT session_count FROM top_pillar), 0)
    ),
    'satisfaction', json_build_object(
      'avg_rating', COALESCE(sm.avg_rating, 0),
      'high_satisfaction_count', sm.high_satisfaction_count,
      'rated_sessions', sm.rated_sessions,
      'satisfaction_rate', 
        CASE WHEN sm.rated_sessions > 0
          THEN ROUND((sm.high_satisfaction_count::NUMERIC / sm.rated_sessions) * 100, 2)
          ELSE 0
        END
    )
  ) INTO result
  FROM company_stats cs, satisfaction_metrics sm;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_company_monthly_metrics(UUID, DATE, DATE) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_company_monthly_metrics IS 'Get comprehensive monthly metrics for a company including utilization, employees, pillar breakdown, and satisfaction';

