-- Add new columns for enhanced booking flow
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES profiles(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rescheduled_from DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rescheduled_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES profiles(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES profiles(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- Update status check constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'pending_confirmation', 'confirmed', 'completed', 'cancelled', 'rejected', 'no_show', 'rescheduled'));

