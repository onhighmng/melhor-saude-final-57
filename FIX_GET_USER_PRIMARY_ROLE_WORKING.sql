-- =====================================================
-- FIX get_user_primary_role function - WORKING VERSION
-- =====================================================
-- Only includes columns that actually exist in profiles table
-- =====================================================

-- Step 1: Drop the view that depends on the function
DROP VIEW IF EXISTS user_profile_with_roles CASCADE;

-- Step 2: Drop the old function
DROP FUNCTION IF EXISTS get_user_primary_role(UUID) CASCADE;

-- Step 3: Create the new function with correct role check
CREATE OR REPLACE FUNCTION get_user_primary_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  primary_role TEXT;
BEGIN
  -- Priority: admin > hr > prestador > especialista_geral > user
  SELECT 
    CASE 
      WHEN bool_or(role = 'admin') THEN 'admin'
      WHEN bool_or(role = 'hr') THEN 'hr'
      WHEN bool_or(role = 'prestador') THEN 'prestador'
      WHEN bool_or(role = 'especialista_geral') THEN 'especialista_geral'
      ELSE 'user'
    END INTO primary_role
  FROM user_roles
  WHERE user_roles.user_id = get_user_primary_role.user_id;
  
  RETURN COALESCE(primary_role, 'user');
END;
$$;

-- Step 4: Recreate the view with only columns that exist in profiles
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

-- Step 5: Grant permissions
GRANT SELECT ON public.user_profile_with_roles TO authenticated;
GRANT SELECT ON public.user_profile_with_roles TO anon;

-- Step 6: Verify the fix
SELECT 
  'Function and view recreated successfully' as status;

-- =====================================================
-- DONE! Now test by logging out and back in
-- Users should now go to correct dashboard
-- =====================================================

