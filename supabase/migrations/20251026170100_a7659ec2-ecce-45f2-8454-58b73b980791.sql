-- Migrate existing roles from profiles.role to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.id,
  p.role::public.app_role
FROM public.profiles p
WHERE 
  p.role IS NOT NULL 
  AND p.role IN ('admin', 'user', 'hr', 'prestador', 'specialist')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = p.role::public.app_role
  )
ON CONFLICT (user_id, role) DO NOTHING;

-- Create helper view for easier queries
CREATE OR REPLACE VIEW public.user_profile_with_roles AS
SELECT 
  p.*,
  ARRAY_AGG(ur.role) FILTER (WHERE ur.role IS NOT NULL) as roles,
  BOOL_OR(ur.role = 'admin') as is_admin,
  BOOL_OR(ur.role = 'hr') as is_hr,
  BOOL_OR(ur.role = 'prestador') as is_prestador,
  BOOL_OR(ur.role = 'specialist') as is_specialist,
  BOOL_OR(ur.role = 'user') as is_user
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
GROUP BY p.id;

GRANT SELECT ON public.user_profile_with_roles TO authenticated;

-- Mark the old role column as deprecated
COMMENT ON COLUMN public.profiles.role IS 'DEPRECATED: Use user_roles table instead via has_role() function or user_profile_with_roles view';