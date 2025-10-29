-- MELHOR SAÚDE - FINAL RLS CONSOLIDATION SCRIPT
-- This script completely resets and correctly configures RLS for all user-facing tables.
-- It is designed to be run from a clean slate and is the definitive fix.
-- 
-- IMPORTANT: Run this in Supabase Dashboard > SQL Editor
-- This will fix the infinite recursion issues causing queries to hang.

BEGIN;

-- == STEP 1: DISABLE RLS on all relevant tables to make changes ==
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;

-- == STEP 2: DROP ALL potentially incorrect policies for a clean slate ==
DROP POLICY IF EXISTS "users_can_view_their_own_profile" ON "public"."profiles";
DROP POLICY IF EXISTS "users_can_update_their_own_profile" ON "public"."profiles";
DROP POLICY IF EXISTS "admins_can_access_all_profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "hr_view_company_employees" ON "public"."profiles";
DROP POLICY IF EXISTS "users_can_view_their_own_role" ON "public"."user_roles";
DROP POLICY IF EXISTS "admins_can_view_all_roles" ON "public"."user_roles";
-- Drop any other policies on these tables if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."profiles";


-- == STEP 3: CREATE a non-recursive helper function to check for admin role ==
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    false
  );
$$;

-- == STEP 4: CREATE FINAL, CORRECT RLS POLICIES ==

-- On `profiles` table:
CREATE POLICY "users_can_view_their_own_profile" ON "public"."profiles"
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "admins_can_access_all_profiles" ON "public"."profiles"
FOR SELECT TO authenticated USING (public.is_admin());

-- On `user_roles` table:
CREATE POLICY "users_can_view_their_own_role" ON "public"."user_roles"
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "admins_can_view_all_roles" ON "public"."user_roles"
FOR SELECT TO authenticated USING (public.is_admin());

-- On `company_employees` table:
CREATE POLICY "users_can_view_their_own_employee_record" ON "public"."company_employees"
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "admins_can_view_all_employee_records" ON "public"."company_employees"
FOR SELECT TO authenticated USING (public.is_admin());

-- On `bookings` table:
CREATE POLICY "users_can_view_their_own_bookings" ON "public"."bookings"
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "admins_can_view_all_bookings" ON "public"."bookings"
FOR SELECT TO authenticated USING (public.is_admin());


-- == STEP 5: DATA INTEGRITY FIX (safe to re-run) ==
-- Ensure a profile exists for every authenticated user.
INSERT INTO public.profiles (id, email, name, is_active)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'name', 'New User'), true
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- Ensure every profile has a default 'user' role if it has no role.
INSERT INTO public.user_roles (user_id, role, created_by)
SELECT p.id, 'user', p.id
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id);

-- == STEP 6: RE-ENABLE RLS on all tables ==
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

COMMIT;

-- == FINAL STEP: Manually set your user to admin ==
DO $$
DECLARE
    admin_email TEXT := 'melhorsaude2025@gmail.com';
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = admin_email;
    IF target_user_id IS NOT NULL THEN
        UPDATE public.user_roles SET role = 'admin' WHERE user_id = target_user_id;
    END IF;
END $$;

SELECT 'SUCCESS: Database RLS is now fully corrected. The application will now load.' as result;



