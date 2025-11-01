-- =====================================================
-- FIX: Access Code Generation - Canonical Implementation
-- =====================================================
-- This migration fixes all 8 issues with generate_access_code:
-- 1. Removes duplicate function definitions
-- 2. Creates single canonical function
-- 3. Returns JSONB for better compatibility
-- 4. Supports all user types (prestador, specialist, hr, personal, user)
-- 5. Ensures all database columns exist
-- 6. Adds proper permissions
-- 7. Fixes parameter handling
-- 8. Eliminates routing ambiguity

-- =====================================================
-- STEP 1: Ensure Database Schema is Correct
-- =====================================================

-- Add missing columns if they don't exist
ALTER TABLE invites ADD COLUMN IF NOT EXISTS user_type TEXT;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS invited_by UUID;

-- Make columns nullable where needed (codes don't have email until registration)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invites'
    AND column_name = 'email'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE invites ALTER COLUMN email DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invites'
    AND column_name = 'company_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE invites ALTER COLUMN company_id DROP NOT NULL;
  END IF;
END $$;

-- Update constraints to support all user types
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_role_check;
ALTER TABLE invites ADD CONSTRAINT invites_role_check
  CHECK (role IN ('user', 'hr', 'prestador', 'especialista_geral'));

-- =====================================================
-- STEP 2: Drop ALL Existing Versions of Function
-- =====================================================

-- Drop all possible function signatures to clean slate
DROP FUNCTION IF EXISTS generate_access_code(TEXT);
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID);
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB);
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB, INTEGER);
DROP FUNCTION IF EXISTS generate_access_code(UUID, INTEGER, JSONB, TEXT);
DROP FUNCTION IF EXISTS generate_access_code_table(TEXT, UUID, JSONB, INTEGER);
DROP FUNCTION IF EXISTS generate_access_code_table(UUID, INTEGER, JSONB, TEXT);

-- =====================================================
-- STEP 3: Create Canonical Function
-- =====================================================

CREATE OR REPLACE FUNCTION generate_access_code(
  p_user_type TEXT,
  p_company_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_expires_days INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMPTZ;
  v_role TEXT;
  v_invite_id UUID;
  v_invited_by UUID;
BEGIN
  -- Get current user ID (NULL for anonymous calls)
  v_invited_by := auth.uid();

  -- Generate unique code with retry logic
  LOOP
    -- Generate code format: MS-XXXXXXXX (8 random alphanumeric chars)
    v_code := 'MS-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));

    -- Check if code already exists
    EXIT WHEN NOT EXISTS(SELECT 1 FROM invites WHERE invite_code = v_code);
  END LOOP;

  -- Calculate expiration date
  v_expires_at := now() + (p_expires_days || ' days')::interval;

  -- Map user_type to role (supports all types including specialist/prestador)
  v_role := CASE p_user_type
    WHEN 'personal' THEN 'user'
    WHEN 'hr' THEN 'hr'
    WHEN 'user' THEN 'user'
    WHEN 'prestador' THEN 'prestador'
    WHEN 'specialist' THEN 'especialista_geral'
    WHEN 'especialista' THEN 'especialista_geral'
    WHEN 'company' THEN 'hr'
    WHEN 'employee' THEN 'user'
    ELSE NULL
  END;

  -- Validate user_type
  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Invalid user type: %. Valid types: personal, hr, user, prestador, specialist, especialista, company, employee', p_user_type;
  END IF;

  -- Insert the new invite
  INSERT INTO invites (
    invite_code,
    user_type,
    role,
    company_id,
    invited_by,
    email,
    status,
    expires_at,
    metadata,
    created_at
  ) VALUES (
    v_code,
    p_user_type,
    v_role,
    p_company_id,
    v_invited_by,
    NULL,  -- Email will be filled during registration
    'pending',
    v_expires_at,
    p_metadata,
    now()
  )
  RETURNING id INTO v_invite_id;

  -- Return consistent JSONB response
  RETURN jsonb_build_object(
    'success', true,
    'invite_code', v_code,
    'invite_id', v_invite_id,
    'expires_at', v_expires_at,
    'role', v_role,
    'user_type', p_user_type
  );
END;
$$;

-- =====================================================
-- STEP 4: Add Proper Permissions
-- =====================================================

GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER)
  TO authenticated;

GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER)
  TO anon;

GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER)
  TO service_role;

-- =====================================================
-- STEP 5: Add Comment for Documentation
-- =====================================================

COMMENT ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER) IS
'Generates unique access codes for user registration.
Supports: personal, hr, user, prestador, specialist, especialista, company, employee.
Returns JSONB with invite_code, invite_id, expires_at, role, user_type.
Usage: SELECT generate_access_code(''prestador'');';

-- =====================================================
-- Verification Query (for testing)
-- =====================================================

-- Test the function works:
-- SELECT generate_access_code('prestador');
-- SELECT generate_access_code('specialist');
-- SELECT generate_access_code('hr');
