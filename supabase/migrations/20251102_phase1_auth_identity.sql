-- Phase 1: Auth & Identity Tables
-- Purpose: Email verification, password reset, terms acceptance, audit logging
-- Date: November 2, 2025

-- ============================================================================
-- 1. EMAIL VERIFICATION TOKENS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT token_length CHECK (length(token) >= 32)
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON public.email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON public.email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON public.email_verification_tokens(expires_at);

ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_tokens"
  ON public.email_verification_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "admin_view_all_tokens"
  ON public.email_verification_tokens FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- 2. PASSWORD RESET TOKENS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT token_length CHECK (length(token) >= 32)
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_tokens"
  ON public.password_reset_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. TERMS ACCEPTANCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.terms_acceptance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version TEXT NOT NULL,
  dpa_accepted BOOLEAN DEFAULT false,
  privacy_accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_terms_acceptance_user_id ON public.terms_acceptance(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_acceptance_accepted_at ON public.terms_acceptance(accepted_at DESC);

ALTER TABLE public.terms_acceptance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_acceptance"
  ON public.terms_acceptance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "admin_view_all"
  ON public.terms_acceptance FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- 4. AUDIT LOGS (Standardized)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'pending')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON public.audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_view_all"
  ON public.audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "users_insert_own_logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT ON public.email_verification_tokens TO authenticated;
GRANT SELECT, INSERT ON public.password_reset_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.terms_acceptance TO authenticated;
GRANT INSERT ON public.audit_logs TO authenticated, service_role;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.email_verification_tokens IS 'Temporary tokens for email verification during signup';
COMMENT ON TABLE public.password_reset_tokens IS 'Temporary tokens for password reset flow';
COMMENT ON TABLE public.terms_acceptance IS 'Track user acceptance of terms, privacy, and DPA';
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit trail for all system actions';

DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Phase 1 auth/identity tables created';
END
$$;
