-- Migration: Security & Authentication Tables
-- Date: 2025-11-01
-- Description: Creates critical security and authentication tables identified in comprehensive error audit
-- Related: SECURITY_IMPROVEMENTS.md - Phase 0

-- ============================================================================
-- 1. USER SESSIONS TABLE
-- Tracks active user sessions for security monitoring and session management
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_fingerprint TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Geolocation data for anomaly detection
  country TEXT,
  city TEXT,

  -- Session metadata
  login_method TEXT CHECK (login_method IN ('email', 'oauth', 'magic_link', 'sso')),

  -- Indexes
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

COMMENT ON TABLE user_sessions IS 'Tracks active user sessions for security and concurrent session management';
COMMENT ON COLUMN user_sessions.device_fingerprint IS 'Browser/device fingerprint for detecting suspicious activity';
COMMENT ON COLUMN user_sessions.ip_address IS 'IP address of the session for geographic anomaly detection';

-- ============================================================================
-- 2. PASSWORD RESET TOKENS TABLE
-- Manages password reset tokens with expiry and one-time use enforcement
-- ============================================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE, -- Store hash, not plaintext
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  used_at TIMESTAMPTZ,
  is_valid BOOLEAN NOT NULL DEFAULT TRUE,

  -- Security tracking
  ip_address INET,
  requested_by_email TEXT NOT NULL,

  CONSTRAINT valid_token_expiry CHECK (expires_at > created_at),
  CONSTRAINT used_if_invalid CHECK (
    (is_valid = FALSE AND used_at IS NOT NULL) OR is_valid = TRUE
  )
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_valid ON password_reset_tokens(user_id, is_valid) WHERE is_valid = TRUE;

COMMENT ON TABLE password_reset_tokens IS 'Manages password reset tokens with one-time use and expiry enforcement';
COMMENT ON COLUMN password_reset_tokens.token_hash IS 'SHA-256 hash of the reset token (never store plaintext)';

-- ============================================================================
-- 3. USER LOGIN ATTEMPTS TABLE
-- Tracks login attempts for brute force prevention and account lockout
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL,

  -- Security tracking
  ip_address INET NOT NULL,
  user_agent TEXT,
  failure_reason TEXT,

  -- Geolocation
  country TEXT,
  city TEXT,

  -- Lockout management
  triggered_lockout BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_login_attempts_email ON user_login_attempts(email, attempted_at DESC);
CREATE INDEX idx_login_attempts_user_id ON user_login_attempts(user_id, attempted_at DESC);
CREATE INDEX idx_login_attempts_ip ON user_login_attempts(ip_address, attempted_at DESC);
CREATE INDEX idx_login_attempts_failed ON user_login_attempts(email, success, attempted_at DESC) WHERE success = FALSE;

COMMENT ON TABLE user_login_attempts IS 'Tracks all login attempts for brute force detection and account lockout';
COMMENT ON COLUMN user_login_attempts.triggered_lockout IS 'TRUE if this attempt caused account lockout';

-- ============================================================================
-- 4. SECURITY LOGS TABLE
-- Centralized security event logging for audit and monitoring
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  -- Event details
  description TEXT NOT NULL,
  details JSONB,

  -- Security context
  ip_address INET,
  user_agent TEXT,
  endpoint TEXT,
  method TEXT,

  -- Response/resolution
  action_taken TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX idx_security_logs_user_id ON security_logs(user_id, created_at DESC);
CREATE INDEX idx_security_logs_event_type ON security_logs(event_type, created_at DESC);
CREATE INDEX idx_security_logs_severity ON security_logs(severity, created_at DESC) WHERE severity IN ('high', 'critical');
CREATE INDEX idx_security_logs_unresolved ON security_logs(severity, created_at DESC) WHERE resolved_at IS NULL AND severity IN ('high', 'critical');

COMMENT ON TABLE security_logs IS 'Centralized security event logging for audit, monitoring, and incident response';
COMMENT ON COLUMN security_logs.event_type IS 'Type of security event (e.g., failed_login, suspicious_activity, rate_limit_exceeded)';

