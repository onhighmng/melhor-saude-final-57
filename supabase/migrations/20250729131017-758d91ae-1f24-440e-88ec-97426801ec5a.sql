-- Create a working analytics function step by step
DROP FUNCTION IF EXISTS public.get_admin_analytics();

CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  pillar_data jsonb;
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
      'monthly', '[]'::jsonb,
      'weekly', '[]'::jsonb,
      'overall', '[]'::jsonb
    ),
    'session_activity', '[]'::jsonb
  );
  
  RETURN result;
END;
$function$