-- Drop and recreate the get_admin_analytics function with extended data
DROP FUNCTION IF EXISTS public.get_admin_analytics();

CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS TABLE(
  total_users integer, 
  active_users integer, 
  total_prestadores integer, 
  active_prestadores integer, 
  total_companies integer, 
  total_bookings integer, 
  pending_change_requests integer, 
  sessions_allocated integer, 
  sessions_used integer,
  pillar_distribution jsonb,
  pillar_trends jsonb,
  session_activity jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH pillar_stats AS (
    SELECT 
      p.pillar,
      COUNT(b.id) as booking_count,
      COUNT(DISTINCT b.user_id) as unique_users
    FROM prestadores p
    LEFT JOIN bookings b ON p.id = b.prestador_id
    WHERE p.is_active = true AND p.is_approved = true
    GROUP BY p.pillar
  ),
  total_booking_count AS (
    SELECT COUNT(*) as total_bookings FROM bookings
  ),
  pillar_distribution_data AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', CASE 
          WHEN pillar = 'psicologica' THEN 'Psicológico'
          WHEN pillar = 'juridica' THEN 'Jurídico' 
          WHEN pillar = 'financeira' THEN 'Financeiro'
          WHEN pillar = 'fisica' THEN 'Físico'
          ELSE INITCAP(pillar)
        END,
        'value', CASE 
          WHEN tbc.total_bookings = 0 THEN 0
          ELSE ROUND((ps.booking_count::numeric / tbc.total_bookings::numeric) * 100, 1)
        END,
        'color', CASE 
          WHEN pillar = 'psicologica' THEN 'hsl(var(--primary))'
          WHEN pillar = 'juridica' THEN 'hsl(var(--secondary))'
          WHEN pillar = 'financeira' THEN 'hsl(var(--accent))'
          WHEN pillar = 'fisica' THEN 'hsl(var(--muted))'
          ELSE 'hsl(var(--border))'
        END
      )
    ) as distribution
    FROM pillar_stats ps
    CROSS JOIN total_booking_count tbc
    WHERE ps.booking_count > 0
  ),
  monthly_trends AS (
    SELECT 
      TO_CHAR(b.booking_date, 'YYYY-MM') as period,
      p.pillar,
      COUNT(*) as sessions
    FROM bookings b
    JOIN prestadores p ON b.prestador_id = p.id
    WHERE b.booking_date >= NOW() - INTERVAL '6 months'
    GROUP BY TO_CHAR(b.booking_date, 'YYYY-MM'), p.pillar
    ORDER BY period
  ),
  pillar_trends_data AS (
    SELECT jsonb_build_object(
      'monthly', COALESCE(jsonb_agg(
        jsonb_build_object(
          'period', period,
          'Psicológico', COALESCE(SUM(CASE WHEN pillar = 'psicologica' THEN sessions END), 0),
          'Jurídico', COALESCE(SUM(CASE WHEN pillar = 'juridica' THEN sessions END), 0),
          'Financeiro', COALESCE(SUM(CASE WHEN pillar = 'financeira' THEN sessions END), 0),
          'Físico', COALESCE(SUM(CASE WHEN pillar = 'fisica' THEN sessions END), 0)
        )
      ), '[]'::jsonb),
      'weekly', '[]'::jsonb,
      'overall', '[]'::jsonb
    ) as trends
    FROM (
      SELECT period FROM monthly_trends GROUP BY period ORDER BY period
    ) periods
    LEFT JOIN monthly_trends mt ON periods.period = mt.period
  ),
  session_activity_data AS (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'period', period,
        'agendadas', scheduled,
        'comparecidas', attended,
        'completadas', completed
      )
    ), '[]'::jsonb) as activity
    FROM (
      SELECT 
        TO_CHAR(booking_date, 'YYYY-MM') as period,
        COUNT(*) as scheduled,
        COUNT(CASE WHEN status IN ('completed', 'attended') THEN 1 END) as attended,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM bookings
      WHERE booking_date >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(booking_date, 'YYYY-MM')
      ORDER BY period
    ) sa
  )
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM profiles WHERE role = 'user')::INTEGER as total_users,
    (SELECT COUNT(*)::INTEGER FROM profiles WHERE role = 'user' AND is_active = true)::INTEGER as active_users,
    (SELECT COUNT(*)::INTEGER FROM prestadores)::INTEGER as total_prestadores,
    (SELECT COUNT(*)::INTEGER FROM prestadores WHERE is_active = true AND is_approved = true)::INTEGER as active_prestadores,
    (SELECT COUNT(DISTINCT company)::INTEGER FROM profiles WHERE company IS NOT NULL)::INTEGER as total_companies,
    (SELECT COUNT(*)::INTEGER FROM bookings)::INTEGER as total_bookings,
    (SELECT COUNT(*)::INTEGER FROM change_requests WHERE status = 'pending')::INTEGER as pending_change_requests,
    (SELECT COALESCE(SUM(sessions_allocated), 0)::INTEGER FROM session_allocations WHERE is_active = true)::INTEGER as sessions_allocated,
    (SELECT COALESCE(SUM(sessions_used), 0)::INTEGER FROM session_allocations WHERE is_active = true)::INTEGER as sessions_used,
    (SELECT COALESCE(distribution, '[]'::jsonb) FROM pillar_distribution_data) as pillar_distribution,
    (SELECT trends FROM pillar_trends_data) as pillar_trends,
    (SELECT activity FROM session_activity_data) as session_activity;
$function$