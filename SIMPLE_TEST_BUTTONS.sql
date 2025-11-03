-- ============================================================================
-- QUICK TEST: Check if specialist calendar buttons will work
-- ============================================================================

-- TEST 1: Check if functions exist
-- Expected: 3 rows (cancel, update_link, reschedule)
-- If 0 rows: You need to run the SQL migration!

SELECT 
  '✅ FUNCTIONS' as check_type,
  routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'cancel_booking_as_specialist',
    'update_meeting_link_as_specialist',
    'reschedule_booking_as_specialist'
  )
ORDER BY routine_name;

-- ============================================================================

-- TEST 2: Check if you are a prestador
-- Expected: 1 row with your prestador_id
-- If 0 rows: You need to create a prestador record!

SELECT 
  '✅ PRESTADOR STATUS' as check_type,
  p.id as prestador_id,
  p.name as prestador_name,
  pr.email,
  pr.role
FROM profiles pr
LEFT JOIN prestadores p ON p.user_id = pr.id
WHERE pr.id = auth.uid();

-- ============================================================================

-- TEST 3: Check if RLS policies exist
-- Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- If less than 4: You need to run the SQL migration!

SELECT 
  '✅ RLS POLICIES' as check_type,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY cmd;

-- ============================================================================

-- TEST 4: Check if you have test bookings
-- Expected: At least 1 row
-- If 0 rows: You need test data!

SELECT 
  '✅ TEST BOOKINGS' as check_type,
  b.id,
  b.booking_date,
  b.status,
  b.prestador_id,
  pr.user_id as prestador_user_id,
  CASE 
    WHEN pr.user_id = auth.uid() THEN '✅ ASSIGNED TO YOU'
    ELSE '❌ NOT YOUR BOOKING'
  END as assignment_status
FROM bookings b
LEFT JOIN prestadores pr ON b.prestador_id = pr.id
WHERE b.status = 'scheduled'
ORDER BY b.booking_date
LIMIT 5;

-- ============================================================================
-- RESULTS INTERPRETATION
-- ============================================================================

/*
IF ALL TESTS PASS:
  ✅ Functions: 3 rows
  ✅ Prestador: 1 row with your ID
  ✅ RLS Policies: 4 policies
  ✅ Bookings: At least 1 assigned to you
  
  → Your buttons SHOULD work! 
  → If they still don't, check browser console for JavaScript errors

IF ANY TEST FAILS:
  → Run the SQL from RUN_THESE_SQL_COMMANDS.md
  → Then run this test again
*/

-- ============================================================================
-- QUICK FIXES IF TESTS FAIL
-- ============================================================================

-- FIX 1: If you're not a prestador (TEST 2 failed)
-- Uncomment and run:
/*
INSERT INTO prestadores (user_id, name, specialty)
SELECT 
  auth.uid(),
  COALESCE(p.name, p.email, 'Unnamed Specialist'),
  'General'
FROM profiles p
WHERE p.id = auth.uid()
ON CONFLICT DO NOTHING;
*/

-- FIX 2: If no test bookings exist (TEST 4 failed)
-- Uncomment and run (replace UUIDs):
/*
INSERT INTO bookings (
  user_id,
  prestador_id,
  booking_date,
  start_time,
  end_time,
  status,
  pillar
) VALUES (
  (SELECT id FROM profiles WHERE role = 'user' LIMIT 1), -- First user
  (SELECT id FROM prestadores WHERE user_id = auth.uid()), -- Your prestador ID
  CURRENT_DATE + INTERVAL '3 days',
  '14:00'::TIME,
  '15:00'::TIME,
  'scheduled',
  'psychological'
);
*/

-- FIX 3: If functions don't exist (TEST 1 failed)
-- You MUST run the complete SQL from RUN_THESE_SQL_COMMANDS.md
-- No shortcut here - that file contains all the function definitions

-- FIX 4: If RLS policies are wrong (TEST 3 failed)
-- You MUST run the complete SQL from RUN_THESE_SQL_COMMANDS.md


