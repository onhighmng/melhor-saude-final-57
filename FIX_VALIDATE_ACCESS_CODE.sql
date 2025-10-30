-- =====================================================
-- FIX validate_access_code FUNCTION
-- =====================================================
-- The frontend expects user_type to be returned
-- But the database only has 'role' column
-- This function maps role back to user_type for the frontend
-- =====================================================

-- Drop old function
DROP FUNCTION IF EXISTS validate_access_code(TEXT);

-- Create new function that returns user_type (mapped from role)
CREATE OR REPLACE FUNCTION validate_access_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  user_type TEXT,
  role TEXT,
  company_id UUID,
  company_name TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_type TEXT;
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    -- Map role back to user_type for frontend compatibility
    CASE i.role
      WHEN 'hr' THEN 'hr'
      WHEN 'user' THEN 'employee'
      WHEN 'prestador' THEN 'prestador'
      WHEN 'especialista_geral' THEN 'specialist'
      ELSE 'employee'
    END as user_type,
    i.role,
    i.company_id,
    c.company_name,
    i.expires_at,
    i.metadata,
    (i.status = 'pending' AND i.expires_at > now()) as is_valid
  FROM invites i
  LEFT JOIN companies c ON i.company_id = c.id
  WHERE i.invite_code = p_code;
END;
$$;

-- Test the function with the specialist code
DO $$
DECLARE
  v_result RECORD;
BEGIN
  SELECT * INTO v_result 
  FROM validate_access_code('9A8EC5A9');
  
  IF v_result.id IS NOT NULL THEN
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ Code found: 9A8EC5A9';
    RAISE NOTICE '  user_type (for frontend): %', v_result.user_type;
    RAISE NOTICE '  role (in database): %', v_result.role;
    RAISE NOTICE '  is_valid: %', v_result.is_valid;
    RAISE NOTICE '============================================';
    
    IF v_result.user_type = 'specialist' THEN
      RAISE NOTICE '✅ Code will be recognized as SPECIALIST registration!';
    ELSE
      RAISE WARNING '⚠ Code is being treated as: %', v_result.user_type;
    END IF;
  ELSE
    RAISE WARNING 'Code not found in database';
  END IF;
END $$;

-- Show what all codes will be recognized as
SELECT 
  invite_code,
  CASE role
    WHEN 'hr' THEN 'hr'
    WHEN 'user' THEN 'employee'
    WHEN 'prestador' THEN 'prestador'
    WHEN 'especialista_geral' THEN 'specialist'
    ELSE 'unknown'
  END as recognized_as,
  role as actual_role,
  status,
  created_at
FROM invites
ORDER BY created_at DESC
LIMIT 10;




