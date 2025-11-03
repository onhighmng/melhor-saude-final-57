-- ========================================
-- FIX: Employee Registration Permissions
-- ========================================
-- Ensures employee registration works flawlessly with RLS enabled

-- ============================================
-- 1. INVITES TABLE
-- ============================================

-- Allow unauthenticated users to READ invites (for validation during registration)
DROP POLICY IF EXISTS "public_read_invites_for_registration" ON invites;
CREATE POLICY "public_read_invites_for_registration"
ON invites
FOR SELECT
TO public
USING (status = 'pending');

-- Allow authenticated users to UPDATE invites (mark as accepted after registration)
DROP POLICY IF EXISTS "authenticated_update_invites" ON invites;
CREATE POLICY "authenticated_update_invites"
ON invites
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 2. PROFILES TABLE  
-- ============================================

-- Allow users to INSERT their own profile during registration
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
CREATE POLICY "users_insert_own_profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Allow users to UPDATE their own profile
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================
-- 3. USER_ROLES TABLE (CRITICAL - HAD NO POLICIES!)
-- ============================================

-- Allow users to INSERT their own role during registration
DROP POLICY IF EXISTS "users_insert_own_role" ON user_roles;
CREATE POLICY "users_insert_own_role"
ON user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to READ their own roles
DROP POLICY IF EXISTS "users_read_own_roles" ON user_roles;
CREATE POLICY "users_read_own_roles"
ON user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to read all roles
DROP POLICY IF EXISTS "admins_read_all_roles" ON user_roles;
CREATE POLICY "admins_read_all_roles"
ON user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Allow admins to manage all roles
DROP POLICY IF EXISTS "admins_manage_all_roles" ON user_roles;
CREATE POLICY "admins_manage_all_roles"
ON user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- ============================================
-- 4. COMPANY_EMPLOYEES TABLE
-- ============================================

-- Allow users to INSERT their own employee record during registration
DROP POLICY IF EXISTS "users_insert_own_employee" ON company_employees;
CREATE POLICY "users_insert_own_employee"
ON company_employees
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow HR to insert employees for their company
DROP POLICY IF EXISTS "hr_insert_employees" ON company_employees;
CREATE POLICY "hr_insert_employees"
ON company_employees
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN profiles p ON p.id = ur.user_id
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'hr'
    AND p.company_id = company_employees.company_id
  )
);

-- ============================================
-- 5. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_employees ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. VERIFY POLICIES
-- ============================================

-- Check invites policies
SELECT 
  'invites' as table_name,
  policyname,
  cmd as command,
  CASE 
    WHEN roles::text LIKE '%public%' THEN 'public'
    WHEN roles::text LIKE '%authenticated%' THEN 'authenticated'
    ELSE roles::text
  END as for_role
FROM pg_policies 
WHERE tablename = 'invites'
ORDER BY policyname;

-- Check user_roles policies (should now have policies!)
SELECT 
  'user_roles' as table_name,
  policyname,
  cmd as command
FROM pg_policies 
WHERE tablename = 'user_roles'
ORDER BY policyname;

-- Check RLS is enabled
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('invites', 'profiles', 'user_roles', 'company_employees')
ORDER BY tablename;


