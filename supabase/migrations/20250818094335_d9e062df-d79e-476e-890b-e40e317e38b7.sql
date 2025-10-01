-- Add function to validate passwords against known compromised passwords
CREATE OR REPLACE FUNCTION validate_password_strength(password_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{"valid": true, "issues": []}'::JSONB;
  issues TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check minimum length
  IF LENGTH(password_text) < 8 THEN
    issues := array_append(issues, 'Password must be at least 8 characters long');
  END IF;
  
  -- Check for uppercase letter
  IF password_text !~ '[A-Z]' THEN
    issues := array_append(issues, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for lowercase letter
  IF password_text !~ '[a-z]' THEN
    issues := array_append(issues, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for number
  IF password_text !~ '[0-9]' THEN
    issues := array_append(issues, 'Password must contain at least one number');
  END IF;
  
  -- Check for special character
  IF password_text !~ '[^A-Za-z0-9]' THEN
    issues := array_append(issues, 'Password must contain at least one special character');
  END IF;
  
  -- Check against common weak passwords
  IF LOWER(password_text) = ANY(ARRAY[
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ]) THEN
    issues := array_append(issues, 'Password is too common and easily guessed');
  END IF;
  
  -- Build result
  IF array_length(issues, 1) > 0 THEN
    result := jsonb_build_object(
      'valid', false,
      'issues', to_jsonb(issues)
    );
  ELSE
    result := jsonb_build_object(
      'valid', true,
      'issues', '[]'::jsonb
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Add backend session consumption guard
CREATE OR REPLACE FUNCTION use_session_with_validation(
  p_user_id uuid, 
  p_allocation_type text DEFAULT 'company'::text, 
  p_session_type text DEFAULT 'individual'::text, 
  p_session_date timestamp with time zone DEFAULT now(), 
  p_prestador_id uuid DEFAULT NULL::uuid, 
  p_notes text DEFAULT NULL::text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_allocation_id UUID;
  v_usage_id UUID;
  v_available_sessions INTEGER;
BEGIN
  -- Check if user has available sessions before attempting to use
  SELECT COALESCE(SUM(sessions_allocated - sessions_used), 0) INTO v_available_sessions
  FROM session_allocations
  WHERE user_id = p_user_id 
    AND allocation_type = p_allocation_type
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());

  -- Prevent session consumption with zero balance
  IF v_available_sessions <= 0 THEN
    RAISE EXCEPTION 'Insufficient session balance. Available: %, Required: 1', v_available_sessions;
  END IF;

  -- Find an active allocation with available sessions
  SELECT id INTO v_allocation_id
  FROM session_allocations
  WHERE user_id = p_user_id 
    AND allocation_type = p_allocation_type
    AND is_active = true
    AND sessions_used < sessions_allocated
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_allocation_id IS NULL THEN
    RAISE EXCEPTION 'No available sessions for allocation type: %', p_allocation_type;
  END IF;

  -- Update the allocation to mark one session as used
  UPDATE session_allocations 
  SET sessions_used = sessions_used + 1,
      updated_at = now()
  WHERE id = v_allocation_id;

  -- Create usage record
  INSERT INTO session_usage (
    user_id, 
    session_allocation_id, 
    prestador_id,
    session_type, 
    session_date, 
    notes
  ) VALUES (
    p_user_id, 
    v_allocation_id, 
    p_prestador_id,
    p_session_type, 
    p_session_date, 
    p_notes
  ) RETURNING id INTO v_usage_id;

  RETURN v_usage_id;
END;
$$;