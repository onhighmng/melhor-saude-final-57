-- Add user_type column to invites table for code-based registration system
-- This allows admin to generate codes for different user types: personal, hr, user, prestador, specialist

-- Add user_type column
ALTER TABLE invites ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'user' 
  CHECK (user_type IN ('personal', 'hr', 'user', 'prestador', 'specialist'));

-- Add metadata column for additional code information
ALTER TABLE invites ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update existing invites to have user_type based on role
UPDATE invites SET user_type = CASE 
  WHEN role = 'hr' THEN 'hr'
  WHEN role = 'prestador' THEN 'prestador'
  WHEN role = 'especialista_geral' THEN 'specialist'
  ELSE 'user'
END WHERE user_type IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invites_user_type ON invites(user_type);
CREATE INDEX IF NOT EXISTS idx_invites_created_at ON invites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invites_status_user_type ON invites(status, user_type);

-- Create RPC function for secure code generation
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
  );
  
  -- Return the generated code and expiry
  RETURN QUERY SELECT v_code, v_expires_at;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER) TO authenticated;

-- Create RPC function to validate access code
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
    c.name as company_name,
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

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION validate_access_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_access_code(TEXT) TO anon;

-- Update RLS policies to allow admin to create all code types
DROP POLICY IF EXISTS "Admins can manage all invites" ON invites;
CREATE POLICY "Admins can manage all invites"
  ON invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow authenticated users to validate codes (for registration)
CREATE POLICY "Anyone can validate pending invites"
  ON invites FOR SELECT
  USING (status = 'pending' AND expires_at > NOW());

-- Update existing policy for company admins to include user_type
DROP POLICY IF EXISTS "Company admins can view company invites" ON invites;
CREATE POLICY "Company admins can view company invites"
  ON invites FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_employees
      WHERE user_id = auth.uid()
      AND role = 'hr'
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
