-- Phase 1: Company Subscription Tables (Non-billing Entitlements)
-- Purpose: Subscription plans and assignments (NO payment processing)
-- Date: November 2, 2025

-- ============================================================================
-- 1. COMPANY SUBSCRIPTION PLANS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.company_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  tier TEXT NOT NULL UNIQUE CHECK (tier IN ('free', 'starter', 'business', 'enterprise')),
  max_employees INTEGER NOT NULL CHECK (max_employees > 0),
  sessions_per_employee_per_month INTEGER NOT NULL CHECK (sessions_per_employee_per_month > 0),
  pillars JSONB DEFAULT '["saude_mental", "bem_estar_fisico", "assistencia_financeira", "assistencia_juridica"]'::jsonb,
  features JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_subscription_plans_tier ON public.company_subscription_plans(tier);
CREATE INDEX IF NOT EXISTS idx_company_subscription_plans_is_active ON public.company_subscription_plans(is_active);

ALTER TABLE public.company_subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_view_active"
  ON public.company_subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "admin_manage_all"
  ON public.company_subscription_plans FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- 2. COMPANY SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.company_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.company_subscription_plans(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'trial')),
  max_employees INTEGER NOT NULL,
  sessions_per_employee_per_month INTEGER NOT NULL,
  current_employees INTEGER DEFAULT 0,
  sessions_used_this_month INTEGER DEFAULT 0,
  trial_ends_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_subscriptions_company_id ON public.company_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_plan_id ON public.company_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_status ON public.company_subscriptions(status);

ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_view_own"
  ON public.company_subscriptions FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.company_employees 
      WHERE user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin_manage_all"
  ON public.company_subscriptions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- 3. COMPANY VERIFICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.company_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN (
    'pending', 'under_review', 'verified', 'rejected', 'suspended'
  )),
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  documents_verified BOOLEAN DEFAULT false,
  compliance_checked BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_verification_company_id ON public.company_verification(company_id);
CREATE INDEX IF NOT EXISTS idx_company_verification_status ON public.company_verification(verification_status);
CREATE INDEX IF NOT EXISTS idx_company_verification_verified_at ON public.company_verification(verified_at DESC);

ALTER TABLE public.company_verification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_view_own"
  ON public.company_verification FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.company_employees 
      WHERE user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin_manage_all"
  ON public.company_verification FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON public.company_subscription_plans TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.company_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.company_verification TO authenticated;

-- ============================================================================
-- SEED DEFAULT PLANS
-- ============================================================================

INSERT INTO public.company_subscription_plans (name, tier, description, max_employees, sessions_per_employee_per_month, features)
VALUES
  ('Free', 'free', 'Limited trial for evaluation', 10, 2, '{"support": "email"}'::jsonb),
  ('Starter', 'starter', 'Perfect for small teams', 50, 6, '{"support": "email", "analytics": true}'::jsonb),
  ('Business', 'business', 'Ideal for growing companies', 200, 12, '{"support": "priority", "analytics": true, "custom_branding": true}'::jsonb),
  ('Enterprise', 'enterprise', 'Unlimited capabilities with white-glove support', NULL, 20, '{"support": "dedicated", "analytics": true, "custom_branding": true, "sso": true, "sla": true}'::jsonb)
ON CONFLICT (tier) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.company_subscription_plans IS 'Non-billing subscription tier definitions (entitlements only)';
COMMENT ON TABLE public.company_subscriptions IS 'Company subscription assignments to plans (no payment data)';
COMMENT ON TABLE public.company_verification IS 'Verification status and compliance tracking for companies';

DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Phase 1 company subscription tables created and seeded';
END
$$;
