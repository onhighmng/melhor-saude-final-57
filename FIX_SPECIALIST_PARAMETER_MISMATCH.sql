-- Fix parameter name mismatch in generate_access_code function
-- The frontend calls it with p_expires_days but function has p_validity_days

DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB, INTEGER);

CREATE OR REPLACE FUNCTION generate_access_code(
  p_user_type TEXT,
  p_company_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_expires_days INTEGER DEFAULT 30  -- Changed from p_validity_days to match frontend
)
RETURNS TABLE (
  code TEXT,
  expires_at TIMESTAMPTZ,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMPTZ;
  v_role TEXT;
BEGIN
  -- Generate random 8-character code
  v_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
  
  -- Calculate expiration (using p_expires_days now)
  v_expires_at := now() + (p_expires_days || ' days')::interval;
  
  -- Map user_type to role
  CASE p_user_type
    WHEN 'company' THEN v_role := 'hr';
    WHEN 'hr' THEN v_role := 'hr';
    WHEN 'employee' THEN v_role := 'user';
    WHEN 'prestador' THEN v_role := 'prestador';
    WHEN 'specialist' THEN v_role := 'especialista_geral';
    WHEN 'especialista' THEN v_role := 'especialista_geral';
    ELSE 
      RAISE EXCEPTION 'Tipo de utilizador inválido: %. Tipos válidos: company, hr, employee, prestador, specialist', p_user_type;
  END CASE;
  
  -- Insert into invites table
  INSERT INTO invites (
    invite_code,
    role,
    company_id,
    metadata,
    expires_at,
    status,
    created_at
  ) VALUES (
    v_code,
    v_role,
    p_company_id,
    p_metadata,
    v_expires_at,
    'pending',
    now()
  );
  
  -- Return the code
  RETURN QUERY SELECT v_code, v_expires_at, v_role;
END;
$$;

-- Test it
DO $$
DECLARE
  v_result RECORD;
BEGIN
  SELECT * INTO v_result FROM generate_access_code('specialist', NULL, '{}'::jsonb, 30);
  
  IF v_result.code IS NOT NULL THEN
    RAISE NOTICE '✓ Function fixed! Test code: %', v_result.code;
    -- Clean up
    DELETE FROM invites WHERE invite_code = v_result.code;
  END IF;
END $$;

