-- ============================================================================
-- COMPLETE FIX - ALL DATABASE ISSUES (Clean Version for Supabase)
-- ============================================================================
-- This script fixes ALL identified issues:
-- 1. Column name mismatches in user_milestones (already done ✓)
-- 2. Missing resource_access_log table
-- 3. Missing columns in user_progress (already done ✓)
-- 4. Missing metadata columns (already done ✓)
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: Fix user_milestones (if not already done)
-- ============================================================================

DO $$ 
BEGIN
  -- Rename milestone_id to milestone_type (if needed)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_milestones' 
    AND column_name = 'milestone_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_milestones' 
    AND column_name = 'milestone_type'
  ) THEN
    ALTER TABLE user_milestones RENAME COLUMN milestone_id TO milestone_type;
  END IF;

  -- Rename milestone_label to label (if needed)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_milestones' 
    AND column_name = 'milestone_label'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_milestones' 
    AND column_name = 'label'
  ) THEN
    ALTER TABLE user_milestones RENAME COLUMN milestone_label TO label;
  END IF;

  -- Add metadata column (if needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_milestones' 
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE user_milestones ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ============================================================================
-- PART 2: Create Missing resource_access_log Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS resource_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  access_type TEXT DEFAULT 'view',
  duration_seconds INTEGER,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'resource_access_log' 
    AND column_name = 'accessed_at'
  ) THEN
    ALTER TABLE resource_access_log ADD COLUMN accessed_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'resource_access_log' 
    AND column_name = 'duration_seconds'
  ) THEN
    ALTER TABLE resource_access_log ADD COLUMN duration_seconds INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'resource_access_log' 
    AND column_name = 'access_type'
  ) THEN
    ALTER TABLE resource_access_log ADD COLUMN access_type TEXT DEFAULT 'view';
  END IF;
END $$;

-- Add indexes for resource_access_log
DO $$ 
BEGIN
  -- Only create indexes if the table and columns exist
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'resource_access_log'
  ) THEN
    
    CREATE INDEX IF NOT EXISTS idx_resource_access_log_user_id 
      ON resource_access_log(user_id);
    
    CREATE INDEX IF NOT EXISTS idx_resource_access_log_resource_id 
      ON resource_access_log(resource_id);
    
    -- Only create index if accessed_at column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'resource_access_log' 
      AND column_name = 'accessed_at'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_resource_access_log_accessed_at 
        ON resource_access_log(accessed_at);
    END IF;
  END IF;
END $$;

-- Enable RLS for resource_access_log (only if table exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'resource_access_log'
  ) THEN
    ALTER TABLE resource_access_log ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own access logs" ON resource_access_log;
    DROP POLICY IF EXISTS "Users can insert their own access logs" ON resource_access_log;
    DROP POLICY IF EXISTS "Users can update their own access logs" ON resource_access_log;

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
  END IF;
END $$;

-- ============================================================================
-- PART 3: Verify user_progress (if not already done)
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' 
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' 
    AND column_name = 'pillar'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN pillar TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' 
    AND column_name = 'resource_id'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN resource_id UUID REFERENCES resources(id);
  END IF;
END $$;

-- ============================================================================
-- PART 4: Verify company_employees (if not already done)
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'company_employees' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE company_employees ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'company_employees' 
    AND column_name = 'sessions_allocated'
  ) THEN
    ALTER TABLE company_employees ADD COLUMN sessions_allocated INTEGER DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'company_employees' 
    AND column_name = 'sessions_used'
  ) THEN
    ALTER TABLE company_employees ADD COLUMN sessions_used INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- PART 5: Update initialize_user_milestones Function
-- ============================================================================

CREATE OR REPLACE FUNCTION initialize_user_milestones(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete existing milestones for this user (if reinitializing)
  DELETE FROM user_milestones WHERE user_id = p_user_id;
  
  -- Insert default milestones using milestone_type
  INSERT INTO user_milestones (user_id, milestone_type, label, points, completed)
  VALUES
    (p_user_id, 'first_login', 'Primeiro Acesso', 10, false),
    (p_user_id, 'complete_profile', 'Perfil Completo', 20, false),
    (p_user_id, 'first_booking', 'Primeira Sessão Agendada', 30, false),
    (p_user_id, 'first_session', 'Primeira Sessão Completa', 50, false),
    (p_user_id, 'fifth_session', 'Quinta Sessão Completa', 100, false),
    (p_user_id, 'complete_onboarding', 'Onboarding Completo', 15, false)
  ON CONFLICT (user_id, milestone_type) DO NOTHING;
END;
$$;

-- ============================================================================
-- PART 6: Add Unique Constraints
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_milestones_user_milestone_unique'
  ) THEN
    ALTER TABLE user_milestones 
    ADD CONSTRAINT user_milestones_user_milestone_unique 
    UNIQUE (user_id, milestone_type);
  END IF;
END $$;

-- ============================================================================
-- PART 7: Add Performance Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id 
  ON user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_completed 
  ON user_milestones(completed) WHERE completed = true;

CREATE INDEX IF NOT EXISTS idx_company_employees_user_id 
  ON company_employees(user_id);
CREATE INDEX IF NOT EXISTS idx_company_employees_company_id 
  ON company_employees(company_id);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id 
  ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_action_type 
  ON user_progress(action_type);

COMMIT;

-- ============================================================================
-- VERIFICATION QUERY - Run this after to check everything
-- ============================================================================

SELECT 
  'user_milestones' as table_name,
  jsonb_build_object(
    'exists', true,
    'has_milestone_type', EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_milestones' AND column_name = 'milestone_type'
    ),
    'has_label', EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_milestones' AND column_name = 'label'
    ),
    'has_metadata', EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_milestones' AND column_name = 'metadata'
    ),
    'row_count', (SELECT COUNT(*) FROM user_milestones)
  ) as status
UNION ALL
SELECT 
  'company_employees' as table_name,
  jsonb_build_object(
    'exists', true,
    'has_user_id', EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'company_employees' AND column_name = 'user_id'
    ),
    'has_sessions_allocated', EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'company_employees' AND column_name = 'sessions_allocated'
    ),
    'has_sessions_used', EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'company_employees' AND column_name = 'sessions_used'
    ),
    'row_count', (SELECT COUNT(*) FROM company_employees)
  ) as status
UNION ALL
SELECT 
  'user_progress' as table_name,
  jsonb_build_object(
    'exists', true,
    'has_metadata', EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_progress' AND column_name = 'metadata'
    ),
    'has_pillar', EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_progress' AND column_name = 'pillar'
    ),
    'row_count', (SELECT COUNT(*) FROM user_progress)
  ) as status
UNION ALL
SELECT 
  'resource_access_log' as table_name,
  jsonb_build_object(
    'exists', EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'resource_access_log'
    ),
    'has_rls_enabled', (
      SELECT COALESCE(bool_or(rowsecurity), false)
      FROM pg_tables 
      WHERE tablename = 'resource_access_log'
    ),
    'policy_count', (
      SELECT COUNT(*) FROM pg_policies 
      WHERE tablename = 'resource_access_log'
    ),
    'row_count', (
      SELECT CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resource_access_log')
        THEN (SELECT COUNT(*) FROM resource_access_log)
        ELSE 0
      END
    )
  ) as status;

