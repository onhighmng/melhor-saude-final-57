-- =====================================================
-- FIX ALL REGISTRATION ISSUES - SIMPLIFIED VERSION
-- Run this in Supabase SQL Editor - ONE SECTION AT A TIME
-- =====================================================

-- =====================================================
-- SECTION 1: FIX company_id constraint
-- =====================================================
-- Run this first
ALTER TABLE invites ALTER COLUMN company_id DROP NOT NULL;

-- =====================================================
-- SECTION 2: Add 'especialista_geral' to enum
-- =====================================================
-- Run this second (may take 5-10 seconds)
ALTER TYPE app_role ADD VALUE 'especialista_geral';

-- =====================================================
-- SECTION 3: Fix status constraint
-- =====================================================
-- Run this third
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_status_check;
ALTER TABLE invites ADD CONSTRAINT invites_status_check 
  CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled', 'revoked', 'used'));

-- =====================================================
-- SECTION 4: Clean up broken codes
-- =====================================================
-- Run this fourth
DELETE FROM invites WHERE role IS NULL;

-- =====================================================
-- SECTION 5: VERIFY FIXES
-- =====================================================
-- Run this fifth to check if fixes worked

-- Check 1: company_id is nullable
SELECT 
  column_name,
  is_nullable,
  'Should be YES' as expected
FROM information_schema.columns
WHERE table_name = 'invites' AND column_name = 'company_id';

-- Check 2: enum has all roles
SELECT 
  enumlabel as role
FROM pg_enum
WHERE enumtypid = 'app_role'::regtype
ORDER BY enumsortorder;

-- Check 3: No NULL roles
SELECT 
  COUNT(*) as codes_with_null_role,
  'Should be 0' as expected
FROM invites 
WHERE role IS NULL;

-- =====================================================
-- SECTION 6: TEST & SHOW RECENT CODES
-- =====================================================
-- Run this last to see current state

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
-- DONE! All fixes applied.
-- Now go to http://localhost:8081/admin/users
-- and generate new codes for specialist/prestador
-- =====================================================

