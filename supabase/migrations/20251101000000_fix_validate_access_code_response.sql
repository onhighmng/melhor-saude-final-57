-- =====================================================
-- Fix validate_access_code to return expected fields
-- =====================================================
-- This migration updates the validate_access_code function to return
-- the fields expected by the frontend client code

-- Drop the existing function
DROP FUNCTION IF EXISTS validate_access_code(TEXT);

-- Create the updated function with correct return fields
CREATE OR REPLACE FUNCTION validate_access_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  user_type TEXT,
  role TEXT,
  company_id UUID,
  company_name TEXT,
  expires_at TIMESTAMPTZ,
  status TEXT,
  metadata JSONB,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    -- Map role to user_type for backwards compatibility
    CASE i.role
      WHEN 'user' THEN 'user'
      WHEN 'hr' THEN 'hr'
      WHEN 'prestador' THEN 'prestador'
      WHEN 'especialista_geral' THEN 'specialist'
      ELSE 'user'
    END as user_type,
    i.role,
    i.company_id,
    c.company_name,
    i.expires_at,
    i.status,
    i.metadata,
    (i.status = 'pending' AND i.expires_at > now()) as is_valid
  FROM invites i
  LEFT JOIN companies c ON i.company_id = c.id
  WHERE i.invite_code = upper(p_code);
END;
$$;

-- Grant execute permission to authenticated and anonymous users (for registration)
GRANT EXECUTE ON FUNCTION validate_access_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_access_code(TEXT) TO anon;

-- Add comment explaining the function
COMMENT ON FUNCTION validate_access_code(TEXT) IS
'Validates an access code and returns all necessary data for registration.
Returns both user_type (for compatibility) and role (database value).
Includes company information via LEFT JOIN for HR/employee codes.';
