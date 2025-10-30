-- =====================================================
-- STEP 2: Add especialista_geral to enum
-- Run this next
-- =====================================================
ALTER TYPE app_role ADD VALUE 'especialista_geral';

-- =====================================================
-- STEP 3: Fix status constraint
-- Run this after STEP 2
-- =====================================================
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_status_check;
ALTER TABLE invites ADD CONSTRAINT invites_status_check 
  CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled', 'revoked', 'used'));

-- =====================================================
-- STEP 4: Clean up broken codes
-- Run this after STEP 3
-- =====================================================
DELETE FROM invites WHERE role IS NULL;

-- =====================================================
-- STEP 5: VERIFY - Check if fixes worked
-- Run this to see if everything is correct
-- =====================================================
-- Check enum has all roles
SELECT 
  enumlabel as role
FROM pg_enum
WHERE enumtypid = 'app_role'::regtype
ORDER BY enumsortorder;

-- Check no NULL roles
SELECT 
  COUNT(*) as codes_with_null_role
FROM invites 
WHERE role IS NULL;

-- =====================================================
-- STEP 6: TEST - Generate codes and see them
-- =====================================================
-- This will show you recent codes and their roles
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

