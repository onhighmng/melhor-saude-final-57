-- ============================================================================
-- DIAGNOSE DATA VISIBILITY ISSUES
-- ============================================================================
-- This script checks common reasons why data might not show in the frontend
-- Run this to identify what's blocking data visibility
-- ============================================================================

-- ============================================================================
-- 1. CHECK RLS (ROW LEVEL SECURITY) STATUS
-- ============================================================================
-- RLS can block data if policies are too restrictive

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) 
   FROM pg_policies 
   WHERE pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'companies', 'company_employees', 'bookings',
    'user_milestones', 'user_progress', 'notifications',
    'invites', 'resources', 'prestadores', 'user_roles'
  )
ORDER BY tablename;

-- ============================================================================
-- 2. CHECK DATA EXISTS IN KEY TABLES
-- ============================================================================

SELECT 'Data Counts' as check_type;

SELECT 
  'profiles' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'hr' THEN 1 END) as hr_users,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users
FROM profiles
UNION ALL
SELECT 
  'companies',
  COUNT(*),
  COUNT(CASE WHEN is_active = true THEN 1 END),
  NULL,
  NULL
FROM companies
UNION ALL
SELECT 
  'company_employees',
  COUNT(*),
  COUNT(CASE WHEN sessions_allocated > 0 THEN 1 END),
  NULL,
  NULL
FROM company_employees
UNION ALL
SELECT 
  'bookings',
  COUNT(*),
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END),
  COUNT(CASE WHEN status = 'pending' THEN 1 END),
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END)
FROM bookings
UNION ALL
SELECT 
  'user_milestones',
  COUNT(*),
  COUNT(CASE WHEN completed = true THEN 1 END),
  NULL,
  NULL
FROM user_milestones
UNION ALL
SELECT 
  'invites',
  COUNT(*),
  COUNT(CASE WHEN status = 'pending' THEN 1 END),
  COUNT(CASE WHEN status = 'accepted' THEN 1 END),
  NULL
FROM invites
UNION ALL
SELECT 
  'prestadores',
  COUNT(*),
  COUNT(CASE WHEN is_active = true THEN 1 END),
  NULL,
  NULL
FROM prestadores
UNION ALL
SELECT 
  'user_roles',
  COUNT(*),
  NULL,
  NULL,
  NULL
FROM user_roles;

-- ============================================================================
-- 3. CHECK RLS POLICIES FOR KEY TABLES
-- ============================================================================

SELECT 
  'RLS Policies' as check_type,
  tablename as table_name,
  policyname as policy_name,
  cmd as command_type,
  qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'companies', 'company_employees', 'bookings',
    'user_milestones', 'user_progress', 'notifications', 'invites'
  )
ORDER BY tablename, policyname;

-- ============================================================================
-- 4. CHECK FOR TABLES WITH RLS ENABLED BUT NO POLICIES
-- ============================================================================
-- These will BLOCK all data access!

SELECT 
  'CRITICAL: RLS enabled but NO policies' as issue_type,
  tablename,
  'This will block ALL data access!' as impact
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
  AND tablename NOT IN (
    SELECT DISTINCT tablename 
    FROM pg_policies 
    WHERE schemaname = 'public'
  )
  AND tablename IN (
    'profiles', 'companies', 'company_employees', 'bookings',
    'user_milestones', 'user_progress', 'notifications', 'invites',
    'resources', 'prestadores', 'user_roles'
  );

-- ============================================================================
-- 5. CHECK FOREIGN KEY RELATIONSHIPS
-- ============================================================================
-- Missing FK data can cause joins to fail

SELECT 
  'Foreign Key Check' as check_type,
  conname as constraint_name,
  conrelid::regclass as from_table,
  confrelid::regclass as to_table,
  a.attname as from_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE c.contype = 'f'
  AND connamespace = 'public'::regnamespace
  AND (
    conrelid::regclass::text IN ('profiles', 'companies', 'company_employees', 'bookings', 'invites')
    OR confrelid::regclass::text IN ('profiles', 'companies', 'company_employees', 'bookings', 'invites')
  )
ORDER BY from_table, constraint_name;

-- ============================================================================
-- 6. CHECK SPECIFIC USER DATA (Replace with actual user_id)
-- ============================================================================
-- Uncomment and replace USER_ID_HERE with actual user ID to test

/*
DO $$
DECLARE
  test_user_id UUID := 'USER_ID_HERE'; -- Replace with actual user ID
BEGIN
  RAISE NOTICE 'Checking data for user: %', test_user_id;
  
  -- Check profile
  RAISE NOTICE 'Profile exists: %', EXISTS(SELECT 1 FROM profiles WHERE id = test_user_id);
  
  -- Check roles
  RAISE NOTICE 'User roles: %', (SELECT array_agg(role) FROM user_roles WHERE user_id = test_user_id);
  
  -- Check company membership
  RAISE NOTICE 'Company membership: %', EXISTS(SELECT 1 FROM company_employees WHERE user_id = test_user_id);
  
  -- Check milestones
  RAISE NOTICE 'Milestones count: %', (SELECT COUNT(*) FROM user_milestones WHERE user_id = test_user_id);
END $$;
*/

-- ============================================================================
-- 7. COMMON ISSUES SUMMARY
-- ============================================================================

SELECT 
  'Issue Summary' as report_type,
  'Check the results above for:' as instructions
UNION ALL
SELECT '', '1. Tables with RLS enabled but NO policies (CRITICAL - blocks all data)'
UNION ALL
SELECT '', '2. Tables with 0 rows (no data to show)'
UNION ALL
SELECT '', '3. Missing RLS policies for SELECT operations'
UNION ALL
SELECT '', '4. Foreign key constraints that might be failing';

-- ============================================================================
-- 8. RECOMMENDED FIXES QUERY
-- ============================================================================

SELECT 
  'Recommended Actions' as action_type,
  'If you see issues above, run these fixes:' as description
UNION ALL
SELECT '', 'A. Disable RLS temporarily for testing: ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;'
UNION ALL
SELECT '', 'B. Create SELECT policies: CREATE POLICY "name" ON [table] FOR SELECT USING (true);'
UNION ALL
SELECT '', 'C. Check auth.uid() returns correct user ID in browser console'
UNION ALL
SELECT '', 'D. Verify user has correct roles in user_roles table';





