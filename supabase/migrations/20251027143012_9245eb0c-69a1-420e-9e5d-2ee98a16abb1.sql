-- Add missing fields based on actual database schema

-- Add outcome field to specialist_call_logs (completed_at already exists)
ALTER TABLE specialist_call_logs 
ADD COLUMN IF NOT EXISTS outcome TEXT CHECK (outcome IN ('resolved', 'session_booked', 'no_answer', 'callback_requested', 'other'));

-- Add rescheduling tracking fields to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS rescheduled_from UUID REFERENCES bookings(id),
ADD COLUMN IF NOT EXISTS rescheduled_at TIMESTAMPTZ;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_specialist_call_logs_outcome ON specialist_call_logs(outcome) WHERE outcome IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_rescheduled ON bookings(rescheduled_from) WHERE rescheduled_from IS NOT NULL;