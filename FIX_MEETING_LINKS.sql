-- ============================================
-- FIX MEETING LINKS FOR USER: 72ec7142-9478-4b82-8c3a-66f4cdff461e
-- Adds https:// protocol to meeting links that don't have it
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check current meeting links
SELECT 
  id,
  date,
  start_time,
  meeting_link,
  CASE 
    WHEN meeting_link IS NULL THEN 'No link set'
    WHEN meeting_link = '' THEN 'Empty link'
    WHEN meeting_link ~ '^https?://' THEN 'Valid (has protocol)'
    ELSE 'Invalid (missing protocol)'
  END as link_status
FROM bookings
WHERE user_id = '72ec7142-9478-4b82-8c3a-66f4cdff461e'
ORDER BY date DESC;

-- 2. Fix meeting links that are missing protocol
UPDATE bookings
SET meeting_link = 'https://' || meeting_link
WHERE user_id = '72ec7142-9478-4b82-8c3a-66f4cdff461e'
  AND meeting_link IS NOT NULL
  AND meeting_link != ''
  AND meeting_link !~ '^https?://';

-- 3. Fix ALL meeting links in the entire database (for all users)
UPDATE bookings
SET meeting_link = 'https://' || meeting_link
WHERE meeting_link IS NOT NULL
  AND meeting_link != ''
  AND meeting_link !~ '^https?://';

-- 4. Verify all links are now valid
SELECT 
  COUNT(*) as total_bookings_with_links,
  SUM(CASE WHEN meeting_link ~ '^https?://' THEN 1 ELSE 0 END) as valid_links,
  SUM(CASE WHEN meeting_link IS NOT NULL AND meeting_link != '' AND meeting_link !~ '^https?://' THEN 1 ELSE 0 END) as invalid_links
FROM bookings
WHERE meeting_link IS NOT NULL AND meeting_link != '';


