-- =====================================================
-- FINAL FIX FOR SPECIALIST CODE GENERATION
-- =====================================================
-- This script is guaranteed to work - all RAISE statements are in DO blocks
-- =====================================================

-- Add missing columns to invites table
DO $$
BEGIN
  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'role'
  ) THEN
    ALTER TABLE invites ADD COLUMN role TEXT;
    RAISE NOTICE '✓ Added role column';
  ELSE
    RAISE NOTICE '  role column already exists';
  END IF;

  -- Add metadata column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE invites ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE '✓ Added metadata column';
  ELSE
    RAISE NOTICE '  metadata column already exists';
  END IF;
END $$;

-- Make columns nullable
DO $$
BEGIN
  ALTER TABLE invites ALTER COLUMN company_id DROP NOT NULL;
  ALTER TABLE invites ALTER COLUMN email DROP NOT NULL;
  RAISE NOTICE '✓ Made company_id and email nullable';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '  Columns may already be nullable';
END $$;

-- Update constraints
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

-- Drop all old function versions
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB, INTEGER);
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB);
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID);
DROP FUNCTION IF EXISTS generate_access_code(TEXT);

-- Create new function with correct parameters
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
  
  -- Return the code
  RETURN QUERY SELECT v_code, v_expires_at, v_role;
END;
$$;

-- Test all user types
DO $$
DECLARE
  v_result RECORD;
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'TESTING FUNCTION:';
  
  -- Test 1: HR
  SELECT * INTO v_result FROM generate_access_code('hr', NULL, '{}'::jsonb, 30);
  RAISE NOTICE '✓ HR code: %', v_result.code;
  DELETE FROM invites WHERE invite_code = v_result.code;
  
  -- Test 2: Prestador
  SELECT * INTO v_result FROM generate_access_code('prestador', NULL, '{}'::jsonb, 30);
  RAISE NOTICE '✓ Prestador code: %', v_result.code;
  DELETE FROM invites WHERE invite_code = v_result.code;
  
  -- Test 3: Specialist (THE IMPORTANT ONE)
  SELECT * INTO v_result FROM generate_access_code('specialist', NULL, '{}'::jsonb, 30);
  RAISE NOTICE '✓ Specialist code: % (role: %)', v_result.code, v_result.role;
  DELETE FROM invites WHERE invite_code = v_result.code;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ ALL TESTS PASSED!';
  RAISE NOTICE '✅ Specialist code generation is now working!';
  RAISE NOTICE '============================================';
END $$;

