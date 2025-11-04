-- ========================================
-- FIX: Update get_user_primary_role to recognize especialista_geral
-- ========================================

DROP FUNCTION IF EXISTS get_user_primary_role(UUID);

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
  -- Priority: admin > hr > prestador > especialista_geral/specialist > user
  SELECT 
    CASE 
      WHEN bool_or(role = 'admin') THEN 'admin'
      WHEN bool_or(role = 'hr') THEN 'hr'
      WHEN bool_or(role = 'prestador') THEN 'prestador'
      WHEN bool_or(role = 'especialista_geral') THEN 'specialist' -- Map especialista_geral → specialist
      WHEN bool_or(role = 'specialist') THEN 'specialist'
      ELSE 'user'
    END INTO primary_role
  FROM user_roles
  WHERE user_roles.user_id = p_user_id;
  
  RETURN COALESCE(primary_role, 'user');
END;
$$;

-- Test it with the especialista user
SELECT get_user_primary_role('31d7595f-5cc4-4896-bf92-29271f3fc329');
-- Should return: 'specialist'

-- Verify the mapping works
SELECT 
  ur.user_id,
  ur.role as db_role,
  get_user_primary_role(ur.user_id) as mapped_role
FROM user_roles ur
WHERE ur.user_id = '31d7595f-5cc4-4896-bf92-29271f3fc329';





