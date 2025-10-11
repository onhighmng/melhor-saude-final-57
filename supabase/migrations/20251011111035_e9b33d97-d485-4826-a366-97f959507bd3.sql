-- Add meeting_type column to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS meeting_type TEXT CHECK (meeting_type IN ('virtual', 'phone'));

-- Set default for existing records
UPDATE bookings SET meeting_type = 'virtual' WHERE meeting_type IS NULL;

COMMENT ON COLUMN bookings.meeting_type IS 'Type of meeting: virtual (video call) or phone';
