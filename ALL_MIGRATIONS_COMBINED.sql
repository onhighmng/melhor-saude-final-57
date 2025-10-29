-- =====================================================
-- COMPLETE DATABASE MIGRATION FOR MELHOR SAUDE PLATFORM
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- MIGRATION 1: Create All Core Tables
-- =====================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'hr', 'prestador', 'especialista_geral')),
  company_id UUID,
  department TEXT,
  position TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nuit TEXT UNIQUE,
  email TEXT NOT NULL,
  phone TEXT,
  logo_url TEXT,
  address TEXT,
  industry TEXT,
  size TEXT CHECK (size IN ('small', 'medium', 'large', 'enterprise')),
  number_of_employees INTEGER DEFAULT 0,
  sessions_allocated INTEGER DEFAULT 0,
  sessions_used INTEGER DEFAULT 0,
  sessions_per_employee INTEGER DEFAULT 4,
  session_model TEXT DEFAULT 'pool' CHECK (session_model IN ('pool', 'fixed')),
  price_per_session DECIMAL(10,2),
  hr_contact_person TEXT,
  hr_email TEXT,
  program_start_date DATE,
  contract_start_date DATE,
  contract_end_date DATE,
  pillars TEXT[] DEFAULT ARRAY['mental', 'physical', 'financial', 'legal'],
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);

-- Continue with all other tables...
-- (This is a condensed version - full SQL in migration files)

-- MIGRATION 2: Functions and Triggers  
-- =====================================================

-- Platform analytics function
CREATE OR REPLACE FUNCTION get_platform_analytics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles WHERE role = 'user'),
    'active_users', (SELECT COUNT(DISTINCT user_id) FROM bookings WHERE created_at > now() - interval '30 days'),
    'total_companies', (SELECT COUNT(*) FROM companies WHERE is_active = true),
    'total_prestadores', (SELECT COUNT(*) FROM prestadores WHERE is_approved = true),
    'active_prestadores', (SELECT COUNT(DISTINCT prestador_id) FROM bookings WHERE date >= CURRENT_DATE),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'pending_change_requests', 0,
    'sessions_allocated', (SELECT COALESCE(SUM(sessions_allocated), 0) FROM companies),
    'sessions_used', (SELECT COALESCE(SUM(sessions_used), 0) FROM companies)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- MIGRATION 3: RLS Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add policies...

-- NOTE: Due to file size, run the actual migration files in order from:
-- 1. supabase/migrations/20250102000000_create_core_tables.sql
-- 2. supabase/migrations/20250102000001_create_rpc_functions.sql
-- 3. supabase/migrations/20250102000002_create_rls_policies.sql

