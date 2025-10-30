-- =====================================================
-- URGENT: RPC function is missing (404 error)
-- =====================================================
-- The get_user_primary_role function was dropped and not recreated
-- This fixes it immediately
-- =====================================================

-- First check if function exists and what it looks like
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
WHERE p.proname = 'get_user_primary_role';

-- Drop everything that might depend on it
DROP VIEW IF EXISTS user_profile_with_roles CASCADE;

-- Create the RPC function from scratch with correct signature
CREATE OR REPLACE FUNCTION get_user_primary_role(p_user_id UUID)
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
  WHERE user_roles.user_id = p_user_id;

  RETURN COALESCE(primary_role, 'user');
END;
$$;

-- Recreate the view
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

-- Grant permissions
GRANT SELECT ON public.user_profile_with_roles TO authenticated;
GRANT SELECT ON public.user_profile_with_roles TO anon;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_primary_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_primary_role(UUID) TO anon;

-- Test the function with your user ID
-- Replace with your actual user ID from the error
SELECT get_user_primary_role('b125562d-7b5b-48c0-85ec-4fbd4a112010') as your_role;

-- Check what roles that user has
SELECT 
  ur.role,
  p.email
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
WHERE ur.user_id = 'b125562d-7b5b-48c0-85ec-4fbd4a112010';

-- =====================================================
-- DONE! Refresh the page and try again
-- =====================================================

