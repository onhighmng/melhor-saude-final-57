-- ============================================================================
-- SPECIALIST ARCHITECTURE FIX
-- ============================================================================
-- Specialists are PLATFORM-WIDE, not company-specific
-- They serve ALL users across ALL companies
-- ============================================================================

-- ============================================================================
-- STEP 1: Update generate_access_code to PREVENT company_id for specialists
-- ============================================================================

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
  v_final_company_id UUID;
BEGIN
  -- Specialists and Prestadores are PLATFORM-WIDE - force company_id to NULL
  IF p_user_type IN ('specialist', 'prestador') THEN
    v_final_company_id := NULL;
  ELSE
    v_final_company_id := p_company_id;
  END IF;
  
  -- Generate unique code
  LOOP
    -- Generate code format: MS-XXXX (4 random alphanumeric chars)
    v_code := 'MS-' || upper(substring(md5(random()::text) from 1 for 4));
    
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
    v_final_company_id,  -- NULL for specialists and prestadores
    auth.uid(),
    NULL,
    CASE 
      WHEN p_user_type = 'personal' THEN 'user'
      WHEN p_user_type = 'hr' THEN 'hr'
      WHEN p_user_type = 'user' THEN 'user'
      WHEN p_user_type = 'prestador' THEN 'prestador'
      WHEN p_user_type = 'specialist' THEN 'especialista_geral'
    END,
    'pending',
    v_expires_at,
    p_metadata
  );
  
  -- Return the generated code and expiry
  RETURN QUERY SELECT v_code, v_expires_at;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER) TO authenticated;

-- ============================================================================
-- STEP 2: Clear any existing specialist invites with company_id
-- ============================================================================

-- Update any pending specialist invites to remove company_id
UPDATE invites
SET company_id = NULL
WHERE role = 'especialista_geral'
  AND company_id IS NOT NULL
  AND status = 'pending';

-- ============================================================================
-- STEP 3: Clear any specialist_assignments created by mistake
-- ============================================================================

-- Remove any specialist_assignments that were auto-created during registration
-- (Keep only manually assigned ones by admins if they exist)
DELETE FROM specialist_assignments
WHERE specialist_id IN (
  SELECT user_id 
  FROM user_roles 
  WHERE role = 'especialista_geral'
)
AND assigned_by IS NULL;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- 1. Check that all specialist invites have NULL company_id
SELECT 
  invite_code,
  role,
  company_id,
  status,
  created_at
FROM invites
WHERE role = 'especialista_geral'
ORDER BY created_at DESC;

-- Expected: ALL company_id values should be NULL

-- 2. Check that all prestador invites have NULL company_id
SELECT 
  invite_code,
  role,
  company_id,
  status,
  created_at
FROM invites
WHERE role = 'prestador'
ORDER BY created_at DESC;

-- Expected: ALL company_id values should be NULL

-- 3. Verify specialists are in prestadores table (not specialist_assignments)
SELECT 
  p.user_id,
  p.specialty,
  p.is_active,
  pr.role as profile_role,
  STRING_AGG(ur.role, ', ') as user_roles
FROM prestadores p
JOIN profiles pr ON pr.id = p.user_id
JOIN user_roles ur ON ur.user_id = p.user_id
WHERE ur.role = 'especialista_geral'
GROUP BY p.user_id, p.specialty, p.is_active, pr.role;

-- Expected: All specialists should be in prestadores table with specialty = 'Especialista Geral'

-- ============================================================================
-- ARCHITECTURE SUMMARY
-- ============================================================================

SELECT '
✅ CORRECTED ARCHITECTURE:

┌─────────────────────────────────────────────────────────────┐
│ USER TYPE    │ SCOPE          │ company_id │ TABLE          │
├─────────────────────────────────────────────────────────────┤
│ HR           │ Company        │ ✅ YES      │ companies      │
│ Employee     │ Company        │ ✅ YES      │ company_emp    │
│ Prestador    │ Platform-wide  │ ❌ NO       │ prestadores    │
│ Specialist   │ Platform-wide  │ ❌ NO       │ prestadores    │
└─────────────────────────────────────────────────────────────┘

KEY POINTS:
- Specialists serve ALL users across ALL companies
- Prestadores are independent affiliates (platform-wide)
- specialist_assignments is for MANUAL admin assignments only
- Auto-registration codes NEVER create company assignments

TABLES:
- prestadores: Contains BOTH prestadores AND specialists
- specialist_assignments: Only for manual admin assignments (optional)
' as architecture_fixed;

-- ============================================================================
-- TEST THE FIX
-- ============================================================================

-- Generate a specialist code (should have company_id = NULL)
SELECT * FROM generate_access_code('specialist', NULL, '{}'::jsonb, 30);

-- Generate a prestador code (should have company_id = NULL)
SELECT * FROM generate_access_code('prestador', NULL, '{}'::jsonb, 30);

-- Try to generate with company_id - should be ignored for specialist
SELECT * FROM generate_access_code('specialist', '00000000-0000-0000-0000-000000000000'::UUID, '{}'::jsonb, 30);
-- Should still return company_id = NULL in invites table

-- ============================================================================
-- SUCCESS!
-- ============================================================================



