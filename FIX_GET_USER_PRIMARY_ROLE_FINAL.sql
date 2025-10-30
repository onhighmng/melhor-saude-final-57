-- =====================================================
-- FIX get_user_primary_role function - FINAL VERSION
-- =====================================================
-- Drop old function first, then create new one
-- =====================================================

-- Drop the old function
DROP FUNCTION IF EXISTS get_user_primary_role(UUID);

-- Create the new function
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

-- Verify it works
SELECT 
  'Function recreated successfully' as status;

-- Test with a sample (optional - uncomment and add your user ID)
-- SELECT get_user_primary_role('YOUR_USER_ID_HERE');

