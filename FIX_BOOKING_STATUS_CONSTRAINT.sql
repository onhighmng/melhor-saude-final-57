-- ============================================================================
-- FIX BOOKINGS TABLE STATUS CONSTRAINT
-- ============================================================================
-- ISSUE: Code uses 'scheduled' status but CHECK constraint doesn't include it
-- This causes inserts/updates with status='scheduled' to fail
--
-- Evidence:
-- - src/components/admin/providers/BookingModal.tsx:102 uses 'scheduled'
-- - supabase/migrations RPC functions use 'scheduled'
-- - Database constraint only allows: pending, confirmed, completed, cancelled, no_show, rescheduled
--
-- SOLUTION: Add 'scheduled' to the valid status values
-- ============================================================================

-- Drop existing constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Recreate with complete list of status values
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN (
    'pending',      -- Initial state when booking created
    'scheduled',    -- Confirmed time slot (used by admin bookings)
    'confirmed',    -- Provider confirmed attendance
    'completed',    -- Session finished successfully
    'cancelled',    -- Booking cancelled by user or provider
    'no_show',      -- User didn't attend
    'rescheduled'   -- Booking moved to different time
  ));

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check the constraint exists
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'bookings'::regclass
  AND conname = 'bookings_status_check';

-- Check for any invalid status values currently in the table
SELECT DISTINCT status, COUNT(*) as count
FROM bookings
GROUP BY status
ORDER BY status;

-- Show any bookings with 'scheduled' status (should now be valid)
SELECT COUNT(*) as scheduled_bookings
FROM bookings
WHERE status = 'scheduled';

-- ============================================================================
-- NOTES
-- ============================================================================
-- After applying this fix:
-- ✅ Admin manual bookings will work (they use 'scheduled')
-- ✅ RPC functions will work correctly
-- ✅ Frontend code won't get constraint violation errors
-- ✅ All existing bookings remain valid
--
-- If there are existing bookings with status='scheduled' before this fix,
-- they may have been inserted with constraints disabled or via raw SQL.
-- This migration makes them officially valid.
-- ============================================================================





