-- ===================================================================
-- CLEANUP INVALID COMPANIES AND AFFILIATES
-- ===================================================================
-- This script helps you identify and delete test/invalid data
-- from the admin user management page
-- ===================================================================

-- ============================================
-- STEP 1: REVIEW WHAT WILL BE DELETED
-- ============================================

-- View all companies (review before deleting)
SELECT 
  id,
  name,
  email,
  nuit,
  plan_type,
  sessions_allocated,
  sessions_used,
  is_active,
  created_at
FROM companies
ORDER BY created_at DESC;

-- View all prestadores/affiliates (review before deleting)
SELECT 
  p.id,
  p.user_id,
  COALESCE(pr.name, pr.email) as name,
  pr.email,
  p.specialty,
  p.pillars,
  p.is_active,
  p.created_at
FROM prestadores p
LEFT JOIN profiles pr ON pr.id = p.user_id
ORDER BY p.created_at DESC;

-- ============================================
-- OPTION 1: DELETE SPECIFIC COMPANY BY NAME OR EMAIL
-- ============================================

-- Replace 'Test Company' with the actual company name or email
DO $$
DECLARE
  v_company_id UUID;
  v_company_name TEXT := 'Test Company'; -- ⚠️ CHANGE THIS
BEGIN
  -- Find company
  SELECT id INTO v_company_id
  FROM companies
  WHERE name ILIKE v_company_name
     OR email ILIKE v_company_name;
  
  IF v_company_id IS NULL THEN
    RAISE NOTICE '❌ Company not found: %', v_company_name;
    RETURN;
  END IF;
  
  RAISE NOTICE '🗑️  Deleting company: % (ID: %)', v_company_name, v_company_id;
  
  -- Delete in order (respecting foreign keys)
  
  -- 1. Delete company employees
  DELETE FROM company_employees WHERE company_id = v_company_id;
  RAISE NOTICE '  ✓ Deleted company_employees';
  
  -- 2. Delete invites for this company
  DELETE FROM invites WHERE company_id = v_company_id;
  RAISE NOTICE '  ✓ Deleted invites';
  
  -- 3. Delete company
  DELETE FROM companies WHERE id = v_company_id;
  RAISE NOTICE '  ✓ Deleted company';
  
  RAISE NOTICE '✅ Successfully deleted company: %', v_company_name;
END $$;

-- ============================================
-- OPTION 2: DELETE SPECIFIC PRESTADOR/AFFILIATE BY EMAIL
-- ============================================

-- Replace with the actual prestador email
DO $$
DECLARE
  v_user_id UUID;
  v_prestador_email TEXT := 'prestador@test.com'; -- ⚠️ CHANGE THIS
BEGIN
  -- Find user ID from email
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = v_prestador_email;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ Prestador not found: %', v_prestador_email;
    RETURN;
  END IF;
  
  RAISE NOTICE '🗑️  Deleting prestador: % (ID: %)', v_prestador_email, v_user_id;
  
  -- Delete in order (respecting foreign keys)
  
  -- 1. Delete bookings
  DELETE FROM bookings WHERE prestador_id = v_user_id;
  RAISE NOTICE '  ✓ Deleted bookings';
  
  -- 2. Delete sessions
  DELETE FROM sessions WHERE prestador_id = v_user_id;
  RAISE NOTICE '  ✓ Deleted sessions';
  
  -- 3. Delete availability
  DELETE FROM prestador_availability WHERE prestador_id = v_user_id;
  RAISE NOTICE '  ✓ Deleted availability';
  
  -- 4. Delete prestador record
  DELETE FROM prestadores WHERE user_id = v_user_id;
  RAISE NOTICE '  ✓ Deleted prestador record';
  
  -- 5. Delete user roles
  DELETE FROM user_roles WHERE user_id = v_user_id;
  RAISE NOTICE '  ✓ Deleted user_roles';
  
  -- 6. Delete profile
  DELETE FROM profiles WHERE id = v_user_id;
  RAISE NOTICE '  ✓ Deleted profile';
  
  -- 7. Delete auth user (if possible)
  -- Note: This requires admin privileges
  DELETE FROM auth.users WHERE id = v_user_id;
  RAISE NOTICE '  ✓ Deleted auth user';
  
  RAISE NOTICE '✅ Successfully deleted prestador: %', v_prestador_email;
