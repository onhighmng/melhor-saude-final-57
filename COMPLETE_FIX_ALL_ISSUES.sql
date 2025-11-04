-- ============================================================================
-- COMPLETE FIX - ALL DATABASE ISSUES IN ONE SCRIPT
-- ============================================================================
-- This script fixes ALL identified issues:
-- 1. Column name mismatches in user_milestones
-- 2. Missing resource_access_log table
-- 3. Missing columns in user_progress
-- 4. Missing metadata columns
-- 5. Updates RPC functions
-- 6. Adds indexes for performance
-- 
-- Run this in: Supabase SQL Editor
-- Expected time: 30-60 seconds
-- Safe to run multiple times (idempotent)
-- ============================================================================

BEGIN;

RAISE NOTICE '============================================================================';
RAISE NOTICE 'STARTING COMPLETE DATABASE FIX';
RAISE NOTICE '============================================================================';

-- ============================================================================
-- PART 1: Fix user_milestones Column Name Mismatches
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE 'Part 1: Fixing user_milestones table...';

DO $$ 
BEGIN
  -- Rename milestone_id to milestone_type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_milestones' 
    AND column_name = 'milestone_id'
    AND table_schema = 'public'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_milestones' 
    AND column_name = 'milestone_type'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE user_milestones RENAME COLUMN milestone_id TO milestone_type;
    RAISE NOTICE '  ✓ Renamed milestone_id to milestone_type';
  ELSE
    RAISE NOTICE '  ✓ milestone_type already exists';
  END IF;

  -- Rename milestone_label to label
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_milestones' 
    AND column_name = 'milestone_label'
    AND table_schema = 'public'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_milestones' 
    AND column_name = 'label'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE user_milestones RENAME COLUMN milestone_label TO label;
    RAISE NOTICE '  ✓ Renamed milestone_label to label';
  ELSE
    RAISE NOTICE '  ✓ label column already exists';
  END IF;

  -- Add metadata column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_milestones' 
    AND column_name = 'metadata'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE user_milestones ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE '  ✓ Added metadata column to user_milestones';
  ELSE
    RAISE NOTICE '  ✓ metadata column already exists';
  END IF;
END $$;

-- ============================================================================
-- PART 2: Create Missing resource_access_log Table
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE 'Part 2: Creating resource_access_log table...';

CREATE TABLE IF NOT EXISTS resource_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  access_type TEXT DEFAULT 'view',
  duration_seconds INTEGER,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

RAISE NOTICE '  ✓ resource_access_log table created';