-- ============================================================================
-- 5. API KEYS TABLE
-- Manages API keys for programmatic access with scoping and expiry
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

  -- Key details
  key_hash TEXT NOT NULL UNIQUE, -- Store hash, not plaintext
  key_prefix TEXT NOT NULL, -- First 8 chars for identification (e.g., "pk_live_")
  name TEXT NOT NULL,
  description TEXT,

  -- Access control
  scopes TEXT[] NOT NULL DEFAULT '{}', -- Array of allowed scopes/permissions
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Lifecycle
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,

  -- Rate limiting
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_hour INTEGER DEFAULT 1000,

  -- Usage tracking
  total_requests BIGINT DEFAULT 0,

  CONSTRAINT api_key_owner CHECK (
    (user_id IS NOT NULL AND company_id IS NULL) OR
    (user_id IS NULL AND company_id IS NOT NULL)
  ),
  CONSTRAINT valid_api_key_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_api_keys_company_id ON api_keys(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_api_keys_active ON api_keys(is_active, expires_at) WHERE is_active = TRUE;

COMMENT ON TABLE api_keys IS 'Manages API keys for programmatic access with rate limiting and scope control';
COMMENT ON COLUMN api_keys.key_hash IS 'SHA-256 hash of the API key (never store plaintext)';
COMMENT ON COLUMN api_keys.key_prefix IS 'First 8 characters of the key for user identification (e.g., "pk_live_12345678")';
COMMENT ON COLUMN api_keys.scopes IS 'Array of allowed permissions (e.g., ["read:bookings", "write:users"])';

-- ============================================================================
-- 6. ACCOUNT LOCKOUTS TABLE
-- Tracks account lockouts due to failed login attempts
-- ============================================================================

CREATE TABLE IF NOT EXISTS account_lockouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlock_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Lockout reason
  reason TEXT NOT NULL,
  failed_attempts_count INTEGER NOT NULL,

  -- Resolution
  unlocked_at TIMESTAMPTZ,
  unlocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  unlock_method TEXT CHECK (unlock_method IN ('automatic', 'admin', 'password_reset', 'support')),

  CONSTRAINT valid_unlock_time CHECK (unlock_at > locked_at)
);

CREATE INDEX idx_account_lockouts_user_id ON account_lockouts(user_id);
CREATE INDEX idx_account_lockouts_active ON account_lockouts(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_account_lockouts_email ON account_lockouts(email, is_active) WHERE is_active = TRUE;

COMMENT ON TABLE account_lockouts IS 'Tracks account lockouts and unlock history for security';
COMMENT ON COLUMN account_lockouts.reason IS 'Reason for lockout (e.g., "5 failed login attempts in 10 minutes")';

-- ============================================================================
-- 7. USER DEVICE FINGERPRINTS TABLE
-- Tracks known devices for anomaly detection
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_device_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint_hash TEXT NOT NULL,

  -- Device information
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  os TEXT,
  browser TEXT,

  -- Trust level
  is_trusted BOOLEAN NOT NULL DEFAULT FALSE,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  login_count INTEGER DEFAULT 1,

  -- Geolocation of first appearance
  first_seen_ip INET,
  first_seen_country TEXT,
  first_seen_city TEXT,

  CONSTRAINT unique_user_fingerprint UNIQUE (user_id, fingerprint_hash)
);

CREATE INDEX idx_device_fingerprints_user_id ON user_device_fingerprints(user_id);
CREATE INDEX idx_device_fingerprints_hash ON user_device_fingerprints(fingerprint_hash);
CREATE INDEX idx_device_fingerprints_trusted ON user_device_fingerprints(user_id, is_trusted) WHERE is_trusted = TRUE;

COMMENT ON TABLE user_device_fingerprints IS 'Tracks known devices for anomaly detection and trust scoring';
COMMENT ON COLUMN user_device_fingerprints.is_trusted IS 'TRUE if device has been used successfully multiple times';

-- ============================================================================
-- 8. TWO FACTOR AUTHENTICATION TABLE
-- Manages 2FA settings and backup codes
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_2fa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 2FA method
  method TEXT NOT NULL CHECK (method IN ('totp', 'sms', 'email', 'authenticator_app')),
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,

  -- TOTP settings (for authenticator apps)
  totp_secret_encrypted TEXT, -- Encrypt this!
  totp_verified_at TIMESTAMPTZ,

  -- Backup codes (hashed)
  backup_codes_hash TEXT[], -- Array of hashed backup codes

  -- Lifecycle
  enabled_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_2fa_settings_user_id ON user_2fa_settings(user_id);
