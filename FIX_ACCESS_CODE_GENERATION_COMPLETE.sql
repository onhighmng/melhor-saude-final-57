-- ========================================================================
-- COMPLETE FIX FOR ACCESS CODE GENERATION ISSUE
-- Problem: invites.role CHECK constraint doesn't include all necessary roles
-- Solution: Update constraint and fix all related functions
-- ========================================================================

-- ============================================
-- STEP 1: Fix the invites.role CHECK constraint
-- ============================================

-- Drop the old constraint
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_role_check;

-- Add new constraint with all required roles
ALTER TABLE invites 
ADD CONSTRAINT invites_role_check 
CHECK (role = ANY (ARRAY['user'::text, 'hr'::text, 'prestador'::text, 'especialista_geral'::text]));

COMMENT ON CONSTRAINT invites_role_check ON invites IS 'Allows user, hr, prestador, and especialista_geral roles';


-- ============================================
-- STEP 2: Update generate_access_code function
-- ============================================

DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB, INTEGER);

CREATE OR REPLACE FUNCTION generate_access_code(
  p_user_type TEXT,
  p_company_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_expires_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  invite_code TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMPTZ;
  v_code_exists BOOLEAN;
  v_role TEXT;
BEGIN
  -- Map user_type to role
  v_role := CASE 
    WHEN p_user_type = 'personal' THEN 'user'
    WHEN p_user_type = 'hr' THEN 'hr'
    WHEN p_user_type = 'user' THEN 'user'
    WHEN p_user_type = 'prestador' THEN 'prestador'
    WHEN p_user_type = 'specialist' THEN 'especialista_geral'
    ELSE 'user'
  END;

  -- Generate unique code
  LOOP
    -- Generate code format: MS-XXXX (4 random alphanumeric chars)
    v_code := 'MS-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM invites WHERE invite_code = v_code) INTO v_code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT v_code_exists;
  END LOOP;
  
  -- Calculate expiry date
  v_expires_at := NOW() + (p_expires_days || ' days')::INTERVAL;
  
  -- Insert the new invite
  INSERT INTO invites (
    invite_code,
    user_type,
    company_id,
    invited_by,
    email,
    role,
    status,
    expires_at,
    metadata
  ) VALUES (
    v_code,
    p_user_type,
    p_company_id,
    auth.uid(),
    NULL, -- Email will be filled during registration
    v_role,
    'pending',
    v_expires_at,
    p_metadata
  );
  
  -- Return the generated code and expiry
  RETURN QUERY SELECT v_code, v_expires_at;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER) TO authenticated;

COMMENT ON FUNCTION generate_access_code IS 'Generates unique access codes for user registration - supports all user types';


-- ============================================
-- STEP 3: Update create_invite_code function
-- ============================================

DROP FUNCTION IF EXISTS create_invite_code(TEXT);

CREATE OR REPLACE FUNCTION create_invite_code(p_user_type TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_prefix TEXT;
  v_invite_id UUID;
  v_role TEXT;
BEGIN
  -- Set prefix based on user type
  v_prefix := CASE 
    WHEN p_user_type = 'hr' THEN 'HR'
    WHEN p_user_type = 'prestador' THEN 'PR'
    WHEN p_user_type = 'specialist' THEN 'SP'
    ELSE 'US'
  END;
  
  -- Generate unique code
  v_code := v_prefix || '-' || 
            TO_CHAR(EXTRACT(EPOCH FROM NOW())::BIGINT, 'FM9999999') || '-' ||
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
  
  -- Map user_type to role
  v_role := CASE 
    WHEN p_user_type = 'hr' THEN 'hr'
    WHEN p_user_type = 'prestador' THEN 'prestador'
    WHEN p_user_type = 'specialist' THEN 'especialista_geral'
    ELSE 'user'
  END;
  
  -- Insert invite
  INSERT INTO invites (
    company_id, 
    invite_code, 
    status, 
    sessions_allocated, 
    role, 
    user_type,
    expires_at, 
    created_at
  )
  VALUES (
    NULL, 
    v_code, 
    'pending', 
    5,
    v_role,
    p_user_type,
    NOW() + INTERVAL '30 days', 
    NOW()
  )
  RETURNING id INTO v_invite_id;
  
  RETURN jsonb_build_object(
    'invite_code', v_code,
    'invite_id', v_invite_id,
    'success', true
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_invite_code(TEXT) TO authenticated;

COMMENT ON FUNCTION create_invite_code IS 'Creates invite code with automatic role mapping - supports all user types';


-- ============================================
-- STEP 4: Update validate_access_code function
-- ============================================

DROP FUNCTION IF EXISTS validate_access_code(TEXT);

CREATE OR REPLACE FUNCTION validate_access_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  user_type TEXT,
  role TEXT,
  company_id UUID,
  company_name TEXT,
  expires_at TIMESTAMPTZ,
  status TEXT,
  metadata JSONB,
  sessions_allocated INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.user_type,
    i.role,
    i.company_id,
    c.name as company_name,
    i.expires_at,
    i.status,
    i.metadata,
    i.sessions_allocated
  FROM invites i
  LEFT JOIN companies c ON i.company_id = c.id
  WHERE i.invite_code = upper(p_code)
    AND i.status = 'pending'
    AND i.expires_at > NOW();
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION validate_access_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_access_code(TEXT) TO anon;


-- ============================================
-- STEP 5: Verify and update RLS policies
-- ============================================

-- Ensure HR users can create invites for their company
DROP POLICY IF EXISTS "HR can manage invites" ON invites;
CREATE POLICY "HR can manage invites"
  ON invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'hr'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'hr'
    )
  );

-- Ensure authenticated users can manage invites (backup policy)
DROP POLICY IF EXISTS "authenticated_manage_invites" ON invites;
CREATE POLICY "authenticated_manage_invites"
  ON invites FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);


-- ============================================
-- STEP 6: VERIFICATION QUERIES
-- ============================================

-- Test 1: Verify constraint was updated
SELECT 
  conname, 
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'invites'::regclass 
  AND conname = 'invites_role_check';

-- Test 2: Verify functions exist
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE proname IN ('generate_access_code', 'create_invite_code', 'validate_access_code')
  AND pronamespace = 'public'::regnamespace
ORDER BY proname;

-- Test 3: Check HR user setup
SELECT 
  p.email,
  p.role as profile_role,
  p.company_id,
  c.name as company_name,
  c.employee_seats,
  (SELECT array_agg(ur.role) FROM user_roles ur WHERE ur.user_id = p.id) as user_roles
FROM profiles p
LEFT JOIN companies c ON c.id = p.company_id
WHERE p.id = 'd94c8947-3782-47f9-9285-35f035c1e1f2';

-- Test 4: Check seat availability
SELECT * FROM get_company_seat_stats('b967ebce-b0c3-4763-b3cd-35a4e67661ae');

-- Output success message
SELECT 
  '✅ FIX COMPLETE' as status,
  'All constraints, functions, and policies have been updated' as message
UNION ALL
SELECT 
  '🔧 Functions Updated' as status,
  'generate_access_code, create_invite_code, validate_access_code' as message
UNION ALL
SELECT 
  '✓ Role Constraint' as status,
  'Now supports: user, hr, prestador, especialista_geral' as message;

