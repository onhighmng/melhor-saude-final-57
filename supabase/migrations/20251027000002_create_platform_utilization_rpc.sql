-- Create RPC function to get platform utilization metrics
CREATE OR REPLACE FUNCTION get_platform_utilization()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_total_companies INT;
  v_total_employees INT;
  v_total_sessions INT;
  v_active_sessions INT;
  v_utilization_pct NUMERIC;
BEGIN
  -- Get counts
  SELECT COUNT(*) INTO v_total_companies 
  FROM companies 
  WHERE is_active = true;
  
  SELECT COUNT(*) INTO v_total_employees 
  FROM company_employees 
  WHERE is_active = true;
  
  SELECT COUNT(*) INTO v_total_sessions 
  FROM bookings;
  
  SELECT COUNT(*) INTO v_active_sessions 
  FROM bookings 
  WHERE status = 'confirmed';
  
  -- Calculate utilization percentage
  SELECT 
    CASE 
      WHEN SUM(seats_total) > 0 
      THEN (SUM(seats_used)::NUMERIC / SUM(seats_total)::NUMERIC * 100)
      ELSE 0 
    END
  INTO v_utilization_pct
  FROM companies 
  WHERE is_active = true;

  -- Build result
  v_result := jsonb_build_object(
    'total_companies', COALESCE(v_total_companies, 0),
    'total_employees', COALESCE(v_total_employees, 0),
    'total_sessions', COALESCE(v_total_sessions, 0),
    'active_sessions', COALESCE(v_active_sessions, 0),
    'utilization_percentage', ROUND(COALESCE(v_utilization_pct, 0), 2)
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_platform_utilization() TO authenticated;

