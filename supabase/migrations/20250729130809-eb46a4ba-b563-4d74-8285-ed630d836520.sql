-- Create a simpler version that fixes the ambiguous column reference
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
    
    -- Pillar distribution based on bookings
    (SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'name', CASE 
          WHEN p.pillar = 'psicologica' THEN 'Psicológico'
          WHEN p.pillar = 'juridica' THEN 'Jurídico' 
          WHEN p.pillar = 'financeira' THEN 'Financeiro'
          WHEN p.pillar = 'fisica' THEN 'Físico'
          ELSE INITCAP(p.pillar)
        END,
        'value', ROUND((COUNT(b.id)::numeric / NULLIF(total_bookings.count, 0)::numeric) * 100, 1),
        'color', CASE 
          WHEN p.pillar = 'psicologica' THEN 'hsl(var(--primary))'
          WHEN p.pillar = 'juridica' THEN 'hsl(var(--secondary))'
          WHEN p.pillar = 'financeira' THEN 'hsl(var(--accent))'
          WHEN p.pillar = 'fisica' THEN 'hsl(var(--muted))'
          ELSE 'hsl(var(--border))'
        END
      )
    ), '[]'::jsonb)
    FROM prestadores p
    LEFT JOIN bookings b ON p.id = b.prestador_id
    CROSS JOIN (SELECT COUNT(*) as count FROM bookings) total_bookings
    WHERE p.is_active = true AND p.is_approved = true
    GROUP BY p.pillar, total_bookings.count
    HAVING COUNT(b.id) > 0) as pillar_distribution,
    
    -- Pillar trends - simplified for now
    jsonb_build_object(
      'monthly', '[]'::jsonb,
      'weekly', '[]'::jsonb,
      'overall', '[]'::jsonb
    ) as pillar_trends,
    
    -- Session activity - simplified for now  
    '[]'::jsonb as session_activity;
$function$