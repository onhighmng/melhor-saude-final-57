-- Add missing resource_id column to user_progress table
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS resource_id UUID REFERENCES resources(id);