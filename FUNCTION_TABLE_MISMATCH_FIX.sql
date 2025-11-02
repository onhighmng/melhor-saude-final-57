-- Function and Table Mismatch Fix Script
-- This script addresses issues with:
-- 1. Duplicate table definitions
-- 2. Triggers referencing non-existent tables
-- 3. Multiple trigger definitions for the same tables
-- 4. Frontend-backend integration issues

-- First, drop duplicate triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_session_notes_updated_at ON session_notes;
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS update_company_employees_updated_at ON company_employees;
DROP TRIGGER IF EXISTS update_prestador_schedule_updated_at ON prestador_schedule;
DROP TRIGGER IF EXISTS set_updated_at ON resources;
DROP TRIGGER IF EXISTS set_updated_at ON chat_sessions;

-- Create trigger function if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END
$$;

-- Ensure all tables have proper updated_at triggers
DO $$
DECLARE
  tables TEXT[] := ARRAY[
    'chat_sessions', 
    'specialist_analytics', 
    'self_help_content',
    'resources',
    'session_notes',
    'companies',
    'company_employees',
    'prestadores',
    'bookings',
    'psychological_tests',
    'user_milestones',
    'user_progress',
    'chat_messages',
    'content_views',
    'profiles',
    'feedback',
    'notifications',
    'change_requests'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t) 
       AND EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = t AND column_name = 'updated_at') THEN
      EXECUTE format('
        CREATE TRIGGER IF NOT EXISTS update_%s_updated_at 
        BEFORE UPDATE ON %s
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      ', t, t);
    END IF;
  END LOOP;
END
$$;

-- Fix the get_platform_analytics function to handle missing tables gracefully
-- and include chat_sessions data that frontend expects
CREATE OR REPLACE FUNCTION get_platform_analytics()
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  total_users INTEGER := 0;
  active_users INTEGER := 0;
  total_companies INTEGER := 0;
  total_prestadores INTEGER := 0;
  active_prestadores INTEGER := 0;
  total_bookings INTEGER := 0;
  sessions_allocated INTEGER := 0;
  sessions_used INTEGER := 0;
  total_chats INTEGER := 0;
  escalated_chats INTEGER := 0;
  pending_change_requests INTEGER := 0;
BEGIN
  -- Since we know all tables exist, we can simplify this function
  -- but still keep exception handling for safety
  
  BEGIN
    SELECT COUNT(*) INTO total_users FROM profiles WHERE role = 'user';
  EXCEPTION WHEN OTHERS THEN
    -- Keep default value
  END;
  
  BEGIN
    SELECT COUNT(DISTINCT user_id) INTO active_users FROM bookings WHERE created_at > now() - interval '30 days';
  EXCEPTION WHEN OTHERS THEN
    -- Keep default value
  END;
  
  BEGIN
    SELECT COUNT(*) INTO total_companies FROM companies WHERE is_active = true;
  EXCEPTION WHEN OTHERS THEN
    -- Keep default value
  END;
  
  BEGIN
    SELECT COUNT(*) INTO total_prestadores FROM prestadores WHERE is_approved = true;
  EXCEPTION WHEN OTHERS THEN
    -- Keep default value
  END;
  
  BEGIN
    SELECT COUNT(DISTINCT prestador_id) INTO active_prestadores FROM bookings WHERE date >= CURRENT_DATE;
  EXCEPTION WHEN OTHERS THEN
    -- Keep default value
  END;
  
  BEGIN
    SELECT COUNT(*) INTO total_bookings FROM bookings;
  EXCEPTION WHEN OTHERS THEN
    -- Keep default value
  END;
  
  BEGIN
    SELECT COALESCE(SUM(sessions_allocated), 0) INTO sessions_allocated FROM companies;
  EXCEPTION WHEN OTHERS THEN
    -- Keep default value
  END;
  
  BEGIN
    SELECT COALESCE(SUM(sessions_used), 0) INTO sessions_used FROM companies;
  EXCEPTION WHEN OTHERS THEN
    -- Keep default value
  END;

  -- Add chat_sessions data that frontend expects
  BEGIN
    SELECT COUNT(*) INTO total_chats FROM chat_sessions;
  EXCEPTION WHEN OTHERS THEN
    -- Keep default value
  END;
  
  BEGIN
    SELECT COUNT(*) INTO escalated_chats FROM chat_sessions WHERE status = 'phone_escalated';
  EXCEPTION WHEN OTHERS THEN
    -- Keep default value
  END;
  
  -- Add change requests count
  BEGIN
    SELECT COUNT(*) INTO pending_change_requests FROM change_requests WHERE status = 'pending';
  EXCEPTION WHEN OTHERS THEN
    -- Keep default value
  END;

  SELECT json_build_object(
    'total_users', total_users,
    'active_users', active_users,
    'total_companies', total_companies,
    'total_prestadores', total_prestadores,
    'active_prestadores', active_prestadores,
    'total_bookings', total_bookings,
    'pending_change_requests', pending_change_requests,
    'sessions_allocated', sessions_allocated,
    'sessions_used', sessions_used,
    'total_chats', total_chats,
    'escalated_chats', escalated_chats
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create or replace the verify_database_integrity function
CREATE OR REPLACE FUNCTION verify_database_integrity()
RETURNS JSON[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON[];
  table_info JSON;
  critical_tables TEXT[] := ARRAY[
    'chat_sessions', 
    'chat_messages', 
    'specialist_analytics', 
    'user_progress', 
    'content_views', 
    'self_help_content',
    'resources',
    'bookings',
    'profiles',
    'companies',
    'prestadores'
  ];
  table_name TEXT;
BEGIN
  -- Check each critical table
  FOREACH table_name IN ARRAY critical_tables
  LOOP
    -- Check if table exists
    IF EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = table_name
    ) THEN
      -- Table exists, check for updated_at column
      IF EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = table_name
        AND column_name = 'updated_at'
      ) THEN
        -- Check if trigger exists
        IF EXISTS (
          SELECT FROM pg_trigger
          WHERE tgname = 'set_updated_at'
          AND tgrelid = (SELECT oid FROM pg_class WHERE relname = table_name)
        ) THEN
          -- Everything is good
          table_info := json_build_object(
            'table_name', table_name,
            'exists', true,
            'has_updated_at', true,
            'has_trigger', true,
            'status', 'OK'
          );
        ELSE
          -- Missing trigger
          table_info := json_build_object(
            'table_name', table_name,
            'exists', true,
            'has_updated_at', true,
            'has_trigger', false,
            'status', 'Missing trigger'
          );
        END IF;
      ELSE
        -- Missing updated_at column
        table_info := json_build_object(
          'table_name', table_name,
          'exists', true,
          'has_updated_at', false,
          'has_trigger', false,
          'status', 'Missing updated_at column'
        );
      END IF;
    ELSE
      -- Table doesn't exist
      table_info := json_build_object(
        'table_name', table_name,
        'exists', false,
        'has_updated_at', false,
        'has_trigger', false,
        'status', 'Table does not exist'
      );
    END IF;
    
    -- Add to result array
    result := array_append(result, table_info);
  END LOOP;
  
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
  tables TEXT[] := ARRAY[
    'profiles', 
    'companies', 
    'prestadores', 
    'bookings', 
    'chat_sessions', 
    'chat_messages',
    'resources', 
    'subscriptions', 
    'session_notes',
    'specialist_analytics',
    'user_progress',
    'content_views',
    'self_help_content'
  ];
  t TEXT;
  cols TEXT[];
  missing TEXT[];
  c TEXT;
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
          cols := ARRAY['id', 'user_id', 'pillar', 'status', 'phone_escalation_reason', 'satisfaction_rating', 'created_at', 'updated_at'];
        WHEN 'chat_messages' THEN
          cols := ARRAY['id', 'session_id', 'role', 'content', 'metadata', 'created_at'];
        WHEN 'resources' THEN
          cols := ARRAY['id', 'title', 'created_at', 'updated_at'];
        WHEN 'subscriptions' THEN
          cols := ARRAY['id', 'user_id', 'company_id', 'plan_type', 'created_at', 'updated_at'];
        WHEN 'session_notes' THEN
          cols := ARRAY['id', 'booking_id', 'prestador_id', 'notes', 'created_at', 'updated_at'];
        WHEN 'specialist_analytics' THEN
          cols := ARRAY['id', 'date', 'pillar', 'total_chats', 'ai_resolved', 'phone_escalated', 'sessions_booked', 'satisfied_users', 'unsatisfied_users', 'created_at', 'updated_at'];
        WHEN 'user_progress' THEN
          cols := ARRAY['id', 'user_id', 'pillar', 'action_type', 'action_date', 'metadata', 'created_at'];
        WHEN 'content_views' THEN
          cols := ARRAY['id', 'user_id', 'content_id', 'viewed_at', 'created_at'];
        WHEN 'self_help_content' THEN
          cols := ARRAY['id', 'title', 'category', 'content', 'is_published', 'view_count', 'created_at', 'updated_at'];
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