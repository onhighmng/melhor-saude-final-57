-- Create provider_change_requests table
CREATE TABLE IF NOT EXISTS provider_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_prestador_id UUID REFERENCES prestadores(id),
  pillar TEXT NOT NULL,
  reason TEXT,
  preferences TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_provider_change_requests_user ON provider_change_requests(user_id);
CREATE INDEX idx_provider_change_requests_status ON provider_change_requests(status);
CREATE INDEX idx_provider_change_requests_created ON provider_change_requests(created_at DESC);

-- RLS Policies for provider_change_requests
ALTER TABLE provider_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own change requests"
  ON provider_change_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own change requests"
  ON provider_change_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all change requests"
  ON provider_change_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update change requests"
  ON provider_change_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create employee_invites table
CREATE TABLE IF NOT EXISTS employee_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  email TEXT,
  is_used BOOLEAN DEFAULT false,
  used_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

CREATE INDEX idx_employee_invites_code ON employee_invites(invite_code);
CREATE INDEX idx_employee_invites_company ON employee_invites(company_id);
CREATE INDEX idx_employee_invites_email ON employee_invites(email) WHERE email IS NOT NULL;
CREATE INDEX idx_employee_invites_expires ON employee_invites(expires_at);

-- RLS Policies for employee_invites
ALTER TABLE employee_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can view company invites"
  ON employee_invites FOR SELECT
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

CREATE POLICY "Company admins can create invites"
  ON employee_invites FOR INSERT
  WITH CHECK (
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

CREATE POLICY "Admins can manage all invites"
  ON employee_invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create RPC function to check invite code validity
CREATE OR REPLACE FUNCTION check_invite_code(code TEXT)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  email TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ei.id,
    ei.company_id,
    ei.email,
    ei.expires_at
  FROM employee_invites ei
  WHERE ei.invite_code = code
    AND ei.is_used = false
    AND ei.expires_at > NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION check_invite_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_invite_code(TEXT) TO anon;

-- Create RPC function to mark invite as used
CREATE OR REPLACE FUNCTION mark_invite_used(
  code TEXT,
  user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  UPDATE employee_invites
  SET is_used = true,
      used_at = NOW(),
      used_by = user_id
  WHERE invite_code = code
    AND is_used = false
    AND expires_at > NOW()
  RETURNING company_id INTO v_company_id;
  
  RETURN v_company_id;
END;
$$;

GRANT EXECUTE ON FUNCTION mark_invite_used(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_invite_used(TEXT, UUID) TO anon;

