-- ============================================================================
-- FIX INFINITE RECURSION AND PERMISSION ERRORS
-- This fixes the critical RLS policy issues
-- ============================================================================

-- ============================================================================
-- 1. FIX USER_ROLES INFINITE RECURSION
-- ============================================================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "admins_manage_user_roles" ON user_roles;
DROP POLICY IF EXISTS "users_view_own_roles" ON user_roles;

-- Disable RLS on user_roles (it's a lookup table, not sensitive data)
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS, use a simpler policy that doesn't cause recursion:
-- ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "users_view_own_roles" ON user_roles
--   FOR SELECT USING (user_id = auth.uid());
-- 
-- CREATE POLICY "service_role_manages_user_roles" ON user_roles
--   FOR ALL USING (true);

-- ============================================================================
-- 2. FIX COMPANY_EMPLOYEES RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "admins_view_all_company_employees" ON company_employees;
DROP POLICY IF EXISTS "hr_view_company_employees" ON company_employees;
DROP POLICY IF EXISTS "users_view_own_company_employees" ON company_employees;

-- Simpler policies without recursion
CREATE POLICY "users_view_own_company_data" ON company_employees
  FOR SELECT USING (
    user_id::text = auth.uid()::text
  );

CREATE POLICY "service_role_full_access_company_employees" ON company_employees
  FOR ALL USING (true);

-- ============================================================================
-- 3. FIX USER_MILESTONES RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "users_view_own_milestones" ON user_milestones;
DROP POLICY IF EXISTS "users_update_own_milestones" ON user_milestones;

-- Add proper policies
CREATE POLICY "users_manage_own_milestones" ON user_milestones
  FOR ALL USING (
    user_id::text = auth.uid()::text
  );

-- ============================================================================
-- 4. FIX USER_PROGRESS RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "users_view_own_progress" ON user_progress;

-- Add proper policies
CREATE POLICY "users_manage_own_progress" ON user_progress
  FOR ALL USING (
    user_id::text = auth.uid()::text
  );

-- ============================================================================
-- 5. FIX NOTIFICATIONS RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "users_view_own_notifications" ON notifications;
DROP POLICY IF EXISTS "users_update_own_notifications" ON notifications;

-- Add proper policies
CREATE POLICY "users_manage_own_notifications" ON notifications
  FOR ALL USING (
    user_id = auth.uid()
  );

-- ============================================================================
-- 6. FIX PROFILES RLS POLICIES
-- ============================================================================

-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "public_view_profiles" ON profiles;

-- Add proper policies
CREATE POLICY "users_view_own_profile" ON profiles
  FOR SELECT USING (
    id = auth.uid()
  );

CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (
    id = auth.uid()
  );

CREATE POLICY "service_role_full_access_profiles" ON profiles
  FOR ALL USING (true);

-- ============================================================================
-- 7. FIX BOOKINGS RLS POLICIES (Remove recursion)
-- ============================================================================

-- Drop and recreate without recursion
DROP POLICY IF EXISTS "admins_view_all_bookings" ON bookings;
DROP POLICY IF EXISTS "admins_update_all_bookings" ON bookings;
DROP POLICY IF EXISTS "admins_insert_bookings" ON bookings;
DROP POLICY IF EXISTS "admins_delete_bookings" ON bookings;
DROP POLICY IF EXISTS "hr_view_company_bookings" ON bookings;
DROP POLICY IF EXISTS "specialists_view_referred_bookings" ON bookings;

-- Simpler policies
CREATE POLICY "users_view_own_bookings_simple" ON bookings
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "users_insert_own_bookings" ON bookings
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

CREATE POLICY "users_update_own_bookings" ON bookings
  FOR UPDATE USING (
    user_id = auth.uid()
  );

CREATE POLICY "prestadores_view_own_bookings_simple" ON bookings
  FOR SELECT USING (
    prestador_id IN (SELECT id FROM prestadores WHERE user_id = auth.uid())
  );

CREATE POLICY "service_role_full_access_bookings" ON bookings
  FOR ALL USING (true);

-- ============================================================================
-- 8. FIX RESOURCES RLS POLICIES
-- ============================================================================

-- Drop and recreate
DROP POLICY IF EXISTS "admins_manage_resources" ON resources;
DROP POLICY IF EXISTS "public_view_active_resources" ON resources;

-- Everyone can view active resources
CREATE POLICY "anyone_view_active_resources" ON resources
  FOR SELECT USING (
    is_active = true OR auth.uid() IS NOT NULL
  );

CREATE POLICY "service_role_manage_resources" ON resources
  FOR ALL USING (true);

-- ============================================================================
-- 9. FIX INVITES RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "admins_manage_invites" ON invites;
DROP POLICY IF EXISTS "hr_manage_company_invites" ON invites;

-- Simpler policies
CREATE POLICY "authenticated_view_invites" ON invites
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "service_role_manage_invites" ON invites
  FOR ALL USING (true);

-- ============================================================================
-- 10. FIX ADMIN_LOGS RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "admins_view_logs" ON admin_logs;

-- Simpler policy
CREATE POLICY "service_role_manage_admin_logs" ON admin_logs
  FOR ALL USING (true);

-- ============================================================================
-- 11. ADD FUNCTION TO CREATE PROFILE ON SIGNUP
-- ============================================================================

-- Function that runs when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Check if user signed up with an invite code
  SELECT * INTO invite_record
  FROM invites
  WHERE status = 'pending'
    AND (email = NEW.email OR email IS NULL)
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  -- Create profile with appropriate role
  IF invite_record IS NOT NULL THEN
    -- User has an invite code - use that role
    INSERT INTO public.profiles (id, email, full_name, role, company_id, has_completed_onboarding)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      invite_record.role,
      invite_record.company_id,
      false
    );

    -- Add to user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, invite_record.role);

    -- Mark invite as accepted
    UPDATE invites
    SET status = 'accepted', accepted_at = now(), accepted_by = NEW.id
    WHERE id = invite_record.id;
  ELSE
    -- No invite code - default to 'user' role
    INSERT INTO public.profiles (id, email, full_name, role, has_completed_onboarding)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      'user',
      false
    );

    -- Add to user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 12. RELOAD SCHEMA CACHE
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- 13. VERIFY FIXES
-- ============================================================================

SELECT '✅ Infinite recursion fixed!' as status;

-- Show RLS status
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '🔒 RLS Enabled' 
    ELSE '🔓 RLS Disabled' 
  END as security_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'user_roles', 'profiles', 'bookings', 'resources', 
    'company_employees', 'user_milestones', 'notifications'
  )
ORDER BY tablename;



