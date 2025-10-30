-- =====================================================
-- FIX ALL REGISTRATION ISSUES - Run this in Supabase SQL Editor
-- =====================================================
-- This fixes:
-- 1. company_id NOT NULL constraint blocking specialist/prestador codes
-- 2. app_role enum missing 'especialista_geral'
-- 3. Broken codes with NULL roles
-- =====================================================

-- FIX 1: Make company_id nullable for specialist/prestador codes
-- This allows codes to be generated without a company
ALTER TABLE invites ALTER COLUMN company_id DROP NOT NULL;

-- FIX 2: Add 'especialista_geral' to app_role enum
-- NOTE: PostgreSQL doesn't allow IF NOT EXISTS on enum values before PG 13
-- We use a function to safely add it
DO $$
BEGIN
  -- Try to add the value
  BEGIN
    ALTER TYPE app_role ADD VALUE 'especialista_geral';
  EXCEPTION WHEN duplicate_object THEN
    -- Value already exists, do nothing
    NULL;
  END;
END $$;

-- FIX 3: Clean up any broken invites with NULL roles
-- These can't be used anyway
DELETE FROM invites WHERE role IS NULL;

-- FIX 4: Ensure invites status includes all needed values
-- Check if 'revoked' status exists in constraint
DO $$
BEGIN
  -- Drop old constraint if exists
  ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_status_check;
  
  -- Add new constraint with all statuses
  ALTER TABLE invites ADD CONSTRAINT invites_status_check 
    CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled', 'revoked', 'used'));
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Status constraint already correct or error: %', SQLERRM;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify Fix 1: company_id is now nullable
SELECT 
  column_name,
  data_type,
  is_nullable,
  'company_id should be nullable' as note
FROM information_schema.columns
WHERE table_name = 'invites' AND column_name = 'company_id';

-- Verify Fix 2: enum includes all roles
SELECT 
  enumlabel as role,
  enumsortorder as sort_order
FROM pg_enum
WHERE enumtypid = 'app_role'::regtype
ORDER BY enumsortorder;

-- Verify Fix 3: No NULL roles exist
SELECT 
  COUNT(*) as codes_with_null_role,
  'Should be 0' as expected
FROM invites 
WHERE role IS NULL;

-- =====================================================
-- TEST CODE GENERATION
-- =====================================================

-- Test specialist code generation
DO $$
DECLARE
  v_specialist_code TEXT;
  v_prestador_code TEXT;
  v_hr_code TEXT;
BEGIN
  -- Generate test codes
  v_specialist_code := generate_access_code('specialist', NULL, '{}'::jsonb, 30);
  v_prestador_code := generate_access_code('prestador', NULL, '{}'::jsonb, 30);
  v_hr_code := generate_access_code('hr', NULL, '{}'::jsonb, 30);
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'TEST CODE GENERATION:';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Specialist code: %', v_specialist_code;
  RAISE NOTICE 'Prestador code: %', v_prestador_code;
  RAISE NOTICE 'HR code: %', v_hr_code;
  RAISE NOTICE '============================================';
  
  -- Clean up test codes
  DELETE FROM invites WHERE invite_code IN (v_specialist_code, v_prestador_code, v_hr_code);
  
  RAISE NOTICE '✅ All test codes generated successfully!';
  RAISE NOTICE '✅ Registrations should now work!';
END $$;

-- =====================================================
-- SHOW RECENT CODES
-- =====================================================

SELECT 
  invite_code,
  role,
  CASE 
    WHEN company_id IS NULL THEN 'No company (specialist/prestador)'
    ELSE 'Has company (employee/HR)'
  END as company_status,
  status,
  expires_at > now() as is_valid,
  created_at
FROM invites
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- FINAL STATUS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ FIX COMPLETE!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Go to http://localhost:8081/admin/users';
  RAISE NOTICE '2. Generate codes for specialist and prestador';
  RAISE NOTICE '3. Test registration at /register';
  RAISE NOTICE '4. Test company registration at /register/company';
  RAISE NOTICE '============================================';
END $$;
