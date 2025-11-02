-- Fix validate_access_code to return user_type instead of role
-- This ensures consistency with frontend expectations

DROP FUNCTION IF EXISTS validate_access_code(TEXT);

CREATE OR REPLACE FUNCTION validate_access_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  user_type TEXT,
  company_id UUID,
  company_name TEXT,
  expires_at TIMESTAMPTZ,
  status TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.user_type,
    i.company_id,
    c.name as company_name,
    i.expires_at,
    i.status,
    i.metadata
  FROM invites i
  LEFT JOIN companies c ON i.company_id = c.id
  WHERE i.invite_code = upper(p_code)
    AND i.status = 'pending'
    AND i.expires_at > NOW();
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION validate_access_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_access_code(TEXT) TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION validate_access_code(TEXT) IS
  'Validates an access code and returns user_type, company info if applicable. Used during registration flow. Accessible to anonymous users to allow code validation before signup.';
