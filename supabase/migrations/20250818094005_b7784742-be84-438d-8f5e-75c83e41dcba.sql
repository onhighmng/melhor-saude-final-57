-- Reduce OTP expiry time to 3 minutes for better security
UPDATE auth.config 
SET email_otp_expire_in = 180; -- 3 minutes in seconds

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