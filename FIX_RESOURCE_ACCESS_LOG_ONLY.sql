-- ============================================================================
-- FIX resource_access_log Table ONLY
-- ============================================================================
-- This script drops and recreates the resource_access_log table cleanly
-- Use this if you keep getting "column accessed_at does not exist" errors
-- ============================================================================

BEGIN;

-- Drop the broken table if it exists
DROP TABLE IF EXISTS resource_access_log CASCADE;

-- Create it fresh with all correct columns
CREATE TABLE resource_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  access_type TEXT DEFAULT 'view',
  duration_seconds INTEGER,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_resource_access_log_user_id 
  ON resource_access_log(user_id);

CREATE INDEX idx_resource_access_log_resource_id 
  ON resource_access_log(resource_id);

CREATE INDEX idx_resource_access_log_accessed_at 
  ON resource_access_log(accessed_at);

-- Enable RLS
ALTER TABLE resource_access_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own access logs"
  ON resource_access_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own access logs"
  ON resource_access_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own access logs"
  ON resource_access_log FOR UPDATE
  USING (auth.uid() = user_id);

COMMIT;

-- Verify it worked
SELECT 
  'resource_access_log' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'resource_access_log'
ORDER BY ordinal_position;



