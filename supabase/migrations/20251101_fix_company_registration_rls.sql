-- CRITICAL FIX: Company Registration RLS Policies
-- This migration fixes the 403/409 errors during company registration
-- Date: November 1, 2025
-- 
-- DEFENSIVE APPROACH: Creates tables if missing, then fixes RLS

-- ============================================================================
-- STEP 0: Define helper functions first (required by policies)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin'::public.app_role 
     FROM public.user_roles 
     WHERE user_id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- ============================================================================
-- STEP 1: Ensure company_employees table exists with correct structure
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.company_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sessions_allocated INTEGER DEFAULT 0 CHECK (sessions_allocated >= 0),
  sessions_used INTEGER DEFAULT 0 CHECK (sessions_used >= 0),
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_company_employees_company ON public.company_employees(company_id);
CREATE INDEX IF NOT EXISTS idx_company_employees_user ON public.company_employees(user_id);
CREATE INDEX IF NOT EXISTS idx_company_employees_active ON public.company_employees(is_active);

-- ============================================================================
-- STEP 2: Drop all conflicting RLS policies on companies table
-- ============================================================================

DROP POLICY IF EXISTS "admins_insert_companies" ON public.companies;
DROP POLICY IF EXISTS "hr_create_company" ON public.companies;
DROP POLICY IF EXISTS "Admins can manage all companies" ON public.companies;
DROP POLICY IF EXISTS "Anyone can view active companies" ON public.companies;
DROP POLICY IF EXISTS "admins_view_all_companies" ON public.companies;
DROP POLICY IF EXISTS "users_view_company" ON public.companies;
DROP POLICY IF EXISTS "hr_view_own_company" ON public.companies;
DROP POLICY IF EXISTS "HR can view their own company" ON public.companies;
DROP POLICY IF EXISTS "HR can update their own company" ON public.companies;

-- ============================================================================
-- STEP 3: Create new RLS policies for companies
-- ============================================================================

-- Everyone can view ACTIVE companies
CREATE POLICY "view_active_companies"
  ON public.companies FOR SELECT
  USING (is_active = true);

-- Admins can view ALL companies
CREATE POLICY "admins_view_all_companies"
  ON public.companies FOR SELECT
  USING (public.is_admin());

-- HR users can view their own company (via profiles.company_id)
CREATE POLICY "hr_view_own_company"
  ON public.companies FOR SELECT
  USING (
    public.has_role(auth.uid(), 'hr'::public.app_role) 
    AND id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

-- CRITICAL: HR users can CREATE companies during registration
-- This policy was MISSING and caused 403 errors
CREATE POLICY "hr_create_company_registration"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      -- New HR user: email matches contact_email
      contact_email IN (
        SELECT email FROM auth.users 
        WHERE id = auth.uid() AND email IS NOT NULL
      )
      OR
      -- Existing HR user: has hr role
      public.has_role(auth.uid(), 'hr'::public.app_role)
    )
  );

-- Admins can create companies
CREATE POLICY "admins_create_companies"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- HR users can update their own company
CREATE POLICY "hr_update_own_company"
  ON public.companies FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'hr'::public.app_role) 
    AND id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'hr'::public.app_role) 
    AND id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

-- Admins can manage all companies
CREATE POLICY "admins_manage_all_companies"
  ON public.companies FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- STEP 4: Fix company_employees RLS policies
-- ============================================================================

DROP POLICY IF EXISTS "admins_insert_employees" ON public.company_employees;
DROP POLICY IF EXISTS "users_insert_own_employee_record" ON public.company_employees;
DROP POLICY IF EXISTS "Users can view their own employee record" ON public.company_employees;
DROP POLICY IF EXISTS "users_insert_own_employee" ON public.company_employees;
DROP POLICY IF EXISTS "users_view_own_employee" ON public.company_employees;
DROP POLICY IF EXISTS "hr_view_employees" ON public.company_employees;
DROP POLICY IF EXISTS "admins_manage_employees" ON public.company_employees;

-- Users can insert their own employee record
CREATE POLICY "users_insert_own_employee"
  ON public.company_employees FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can view their own employee record
CREATE POLICY "users_view_own_employee"
  ON public.company_employees FOR SELECT
  USING (user_id = auth.uid());

-- HR can view employees in their company
CREATE POLICY "hr_view_employees"
  ON public.company_employees FOR SELECT
  USING (
    public.has_role(auth.uid(), 'hr'::public.app_role)
    AND company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

-- Admins can manage all employee records
CREATE POLICY "admins_manage_employees"
  ON public.company_employees FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- STEP 5: Enable RLS on both tables
-- ============================================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_employees ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: Grant permissions
-- ============================================================================

GRANT SELECT ON public.companies TO authenticated, anon;
GRANT INSERT, UPDATE ON public.companies TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.company_employees TO authenticated;

-- ============================================================================
-- Success message
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Company registration RLS policies fixed!';
  RAISE NOTICE 'Tables: companies and company_employees are ready';
  RAISE NOTICE 'Policies: Created 7 company policies + 4 company_employees policies';
  RAISE NOTICE 'Functions: is_admin() and has_role() available';
END
$$;
