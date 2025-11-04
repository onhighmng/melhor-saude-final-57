-- ============================================================================
-- DATABASE VERIFICATION AND COMPREHENSIVE FIXES
-- Melhor Saúde Platform - Complete Database Setup
-- Run this manually in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: MISSING TABLES CHECK AND CREATION
-- ============================================================================

-- Create missing tables if they don't exist

-- admin_analytics table
CREATE TABLE IF NOT EXISTS admin_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC DEFAULT 0,
  company_id UUID REFERENCES companies(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- prestador_availability table
CREATE TABLE IF NOT EXISTS prestador_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID REFERENCES prestadores(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- prestador_schedule table
CREATE TABLE IF NOT EXISTS prestador_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID REFERENCES prestadores(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- prestador_performance table
CREATE TABLE IF NOT EXISTS prestador_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID REFERENCES prestadores(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  cancelled_sessions INTEGER DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prestador_id, month)
);

-- session_recordings table
CREATE TABLE IF NOT EXISTS session_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  recording_url TEXT,
  duration_seconds INTEGER,
  status TEXT CHECK (status IN ('processing', 'ready', 'failed')) DEFAULT 'processing',
  consent_given BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- user_goals table
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_title TEXT NOT NULL,
  goal_description TEXT,
  pillar TEXT CHECK (pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')),
  target_date DATE,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  milestones JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- specialist_call_logs table (if not exists)
CREATE TABLE IF NOT EXISTS specialist_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id UUID REFERENCES profiles(id),
  user_id UUID REFERENCES auth.users(id),
  chat_session_id UUID REFERENCES chat_sessions(id),
  call_start TIMESTAMPTZ,
  call_end TIMESTAMPTZ,
  duration_minutes INTEGER,
  call_status TEXT CHECK (call_status IN ('completed', 'missed', 'cancelled', 'no_answer')) DEFAULT 'completed',
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- resource_access_log table (ensure correct structure)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resource_access_log') THEN
    CREATE TABLE resource_access_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id),
      resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
      access_type TEXT CHECK (access_type IN ('view', 'download', 'share')) DEFAULT 'view',
      duration_seconds INTEGER,
      created_at TIMESTAMPTZ DEFAULT now(),
      metadata JSONB DEFAULT '{}'::jsonb
    );
  END IF;
END $$;

-- ============================================================================
-- PART 2: ENSURE ALL COLUMNS EXIST IN TABLES
-- ============================================================================

-- Add missing columns to companies table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'employee_seats') THEN
    ALTER TABLE companies ADD COLUMN employee_seats INTEGER DEFAULT 50 CHECK (employee_seats >= 0);
    COMMENT ON COLUMN companies.employee_seats IS 'Maximum number of employee seats/accounts allowed by subscription package';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'plan_type') THEN
    ALTER TABLE companies ADD COLUMN plan_type TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'contact_email') THEN
    ALTER TABLE companies ADD COLUMN contact_email TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'contact_phone') THEN
    ALTER TABLE companies ADD COLUMN contact_phone TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'final_notes') THEN
    ALTER TABLE companies ADD COLUMN final_notes TEXT;
  END IF;
END $$;

-- Add missing columns to profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'name') THEN
    ALTER TABLE profiles ADD COLUMN name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'metadata') THEN
    ALTER TABLE profiles ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'department') THEN
    ALTER TABLE profiles ADD COLUMN department TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
    ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'company_name') THEN
    ALTER TABLE profiles ADD COLUMN company_name TEXT;
  END IF;
END $$;

