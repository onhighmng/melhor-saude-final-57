-- Phase 4: Compliance & Analytics
-- GDPR compliance, retention policies, analytics, and audit trails

-- 1. Company DPA Acceptance
CREATE TABLE IF NOT EXISTS company_dpa_acceptance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  dpa_version TEXT NOT NULL,
  accepted BOOLEAN NOT NULL DEFAULT false,
  accepted_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  signed_document_url TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_dpa_acceptance_company_id ON company_dpa_acceptance(company_id);
CREATE INDEX IF NOT EXISTS idx_company_dpa_acceptance_accepted_at ON company_dpa_acceptance(accepted_at);

-- RLS for company_dpa_acceptance
ALTER TABLE company_dpa_acceptance ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS company_dpa_acceptance_company_users
  ON company_dpa_acceptance
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_employees WHERE user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY IF NOT EXISTS company_dpa_acceptance_admin_all
  ON company_dpa_acceptance
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 2. Data Retention Policies
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user_data', 'chat_messages', 'booking_data', 'communication_logs', 'audit_logs')),
  retention_days INT NOT NULL CHECK (retention_days > 0),
  auto_delete BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_retention_policies_entity_type ON data_retention_policies(entity_type);

-- RLS for data_retention_policies
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS data_retention_policies_public_read
  ON data_retention_policies
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY IF NOT EXISTS data_retention_policies_admin_all
  ON data_retention_policies
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 3. Monthly Analytics
CREATE TABLE IF NOT EXISTS monthly_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_start DATE NOT NULL UNIQUE,
  total_users INT DEFAULT 0,
  total_specialists INT DEFAULT 0,
  total_companies INT DEFAULT 0,
  total_bookings INT DEFAULT 0,
  completed_bookings INT DEFAULT 0,
  cancelled_bookings INT DEFAULT 0,
  no_show_bookings INT DEFAULT 0,
  total_chat_sessions INT DEFAULT 0,
  average_booking_rating DECIMAL(3,2),
  average_satisfaction_score DECIMAL(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_monthly_analytics_month_start ON monthly_analytics(month_start);

-- RLS for monthly_analytics
ALTER TABLE monthly_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS monthly_analytics_admin_only
  ON monthly_analytics
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 4. Pillar Analytics
CREATE TABLE IF NOT EXISTS pillar_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar TEXT NOT NULL CHECK (pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')),
  date DATE NOT NULL,
  chats INT DEFAULT 0,
  chat_resolutions INT DEFAULT 0,
  bookings INT DEFAULT 0,
  completed_bookings INT DEFAULT 0,
  satisfaction_score DECIMAL(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_pillar_date UNIQUE (pillar, date)
);

CREATE INDEX IF NOT EXISTS idx_pillar_analytics_pillar ON pillar_analytics(pillar);
CREATE INDEX IF NOT EXISTS idx_pillar_analytics_date ON pillar_analytics(date DESC);

-- RLS for pillar_analytics
ALTER TABLE pillar_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS pillar_analytics_admin_only
  ON pillar_analytics
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 5. User Activity Logs
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON user_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);

-- RLS for user_activity_logs
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS user_activity_logs_user_own
  ON user_activity_logs
  FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY IF NOT EXISTS user_activity_logs_admin_all
  ON user_activity_logs
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 6. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  setting_type TEXT NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- RLS for system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS system_settings_public_read
  ON system_settings
  FOR SELECT
  USING (true);
CREATE POLICY IF NOT EXISTS system_settings_admin_all
  ON system_settings
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 7. Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INT DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);

-- RLS for feature_flags
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS feature_flags_public_read
  ON feature_flags
  FOR SELECT
  USING (true);
CREATE POLICY IF NOT EXISTS feature_flags_admin_all
  ON feature_flags
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON company_dpa_acceptance TO authenticated;
GRANT SELECT ON data_retention_policies TO authenticated;
GRANT SELECT ON monthly_analytics TO authenticated;
GRANT SELECT ON pillar_analytics TO authenticated;
GRANT INSERT, SELECT ON user_activity_logs TO authenticated;
GRANT SELECT ON system_settings TO authenticated;
GRANT SELECT ON feature_flags TO authenticated;

