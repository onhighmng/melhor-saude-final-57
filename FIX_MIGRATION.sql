-- Fix the generate_access_code function to resolve ambiguous column reference

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
  -- Determine role based on user type
  v_role := CASE 
    WHEN p_user_type = 'personal' THEN 'user'
    WHEN p_user_type = 'hr' THEN 'hr'
    WHEN p_user_type = 'user' THEN 'user'
    WHEN p_user_type = 'prestador' THEN 'prestador'
    ELSE 'user'
  END;

  -- Generate unique code
  LOOP
    v_code := 'MS-' || upper(substring(md5(random()::text) from 1 for 4));
    
    -- Check if code already exists in invites table
    SELECT EXISTS(SELECT 1 FROM invites WHERE invites.invite_code = v_code) INTO v_code_exists;
    
    EXIT WHEN NOT v_code_exists;
  END LOOP;
  
  -- Calculate expiry date
  v_expires_at := NOW() + (p_expires_days || ' days')::INTERVAL;
  
  -- Insert the new invite (using table alias to avoid ambiguity)
  INSERT INTO invites (
    invites.invite_code,
    invites.user_type,
    invites.company_id,
    invites.invited_by,
    invites.email,
    invites.role,
    invites.status,
    invites.expires_at,
    invites.metadata
  ) VALUES (
    v_code,
    p_user_type,
    p_company_id,
    auth.uid(),
    NULL,
    v_role,
    'pending',
    v_expires_at,
    p_metadata
  );
  
  -- Return the generated code and expiry
  RETURN QUERY SELECT v_code, v_expires_at;
END;
$$;

-- Re-grant permissions
GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER) TO authenticated;