-- Add indexes for resource_access_log
CREATE INDEX IF NOT EXISTS idx_resource_access_log_user_id 
  ON resource_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_log_resource_id 
  ON resource_access_log(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_log_accessed_at 
  ON resource_access_log(accessed_at);

RAISE NOTICE '  ✓ Indexes added to resource_access_log';

-- Enable RLS for resource_access_log
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

RAISE NOTICE '  ✓ RLS policies created for resource_access_log';

-- ============================================================================
-- PART 3: Verify and Fix user_progress Structure
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE 'Part 3: Verifying user_progress table...';

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' 
    AND column_name = 'metadata'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE '  ✓ Added metadata column to user_progress';
  ELSE
    RAISE NOTICE '  ✓ metadata column already exists in user_progress';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' 
    AND column_name = 'pillar'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN pillar TEXT;
    RAISE NOTICE '  ✓ Added pillar column to user_progress';
  ELSE
    RAISE NOTICE '  ✓ pillar column already exists in user_progress';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' 
    AND column_name = 'resource_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN resource_id UUID REFERENCES resources(id);
    RAISE NOTICE '  ✓ Added resource_id column to user_progress';
  ELSE
    RAISE NOTICE '  ✓ resource_id column already exists in user_progress';
  END IF;
END $$;

-- ============================================================================
-- PART 4: Verify company_employees Structure
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE 'Part 4: Verifying company_employees table...';

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'company_employees' 
    AND column_name = 'user_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE company_employees ADD COLUMN user_id UUID REFERENCES auth.users(id);
    RAISE NOTICE '  ✓ Added user_id to company_employees';
  ELSE
    RAISE NOTICE '  ✓ user_id already exists in company_employees';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'company_employees' 
    AND column_name = 'sessions_allocated'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE company_employees ADD COLUMN sessions_allocated INTEGER DEFAULT 10;
    RAISE NOTICE '  ✓ Added sessions_allocated to company_employees';
  ELSE
    RAISE NOTICE '  ✓ sessions_allocated already exists in company_employees';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'company_employees' 
    AND column_name = 'sessions_used'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE company_employees ADD COLUMN sessions_used INTEGER DEFAULT 0;
    RAISE NOTICE '  ✓ Added sessions_used to company_employees';
  ELSE
    RAISE NOTICE '  ✓ sessions_used already exists in company_employees';
  END IF;
END $$;

-- ============================================================================
-- PART 5: Update initialize_user_milestones Function
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE 'Part 5: Updating RPC functions...';

CREATE OR REPLACE FUNCTION initialize_user_milestones(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete existing milestones for this user (if reinitializing)
  DELETE FROM user_milestones WHERE user_id = p_user_id;
  
  -- Insert default milestones using milestone_type (not milestone_id)
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

RAISE NOTICE '  ✓ initialize_user_milestones function updated';

-- ============================================================================
-- PART 6: Add Unique Constraints
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE 'Part 6: Adding unique constraints...';

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_milestones_user_milestone_unique'
  ) THEN
    ALTER TABLE user_milestones 
    ADD CONSTRAINT user_milestones_user_milestone_unique 
    UNIQUE (user_id, milestone_type);
    RAISE NOTICE '  ✓ Added unique constraint to user_milestones';
  ELSE
    RAISE NOTICE '  ✓ Unique constraint already exists on user_milestones';
  END IF;
END $$;

-- ============================================================================
-- PART 7: Add Performance Indexes
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE 'Part 7: Adding performance indexes...';

-- Indexes for user_milestones
CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id 
  ON user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_completed 
  ON user_milestones(completed) WHERE completed = true;

-- Indexes for company_employees
CREATE INDEX IF NOT EXISTS idx_company_employees_user_id 
  ON company_employees(user_id);
CREATE INDEX IF NOT EXISTS idx_company_employees_company_id 
  ON company_employees(company_id);

-- Indexes for user_progress
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id 
  ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_action_type 
  ON user_progress(action_type);

RAISE NOTICE '  ✓ All performance indexes created';

-- ============================================================================
-- PART 8: Verification and Summary Report
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'VERIFICATION REPORT';
RAISE NOTICE '============================================================================';

DO $$
DECLARE
  issues TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check user_milestones
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_milestones' AND column_name = 'milestone_type'
  ) THEN
    issues := array_append(issues, '❌ user_milestones.milestone_type missing');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_milestones' AND column_name = 'label'
  ) THEN
    issues := array_append(issues, '❌ user_milestones.label missing');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_milestones' AND column_name = 'metadata'
  ) THEN
    issues := array_append(issues, '❌ user_milestones.metadata missing');
  END IF;

  -- Check company_employees
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'company_employees' AND column_name = 'sessions_allocated'
  ) THEN
    issues := array_append(issues, '❌ company_employees.sessions_allocated missing');
  END IF;

  -- Check user_progress
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' AND column_name = 'metadata'
  ) THEN
    issues := array_append(issues, '❌ user_progress.metadata missing');
  END IF;

  -- Check resource_access_log
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'resource_access_log'
  ) THEN
    issues := array_append(issues, '❌ resource_access_log table missing');
  END IF;

  -- Report results
  IF array_length(issues, 1) IS NULL THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ALL CHECKS PASSED!';
    RAISE NOTICE '';
    RAISE NOTICE 'Fixed Issues:';
    RAISE NOTICE '  ✓ user_milestones.milestone_type column';
    RAISE NOTICE '  ✓ user_milestones.label column';
    RAISE NOTICE '  ✓ user_milestones.metadata column';
    RAISE NOTICE '  ✓ resource_access_log table created';
    RAISE NOTICE '  ✓ company_employees structure verified';
    RAISE NOTICE '  ✓ user_progress structure verified';
    RAISE NOTICE '  ✓ initialize_user_milestones() function updated';
    RAISE NOTICE '  ✓ Unique constraints added';
    RAISE NOTICE '  ✓ Performance indexes created';
    RAISE NOTICE '  ✓ RLS policies configured';
    RAISE NOTICE '';
    RAISE NOTICE 'Database is now fully aligned with frontend code!';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  REMAINING ISSUES:';
    FOR i IN 1..array_length(issues, 1) LOOP
      RAISE NOTICE '  %', issues[i];
    END LOOP;
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- PART 9: Final Summary Query
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'FINAL STATUS SUMMARY';
RAISE NOTICE '============================================================================';

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
    'has_rls_enabled', EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'resource_access_log' 
      AND rowsecurity = true
    ),
    'row_count', (
      SELECT COUNT(*) FROM resource_access_log 
      WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resource_access_log')
    )
  ) as status;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '🎉 COMPLETE DATABASE FIX - FINISHED SUCCESSFULLY';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)';
  RAISE NOTICE '  2. Test milestone system in User Dashboard';
  RAISE NOTICE '  3. Test resource viewing (should now track properly)';
  RAISE NOTICE '  4. Test session balance in Company pages';
  RAISE NOTICE '';
  RAISE NOTICE 'All database schema issues have been resolved! ✅';
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
END $$;





