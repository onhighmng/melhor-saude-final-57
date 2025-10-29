-- =====================================================
-- VERIFY ADMIN ROLE AND FIX IF NEEDED
-- =====================================================

-- 1. Check current roles
SELECT 
  u.email,
  u.id as user_id,
  ARRAY_AGG(ur.role) as roles,
  public.get_user_primary_role(u.id) as computed_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
GROUP BY u.email, u.id
ORDER BY u.email;

-- 2. Ensure admin has admin role
INSERT INTO public.user_roles (user_id, role)
SELECT 
  u.id,
  'admin'::public.app_role
FROM auth.users u
WHERE u.email = 'melhorsaude2025@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = u.id AND ur.role = 'admin'
  )
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Remove any 'user' role from admin (if they have both)
DELETE FROM public.user_roles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'melhorsaude2025@gmail.com')
  AND role = 'user'
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur2
    WHERE ur2.user_id = user_roles.user_id
    AND ur2.role = 'admin'
  );

-- 4. Verify final state
SELECT 
  u.email,
  ARRAY_AGG(ur.role) as roles,
  public.get_user_primary_role(u.id) as primary_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'melhorsaude2025@gmail.com'
GROUP BY u.email, u.id;

