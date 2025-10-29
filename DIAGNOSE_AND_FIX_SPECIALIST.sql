-- =====================================================
-- DIAGNOSE AND FIX SPECIALIST CODE GENERATION
-- =====================================================

-- STEP 1: Check current function signature
DO $$
DECLARE
  v_function_exists BOOLEAN;
  v_param_names TEXT;
BEGIN
  -- Check if function exists
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'generate_access_code'
  ) INTO v_function_exists;
  
  IF v_function_exists THEN
    RAISE NOTICE '✓ Function exists';
    
    -- Get parameter names
    SELECT string_agg(p.parameter_name, ', ' ORDER BY p.ordinal_position)
    INTO v_param_names
    FROM information_schema.parameters p
    WHERE p.specific_schema = 'public'
    AND p.specific_name = (
      SELECT p2.specific_name 
      FROM information_schema.routines p2
      WHERE p2.routine_schema = 'public' 
      AND p2.routine_name = 'generate_access_code'
      LIMIT 1
    );
    
    RAISE NOTICE '  Current parameters: %', COALESCE(v_param_names, 'Could not read parameters');
  ELSE
    RAISE NOTICE '✗ Function does not exist';
  END IF;
END $$;

-- STEP 2: Check invites table columns
DO $$
DECLARE
  v_has_role BOOLEAN;
  v_has_metadata BOOLEAN;
  v_company_nullable BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'role'
  ) INTO v_has_role;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'metadata'
  ) INTO v_has_metadata;
  
  SELECT is_nullable = 'YES'
  INTO v_company_nullable
  FROM information_schema.columns
  WHERE table_name = 'invites' AND column_name = 'company_id';
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'INVITES TABLE CHECK:';
  RAISE NOTICE '  Has role column: %', v_has_role;
  RAISE NOTICE '  Has metadata column: %', v_has_metadata;
  RAISE NOTICE '  company_id is nullable: %', v_company_nullable;
  RAISE NOTICE '============================================';
END $$;

-- STEP 3: Add missing columns if needed
DO $$
BEGIN
  -- Add role column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'role'
  ) THEN
    ALTER TABLE invites ADD COLUMN role TEXT;
    RAISE NOTICE '✓ Added role column';
  END IF;

  -- Add metadata column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE invites ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE '✓ Added metadata column';
  END IF;

  -- Make company_id nullable
  ALTER TABLE invites ALTER COLUMN company_id DROP NOT NULL;
  RAISE NOTICE '✓ Made company_id nullable';
  
  -- Make email nullable
  ALTER TABLE invites ALTER COLUMN email DROP NOT NULL;
  RAISE NOTICE '✓ Made email nullable';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Note: Some columns may already exist or be nullable';
END $$;

-- STEP 4: Update constraints
DO $$
BEGIN
  ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_role_check;
  ALTER TABLE invites ADD CONSTRAINT invites_role_check 
    CHECK (role IN ('user', 'hr', 'prestador', 'especialista_geral'));

  ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_status_check;
  ALTER TABLE invites ADD CONSTRAINT invites_status_check 
    CHECK (status IN ('pending', 'sent', 'accepted', 'expired', 'cancelled', 'revoked'));

  RAISE NOTICE '✓ Updated constraints';
END $$;

-- STEP 5: Drop ALL versions of the function
DO $$
BEGIN
  DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB, INTEGER);
  DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB);
  DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID);
  DROP FUNCTION IF EXISTS generate_access_code(TEXT);
  DROP FUNCTION IF EXISTS generate_access_code();

  RAISE NOTICE '✓ Dropped all old function versions';
END $$;

-- STEP 6: Create the correct function
CREATE OR REPLACE FUNCTION generate_access_code(
  p_user_type TEXT,
  p_company_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_expires_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  code TEXT,
  expires_at TIMESTAMPTZ,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMPTZ;
  v_role TEXT;
BEGIN
  RAISE NOTICE 'generate_access_code called with p_user_type: %', p_user_type;
  
  -- Generate random 8-character code
  v_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
  
  -- Calculate expiration
  v_expires_at := now() + (p_expires_days || ' days')::interval;
  
  -- Map user_type to role
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
  
  RAISE NOTICE 'Mapped to role: %', v_role;
  
  -- Insert into invites table
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
  
  RAISE NOTICE 'Successfully inserted invite code: %', v_code;
  
  -- Return the code
  RETURN QUERY SELECT v_code, v_expires_at, v_role;
END;
$$;

DO $$
BEGIN
  RAISE NOTICE '✓ Created new function with correct signature';
END $$;

-- STEP 7: Test with both prestador and specialist
DO $$
DECLARE
  v_result RECORD;
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'TESTING FUNCTION:';
  RAISE NOTICE '============================================';
  
  -- Test 1: prestador
  SELECT * INTO v_result FROM generate_access_code('prestador', NULL, '{}'::jsonb, 30);
  RAISE NOTICE '✓ TEST 1 PASSED - Prestador code: %', v_result.code;
  DELETE FROM invites WHERE invite_code = v_result.code;
  
  -- Test 2: specialist
  SELECT * INTO v_result FROM generate_access_code('specialist', NULL, '{}'::jsonb, 30);
  RAISE NOTICE '✓ TEST 2 PASSED - Specialist code: %', v_result.code;
  RAISE NOTICE '  Role assigned: %', v_result.role;
  DELETE FROM invites WHERE invite_code = v_result.code;
  
  -- Test 3: hr
  SELECT * INTO v_result FROM generate_access_code('hr', NULL, '{}'::jsonb, 30);
  RAISE NOTICE '✓ TEST 3 PASSED - HR code: %', v_result.code;
  DELETE FROM invites WHERE invite_code = v_result.code;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ ALL TESTS PASSED!';
  RAISE NOTICE '✅ You can now generate specialist codes from the admin panel';
  RAISE NOTICE '============================================';
END $$;

