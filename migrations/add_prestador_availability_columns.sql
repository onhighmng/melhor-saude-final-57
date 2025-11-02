-- Migration: Add availability columns to prestadores table
-- Created: 2024-11-02
-- Description: Adds columns for managing prestador availability, blocked dates, and working hours

-- Add availability columns to prestadores table
ALTER TABLE prestadores 
ADD COLUMN IF NOT EXISTS weekly_availability jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS blocked_dates jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS working_hours jsonb DEFAULT '{"start": "09:00", "end": "18:00"}';

-- Add comments for documentation
COMMENT ON COLUMN prestadores.weekly_availability IS 'Weekly schedule: {"monday": ["09:00-12:00", "14:00-18:00"], ...}';
COMMENT ON COLUMN prestadores.blocked_dates IS 'Array of blocked date-time slots: [{"date": "2024-01-15", "times": ["10:00", "14:00"]}, ...]';
COMMENT ON COLUMN prestadores.working_hours IS 'Default working hours: {"start": "09:00", "end": "18:00"}';

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'prestadores' 
AND column_name IN ('weekly_availability', 'blocked_dates', 'working_hours');

