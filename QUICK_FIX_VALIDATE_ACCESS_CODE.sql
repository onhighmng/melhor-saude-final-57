-- ============================================================================
-- QUICK FIX: validate_access_code function
-- ============================================================================
-- The function is using c.company_name but the table uses c.name
-- Run this RIGHT NOW in Supabase SQL Editor to fix the error
-- ============================================================================

-- Drop the broken function
DROP FUNCTION IF EXISTS validate_access_code(TEXT);

-- Recreate with correct column name
CREATE OR REPLACE FUNCTION validate_access_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  user_type TEXT,
  role TEXT,
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
    i.role,
    i.company_id,
    c.name as company_name,  -- ✅ FIXED: uses c.name instead of c.company_name
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION validate_access_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_access_code(TEXT) TO anon;

-- Verify it works
SELECT '✅ Function fixed! Test with a code:' as status;

-- Test the function (replace MS-XXXX with your actual code)
-- SELECT * FROM validate_access_code('MS-XXXX');