-- Add missing columns to company_employees table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'company_employees' AND column_name = 'created_at') THEN
    ALTER TABLE company_employees ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'company_employees' AND column_name = 'updated_at') THEN
    ALTER TABLE company_employees ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Add missing columns to bookings table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'meeting_type') THEN
    ALTER TABLE bookings ADD COLUMN meeting_type TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'session_type') THEN
    ALTER TABLE bookings ADD COLUMN session_type TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'chat_session_id') THEN
    ALTER TABLE bookings ADD COLUMN chat_session_id UUID REFERENCES chat_sessions(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'pillar_specialties') THEN
    ALTER TABLE bookings ADD COLUMN pillar_specialties TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'prediagnostic_completed') THEN
    ALTER TABLE bookings ADD COLUMN prediagnostic_completed BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'prediagnostic_summary') THEN
    ALTER TABLE bookings ADD COLUMN prediagnostic_summary JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'cancellation_reason') THEN
    ALTER TABLE bookings ADD COLUMN cancellation_reason TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'cancelled_by') THEN
    ALTER TABLE bookings ADD COLUMN cancelled_by UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'cancelled_at') THEN
    ALTER TABLE bookings ADD COLUMN cancelled_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'rescheduled_from') THEN
    ALTER TABLE bookings ADD COLUMN rescheduled_from UUID REFERENCES bookings(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'rescheduled_at') THEN
    ALTER TABLE bookings ADD COLUMN rescheduled_at TIMESTAMPTZ;
  END IF;
END $$;

-- Fix bookings rating constraint (1-10 scale)
DO $$
BEGIN
  ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_rating_check;
  ALTER TABLE bookings ADD CONSTRAINT bookings_rating_check CHECK (rating >= 1 AND rating <= 10);
  COMMENT ON COLUMN bookings.rating IS 'User satisfaction rating on a scale of 1-10';
END $$;

-- Add missing columns to feedback table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'feedback' AND column_name = 'booking_id') THEN
    ALTER TABLE feedback ADD COLUMN booking_id UUID REFERENCES bookings(id);
  END IF;
END $$;

-- Fix feedback rating constraint (1-10 scale)
DO $$
BEGIN
  ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_rating_check;
  ALTER TABLE feedback ADD CONSTRAINT feedback_rating_check CHECK (rating >= 1 AND rating <= 10);
  COMMENT ON COLUMN feedback.rating IS 'User feedback rating on a scale of 1-10';
END $$;

-- Add missing columns to prestadores table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'biography') THEN
    ALTER TABLE prestadores ADD COLUMN biography TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'languages') THEN
    ALTER TABLE prestadores ADD COLUMN languages TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'pillar_specialties') THEN
    ALTER TABLE prestadores ADD COLUMN pillar_specialties TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'session_duration') THEN
    ALTER TABLE prestadores ADD COLUMN session_duration INTEGER DEFAULT 60;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'video_url') THEN
    ALTER TABLE prestadores ADD COLUMN video_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'specialties') THEN
    ALTER TABLE prestadores ADD COLUMN specialties TEXT[];
  END IF;
END $$;

-- Add missing columns to chat_sessions table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'chat_sessions' AND column_name = 'ai_resolution') THEN
    ALTER TABLE chat_sessions ADD COLUMN ai_resolution BOOLEAN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'chat_sessions' AND column_name = 'phone_contact_made') THEN
    ALTER TABLE chat_sessions ADD COLUMN phone_contact_made BOOLEAN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'chat_sessions' AND column_name = 'session_booked_by_specialist') THEN
    ALTER TABLE chat_sessions ADD COLUMN session_booked_by_specialist UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'chat_sessions' AND column_name = 'satisfaction_rating') THEN
    ALTER TABLE chat_sessions ADD COLUMN satisfaction_rating TEXT CHECK (satisfaction_rating IN ('satisfied', 'unsatisfied', 'neutral'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'chat_sessions' AND column_name = 'ended_at') THEN
    ALTER TABLE chat_sessions ADD COLUMN ended_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add missing columns to chat_messages table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'chat_messages' AND column_name = 'role') THEN
    ALTER TABLE chat_messages ADD COLUMN role TEXT CHECK (role IN ('user', 'assistant', 'system'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'chat_messages' AND column_name = 'metadata') THEN
    ALTER TABLE chat_messages ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add missing columns to notifications table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'notifications' AND column_name = 'title') THEN
    ALTER TABLE notifications ADD COLUMN title TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'notifications' AND column_name = 'type') THEN
    ALTER TABLE notifications ADD COLUMN type TEXT DEFAULT 'general';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'notifications' AND column_name = 'priority') THEN
    ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
    ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
    ALTER TABLE notifications ADD COLUMN read_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'notifications' AND column_name = 'related_booking_id') THEN
    ALTER TABLE notifications ADD COLUMN related_booking_id UUID REFERENCES bookings(id);
  END IF;
