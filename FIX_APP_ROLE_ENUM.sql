-- ===================================================================
-- FIX APP_ROLE ENUM TO INCLUDE ESPECIALISTA_GERAL
-- ===================================================================
-- The issue: app_role enum might only have 'specialist' but not 'especialista_geral'
-- This causes registration errors when the role is assigned
-- ===================================================================

-- ============================================
-- STEP 1: Check current enum values
-- ============================================
SELECT enumlabel as current_roles
FROM pg_enum
WHERE enumtypid = 'app_role'::regtype
ORDER BY enumsortorder;

-- Expected output should include:
-- admin
-- user
-- hr
-- prestador
-- specialist
-- especialista_geral (might be MISSING - this is the problem!)

-- ============================================
-- STEP 2: Add missing role if it doesn't exist
-- ============================================

-- Add 'especialista_geral' to the enum if it's not there
DO $$
BEGIN
  -- Check if especialista_geral already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'especialista_geral'
    AND enumtypid = 'app_role'::regtype
  ) THEN
    -- Add it
    ALTER TYPE app_role ADD VALUE 'especialista_geral';
    RAISE NOTICE '✅ Added "especialista_geral" to app_role enum';
  ELSE
    RAISE NOTICE '✓ "especialista_geral" already exists in app_role enum';
  END IF;
END $$;

-- ============================================
-- STEP 3: Verify the fix
-- ============================================
SELECT enumlabel as updated_roles
FROM pg_enum
WHERE enumtypid = 'app_role'::regtype
ORDER BY enumsortorder;

-- Should now show:
-- admin
-- user
-- hr
-- prestador
-- specialist
-- especialista_geral ← Should be added now

-- ============================================
-- STEP 4: Test role assignment
-- ============================================
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
BEGIN
  -- Test each role
  INSERT INTO user_roles (user_id, role) VALUES (test_user_id, 'prestador'::app_role);
  RAISE NOTICE '✅ prestador role works';
  
  DELETE FROM user_roles WHERE user_id = test_user_id;
  
  INSERT INTO user_roles (user_id, role) VALUES (test_user_id, 'hr'::app_role);
  RAISE NOTICE '✅ hr role works';
  
  DELETE FROM user_roles WHERE user_id = test_user_id;
  
  INSERT INTO user_roles (user_id, role) VALUES (test_user_id, 'especialista_geral'::app_role);
  RAISE NOTICE '✅ especialista_geral role works';
  
  -- Clean up
  DELETE FROM user_roles WHERE user_id = test_user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error: %', SQLERRM;
    -- Clean up
    DELETE FROM user_roles WHERE user_id = test_user_id;
END $$;

-- ============================================
-- STEP 5: Check validate_access_code function
-- ============================================
-- Make sure it returns proper column names
SELECT * FROM validate_access_code('test_check_columns');
-- Should return columns: id, role, company_id, metadata, etc.

-- If you get "function does not exist", the function needs to be created
-- See: supabase/migrations/20251030000000_add_specialist_to_invites_constraint.sql

-- ============================================
-- IMPORTANT NOTES
-- ============================================
/*
After running this:

1. TRY REGISTRATION AGAIN with a NEW access code
   - Generate fresh prestador code
   - Register with new email
   - Should work without enum error

2. ERROR MESSAGES TO WATCH FOR:
   ❌ "invalid input value for enum app_role: \"especialista_geral\""
      → Run this script to add the missing enum value

   ❌ "function validate_access_code does not exist"
      → Need to run migration to create the function

   ❌ "column \"role\" of relation \"invites\" does not exist"
      → Need to run migration to add role column to invites table

3. If you still get errors, run DIAGNOSE_ROLE_ISSUE.sql to get more details
*/

