-- ============================================
-- CHECK AND FIX MEETING LINKS FOR YOUR USER
-- Run this in Supabase SQL Editor NOW
-- ============================================

-- 1. FIRST: Check your current meeting links
SELECT 
  id,
  date,
  start_time,
  meeting_link,
  LENGTH(meeting_link) as link_length,
  SUBSTRING(meeting_link, 1, 10) as first_10_chars
FROM bookings
WHERE user_id = '72ec7142-9478-4b82-8c3a-66f4cdff461e'
  AND meeting_link IS NOT NULL
ORDER BY created_at DESC;

-- 2. FIX: Add https:// to links without protocol
UPDATE bookings
SET meeting_link = 'https://' || meeting_link
WHERE user_id = '72ec7142-9478-4b82-8c3a-66f4cdff461e'
  AND meeting_link IS NOT NULL
  AND meeting_link != ''
  AND meeting_link NOT LIKE 'http://%'
  AND meeting_link NOT LIKE 'https://%';

-- 3. VERIFY: Check that all links now have https://
SELECT 
  id,
  date,
  start_time,
  meeting_link,
  CASE 
    WHEN meeting_link LIKE 'https://%' THEN '✅ FIXED - Has https://'
    WHEN meeting_link LIKE 'http://%' THEN '⚠️ Has http:// (should be https://)'
    ELSE '❌ MISSING protocol'
  END as status
FROM bookings
WHERE user_id = '72ec7142-9478-4b82-8c3a-66f4cdff461e'
  AND meeting_link IS NOT NULL
ORDER BY created_at DESC;

-- 4. BONUS: Fix ALL bookings in the entire database (for all users)
UPDATE bookings
SET meeting_link = 'https://' || meeting_link
WHERE meeting_link IS NOT NULL
  AND meeting_link != ''
  AND meeting_link NOT LIKE 'http://%'
  AND meeting_link NOT LIKE 'https://%';

-- 5. FINAL CHECK: Show how many links were fixed
SELECT 
  'Total bookings with links' as metric,
  COUNT(*) as count
FROM bookings
WHERE meeting_link IS NOT NULL AND meeting_link != ''
UNION ALL
SELECT 
  'Links with https://' as metric,
  COUNT(*) as count
FROM bookings
WHERE meeting_link LIKE 'https://%'
UNION ALL
SELECT 
  'Links with http://' as metric,
  COUNT(*) as count
FROM bookings
WHERE meeting_link LIKE 'http://%'
UNION ALL
SELECT 
  'Links WITHOUT protocol' as metric,
  COUNT(*) as count
FROM bookings
WHERE meeting_link IS NOT NULL 
  AND meeting_link != ''
  AND meeting_link NOT LIKE 'http://%'
  AND meeting_link NOT LIKE 'https://%';