END $$;

-- ============================================
-- OPTION 3: DELETE ALL TEST/INVALID COMPANIES
-- ============================================
-- Use this if you want to delete multiple test companies at once

DO $$
DECLARE
  v_company RECORD;
  v_deleted_count INTEGER := 0;
BEGIN
  -- Delete companies matching test patterns
  FOR v_company IN
    SELECT id, name, email
    FROM companies
    WHERE 
      name ILIKE '%test%'
      OR name ILIKE '%demo%'
      OR name ILIKE '%example%'
      OR email ILIKE '%test%'
      OR email ILIKE '%example%'
      OR nuit IS NULL
      OR nuit = ''
      OR nuit = 'N/A'
  LOOP
    RAISE NOTICE '🗑️  Deleting company: % (ID: %)', v_company.name, v_company.id;
    
    DELETE FROM company_employees WHERE company_id = v_company.id;
    DELETE FROM invites WHERE company_id = v_company.id;
    DELETE FROM companies WHERE id = v_company.id;
    
    v_deleted_count := v_deleted_count + 1;
  END LOOP;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ Total test companies deleted: %', v_deleted_count;
END $$;

-- ============================================
-- OPTION 4: DELETE ALL TEST/INVALID PRESTADORES
-- ============================================
-- Use this if you want to delete multiple test prestadores at once

DO $$
DECLARE
  v_user RECORD;
  v_deleted_count INTEGER := 0;
BEGIN
  -- Delete prestadores matching test patterns
  FOR v_user IN
    SELECT DISTINCT p.user_id, pr.email, pr.name
    FROM prestadores p
    LEFT JOIN profiles pr ON pr.id = p.user_id
    WHERE 
      pr.email ILIKE '%test%'
      OR pr.email ILIKE '%demo%'
      OR pr.email ILIKE '%example%'
      OR pr.name ILIKE '%test%'
      OR pr.name ILIKE '%demo%'
  LOOP
    RAISE NOTICE '🗑️  Deleting prestador: % (%)', v_user.name, v_user.email;
    
    DELETE FROM bookings WHERE prestador_id = v_user.user_id;
    DELETE FROM sessions WHERE prestador_id = v_user.user_id;
    DELETE FROM prestador_availability WHERE prestador_id = v_user.user_id;
    DELETE FROM prestadores WHERE user_id = v_user.user_id;
    DELETE FROM user_roles WHERE user_id = v_user.user_id;
    DELETE FROM profiles WHERE id = v_user.user_id;
    DELETE FROM auth.users WHERE id = v_user.user_id;
    
    v_deleted_count := v_deleted_count + 1;
  END LOOP;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ Total test prestadores deleted: %', v_deleted_count;
END $$;

-- ============================================
-- OPTION 5: DELETE OLD/EXPIRED INVITE CODES
-- ============================================
-- Clean up old codes that were generated before the fix

DELETE FROM invites
WHERE status = 'pending'
  AND expires_at < NOW();

RAISE NOTICE '✅ Deleted expired invite codes';

-- Optionally, delete ALL pending codes to start fresh
-- Uncomment the lines below if you want to delete all pending codes

/*
DELETE FROM invites
WHERE status = 'pending';

RAISE NOTICE '✅ Deleted all pending invite codes';
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check remaining companies
SELECT COUNT(*) as total_companies FROM companies;

-- Check remaining prestadores
SELECT COUNT(*) as total_prestadores FROM prestadores;

-- Check remaining pending codes
SELECT 
  user_type,
  role,
  COUNT(*) as count
FROM invites
WHERE status = 'pending'
GROUP BY user_type, role
ORDER BY user_type;

-- ============================================
-- NOTES
-- ============================================
-- After cleaning up:
-- 1. Generate NEW access codes in the admin dashboard
-- 2. New codes will have correct role mapping
-- 3. Register test accounts with new codes to verify fix works