CREATE INDEX idx_2fa_enabled ON user_2fa_settings(user_id, is_enabled) WHERE is_enabled = TRUE;

COMMENT ON TABLE user_2fa_settings IS 'Manages two-factor authentication settings and backup codes';
COMMENT ON COLUMN user_2fa_settings.totp_secret_encrypted IS 'TOTP secret key - MUST be encrypted at rest';
COMMENT ON COLUMN user_2fa_settings.backup_codes_hash IS 'Array of SHA-256 hashed backup codes (one-time use)';

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_2fa_settings_updated_at
    BEFORE UPDATE ON user_2fa_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_lockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_device_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa_settings ENABLE ROW LEVEL SECURITY;

-- user_sessions policies
CREATE POLICY "Users can view their own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can invalidate their own sessions"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON user_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- password_reset_tokens policies
-- No direct user access - managed by edge functions only

CREATE POLICY "Service role can manage password reset tokens"
  ON password_reset_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- user_login_attempts policies
CREATE POLICY "Admins can view all login attempts"
  ON user_login_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- security_logs policies
CREATE POLICY "Admins can view all security logs"
  ON security_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Service role can insert security logs"
  ON security_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- api_keys policies
CREATE POLICY "Users can view their own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys"
  ON api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() = created_by);

CREATE POLICY "Users can revoke their own API keys"
  ON api_keys FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all API keys"
  ON api_keys FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- account_lockouts policies
CREATE POLICY "Admins can view all account lockouts"
  ON account_lockouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Service role can manage account lockouts"
  ON account_lockouts FOR ALL
  USING (auth.role() = 'service_role');

-- user_device_fingerprints policies
CREATE POLICY "Users can view their own device fingerprints"
  ON user_device_fingerprints FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can trust/untrust their own devices"
  ON user_device_fingerprints FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_2fa_settings policies
CREATE POLICY "Users can view their own 2FA settings"
  ON user_2fa_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own 2FA settings"
  ON user_2fa_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM account_lockouts
    WHERE user_id = p_user_id
    AND is_active = TRUE
    AND NOW() < unlock_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get failed login attempts in last N minutes
CREATE OR REPLACE FUNCTION get_recent_failed_logins(p_email TEXT, p_minutes INTEGER DEFAULT 10)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM user_login_attempts
    WHERE email = p_email
    AND success = FALSE
    AND attempted_at > NOW() - (p_minutes || ' minutes')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM user_sessions
    WHERE expires_at < NOW()
    OR (is_active = FALSE AND last_activity_at < NOW() - INTERVAL '7 days')
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_expired_sessions IS 'Deletes expired sessions and inactive sessions older than 7 days. Returns count of deleted sessions. Should be run periodically (e.g., daily cron job).';

-- ============================================================================
-- DATA INTEGRITY CHECKS
-- ============================================================================

-- Ensure no active lockouts with past unlock times
CREATE OR REPLACE FUNCTION check_lockout_consistency()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = TRUE AND NEW.unlock_at < NOW() THEN
    NEW.is_active := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_lockout_consistency
  BEFORE INSERT OR UPDATE ON account_lockouts
  FOR EACH ROW
  EXECUTE FUNCTION check_lockout_consistency();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant service role full access (for edge functions)
GRANT ALL ON user_sessions TO service_role;
GRANT ALL ON password_reset_tokens TO service_role;
GRANT ALL ON user_login_attempts TO service_role;
GRANT ALL ON security_logs TO service_role;
GRANT ALL ON api_keys TO service_role;
GRANT ALL ON account_lockouts TO service_role;
GRANT ALL ON user_device_fingerprints TO service_role;
GRANT ALL ON user_2fa_settings TO service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Insert migration record
INSERT INTO admin_logs (action, admin_id, details, created_at)
VALUES (
  'migration_applied',
  NULL,
  jsonb_build_object(
    'migration', '20251101000000_create_security_auth_tables',
    'tables_created', ARRAY[
      'user_sessions',
      'password_reset_tokens',
      'user_login_attempts',
      'security_logs',
      'api_keys',
      'account_lockouts',
      'user_device_fingerprints',
      'user_2fa_settings'
    ],
    'status', 'success'
  ),
  NOW()
);
