-- Phase 7A: Critical Database Fixes

-- Step 1: Add missing columns to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- Add check constraint for priority
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_priority_check;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_priority_check 
CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_related_booking 
ON notifications(related_booking_id);

-- Step 2: Standardize booking statuses in database
UPDATE bookings 
SET status = 'confirmed' 
WHERE status = 'scheduled';

-- Add check constraint for valid booking statuses
ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings
ADD CONSTRAINT bookings_status_check
CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled', 'in_progress'));

-- Add index for booking status queries
CREATE INDEX IF NOT EXISTS idx_bookings_status 
ON bookings(status);

-- Add index for booking date queries
CREATE INDEX IF NOT EXISTS idx_bookings_date 
ON bookings(date) WHERE status IN ('pending', 'confirmed');