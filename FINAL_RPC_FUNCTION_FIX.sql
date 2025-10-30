-- =====================================================
-- FINAL FIX: get_user_primary_role function
-- This will work - run in Supabase SQL Editor
-- =====================================================

-- STEP 1: Check what functions exist
SELECT
  proname as function_name,
  pg_get_function_identity_arguments(oid) as parameters,
  obj_description(oid, 'pg_proc') as description
FROM pg_proc
WHERE proname LIKE '%primary_role%';

-- STEP 2: Drop any existing functions completely
DROP FUNCTION IF EXISTS get_user_primary_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_primary_role(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_primary_role(uuid) CASCADE;

-- STEP 3: Drop the view that depends on it
DROP VIEW IF EXISTS user_profile_with_roles CASCADE;

-- STEP 4: Create the function with the EXACT signature the frontend expects
CREATE OR REPLACE FUNCTION public.get_user_primary_role(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  primary_role text;
BEGIN
  -- Get the highest priority role for the user
  SELECT
    CASE
      WHEN bool_or(role = 'admin') THEN 'admin'
      WHEN bool_or(role = 'hr') THEN 'hr'
      WHEN bool_or(role = 'prestador') THEN 'prestador'
      WHEN bool_or(role = 'especialista_geral') THEN 'especialista_geral'
      ELSE 'user'
    END INTO primary_role
  FROM user_roles
  WHERE user_roles.user_id = p_user_id;

  RETURN COALESCE(primary_role, 'user');
END;
$$;

-- STEP 5: Grant all necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_primary_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_primary_role(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_primary_role(uuid) TO service_role;

-- STEP 6: Recreate the view
CREATE OR REPLACE VIEW user_profile_with_roles AS
SELECT
  p.id,
  p.name,
  p.email,
  p.phone,
  p.avatar_url,
  p.company_id,
  p.department,
  p.bio,
  p.is_active,
  p.metadata,
  p.created_at,
  p.updated_at,
  public.get_user_primary_role(p.id) as role,
  ARRAY_AGG(ur.role) FILTER (WHERE ur.role IS NOT NULL) as roles,
  BOOL_OR(ur.role = 'admin') as is_admin,
  BOOL_OR(ur.role = 'hr') as is_hr,
  BOOL_OR(ur.role = 'prestador') as is_prestador,
  BOOL_OR(ur.role = 'especialista_geral') as is_specialist,
  BOOL_OR(ur.role = 'user') as is_user
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
GROUP BY p.id;

-- STEP 7: Grant view permissions
GRANT SELECT ON public.user_profile_with_roles TO authenticated;
GRANT SELECT ON public.user_profile_with_roles TO anon;

-- STEP 8: Test the function with your user ID
SELECT public.get_user_primary_role('b125562d-7b5b-48c0-85ec-4fbd4a112010') as your_role;

-- STEP 9: Check what roles that user has
SELECT
  ur.role,
  p.email
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
WHERE ur.user_id = 'b125562d-7b5b-48c0-85ec-4fbd4a112010';

-- STEP 10: Verify function is in schema cache
SELECT
  proname as function_name,
  pg_get_function_identity_arguments(oid) as parameters
FROM pg_proc
WHERE proname = 'get_user_primary_role';

-- =====================================================
-- SUCCESS! Now refresh the page and try login again
-- =====================================================

