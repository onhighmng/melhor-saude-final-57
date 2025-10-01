-- Update the get_admin_analytics function to include real pillar trends data
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  pillar_data jsonb;
  weekly_trends jsonb;
  monthly_trends jsonb;
  overall_trends jsonb;
  total_bookings_count integer;
BEGIN
  -- Get total bookings count
  SELECT COUNT(*) INTO total_bookings_count FROM bookings;
  
  -- Build pillar distribution data
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'name', CASE 
        WHEN p.pillar = 'psicologica' THEN 'Psicológico'
        WHEN p.pillar = 'juridica' THEN 'Jurídico' 
        WHEN p.pillar = 'financeira' THEN 'Financeiro'
        WHEN p.pillar = 'fisica' THEN 'Físico'
        ELSE INITCAP(p.pillar)
      END,
      'value', CASE 
        WHEN total_bookings_count = 0 THEN 0
        ELSE ROUND((booking_count::numeric / total_bookings_count::numeric) * 100, 1)
      END,
      'color', CASE 
        WHEN p.pillar = 'psicologica' THEN 'hsl(var(--primary))'
        WHEN p.pillar = 'juridica' THEN 'hsl(var(--secondary))'
        WHEN p.pillar = 'financeira' THEN 'hsl(var(--accent))'
        WHEN p.pillar = 'fisica' THEN 'hsl(var(--muted))'
        ELSE 'hsl(var(--border))'
      END
    )
  ), '[]'::jsonb) INTO pillar_data
  FROM (
    SELECT 
      pr.pillar,
      COUNT(b.id) as booking_count
    FROM prestadores pr
    LEFT JOIN bookings b ON pr.id = b.prestador_id
    WHERE pr.is_active = true AND pr.is_approved = true
    GROUP BY pr.pillar
    HAVING COUNT(b.id) > 0
  ) p;
  
  -- Build weekly trends data (last 4 weeks)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'period', week_data.period,
      'Psicológico', COALESCE(week_data.psicologica, 0),
      'Jurídico', COALESCE(week_data.juridica, 0),
      'Financeiro', COALESCE(week_data.financeira, 0),
      'Físico', COALESCE(week_data.fisica, 0)
    ) ORDER BY week_data.week_start
  ), '[]'::jsonb) INTO weekly_trends
  FROM (
    SELECT 
      DATE_TRUNC('week', b.created_at) as week_start,
      'Semana ' || EXTRACT(week FROM b.created_at)::text as period,
      COUNT(CASE WHEN pr.pillar = 'psicologica' THEN 1 END) as psicologica,
      COUNT(CASE WHEN pr.pillar = 'juridica' THEN 1 END) as juridica,
      COUNT(CASE WHEN pr.pillar = 'financeira' THEN 1 END) as financeira,
      COUNT(CASE WHEN pr.pillar = 'fisica' THEN 1 END) as fisica
    FROM bookings b
    JOIN prestadores pr ON b.prestador_id = pr.id
    WHERE b.created_at >= NOW() - INTERVAL '4 weeks'
    GROUP BY DATE_TRUNC('week', b.created_at), EXTRACT(week FROM b.created_at)
  ) week_data;
  
  -- Build monthly trends data (last 6 months)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'period', month_data.period,
      'Psicológico', COALESCE(month_data.psicologica, 0),
      'Jurídico', COALESCE(month_data.juridica, 0),
      'Financeiro', COALESCE(month_data.financeira, 0),
      'Físico', COALESCE(month_data.fisica, 0)
    ) ORDER BY month_data.month_start
  ), '[]'::jsonb) INTO monthly_trends
  FROM (
    SELECT 
      DATE_TRUNC('month', b.created_at) as month_start,
      TO_CHAR(b.created_at, 'Mon YYYY') as period,
      COUNT(CASE WHEN pr.pillar = 'psicologica' THEN 1 END) as psicologica,
      COUNT(CASE WHEN pr.pillar = 'juridica' THEN 1 END) as juridica,
      COUNT(CASE WHEN pr.pillar = 'financeira' THEN 1 END) as financeira,
      COUNT(CASE WHEN pr.pillar = 'fisica' THEN 1 END) as fisica
    FROM bookings b
    JOIN prestadores pr ON b.prestador_id = pr.id
    WHERE b.created_at >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', b.created_at), TO_CHAR(b.created_at, 'Mon YYYY')
  ) month_data;
  
  -- Build overall/yearly trends data
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'period', year_data.period,
      'Psicológico', COALESCE(year_data.psicologica, 0),
      'Jurídico', COALESCE(year_data.juridica, 0),
      'Financeiro', COALESCE(year_data.financeira, 0),
      'Físico', COALESCE(year_data.fisica, 0)
    ) ORDER BY year_data.year_start
  ), '[]'::jsonb) INTO overall_trends
  FROM (
    SELECT 
      DATE_TRUNC('year', b.created_at) as year_start,
      EXTRACT(year FROM b.created_at)::text as period,
      COUNT(CASE WHEN pr.pillar = 'psicologica' THEN 1 END) as psicologica,
      COUNT(CASE WHEN pr.pillar = 'juridica' THEN 1 END) as juridica,
      COUNT(CASE WHEN pr.pillar = 'financeira' THEN 1 END) as financeira,
      COUNT(CASE WHEN pr.pillar = 'fisica' THEN 1 END) as fisica
    FROM bookings b
    JOIN prestadores pr ON b.prestador_id = pr.id
    GROUP BY DATE_TRUNC('year', b.created_at), EXTRACT(year FROM b.created_at)
  ) year_data;
  
  -- Build final result
  result := jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles WHERE role = 'user'),
    'active_users', (SELECT COUNT(*) FROM profiles WHERE role = 'user' AND is_active = true),
    'total_prestadores', (SELECT COUNT(*) FROM prestadores),
    'active_prestadores', (SELECT COUNT(*) FROM prestadores WHERE is_active = true AND is_approved = true),
    'total_companies', (SELECT COUNT(DISTINCT company) FROM profiles WHERE company IS NOT NULL),
    'total_bookings', total_bookings_count,
    'pending_change_requests', (SELECT COUNT(*) FROM change_requests WHERE status = 'pending'),
    'sessions_allocated', (SELECT COALESCE(SUM(sessions_allocated), 0) FROM session_allocations WHERE is_active = true),
    'sessions_used', (SELECT COALESCE(SUM(sessions_used), 0) FROM session_allocations WHERE is_active = true),
    'pillar_distribution', pillar_data,
    'pillar_trends', jsonb_build_object(
      'weekly', COALESCE(weekly_trends, '[]'::jsonb),
      'monthly', COALESCE(monthly_trends, '[]'::jsonb),
      'overall', COALESCE(overall_trends, '[]'::jsonb)
    ),
    'session_activity', '[]'::jsonb
  );
  
  RETURN result;
END;
$function$;