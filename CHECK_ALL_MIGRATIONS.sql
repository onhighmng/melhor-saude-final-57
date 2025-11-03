-- ===================================================================
-- COMPREHENSIVE CHECK: Verify all migrations and functions
-- Run this to see what's missing
-- ===================================================================

-- 1. Check if employee_seats column exists
SELECT '1. EMPLOYEE_SEATS COLUMN' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'employee_seats'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 2. Check bookings.rating constraint (should allow 1-10)
SELECT '2. BOOKINGS RATING SCALE' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'bookings_rating_check'
    AND check_clause LIKE '%<= 10%'
  ) THEN '✅ 1-10 SCALE' ELSE '❌ WRONG SCALE' END as status;

-- 3. Check if get_company_monthly_metrics exists
SELECT '3. GET_COMPANY_MONTHLY_METRICS RPC' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'get_company_monthly_metrics'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 4. Check if get_specialist_performance exists
SELECT '4. GET_SPECIALIST_PERFORMANCE RPC' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'get_specialist_performance'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 5. Check if get_prestador_performance exists
SELECT '5. GET_PRESTADOR_PERFORMANCE RPC' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'get_prestador_performance'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 6. Check if get_company_seat_stats exists
SELECT '6. GET_COMPANY_SEAT_STATS RPC' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'get_company_seat_stats'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 7. Check if can_generate_invite_code exists
SELECT '7. CAN_GENERATE_INVITE_CODE RPC' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'can_generate_invite_code'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 8. List all applied migrations
SELECT '8. APPLIED MIGRATIONS' as check_item,
  'Total: ' || COUNT(*)::text || ' migrations' as status
FROM supabase_migrations.schema_migrations;

-- 9. Show recent migrations (last 10)
SELECT '   Recent Migration' as check_item,
  version || ': ' || name as status
FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 10;


