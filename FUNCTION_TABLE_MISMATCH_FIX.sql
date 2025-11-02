-- Function and Table Mismatch Fix Script
-- This script addresses issues with:
-- 1. Duplicate table definitions
-- 2. Triggers referencing non-existent tables
-- 3. Multiple trigger definitions for the same tables

-- First, drop duplicate triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_session_notes_updated_at ON session_notes;
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS update_company_employees_updated_at ON company_employees;
DROP TRIGGER IF EXISTS update_prestador_schedule_updated_at ON prestador_schedule;

-- Check if resources table exists before creating trigger
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'resources') THEN
    CREATE TRIGGER IF NOT EXISTS update_resources_updated_at 
    BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Check if chat_sessions table exists in bookings reference
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'chat_sessions'
  ) THEN
    -- Create the missing chat_sessions table if it doesn't exist
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES profiles(id),
      title TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    -- Add trigger for the new table
    CREATE TRIGGER update_chat_sessions_updated_at 
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Fix the get_platform_analytics function to handle missing tables gracefully
CREATE OR REPLACE FUNCTION get_platform_analytics()
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  total_users INTEGER;
  active_users INTEGER;
  total_companies INTEGER;
  total_prestadores INTEGER;
  active_prestadores INTEGER;
  total_bookings INTEGER;
  sessions_allocated INTEGER;
  sessions_used INTEGER;
BEGIN
  -- Use exception handling to deal with potentially missing tables
  BEGIN
    SELECT COUNT(*) INTO total_users FROM profiles WHERE role = 'user';
  EXCEPTION WHEN undefined_table THEN
    total_users := 0;
  END;
  
  BEGIN
    SELECT COUNT(DISTINCT user_id) INTO active_users FROM bookings WHERE created_at > now() - interval '30 days';
  EXCEPTION WHEN undefined_table THEN
    active_users := 0;
  END;
  
  BEGIN
    SELECT COUNT(*) INTO total_companies FROM companies WHERE is_active = true;
  EXCEPTION WHEN undefined_table THEN
    total_companies := 0;
  END;
  
  BEGIN
    SELECT COUNT(*) INTO total_prestadores FROM prestadores WHERE is_approved = true;
  EXCEPTION WHEN undefined_table THEN
    total_prestadores := 0;
  END;
  
  BEGIN
    SELECT COUNT(DISTINCT prestador_id) INTO active_prestadores FROM bookings WHERE date >= CURRENT_DATE;
  EXCEPTION WHEN undefined_table THEN
    active_prestadores := 0;
  END;
  
  BEGIN
    SELECT COUNT(*) INTO total_bookings FROM bookings;
  EXCEPTION WHEN undefined_table THEN
    total_bookings := 0;
  END;
  
  BEGIN
    SELECT COALESCE(SUM(sessions_allocated), 0) INTO sessions_allocated FROM companies;
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    sessions_allocated := 0;
  END;
  
  BEGIN
    SELECT COALESCE(SUM(sessions_used), 0) INTO sessions_used FROM companies;
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    sessions_used := 0;
  END;

  SELECT json_build_object(
    'total_users', total_users,
    'active_users', active_users,
    'total_companies', total_companies,
    'total_prestadores', total_prestadores,
    'active_prestadores', active_prestadores,
    'total_bookings', total_bookings,
    'pending_change_requests', 0,
    'sessions_allocated', sessions_allocated,
    'sessions_used', sessions_used
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create a function to verify table and column existence
CREATE OR REPLACE FUNCTION verify_database_integrity()
RETURNS TABLE (
  table_name TEXT,
  exists BOOLEAN,
  missing_columns TEXT[]
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tables TEXT[] := ARRAY['profiles', 'companies', 'prestadores', 'bookings', 'chat_sessions', 'resources', 'subscriptions', 'session_notes'];
  t TEXT;
  cols TEXT[];
  missing TEXT[];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      -- Table exists, check for expected columns based on table
      CASE t
        WHEN 'profiles' THEN
          cols := ARRAY['id', 'email', 'name', 'role', 'company_id', 'created_at', 'updated_at'];
        WHEN 'companies' THEN
          cols := ARRAY['id', 'name', 'email', 'sessions_allocated', 'sessions_used', 'created_at', 'updated_at'];
        WHEN 'prestadores' THEN
          cols := ARRAY['id', 'user_id', 'specialty', 'pillars', 'created_at', 'updated_at'];
        WHEN 'bookings' THEN
          cols := ARRAY['id', 'user_id', 'prestador_id', 'date', 'start_time', 'end_time', 'status', 'created_at', 'updated_at'];
        WHEN 'chat_sessions' THEN
          cols := ARRAY['id', 'user_id', 'created_at', 'updated_at'];
        WHEN 'resources' THEN
          cols := ARRAY['id', 'title', 'created_at', 'updated_at'];
        WHEN 'subscriptions' THEN
          cols := ARRAY['id', 'user_id', 'company_id', 'plan_type', 'created_at', 'updated_at'];
        WHEN 'session_notes' THEN
          cols := ARRAY['id', 'booking_id', 'prestador_id', 'notes', 'created_at', 'updated_at'];
        ELSE
          cols := ARRAY[]::TEXT[];
      END CASE;
      
      -- Check which expected columns are missing
      missing := ARRAY[]::TEXT[];
      FOREACH c IN ARRAY cols
      LOOP
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = t AND column_name = c
        ) THEN
          missing := array_append(missing, c);
        END IF;
      END LOOP;
      
      table_name := t;
      exists := TRUE;
      missing_columns := missing;
      RETURN NEXT;
    ELSE
      -- Table doesn't exist
      table_name := t;
      exists := FALSE;
      missing_columns := ARRAY[]::TEXT[];
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;

-- Create a function to fix circular dependencies
CREATE OR REPLACE FUNCTION fix_circular_dependencies()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result TEXT;
BEGIN
  result := 'Checking for circular dependencies...';
  
  -- Check if bookings references chat_sessions but chat_sessions doesn't exist
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'bookings' 
    AND ccu.table_name = 'chat_sessions'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'chat_sessions'
  ) THEN
    result := result || E'\nFound circular dependency: bookings references chat_sessions but chat_sessions does not exist';
    
    -- Attempt to fix by temporarily dropping the constraint
    BEGIN
      EXECUTE 'ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_chat_session_id_fkey';
      result := result || E'\nTemporarily dropped foreign key constraint from bookings to chat_sessions';
    EXCEPTION WHEN OTHERS THEN
      result := result || E'\nError dropping constraint: ' || SQLERRM;
    END;
  END IF;
  
  RETURN result;
END;
$$;

-- Execute the fix for circular dependencies
SELECT fix_circular_dependencies();