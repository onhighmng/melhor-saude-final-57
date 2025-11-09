-- Fix generate_access_code function to work with Supabase RPC
-- Issue: Function signature mismatch and TABLE return type incompatibility
-- Solution: Update parameter order and change to JSONB return type

-- Drop old function with TABLE return type
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB, INTEGER);

-- Create new function with JSONB return type and corrected parameter order
CREATE OR REPLACE FUNCTION generate_access_code(
  p_company_id UUID DEFAULT NULL,
  p_expires_days INTEGER DEFAULT 30,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_user_type TEXT DEFAULT 'user'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMPTZ;
  v_code_exists BOOLEAN;
  v_invite_id UUID;
  v_prefix TEXT;
BEGIN
  -- Validate user_type
  IF p_user_type NOT IN ('personal', 'hr', 'user', 'prestador', 'specialist') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid user_type. Must be: personal, hr, user, prestador, or specialist'
    );
  END IF;

  -- Determine code prefix based on user type
  v_prefix := CASE p_user_type
    WHEN 'hr' THEN 'HR'
    WHEN 'prestador' THEN 'PR'
    WHEN 'personal' THEN 'PS'
    WHEN 'specialist' THEN 'SP'
    ELSE 'US'
  END;

  -- Generate unique code
  LOOP
    -- Generate code format: PREFIX-TIMESTAMP-RANDOM
    v_code := v_prefix || '-' ||
              FLOOR(EXTRACT(EPOCH FROM NOW()))::TEXT || '-' ||
              upper(substring(md5(random()::text) from 1 for 4));

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
  )
  RETURNING id INTO v_invite_id;

  -- Return success response with code details
  RETURN jsonb_build_object(
    'success', true,
    'invite_code', v_code,
    'invite_id', v_invite_id,
    'expires_at', v_expires_at,
    'user_type', p_user_type
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION generate_access_code(UUID, INTEGER, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_access_code(UUID, INTEGER, JSONB, TEXT) TO anon;

-- Create backward-compatible TABLE-returning variant for any legacy code
CREATE OR REPLACE FUNCTION generate_access_code_table(
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
  v_result JSONB;
BEGIN
  -- Call the main JSONB function with reordered parameters
  v_result := generate_access_code(p_company_id, p_expires_days, p_metadata, p_user_type);

  -- Return as table format
  RETURN QUERY SELECT
    (v_result->>'invite_code')::TEXT,
    (v_result->>'expires_at')::TIMESTAMPTZ;
END;
$$;

-- Grant execute permission for backward-compatible function
GRANT EXECUTE ON FUNCTION generate_access_code_table(TEXT, UUID, JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_access_code_table(TEXT, UUID, JSONB, INTEGER) TO anon;

-- Add helpful comment
COMMENT ON FUNCTION generate_access_code(UUID, INTEGER, JSONB, TEXT) IS
'Generates a unique access code for user registration. Returns JSONB with success status, invite_code, invite_id, and expires_at. Use this version for all new code.';

COMMENT ON FUNCTION generate_access_code_table(TEXT, UUID, JSONB, INTEGER) IS
'Backward-compatible TABLE-returning wrapper for generate_access_code. Deprecated - use generate_access_code() instead.';
