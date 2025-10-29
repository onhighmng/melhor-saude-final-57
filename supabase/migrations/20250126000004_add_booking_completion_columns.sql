-- Add completion tracking columns to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS session_duration_minutes INTEGER DEFAULT 60;

