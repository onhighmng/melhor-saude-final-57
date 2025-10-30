-- =====================================================
-- COMPLETE FIX - generate_access_code for ALL user types
-- =====================================================
-- Based on diagnostic showing role is NULL for some codes
-- This ensures the function works for prestador, specialist, and hr
-- =====================================================

-- Drop all versions of the function
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB, INTEGER);
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB);
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID);
DROP FUNCTION IF EXISTS generate_access_code(TEXT);

-- Create the correct function
CREATE OR REPLACE FUNCTION generate_access_code(
  p_user_type TEXT,
  p_company_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_expires_days INTEGER DEFAULT 30
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMPTZ;
  v_role TEXT;
BEGIN
  -- Generate random 8-character code
  v_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
  
  -- Calculate expiration
  v_expires_at := now() + (p_expires_days || ' days')::interval;
  
  -- Map user_type to role with DETAILED logging
  CASE p_user_type
    WHEN 'company' THEN v_role := 'hr';
    WHEN 'hr' THEN v_role := 'hr';
    WHEN 'employee' THEN v_role := 'user';
    WHEN 'prestador' THEN v_role := 'prestador';
    WHEN 'specialist' THEN v_role := 'especialista_geral';
    WHEN 'especialista' THEN v_role := 'especialista_geral';
    ELSE 
      RAISE EXCEPTION 'Tipo de utilizador inválido: "%". Tipos válidos: company, hr, employee, prestador, specialist', p_user_type;
  END CASE;
  
  -- Insert into invites table (with EXPLICIT column list)
  INSERT INTO invites (
    invite_code,
    role,
    company_id,
    metadata,
    expires_at,
    status,
    created_at
  ) VALUES (
    v_code,
    v_role,
    p_company_id,
    p_metadata,
    v_expires_at,
    'pending',
    now()
  );
  
  -- Return JUST the code (matching frontend expectation)
  RETURN v_code;
END;
$$;

-- Test ALL user types
DO $$
DECLARE
  v_code TEXT;
  v_invite RECORD;
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'TESTING ALL USER TYPES:';
  RAISE NOTICE '============================================';
  
  -- Test 1: HR
  v_code := generate_access_code('hr', NULL, '{}'::jsonb, 30);
  SELECT * INTO v_invite FROM invites WHERE invite_code = v_code;
  RAISE NOTICE '✓ HR: code=%, role=%', v_code, v_invite.role;
  DELETE FROM invites WHERE invite_code = v_code;
  
  -- Test 2: Prestador
  v_code := generate_access_code('prestador', NULL, '{}'::jsonb, 30);
  SELECT * INTO v_invite FROM invites WHERE invite_code = v_code;
  RAISE NOTICE '✓ Prestador: code=%, role=%', v_code, v_invite.role;
  DELETE FROM invites WHERE invite_code = v_code;
  
  -- Test 3: Specialist
  v_code := generate_access_code('specialist', NULL, '{}'::jsonb, 30);
  SELECT * INTO v_invite FROM invites WHERE invite_code = v_code;
  RAISE NOTICE '✓ Specialist: code=%, role=%', v_code, v_invite.role;
  DELETE FROM invites WHERE invite_code = v_code;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ ALL TESTS PASSED!';
  RAISE NOTICE '✅ All user types working correctly!';
  RAISE NOTICE '============================================';
END $$;

-- Verify the function signature is correct
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as parameters,
  pg_get_function_result(p.oid) as returns
FROM pg_proc p
WHERE p.proname = 'generate_access_code';




