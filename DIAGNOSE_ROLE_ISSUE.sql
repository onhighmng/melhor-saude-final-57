-- ===================================================================
-- DIAGNOSE ROLE AND ACCESS CODE ISSUES
-- ===================================================================
-- Run these queries to find out what's wrong
-- ===================================================================

-- ============================================
-- CHECK 1: Verify generate_access_code function exists
-- ============================================
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE proname = 'generate_access_code';
-- Expected: Should return the function with its parameters

-- ============================================
-- CHECK 2: Test generate_access_code function manually
-- ============================================
-- This tests if the function works
SELECT * FROM generate_access_code('prestador', NULL, '{}'::jsonb, 30);
-- Expected: Should return a code, expires_at, and role = 'prestador'

-- If you get an error, it might say:
-- "function generate_access_code does not exist"
-- OR "role constraint violation"

-- ============================================
-- CHECK 3: Check the invites table constraint
-- ============================================
SELECT
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'invites'::regclass
  AND conname LIKE '%role%';
-- This shows what roles are allowed in the invites table

-- ============================================
-- CHECK 4: Check the user_roles table constraint  
-- ============================================
SELECT
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_roles'::regclass
  AND conname LIKE '%role%';
-- This shows what roles are allowed in the user_roles table

-- ============================================
-- CHECK 5: Check if app_role enum type exists
-- ============================================
SELECT enumlabel as allowed_roles
FROM pg_enum
WHERE enumtypid = 'app_role'::regtype
ORDER BY enumsortorder;
-- Expected: Should show: admin, user, hr, prestador, especialista_geral

-- ============================================
-- CHECK 6: View recently created invites
-- ============================================
SELECT 
  invite_code,
  role,
  user_type,
  status,
  created_at,
  expires_at
FROM invites
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 10;
-- Check if codes are being created with correct role

-- ============================================
-- CHECK 7: Check handle_new_user trigger
-- ============================================
SELECT 
  tgname as trigger_name,
  tgtype,
  tgenabled
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass
  AND tgname = 'on_auth_user_created';
-- Expected: Should show the trigger exists and is enabled

-- ============================================
-- CHECK 8: View handle_new_user function source
-- ============================================
SELECT pg_get_functiondef('handle_new_user'::regproc);
-- This shows the actual code of the trigger function

-- ============================================
-- CHECK 9: Find recently created users and their roles
-- ============================================
SELECT 
  p.email,
  p.name,
  p.created_at,
  ARRAY_AGG(DISTINCT ur.role) as assigned_roles,
  get_user_primary_role(p.id) as primary_role
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE p.created_at > NOW() - INTERVAL '1 hour'
GROUP BY p.id, p.email, p.name, p.created_at
ORDER BY p.created_at DESC;
-- Check what roles are actually being assigned

-- ============================================
-- CHECK 10: Test role assignment manually
-- ============================================
-- This simulates what happens during registration
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_role TEXT := 'prestador';
BEGIN
  -- Try to insert a test role
  INSERT INTO user_roles (user_id, role)
  VALUES (test_user_id, test_role::app_role);
  
  RAISE NOTICE '✅ Role insertion works!';
  
  -- Clean up test data
  DELETE FROM user_roles WHERE user_id = test_user_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error inserting role: %', SQLERRM;
END $$;

-- ============================================
-- COMMON ISSUES AND FIXES
-- ============================================

-- ISSUE 1: generate_access_code function doesn't exist
-- FIX: Need to run the migration that creates it
/*
Run this migration file:
supabase/migrations/20251030000000_add_specialist_to_invites_constraint.sql
OR
Run the create function SQL from FIX_SPECIALIST_COMPLETE.sql
*/

-- ISSUE 2: Role constraint violation (role not allowed)
-- FIX: Check what roles are allowed in the enum
-- If 'prestador' is not in the list, add it:
/*
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'prestador';
*/

-- ISSUE 3: Trigger not firing or failing silently
-- FIX: Check trigger function and recreate it
/*
See supabase/migrations/20251027105656_2865f3be-1226-4250-952d-8411c1ceb6a7.sql
*/

-- ============================================
-- EXPORT DIAGNOSTICS
-- ============================================
-- Copy the results of all these queries and send them
-- This will help identify the exact problem

