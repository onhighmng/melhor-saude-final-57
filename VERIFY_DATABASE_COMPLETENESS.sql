-- ============================================================================
-- COMPREHENSIVE DATABASE VERIFICATION SCRIPT
-- Run this to check what you have vs what you need
-- ============================================================================

-- ============================================================================
-- 1. CHECK APPLIED MIGRATIONS
-- ============================================================================
SELECT 
  '📋 Applied Migrations' as section,
  COUNT(*) as count,
  MIN(version) as oldest,
  MAX(version) as newest
FROM supabase_migrations.schema_migrations;

-- ============================================================================
-- 2. CHECK ALL TABLES
-- ============================================================================
SELECT 
  '📊 Existing Tables' as section,
  tablename,
  CASE WHEN rowsecurity THEN '🔒 RLS Enabled' ELSE '🔓 RLS Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- 3. CHECK ESSENTIAL TABLES (Must Have)
-- ============================================================================
SELECT 
  '✅ Essential Tables Check' as section,
  table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables t 
      WHERE t.table_schema = 'public' 
      AND t.table_name = required_tables.table_name
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (
  VALUES 
    ('profiles'),
    ('companies'),
    ('company_employees'),
    ('user_roles'),
    ('invites'),
    ('prestadores'),
    ('bookings'),
    ('resources'),
    ('notifications'),
    ('chat_sessions'),
    ('chat_messages'),
    ('feedback'),
    ('user_milestones'),
    ('user_progress'),
    ('specialist_assignments'),
    ('admin_logs'),
    ('specialist_analytics')
) AS required_tables(table_name)
ORDER BY status DESC, table_name;

-- ============================================================================
-- 4. CHECK ESSENTIAL FUNCTIONS (Must Have)
-- ============================================================================
SELECT 
  '🔧 Essential Functions Check' as section,
  func_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
      AND p.proname = required_funcs.func_name
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (
  VALUES 
    ('handle_new_user'),
    ('promote_to_admin'),
    ('is_admin'),
    ('create_invite_code')
) AS required_funcs(func_name)
ORDER BY status DESC, func_name;

-- ============================================================================
-- 5. CHECK RLS POLICIES
-- ============================================================================
SELECT 
  '🔐 RLS Policies Summary' as section,
  tablename,
  COUNT(*) as policy_count,
  ARRAY_AGG(policyname ORDER BY policyname) as policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- 6. CHECK FOR MISSING COLUMNS IN KEY TABLES
-- ============================================================================

-- Check profiles table columns
SELECT 
  '📋 Profiles Columns' as section,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check bookings table columns
SELECT 
  '📋 Bookings Columns' as section,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookings'
ORDER BY ordinal_position;

-- Check prestadores table columns
SELECT 
  '📋 Prestadores Columns' as section,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'prestadores'
ORDER BY ordinal_position;

-- ============================================================================
-- 7. CHECK USER DATA
-- ============================================================================
SELECT 
  '👥 User Data Check' as section,
  COUNT(*) as total_users,
  COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END) as users_with_profiles,
  COUNT(CASE WHEN ur.id IS NOT NULL THEN 1 END) as users_with_roles
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN user_roles ur ON ur.user_id = au.id;

-- ============================================================================
-- 8. OVERALL HEALTH SCORE
-- ============================================================================
WITH health_check AS (
  SELECT 
    -- Tables
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count,
    -- RLS Policies
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as policy_count,
    -- Functions
    (SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public') as function_count,
    -- Users
    (SELECT COUNT(*) FROM auth.users) as user_count,
    -- Profiles
    (SELECT COUNT(*) FROM profiles) as profile_count
)
SELECT 
  '🏥 Database Health Score' as section,
  table_count || ' tables' as tables,
  policy_count || ' RLS policies' as policies,
  function_count || ' functions' as functions,
  user_count || ' users' as users,
  profile_count || ' profiles' as profiles,
  CASE 
    WHEN table_count >= 15 AND policy_count >= 10 AND function_count >= 4 THEN '✅ HEALTHY'
    WHEN table_count >= 10 AND policy_count >= 5 THEN '⚠️ PARTIAL'
    ELSE '❌ INCOMPLETE'
  END as overall_status
FROM health_check;

-- ============================================================================
-- 9. MISSING MIGRATIONS SUMMARY
-- ============================================================================
SELECT 
  '📝 Migration Summary' as section,
  'You have 85+ local migration files' as local_files,
  (SELECT COUNT(*)::text || ' migrations applied' FROM supabase_migrations.schema_migrations) as applied,
  '~50 older migrations not applied (but may not be needed)' as note;


