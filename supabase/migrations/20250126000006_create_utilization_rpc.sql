-- Create RPC function to calculate platform utilization rate
CREATE OR REPLACE FUNCTION calculate_platform_utilization()
RETURNS TABLE(utilization_rate numeric) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN SUM(sessions_allocated) > 0 
      THEN ROUND((SUM(sessions_used)::numeric / SUM(sessions_allocated)::numeric) * 100, 2)
      ELSE 0
    END as utilization_rate
  FROM companies
  WHERE is_active = true;
END;
$$;

-- Create RPC function to get company session metrics
CREATE OR REPLACE FUNCTION get_company_session_metrics(company_id uuid)
RETURNS TABLE(
  total_sessions integer,
  used_sessions integer,
  remaining_sessions integer,
  utilization_percent numeric,
  monthly_usage jsonb
) 
LANGUAGE plpgsql
AS $$
DECLARE
  monthly_data jsonb;
BEGIN
  -- Get monthly usage data
  SELECT jsonb_agg(jsonb_build_object(
    'month', to_char(created_at, 'YYYY-MM'),
    'count', count(*)
  ))
  INTO monthly_data
  FROM bookings
  WHERE bookings.company_id = get_company_session_metrics.company_id
  AND created_at >= date_trunc('month', current_date - interval '6 months')
  GROUP BY to_char(created_at, 'YYYY-MM')
  ORDER BY to_char(created_at, 'YYYY-MM');

  RETURN QUERY
  SELECT 
    c.sessions_allocated,
    c.sessions_used,
    (c.sessions_allocated - c.sessions_used),
    CASE 
      WHEN c.sessions_allocated > 0 
      THEN ROUND((c.sessions_used::numeric / c.sessions_allocated::numeric) * 100, 2)
      ELSE 0
    END,
    COALESCE(monthly_data, '[]'::jsonb)
  FROM companies c
  WHERE c.id = get_company_session_metrics.company_id;
END;
$$;

