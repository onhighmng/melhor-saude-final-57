-- ============================================
-- FIX SPECIALIST REGISTRATION
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Drop the old constraint that doesn't include 'specialist'
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_user_type_check;

-- Add new constraint that includes 'specialist'
ALTER TABLE invites ADD CONSTRAINT invites_user_type_check 
  CHECK (user_type IN ('personal', 'hr', 'user', 'prestador', 'specialist'));

-- Drop the old function first (required before recreating with different return type)
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB, INTEGER);

-- Recreate the generate_access_code function to support specialist type
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
BEGIN
  -- Validate user_type
  IF p_user_type NOT IN ('personal', 'hr', 'user', 'prestador', 'specialist') THEN
    RAISE EXCEPTION 'Invalid user_type: %', p_user_type;
  END IF;

  -- Generate unique code
  LOOP
    -- Generate code format: MS-XXXX (4 random alphanumeric chars)
    v_code := 'MS-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 4));
    
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
    NULL,
    CASE 
      WHEN p_user_type = 'personal' THEN 'user'
      WHEN p_user_type = 'hr' THEN 'hr'
      WHEN p_user_type = 'user' THEN 'user'
      WHEN p_user_type = 'prestador' THEN 'prestador'
      WHEN p_user_type = 'specialist' THEN 'especialista_geral'
      ELSE 'user'
    END,
    'pending',
    v_expires_at,
    p_metadata
  );
  
  RETURN QUERY SELECT v_code, v_expires_at;
END;
$$;

-- Drop the old validate_access_code function first
DROP FUNCTION IF EXISTS validate_access_code(TEXT);

-- Update the validate_access_code function to ensure it's consistent
CREATE OR REPLACE FUNCTION validate_access_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  user_type TEXT,
  company_id UUID,
  company_name TEXT,
  expires_at TIMESTAMPTZ,
  status TEXT,
  metadata JSONB
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
    i.company_id,
    c.company_name,
    i.expires_at,
    i.status,
    i.metadata
  FROM invites i
  LEFT JOIN companies c ON i.company_id = c.id
  WHERE i.invite_code = upper(p_code)
    AND i.status = 'pending'
    AND i.expires_at > NOW();
END;
$$;

-- Verify the fix worked
SELECT 
  'Constraint updated' as status,
  COUNT(*) as total_invites,
  COUNT(DISTINCT user_type) as user_types
FROM invites;

-- Show all user types that now support code generation
SELECT 'specialist' as supported_user_type UNION ALL
SELECT 'prestador' UNION ALL
SELECT 'hr' UNION ALL
SELECT 'user' UNION ALL
SELECT 'personal'
ORDER BY supported_user_type;
