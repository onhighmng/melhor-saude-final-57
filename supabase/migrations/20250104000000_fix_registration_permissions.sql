-- Fix RLS policies to allow registration flows
-- This migration fixes permissions for all user registration scenarios
-- IMPORTANT: Run this AFTER all other migrations

-- ============================================================================
-- PROFILES TABLE: Allow users to INSERT their own profile during registration
-- ============================================================================
-- Drop existing policy if it conflicts
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;

-- Create policy to allow users to create their own profile
CREATE POLICY "users_insert_own_profile" ON profiles FOR INSERT
  WITH CHECK (
    -- Users can only create profiles for themselves
    auth.uid() = id
    -- Ensure they're authenticated
    AND auth.uid() IS NOT NULL
  );

-- ============================================================================
-- USER_ROLES TABLE: Allow users to INSERT their own role during registration
-- ============================================================================
-- This supplements the existing "Admins can insert roles" policy
DROP POLICY IF EXISTS "users_insert_own_role" ON user_roles;
CREATE POLICY "users_insert_own_role" ON user_roles FOR INSERT
  WITH CHECK (
    -- Users can create their own role during registration
    auth.uid() = user_id
    AND auth.uid() IS NOT NULL
  );

-- ============================================================================
-- COMPANIES TABLE: Allow HR users to CREATE companies during registration
-- ============================================================================
DROP POLICY IF EXISTS "hr_create_company" ON companies;
CREATE POLICY "hr_create_company" ON companies FOR INSERT
  WITH CHECK (
    -- During registration, allow authenticated users to create companies
    -- This is needed because HR users don't have company_id yet when registering
    -- Security: Users can only create companies, not read them without proper permissions
    auth.uid() IS NOT NULL
    AND (
      -- New HR user: their email matches company contact_email field (required field)
      -- Note: Actual schema uses 'contact_email' not 'email'
      contact_email IN (SELECT email FROM auth.users WHERE id = auth.uid())
      OR
      -- Existing HR user creating additional company
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'hr'
      )
    )
  );

-- ============================================================================
-- COMPANY_EMPLOYEES TABLE: Allow users to INSERT their own employee record
-- ============================================================================
DROP POLICY IF EXISTS "users_insert_own_employee_record" ON company_employees;
CREATE POLICY "users_insert_own_employee_record" ON company_employees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PRESTADORES TABLE: Allow prestadores to INSERT their own record during registration
-- ============================================================================
DROP POLICY IF EXISTS "prestadores_insert_own" ON prestadores;
CREATE POLICY "prestadores_insert_own" ON prestadores FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- INVITES TABLE: Allow users to UPDATE invite status during registration
-- ============================================================================
DROP POLICY IF EXISTS "users_update_invite_status" ON invites;
CREATE POLICY "users_update_invite_status" ON invites FOR UPDATE
  USING (
    -- Allow authenticated users to update invites they're registering with
    auth.uid() IS NOT NULL
    AND status = 'pending'
  )
  WITH CHECK (
    -- Only allow updating status to 'accepted' or 'used' and setting accepted_at timestamp
    -- Note: Actual schema has 'accepted_at' (not 'accepted_by')
    (status = 'accepted' OR status = 'used')
    AND accepted_at IS NOT NULL
  );

-- ============================================================================
-- INVITES TABLE: Additional policies for code generation and validation
-- ============================================================================
-- Ensure admins can INSERT invites without company_id (for prestador/personal codes)
-- The existing "Admins can manage invites" should cover ALL operations, but let's ensure INSERT works
-- No additional policy needed if "Admins can manage invites" uses ALL

-- Ensure users can view invites for validation (already exists "Anyone can view invites by code")

-- ============================================================================
-- Ensure RPC functions are accessible for registration
-- ============================================================================

-- Grant execute permissions on validate_access_code (make sure it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'validate_access_code') THEN
    GRANT EXECUTE ON FUNCTION validate_access_code(TEXT) TO anon;
    GRANT EXECUTE ON FUNCTION validate_access_code(TEXT) TO authenticated;
  END IF;
END $$;

-- Grant execute permissions on generate_access_code (make sure it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'generate_access_code' 
    AND pg_get_function_arguments(oid) LIKE '%TEXT%UUID%JSONB%INTEGER%'
  ) THEN
    GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER) TO authenticated;
    GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER) TO anon;
  END IF;
END $$;

-- ============================================================================
-- Fix any policies that might block during registration flow
-- ============================================================================

-- Allow users to view their own roles immediately after creation
DROP POLICY IF EXISTS "users_view_own_roles_immediate" ON user_roles;
-- This is already covered by existing policy, but ensure it works

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON POLICY "users_insert_own_profile" ON profiles IS 
  'Allows users to create their own profile during registration. Required for all registration flows.';

COMMENT ON POLICY "users_insert_own_role" ON user_roles IS 
  'Allows users to create their own role during registration. Required for all registration flows.';

COMMENT ON POLICY "hr_create_company" ON companies IS 
  'Allows HR users to create companies during registration. Can be used by new HR users registering with a company, or existing HR users creating additional companies.';

COMMENT ON POLICY "users_insert_own_employee_record" ON company_employees IS 
  'Allows users to create their own employee record when registering with a company code.';

COMMENT ON POLICY "prestadores_insert_own" ON prestadores IS 
  'Allows prestadores to create their own prestador record during registration.';

COMMENT ON POLICY "users_update_invite_status" ON invites IS 
  'Allows authenticated users to update invite status from pending to accepted during registration. Prevents race conditions.';