END $$;

-- Add missing columns to invites table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'invites' AND column_name = 'user_type') THEN
    ALTER TABLE invites ADD COLUMN user_type TEXT CHECK (user_type IN ('user', 'hr', 'prestador', 'specialist', 'admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'invites' AND column_name = 'metadata') THEN
    ALTER TABLE invites ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add missing columns to resources table
DO $$ 
BEGIN
  -- Fix resource_type constraint to include 'pdf'
  ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_resource_type_check;
  ALTER TABLE resources ADD CONSTRAINT resources_resource_type_check 
    CHECK (resource_type IN ('article', 'video', 'exercise', 'worksheet', 'guide', 'pdf'));
END $$;

-- Add missing columns to user_progress table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_progress' AND column_name = 'pillar') THEN
    ALTER TABLE user_progress ADD COLUMN pillar TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_progress' AND column_name = 'resource_id') THEN
    ALTER TABLE user_progress ADD COLUMN resource_id UUID REFERENCES resources(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_progress' AND column_name = 'metadata') THEN
    ALTER TABLE user_progress ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add missing columns to user_milestones table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_milestones' AND column_name = 'created_at') THEN
    ALTER TABLE user_milestones ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- ============================================================================
-- PART 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

CREATE INDEX IF NOT EXISTS idx_company_employees_company_id ON company_employees(company_id);
CREATE INDEX IF NOT EXISTS idx_company_employees_user_id ON company_employees(user_id);
CREATE INDEX IF NOT EXISTS idx_company_employees_is_active ON company_employees(is_active);

CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_nuit ON companies(nuit);

CREATE INDEX IF NOT EXISTS idx_prestadores_user_id ON prestadores(user_id);
CREATE INDEX IF NOT EXISTS idx_prestadores_is_active ON prestadores(is_active);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_prestador_id ON bookings(prestador_id);
CREATE INDEX IF NOT EXISTS idx_bookings_company_id ON bookings(company_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_resources_pillar ON resources(pillar);
CREATE INDEX IF NOT EXISTS idx_resources_is_active ON resources(is_active);
CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON resources(resource_type);

CREATE INDEX IF NOT EXISTS idx_invites_invite_code ON invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_invites_company_id ON invites(company_id);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_provider_id ON chat_sessions(provider_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_specialist_assignments_specialist_id ON specialist_assignments(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_assignments_company_id ON specialist_assignments(company_id);

CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id ON user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_completed ON user_milestones(completed);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_pillar ON user_progress(pillar);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_booking_id ON feedback(booking_id);

CREATE INDEX IF NOT EXISTS idx_prestador_availability_prestador_id ON prestador_availability(prestador_id);
CREATE INDEX IF NOT EXISTS idx_prestador_schedule_prestador_id ON prestador_schedule(prestador_id);
CREATE INDEX IF NOT EXISTS idx_prestador_schedule_date ON prestador_schedule(date);
CREATE INDEX IF NOT EXISTS idx_prestador_performance_prestador_id ON prestador_performance(prestador_id);

CREATE INDEX IF NOT EXISTS idx_specialist_call_logs_specialist_id ON specialist_call_logs(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_call_logs_user_id ON specialist_call_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_resource_access_log_user_id ON resource_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_log_resource_id ON resource_access_log(resource_id);

-- ============================================================================
-- PART 4: ADD COMMENTS TO IMPORTANT TABLES/COLUMNS
-- ============================================================================

COMMENT ON TABLE companies IS 'Companies table - final schema cache refresh';
COMMENT ON COLUMN companies.sessions_allocated IS 'Total therapy sessions allocated to the company (pool of sessions)';
COMMENT ON COLUMN companies.sessions_used IS 'Total therapy sessions used by all employees';

COMMENT ON TABLE profiles IS 'User profiles - updated schema cache on 2025-11-02';

COMMENT ON TABLE invites IS 'Access codes for user registration - schema cache refresh trigger';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT '✅ DATABASE VERIFICATION AND FIXES COMPLETED!' as status;
SELECT 'All missing tables, columns, and indexes have been created.' as message;
SELECT 'Proceed to run ALL_RPC_FUNCTIONS.sql next.' as next_step;




