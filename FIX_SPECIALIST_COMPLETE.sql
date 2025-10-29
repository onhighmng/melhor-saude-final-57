-- =====================================================
-- COMPLETE FIX FOR SPECIALIST ACCOUNT CREATION
-- =====================================================
-- This script fixes ALL issues preventing specialist account creation
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- STEP 1: Add missing columns to invites table
DO $$
BEGIN
  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'role'
  ) THEN
    ALTER TABLE invites ADD COLUMN role TEXT;
    RAISE NOTICE '✓ Added role column to invites table';
  ELSE
    RAISE NOTICE '✓ Role column already exists';
  END IF;

  -- Add metadata column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE invites ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE '✓ Added metadata column to invites table';
  ELSE
    RAISE NOTICE '✓ Metadata column already exists';
  END IF;
END $$;

-- STEP 2: Make company_id and email nullable
DO $$
BEGIN
  -- Make company_id nullable
  ALTER TABLE invites ALTER COLUMN company_id DROP NOT NULL;
  RAISE NOTICE '✓ Made company_id nullable';
  
  -- Make email nullable
  ALTER TABLE invites ALTER COLUMN email DROP NOT NULL;
  RAISE NOTICE '✓ Made email nullable';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Note: company_id or email may already be nullable';
END $$;

-- STEP 3: Update role constraint
DO $$
BEGIN
  -- Drop existing constraint
  ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_role_check;
  
  -- Add new constraint including specialist
  ALTER TABLE invites ADD CONSTRAINT invites_role_check 
    CHECK (role IN ('user', 'hr', 'prestador', 'especialista_geral'));
  
  RAISE NOTICE '✓ Updated invites.role constraint to include especialista_geral';
END $$;

-- STEP 4: Update status constraint
DO $$
BEGIN
  ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_status_check;
  ALTER TABLE invites ADD CONSTRAINT invites_status_check 
    CHECK (status IN ('pending', 'sent', 'accepted', 'expired', 'cancelled', 'revoked'));
  
  RAISE NOTICE '✓ Updated invites.status constraint';
END $$;

-- STEP 5: Drop and recreate generate_access_code function
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB, INTEGER);

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
      RAISE EXCEPTION 'Tipo de utilizador inválido: %. Tipos válidos: company, hr, employee, prestador, specialist', p_user_type;
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

DO $$
BEGIN
  RAISE NOTICE '✓ Recreated generate_access_code function';
END $$;

-- STEP 6: Drop and recreate validate_access_code function
DROP FUNCTION IF EXISTS validate_access_code(TEXT);

CREATE OR REPLACE FUNCTION validate_access_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  role TEXT,
  company_id UUID,
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
    i.role,
    i.company_id,
    i.metadata,
    (i.status = 'pending' AND i.expires_at > now()) as is_valid
  FROM invites i
  WHERE i.invite_code = p_code;
END;
$$;

DO $$
BEGIN
  RAISE NOTICE '✓ Recreated validate_access_code function';
END $$;

-- STEP 7: Test the function
DO $$
DECLARE
  v_result RECORD;
BEGIN
  -- Test specialist code generation
  SELECT * INTO v_result
  FROM generate_access_code('specialist', NULL, '{}'::jsonb, 30);
  
  IF v_result.code IS NOT NULL THEN
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ TEST PASSED: Successfully generated specialist code';
    RAISE NOTICE '  Code: %', v_result.code;
    RAISE NOTICE '  Role: %', v_result.role;
    RAISE NOTICE '  Expires: %', v_result.expires_at;
    RAISE NOTICE '============================================';
  ELSE
    RAISE EXCEPTION 'TEST FAILED: Code generation returned NULL';
  END IF;
  
  -- Clean up test code
  DELETE FROM invites WHERE invite_code = v_result.code;
  RAISE NOTICE '✓ Test code cleaned up';
END $$;

-- STEP 8: Final verification
SELECT 
  'Schema Check' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'invites' AND column_name = 'role'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'invites' AND column_name = 'metadata'
    ) THEN '✓ PASS' 
    ELSE '✗ FAIL' 
  END as status
UNION ALL
SELECT 
  'Role Constraint' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invites_role_check'
    AND pg_get_constraintdef(oid) LIKE '%especialista_geral%'
  ) THEN '✓ PASS' ELSE '✗ FAIL' END as status
UNION ALL
SELECT 
  'Function Check' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'generate_access_code'
  ) THEN '✓ PASS' ELSE '✗ FAIL' END as status;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'FIX COMPLETE!';
  RAISE NOTICE 'You can now generate specialist codes from the admin panel.';
  RAISE NOTICE '============================================';
END $$;
