-- Phase 1: Company Tables
-- Subscription plans, company subscriptions (entitlements), and verification

-- 1. Company Subscription Plans (Entitlements Only - No Billing)
CREATE TABLE IF NOT EXISTS company_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  max_employees INT NOT NULL DEFAULT 10 CHECK (max_employees > 0),
  sessions_per_month INT NOT NULL DEFAULT 50 CHECK (sessions_per_month > 0),
  features JSONB DEFAULT '{}',
  trial_days INT DEFAULT 14 CHECK (trial_days >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_subscription_plans_is_active ON company_subscription_plans(is_active);

-- RLS for company_subscription_plans
ALTER TABLE company_subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS company_subscription_plans_public_read
  ON company_subscription_plans
  FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY IF NOT EXISTS company_subscription_plans_admin_all
  ON company_subscription_plans
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 2. Company Subscriptions (Non-Billing - Entitlements)
CREATE TABLE IF NOT EXISTS company_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES company_subscription_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trial', 'suspended', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE,
  trial_end_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  cancellation_date TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT end_date_valid CHECK (end_date IS NULL OR end_date > start_date),
  CONSTRAINT trial_date_valid CHECK (trial_end_date IS NULL OR trial_end_date > start_date),
  CONSTRAINT cancellation_logic CHECK (
    (status = 'cancelled' AND cancellation_date IS NOT NULL) OR
    (status != 'cancelled' AND cancellation_date IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_company_subscriptions_company_id ON company_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_plan_id ON company_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_status ON company_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_start_date ON company_subscriptions(start_date);

-- RLS for company_subscriptions
ALTER TABLE company_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS company_subscriptions_company_users
  ON company_subscriptions
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_employees WHERE user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY IF NOT EXISTS company_subscriptions_admin_all
  ON company_subscriptions
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 3. Company Verification
CREATE TABLE IF NOT EXISTS company_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  registration_number TEXT,
  registration_verified BOOLEAN DEFAULT false,
  registration_verified_at TIMESTAMPTZ,
  tax_id TEXT,
  tax_id_verified BOOLEAN DEFAULT false,
  tax_id_verified_at TIMESTAMPTZ,
  business_license TEXT,
  business_license_verified BOOLEAN DEFAULT false,
  business_license_verified_at TIMESTAMPTZ,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_review', 'verified', 'rejected')),
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_verification_company_id ON company_verification(company_id);
CREATE INDEX IF NOT EXISTS idx_company_verification_status ON company_verification(verification_status);
CREATE INDEX IF NOT EXISTS idx_company_verification_created_at ON company_verification(created_at);

-- RLS for company_verification
ALTER TABLE company_verification ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS company_verification_company_users_read
  ON company_verification
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_employees WHERE user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY IF NOT EXISTS company_verification_admin_all
  ON company_verification
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Grant permissions
GRANT SELECT ON company_subscription_plans TO authenticated, anon;
GRANT ALL ON company_subscription_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON company_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON company_verification TO authenticated;


