-- Create RPC functions for tracking specialist and provider performance
-- Date: 2025-11-02

-- Get Especialista Geral performance metrics
CREATE OR REPLACE FUNCTION get_specialist_performance(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  specialist_id UUID,
  specialist_name TEXT,
  specialist_email TEXT,
  total_cases BIGINT,
  resolved_cases BIGINT,
  referred_cases BIGINT,
  avg_satisfaction_rating NUMERIC,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS specialist_id,
    p.name AS specialist_name,
    p.email AS specialist_email,
    COUNT(cs.id)::BIGINT AS total_cases,
    COUNT(CASE WHEN cs.status = 'resolved' AND cs.session_booked_by_specialist IS NULL THEN 1 END)::BIGINT AS resolved_cases,
    COUNT(CASE WHEN cs.session_booked_by_specialist IS NOT NULL THEN 1 END)::BIGINT AS referred_cases,
    AVG(
      CASE 
        WHEN cs.satisfaction_rating = 'satisfied' THEN 10
        WHEN cs.satisfaction_rating = 'neutral' THEN 5
        WHEN cs.satisfaction_rating = 'unsatisfied' THEN 1
        ELSE NULL
      END
    )::NUMERIC(3,2) AS avg_satisfaction_rating,
    p.is_active
  FROM profiles p
  INNER JOIN user_roles ur ON ur.user_id = p.id AND ur.role = 'especialista_geral'
  LEFT JOIN chat_sessions cs ON cs.provider_id = p.id 
    AND cs.created_at::DATE BETWEEN p_start_date AND p_end_date
  GROUP BY p.id, p.name, p.email, p.is_active
  ORDER BY total_cases DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Prestador performance metrics
CREATE OR REPLACE FUNCTION get_prestador_performance(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  provider_id UUID,
  provider_name TEXT,
  provider_email TEXT,
  total_sessions BIGINT,
  completed_sessions BIGINT,
  cancelled_sessions BIGINT,
  avg_rating NUMERIC,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    prest.id AS provider_id,
    prest.name AS provider_name,
    prest.email AS provider_email,
    COUNT(b.id)::BIGINT AS total_sessions,
    COUNT(CASE WHEN b.status = 'completed' THEN 1 END)::BIGINT AS completed_sessions,
    COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END)::BIGINT AS cancelled_sessions,
    AVG(b.rating)::NUMERIC(3,2) AS avg_rating,
    prest.is_active
  FROM prestadores prest
  LEFT JOIN bookings b ON b.prestador_id = prest.id
    AND b.booking_date BETWEEN p_start_date AND p_end_date
  GROUP BY prest.id, prest.name, prest.email, prest.is_active
  ORDER BY completed_sessions DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to admin users only
GRANT EXECUTE ON FUNCTION get_specialist_performance(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_prestador_performance(DATE, DATE) TO authenticated;

-- Add comments
COMMENT ON FUNCTION get_specialist_performance IS 'Get performance metrics for all Especialista Geral users within a date range';
COMMENT ON FUNCTION get_prestador_performance IS 'Get performance metrics for all Prestadores within a date range';


