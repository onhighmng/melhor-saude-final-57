-- Phase 1: Auth & Identity Tables
-- Authentication tokens, terms acceptance, and audit logging

-- 1. Email Verification Tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  verification_ip INET,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  
  CONSTRAINT expires_after_created CHECK (expires_at > created_at),
  CONSTRAINT verified_after_created CHECK (verified_at IS NULL OR verified_at >= created_at)
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token_hash ON email_verification_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- RLS for email_verification_tokens
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS email_verification_tokens_user_own
  ON email_verification_tokens
  FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY IF NOT EXISTS email_verification_tokens_admin_all
  ON email_verification_tokens
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 2. Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  ip_address INET,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  
  CONSTRAINT expires_after_created CHECK (expires_at > created_at),
  CONSTRAINT used_after_created CHECK (used_at IS NULL OR used_at >= created_at)
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- RLS for password_reset_tokens
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS password_reset_tokens_user_own
  ON password_reset_tokens
  FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY IF NOT EXISTS password_reset_tokens_admin_all
  ON password_reset_tokens
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 3. Terms Acceptance
CREATE TABLE IF NOT EXISTS terms_acceptance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  terms_version TEXT NOT NULL,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  accepted_at TIMESTAMPTZ,
  privacy_version TEXT,
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  privacy_accepted_at TIMESTAMPTZ,
  professional_standards_accepted BOOLEAN NOT NULL DEFAULT false,
  professional_standards_version TEXT,
  professional_standards_accepted_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT accepted_timestamp_valid CHECK (
    (terms_accepted = false AND accepted_at IS NULL) OR 
    (terms_accepted = true AND accepted_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_terms_acceptance_user_id ON terms_acceptance(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_acceptance_created_at ON terms_acceptance(created_at);

-- RLS for terms_acceptance
ALTER TABLE terms_acceptance ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS terms_acceptance_user_own
  ON terms_acceptance
  FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY IF NOT EXISTS terms_acceptance_user_insert_own
  ON terms_acceptance
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS terms_acceptance_user_update_own
  ON terms_acceptance
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- RLS for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS audit_logs_admin_only
  ON audit_logs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY IF NOT EXISTS audit_logs_user_own_limited
  ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON email_verification_tokens TO authenticated;
GRANT SELECT ON password_reset_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE ON terms_acceptance TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT ALL ON audit_logs TO authenticated;

