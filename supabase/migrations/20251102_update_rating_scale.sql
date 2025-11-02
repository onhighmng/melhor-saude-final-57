-- Update rating scale from 1-5 to 1-10 to match UI and user documentation
-- Date: 2025-11-02

-- Update bookings.rating constraint to accept 1-10
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_rating_check;

ALTER TABLE bookings
ADD CONSTRAINT bookings_rating_check 
CHECK (rating >= 1 AND rating <= 10);

-- Update feedback.rating constraint to accept 1-10
ALTER TABLE feedback
DROP CONSTRAINT IF EXISTS feedback_rating_check;

ALTER TABLE feedback
ADD CONSTRAINT feedback_rating_check 
CHECK (rating >= 1 AND rating <= 10);

-- Add comment to document the change
COMMENT ON COLUMN bookings.rating IS 'User satisfaction rating on a scale of 1-10';
COMMENT ON COLUMN feedback.rating IS 'User feedback rating on a scale of 1-10';
