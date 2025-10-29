-- =====================================================
-- CHECK AND FIX ADMIN ROLE
-- =====================================================
-- This script checks if the admin user has the correct role
-- and fixes the get_user_primary_role function

-- 1. Check current roles for your admin user
SELECT 
  u.email,
  p.id as profile_id,
  ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'melhorsaude2025@gmail.com';

-- 2. Ensure the admin user has the 'admin' role
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

-- 3. Drop and recreate get_user_primary_role function (fixed version)
DROP FUNCTION IF EXISTS public.get_user_primary_role(UUID);

CREATE OR REPLACE FUNCTION public.get_user_primary_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role = 'admin') THEN 'admin'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role = 'hr') THEN 'hr'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role = 'prestador') THEN 'prestador'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role = 'specialist') THEN 'specialist'
    ELSE 'user'
  END;
$$;

-- 4. Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_primary_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_primary_role(UUID) TO anon;

-- 5. Verify the function works
SELECT 
  u.email,
  public.get_user_primary_role(u.id) as role_from_function
FROM auth.users u
WHERE u.email = 'melhorsaude2025@gmail.com';

-- 6. Show all users and their roles for verification
SELECT 
  u.email,
  public.get_user_primary_role(u.id) as primary_role,
  ARRAY_AGG(ur.role) as all_roles
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
GROUP BY u.email, u.id
ORDER BY u.email;

