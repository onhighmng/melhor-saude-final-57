-- =====================================================
-- FIX RLS POLICIES TO USE USER_ROLES TABLE
-- =====================================================
-- This migration fixes all RLS policies to use the user_roles table
-- instead of the deprecated profiles.role column.
--
-- ISSUE: RLS policies were checking profiles.role = 'admin', but that
-- column was deprecated. Now we use user_roles table exclusively.
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: CREATE HELPER FUNCTIONS FOR ROLE CHECKING
-- =====================================================
-- These functions check roles from user_roles table
-- They are SECURITY DEFINER to bypass RLS on user_roles

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Function to check if current user is HR
CREATE OR REPLACE FUNCTION public.is_hr()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'hr'
  );
$$;

-- Function to check if current user is prestador
CREATE OR REPLACE FUNCTION public.is_prestador()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'prestador'
  );
$$;

-- Function to check if current user is specialist
CREATE OR REPLACE FUNCTION public.is_specialist()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('specialist', 'especialista_geral')
  );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_hr() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_prestador() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_specialist() TO authenticated;

-- =====================================================
-- STEP 2: DROP OLD RLS POLICIES
-- =====================================================

-- Profiles policies
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "hr_view_company_employees" ON public.profiles;

-- Companies policies
DROP POLICY IF EXISTS "users_view_company" ON public.companies;
DROP POLICY IF EXISTS "hr_view_own_company" ON public.companies;
DROP POLICY IF EXISTS "admins_view_all_companies" ON public.companies;

-- Bookings policies
DROP POLICY IF EXISTS "users_view_own_bookings" ON public.bookings;
DROP POLICY IF EXISTS "users_create_own_bookings" ON public.bookings;
DROP POLICY IF EXISTS "users_update_own_bookings" ON public.bookings;
DROP POLICY IF EXISTS "prestadores_view_assigned_bookings" ON public.bookings;
DROP POLICY IF EXISTS "prestadores_update_assigned_bookings" ON public.bookings;
DROP POLICY IF EXISTS "hr_view_company_bookings" ON public.bookings;
DROP POLICY IF EXISTS "admins_view_all_bookings" ON public.bookings;
DROP POLICY IF EXISTS "admins_update_all_bookings" ON public.bookings;

-- Prestadores policies
DROP POLICY IF EXISTS "prestadores_view_own" ON public.prestadores;
DROP POLICY IF EXISTS "prestadores_update_own" ON public.prestadores;
DROP POLICY IF EXISTS "all_view_approved_prestadores" ON public.prestadores;
DROP POLICY IF EXISTS "admins_view_all_prestadores" ON public.prestadores;
DROP POLICY IF EXISTS "admins_update_all_prestadores" ON public.prestadores;

-- Company employees policies
DROP POLICY IF EXISTS "users_view_own_employee_record" ON public.company_employees;
DROP POLICY IF EXISTS "hr_view_company_employees" ON public.company_employees;
DROP POLICY IF EXISTS "admins_view_all_employees" ON public.company_employees;
DROP POLICY IF EXISTS "hr_update_company_employees" ON public.company_employees;

-- =====================================================
-- STEP 3: CREATE NEW RLS POLICIES USING HELPER FUNCTIONS
-- =====================================================

-- ====================
-- PROFILES TABLE
-- ====================

