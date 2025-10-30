-- =====================================================
-- FIX get_user_primary_role function
-- =====================================================
-- The function checks for 'specialist' but database stores 'especialista_geral'
-- This causes dashboard routing to fail
-- =====================================================

-- Update the function to check for 'especialista_geral' instead of 'specialist'
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
      WHEN bool_or(role = 'especialista_geral') THEN 'especialista_geral'  -- FIX: Check for especialista_geral
      ELSE 'user'
    END INTO primary_role
  FROM user_roles
  WHERE user_roles.user_id = get_user_primary_role.user_id;
  
  RETURN COALESCE(primary_role, 'user');
END;
$$;

-- Verify the fix
SELECT 
  'Function updated successfully' as status,
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'get_user_primary_role'
LIMIT 1;

-- Test with a sample user (if you have one)
-- SELECT get_user_primary_role('YOUR_USER_ID_HERE');

