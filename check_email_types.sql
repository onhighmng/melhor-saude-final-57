-- ============================================================================
-- HELPER QUERY: Check existing email types in the database
-- Run this in Supabase SQL Editor if you still get constraint errors
-- ============================================================================

-- Check all distinct email types currently in the email_queue
SELECT
  email_type,
  COUNT(*) as count,
  MIN(created_at) as first_created,
  MAX(created_at) as last_created
FROM email_queue
GROUP BY email_type
ORDER BY count DESC;

-- If you see any email types NOT in the list below, you need to either:
-- 1. Add them to the constraint in the migration file
-- 2. Or update/delete those rows

-- Currently allowed email types:
-- 'booking_confirmation'
-- 'booking_cancellation'
-- 'booking_cancelled'
-- 'booking_reminder'
-- 'booking_reminder_24h'
-- 'booking_reminder_1h'
-- 'session_completed'
-- 'session_reminder'
-- 'session_reminder_24h'
-- 'session_reminder_1h'
-- 'welcome'
-- 'milestone_achieved'
-- 'milestone'
-- 'goal_progress'
-- 'message_from_specialist'
-- 'chat_escalation'
-- 'new_resource'
-- 'system_alert'
-- 'password_reset'
-- 'email_verification'
-- 'onboarding_complete'
-- 'notification'

-- ============================================================================
-- OPTIONAL: Clean up invalid email types (CAREFUL!)
-- ============================================================================

-- Uncomment and run this ONLY if you want to delete rows with invalid types
-- FIRST, check what would be deleted:

-- SELECT * FROM email_queue
-- WHERE email_type NOT IN (
--   'booking_confirmation', 'booking_cancellation', 'booking_cancelled',
--   'booking_reminder', 'booking_reminder_24h', 'booking_reminder_1h',
--   'session_completed', 'session_reminder', 'session_reminder_24h', 'session_reminder_1h',
--   'welcome', 'milestone_achieved', 'milestone', 'goal_progress',
--   'message_from_specialist', 'chat_escalation', 'new_resource', 'system_alert',
--   'password_reset', 'email_verification', 'onboarding_complete', 'notification'
-- );

-- Then uncomment this to delete them:
-- DELETE FROM email_queue
-- WHERE email_type NOT IN (
--   'booking_confirmation', 'booking_cancellation', 'booking_cancelled',
--   'booking_reminder', 'booking_reminder_24h', 'booking_reminder_1h',
--   'session_completed', 'session_reminder', 'session_reminder_24h', 'session_reminder_1h',
--   'welcome', 'milestone_achieved', 'milestone', 'goal_progress',
--   'message_from_specialist', 'chat_escalation', 'new_resource', 'system_alert',
--   'password_reset', 'email_verification', 'onboarding_complete', 'notification'
-- );
