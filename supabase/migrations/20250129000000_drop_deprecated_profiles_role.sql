-- =====================================================
-- SAFELY DROP DEPRECATED profiles.role COLUMN
-- =====================================================
-- This migration completes the role security refactor by
-- removing the deprecated profiles.role column after ensuring
-- all data has been migrated to user_roles table.

-- =====================================================
-- STEP 1: FINAL DATA MIGRATION (Safety Check)
-- =====================================================
-- Migrate any remaining roles from profiles.role to user_roles
-- This is a safety check in case any data was missed

INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.id,
  p.role::public.app_role
FROM public.profiles p
WHERE 
  p.role IS NOT NULL 
  AND p.role IN ('admin', 'user', 'hr', 'prestador', 'specialist')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = p.role::public.app_role
  )
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure every profile has at least a 'user' role
INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.id,
  'user'::public.app_role
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.id
)
ON CONFLICT (user_id, role) DO NOTHING;

-- =====================================================
-- STEP 2: UPDATE TRIGGER TO NOT USE profiles.role
-- =====================================================
-- Ensure handle_new_user trigger doesn't write to profiles.role

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get role from metadata, default to 'user'
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'user');

  -- Insert into profiles WITHOUT role column
  INSERT INTO public.profiles (id, name, email, company_id, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    (NEW.raw_user_meta_data ->> 'company_id')::UUID,
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 3: RECREATE is_admin() HELPER IF NOT EXISTS
-- =====================================================
-- Create a helper function for admin checks (if it doesn't exist)

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- =====================================================
-- STEP 4: UPDATE ALL RLS POLICIES TO USE is_admin()
-- =====================================================
-- Replace all references to profiles.role = 'admin' with is_admin()

-- Companies policies
DROP POLICY IF EXISTS "admins_insert_companies" ON public.companies;
CREATE POLICY "admins_insert_companies" ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Prestadores policies  
DROP POLICY IF EXISTS "admins_insert_prestadores" ON public.prestadores;
CREATE POLICY "admins_insert_prestadores" ON public.prestadores
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Company employees policies
DROP POLICY IF EXISTS "admins_insert_employees" ON public.company_employees;
CREATE POLICY "admins_insert_employees" ON public.company_employees
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- User roles policies
DROP POLICY IF EXISTS "admins_insert_roles" ON public.user_roles;
CREATE POLICY "admins_insert_roles" ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Additional admin policies that may reference profiles.role
DROP POLICY IF EXISTS "admins_view_all_profiles" ON public.profiles;
CREATE POLICY "admins_view_all_profiles" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admins_view_all_companies" ON public.companies;
CREATE POLICY "admins_view_all_companies" ON public.companies
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admins_view_all_bookings" ON public.bookings;
CREATE POLICY "admins_view_all_bookings" ON public.bookings
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admins_update_all_bookings" ON public.bookings;
CREATE POLICY "admins_update_all_bookings" ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admins_view_all_prestadores" ON public.prestadores;
CREATE POLICY "admins_view_all_prestadores" ON public.prestadores
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admins_insert_logs" ON public.admin_logs;
CREATE POLICY "admins_insert_logs" ON public.admin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admins_manage_assignments" ON public.specialist_assignments;
CREATE POLICY "admins_manage_assignments" ON public.specialist_assignments
  FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admins_manage_resources" ON public.resources;
CREATE POLICY "admins_manage_resources" ON public.resources
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- STEP 5: DROP VIEWS THAT DEPEND ON profiles.role
-- =====================================================
-- Drop any views that reference profiles.role before dropping the column

DROP VIEW IF EXISTS public.user_profile_with_roles CASCADE;

-- =====================================================
-- STEP 6: DROP THE DEPRECATED COLUMN
-- =====================================================
-- Finally, drop the profiles.role column

ALTER TABLE public.profiles DROP COLUMN IF EXISTS role CASCADE;

-- =====================================================
-- STEP 7: RECREATE USEFUL VIEWS (WITHOUT role column)
-- =====================================================
-- Recreate the user_profile_with_roles view without the role column

CREATE OR REPLACE VIEW public.user_profile_with_roles AS
SELECT 
  p.*,
  ARRAY_AGG(ur.role ORDER BY 
    CASE ur.role
      WHEN 'admin' THEN 1
      WHEN 'hr' THEN 2
      WHEN 'prestador' THEN 3
      WHEN 'specialist' THEN 4
      WHEN 'user' THEN 5
    END
  ) FILTER (WHERE ur.role IS NOT NULL) as roles,
  public.get_user_primary_role(p.id) as primary_role,
  BOOL_OR(ur.role = 'admin') as is_admin,
  BOOL_OR(ur.role = 'hr') as is_hr,
  BOOL_OR(ur.role = 'prestador') as is_prestador,
  BOOL_OR(ur.role = 'specialist') as is_specialist,
  BOOL_OR(ur.role = 'user') as is_user
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
GROUP BY p.id;

GRANT SELECT ON public.user_profile_with_roles TO authenticated;
GRANT SELECT ON public.user_profile_with_roles TO anon;

-- =====================================================
-- STEP 6: ADD HELPFUL COMMENTS
-- =====================================================

COMMENT ON TABLE public.user_roles IS 'Stores user role assignments. Users can have multiple roles. Use get_user_primary_role() to get the highest-priority role.';
COMMENT ON VIEW public.user_profile_with_roles IS 'Convenience view that joins profiles with their roles and computed flags.';
COMMENT ON FUNCTION public.get_user_primary_role(UUID) IS 'Returns the highest-priority role for a user. Priority: admin > hr > prestador > specialist > user';

-- =====================================================
-- VERIFICATION QUERIES (for logging)
-- =====================================================
-- These queries help verify the migration succeeded

DO $$
DECLARE
  profiles_count INTEGER;
  user_roles_count INTEGER;
  users_without_roles INTEGER;
BEGIN
  SELECT COUNT(*) INTO profiles_count FROM public.profiles;
  SELECT COUNT(DISTINCT user_id) INTO user_roles_count FROM public.user_roles;
  SELECT COUNT(*) INTO users_without_roles 
  FROM public.profiles p 
  WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id);
  
  RAISE NOTICE '=== Migration Verification ===';
  RAISE NOTICE 'Total profiles: %', profiles_count;
  RAISE NOTICE 'Profiles with roles in user_roles: %', user_roles_count;
  RAISE NOTICE 'Profiles without any role: %', users_without_roles;
  
  IF users_without_roles > 0 THEN
    RAISE WARNING 'Found % profiles without roles! They should have been given default "user" role.', users_without_roles;
  ELSE
    RAISE NOTICE '✅ All profiles have at least one role assigned';
  END IF;
  
  RAISE NOTICE '✅ Migration completed successfully';
  RAISE NOTICE 'profiles.role column has been dropped';
END $$;

