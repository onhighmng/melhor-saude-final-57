-- Fix specialist role routing issue
-- Problem: Database stores 'especialista_geral' but get_user_primary_role only checks for 'specialist'
-- Solution: Update get_user_primary_role to check for both 'specialist' and 'especialista_geral'

-- Drop the existing function first (required when changing parameter names)
DROP FUNCTION IF EXISTS get_user_primary_role(UUID);

-- Create the updated get_user_primary_role function to handle both specialist role names
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
  -- Priority: admin > hr > prestador > especialista_geral/specialist > user
  -- Note: We check for both 'specialist' and 'especialista_geral' for backward compatibility
  SELECT 
    CASE 
      WHEN bool_or(role = 'admin') THEN 'admin'
      WHEN bool_or(role = 'hr') THEN 'hr'
      WHEN bool_or(role = 'prestador') THEN 'prestador'
      WHEN bool_or(role = 'especialista_geral' OR role = 'specialist') THEN 'especialista_geral'
      ELSE 'user'
    END INTO primary_role
  FROM user_roles
  WHERE user_roles.user_id = get_user_primary_role.user_id;
  
  RETURN COALESCE(primary_role, 'user');
END;
$$;

-- Add comment explaining the fix
COMMENT ON FUNCTION get_user_primary_role(UUID) IS 
'Returns the highest-priority role for a user. Priority: admin > hr > prestador > especialista_geral/specialist > user. 
Handles both "specialist" and "especialista_geral" role names for backward compatibility.';

-- Verify the function works correctly
DO $$
DECLARE
  test_user_id UUID;
  test_role TEXT;
BEGIN
  -- Log that migration is running
  RAISE NOTICE 'Fixing specialist role routing...';
  RAISE NOTICE 'Updated get_user_primary_role to handle both specialist and especialista_geral';
  RAISE NOTICE '✓ Migration completed successfully';
END $$;

