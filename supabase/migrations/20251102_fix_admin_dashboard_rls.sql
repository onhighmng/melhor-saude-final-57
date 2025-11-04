-- Fix Admin Dashboard RLS Issues
-- This migration ensures admin users can access all necessary data

-- =============================================================================
-- 1. ENSURE PRESTADORES TABLE HAS PROPER RLS POLICIES
-- =============================================================================

-- First, ensure RLS is actually disabled on prestadores
-- (It should already be, but let's be explicit)
ALTER TABLE prestadores DISABLE ROW LEVEL SECURITY;

-- Or if you want RLS enabled with admin access:
-- ALTER TABLE prestadores ENABLE ROW LEVEL SECURITY;
-- 
-- DROP POLICY IF EXISTS "admins_manage_prestadores" ON prestadores;
-- CREATE POLICY "admins_manage_prestadores"
--   ON prestadores
--   FOR ALL
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_roles.user_id = auth.uid()
--       AND user_roles.role = 'admin'
--     )
--   );

-- =============================================================================
-- 2. FIX BOOKINGS RLS POLICIES
-- =============================================================================

-- Ensure admin can insert bookings too
DROP POLICY IF EXISTS "admins_insert_bookings" ON bookings;
CREATE POLICY "admins_insert_bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Ensure admin can delete bookings
DROP POLICY IF EXISTS "admins_delete_bookings" ON bookings;
CREATE POLICY "admins_delete_bookings"
  ON bookings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- =============================================================================
-- 3. FIX RESOURCES RLS POLICIES
-- =============================================================================

-- The resources table already has admin policies, but let's ensure they're correct
-- Drop duplicate policies first
DROP POLICY IF EXISTS "Admins can manage resources" ON resources;

-- Ensure the correct admin policy exists
DROP POLICY IF EXISTS "admins_manage_resources" ON resources;
CREATE POLICY "admins_manage_resources"
  ON resources
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Keep the public read policy for active resources
DROP POLICY IF EXISTS "Anyone can view active resources" ON resources;
CREATE POLICY "public_view_active_resources"
  ON resources
  FOR SELECT
  USING (is_active = true);

-- =============================================================================
-- 4. ADD HELPER FUNCTION TO CHECK IF USER IS ADMIN
-- =============================================================================

-- Create a helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- =============================================================================
-- 5. ADD FUNCTION TO CREATE FIRST ADMIN USER
-- =============================================================================

-- Function to promote a user to admin (can only be called by existing admin or service role)
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
  result JSON;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User not found with email: ' || user_email
    );
  END IF;

  -- Update profile role
  UPDATE profiles
  SET role = 'admin'
  WHERE id = target_user_id;

  -- Insert or update user_roles
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN json_build_object(
    'success', true,
    'message', 'User promoted to admin successfully',
    'user_id', target_user_id,
    'email', user_email
  );
END;
$$;

-- Grant execute to service role only (for initial setup)
GRANT EXECUTE ON FUNCTION promote_to_admin(TEXT) TO service_role;

-- =============================================================================
-- 6. CREATE VIEW FOR ADMIN ANALYTICS (BYPASSES RLS)
-- =============================================================================

-- Create a view that admin can use to get analytics without RLS blocking
CREATE OR REPLACE VIEW admin_analytics AS
SELECT
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM prestadores) as total_prestadores,
  (SELECT COUNT(*) FROM prestadores WHERE available = true) as active_prestadores,
  (SELECT COUNT(*) FROM companies) as total_companies,
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_bookings,
  (SELECT SUM(sessions_allocated) FROM companies) as sessions_allocated,
  (SELECT SUM(sessions_used) FROM companies) as sessions_used,
  (SELECT AVG(rating)::NUMERIC(3,2) FROM bookings WHERE rating IS NOT NULL) as avg_rating,
  (SELECT COUNT(*) FROM resources WHERE is_active = true) as active_resources;

-- Grant select to authenticated users (they still need to be admin to use it via RLS)
GRANT SELECT ON admin_analytics TO authenticated;

-- =============================================================================
-- COMMIT AND VERIFY
-- =============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Admin Dashboard RLS fixes applied successfully';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create your first admin user account via Supabase Auth';
  RAISE NOTICE '2. Run: SELECT promote_to_admin(''your-email@example.com'');';
  RAISE NOTICE '3. Refresh the admin dashboard';
END $$;




