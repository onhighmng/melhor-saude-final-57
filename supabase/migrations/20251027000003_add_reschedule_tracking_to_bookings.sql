-- Add reschedule tracking columns to bookings table if they don't exist
-- This migration is idempotent and safe to run multiple times

DO $$
BEGIN
  -- Add rescheduled_from column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'rescheduled_from'
  ) THEN
    ALTER TABLE bookings ADD COLUMN rescheduled_from TIMESTAMPTZ;
  END IF;

  -- Add rescheduled_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'rescheduled_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN rescheduled_at TIMESTAMPTZ;
  END IF;

  -- Add comments for documentation
  COMMENT ON COLUMN bookings.rescheduled_from IS 'Original scheduled date/time before rescheduling';
  COMMENT ON COLUMN bookings.rescheduled_at IS 'Timestamp when the booking was rescheduled';
END $$;

