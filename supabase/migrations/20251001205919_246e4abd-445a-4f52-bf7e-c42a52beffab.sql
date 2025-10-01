-- Add meeting link fields to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS meeting_platform TEXT;