CREATE POLICY "users_view_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "admins_view_all_profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "admins_update_all_profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "hr_view_company_employees"
  ON public.profiles FOR SELECT
  USING (
    public.is_hr() AND
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- ====================
-- COMPANIES TABLE
-- ====================

CREATE POLICY "users_view_own_company"
  ON public.companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "hr_view_own_company"
  ON public.companies FOR SELECT
  USING (
    public.is_hr() AND
    id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "admins_view_all_companies"
  ON public.companies FOR SELECT
  USING (public.is_admin());

CREATE POLICY "admins_update_all_companies"
  ON public.companies FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "admins_insert_companies"
  ON public.companies FOR INSERT
  WITH CHECK (public.is_admin());

-- ====================
-- BOOKINGS TABLE
-- ====================

CREATE POLICY "users_view_own_bookings"
  ON public.bookings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "users_create_own_bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_bookings"
  ON public.bookings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "prestadores_view_assigned_bookings"
  ON public.bookings FOR SELECT
  USING (
    public.is_prestador() AND
    prestador_id IN (
      SELECT id FROM public.prestadores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "prestadores_update_assigned_bookings"
  ON public.bookings FOR UPDATE
  USING (
    public.is_prestador() AND
    prestador_id IN (
      SELECT id FROM public.prestadores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "hr_view_company_bookings"
  ON public.bookings FOR SELECT
  USING (
    public.is_hr() AND
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "admins_view_all_bookings"
  ON public.bookings FOR SELECT
  USING (public.is_admin());

CREATE POLICY "admins_update_all_bookings"
  ON public.bookings FOR UPDATE
  USING (public.is_admin());

-- ====================
-- PRESTADORES TABLE
-- ====================

CREATE POLICY "prestadores_view_own"
  ON public.prestadores FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "prestadores_update_own"
  ON public.prestadores FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "all_view_active_prestadores"
  ON public.prestadores FOR SELECT
  USING (is_active = true);

CREATE POLICY "admins_view_all_prestadores"
  ON public.prestadores FOR SELECT
  USING (public.is_admin());

CREATE POLICY "admins_update_all_prestadores"
  ON public.prestadores FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "admins_insert_prestadores"
  ON public.prestadores FOR INSERT
  WITH CHECK (public.is_admin());

-- ====================
-- COMPANY_EMPLOYEES TABLE
-- ====================

CREATE POLICY "users_view_own_employee_record"
  ON public.company_employees FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "hr_view_company_employees"
  ON public.company_employees FOR SELECT
  USING (
    public.is_hr() AND
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "admins_view_all_employees"
  ON public.company_employees FOR SELECT
  USING (public.is_admin());

CREATE POLICY "admins_update_all_employees"
  ON public.company_employees FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "hr_update_company_employees"
  ON public.company_employees FOR UPDATE
  USING (
    public.is_hr() AND
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- ====================
-- USER_ROLES TABLE
-- ====================
-- Ensure RLS is enabled on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "users_view_own_role" ON public.user_roles;
DROP POLICY IF EXISTS "admins_view_all_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_manage_roles" ON public.user_roles;

-- Create new policies
CREATE POLICY "users_view_own_role"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "admins_view_all_roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "admins_insert_roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "admins_update_roles"
  ON public.user_roles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "admins_delete_roles"
  ON public.user_roles FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- STEP 4: ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the current user has admin role in user_roles table';
COMMENT ON FUNCTION public.is_hr() IS 'Returns true if the current user has hr role in user_roles table';
COMMENT ON FUNCTION public.is_prestador() IS 'Returns true if the current user has prestador role in user_roles table';
COMMENT ON FUNCTION public.is_specialist() IS 'Returns true if the current user has specialist or especialista_geral role in user_roles table';

-- =====================================================
-- STEP 5: VERIFY MIGRATION
-- =====================================================

DO $$
DECLARE
  admin_count INTEGER;
  hr_count INTEGER;
  prestador_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  SELECT COUNT(*) INTO hr_count FROM public.user_roles WHERE role = 'hr';
  SELECT COUNT(*) INTO prestador_count FROM public.user_roles WHERE role = 'prestador';

  RAISE NOTICE '=== RLS Migration Complete ===';
  RAISE NOTICE 'Admin users: %', admin_count;
  RAISE NOTICE 'HR users: %', hr_count;
  RAISE NOTICE 'Prestador users: %', prestador_count;
  RAISE NOTICE 'All RLS policies now use user_roles table instead of deprecated profiles.role column';
END $$;

COMMIT;

-- =====================================================
-- VERIFICATION QUERY (run separately if needed)
-- =====================================================
-- SELECT
--   u.email,
--   ARRAY_AGG(DISTINCT ur.role) as roles,
--   public.is_admin() as is_admin_check,
--   public.is_hr() as is_hr_check,
--   public.is_prestador() as is_prestador_check
-- FROM auth.users u
-- LEFT JOIN public.user_roles ur ON ur.user_id = u.id
-- WHERE u.id = auth.uid()
-- GROUP BY u.email;
