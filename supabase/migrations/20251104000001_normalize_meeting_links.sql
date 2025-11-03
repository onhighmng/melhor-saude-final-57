-- ============================================
-- NORMALIZE MEETING LINKS
-- Adds https:// protocol to meeting links that don't have it
-- This prevents browser from treating them as relative URLs
-- ============================================

-- Update meeting links that don't start with http:// or https://
UPDATE bookings
SET meeting_link = 'https://' || meeting_link
WHERE meeting_link IS NOT NULL
  AND meeting_link != ''
  AND meeting_link !~ '^https?://';

-- Verify the update
SELECT 
  id,
  meeting_link,
  CASE 
    WHEN meeting_link IS NULL THEN 'No link'
    WHEN meeting_link ~ '^https?://' THEN 'Valid (has protocol)'
    ELSE 'Invalid (missing protocol)'
  END as link_status
FROM bookings
WHERE meeting_link IS NOT NULL
  AND meeting_link != ''
ORDER BY created_at DESC
LIMIT 10;



