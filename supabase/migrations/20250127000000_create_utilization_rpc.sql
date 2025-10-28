-- RPC function for platform utilization calculation
CREATE OR REPLACE FUNCTION public.get_platform_utilization()
RETURNS TABLE(utilization_rate NUMERIC) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN SUM(sessions_allocated) > 0 
      THEN ROUND((SUM(sessions_used)::NUMERIC / SUM(sessions_allocated)::NUMERIC) * 100, 2)
      ELSE 0
    END as utilization_rate
  FROM companies
  WHERE is_active = true;
END;
$$;

-- RPC function for monthly company usage
CREATE OR REPLACE FUNCTION public.get_monthly_company_usage(company_id_param UUID)
RETURNS TABLE(month TEXT, sessions BIGINT) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(date, 'Mon') as month,
    COUNT(*) as sessions
  FROM bookings
  WHERE company_id = company_id_param
    AND status = 'completed'
    AND date >= NOW() - INTERVAL '6 months'
  GROUP BY TO_CHAR(date, 'Mon'), EXTRACT(MONTH FROM date)
  ORDER BY EXTRACT(MONTH FROM date);
END;
$$;

