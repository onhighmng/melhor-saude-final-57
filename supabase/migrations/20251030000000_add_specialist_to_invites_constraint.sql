-- =====================================================
-- Add 'especialista_geral' support to invites table
-- =====================================================
-- This migration updates the role constraint to support specialist accounts

-- 1. Drop old role constraint if exists
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_role_check;

-- 2. Add new constraint including 'especialista_geral'
ALTER TABLE invites ADD CONSTRAINT invites_role_check 
  CHECK (role IN ('user', 'hr', 'prestador', 'especialista_geral'));

-- 3. Drop and recreate generate_access_code function with correct schema
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB, INTEGER);

CREATE OR REPLACE FUNCTION generate_access_code(
  p_user_type TEXT,
  p_company_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_expires_days INTEGER DEFAULT 30
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
  
  -- Calculate expiration
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
  
  -- Insert into invites table with correct column names
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

-- 4. Drop and recreate validate_access_code function with correct schema
DROP FUNCTION IF EXISTS validate_access_code(TEXT);

CREATE OR REPLACE FUNCTION validate_access_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  role TEXT,
  company_id UUID,
  metadata JSONB,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.role,
    i.company_id,
    i.metadata,
    (i.status = 'pending' AND i.expires_at > now()) as is_valid
  FROM invites i
  WHERE i.invite_code = p_code;
END;
$$;
