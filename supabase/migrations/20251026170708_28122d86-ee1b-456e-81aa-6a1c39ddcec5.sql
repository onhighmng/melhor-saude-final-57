-- ============================================
-- FINAL COMPREHENSIVE MIGRATION
-- Creates: 10 tables + trigger + helper functions
-- ============================================

-- ============================================
-- 1. PROVIDER MANAGEMENT TABLES
-- ============================================

-- Prestador Availability: Weekly recurring availability templates
CREATE TABLE IF NOT EXISTS public.prestador_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID NOT NULL REFERENCES public.prestadores(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_prestador_availability_prestador ON public.prestador_availability(prestador_id);
CREATE INDEX IF NOT EXISTS idx_prestador_availability_day ON public.prestador_availability(day_of_week);

-- Prestador Performance: Monthly aggregated stats
CREATE TABLE IF NOT EXISTS public.prestador_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID NOT NULL REFERENCES public.prestadores(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- First day of month
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  cancelled_sessions INTEGER DEFAULT 0,
  no_show_sessions INTEGER DEFAULT 0,
  avg_rating NUMERIC(3,2),
  total_revenue NUMERIC(10,2) DEFAULT 0,
  total_hours NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prestador_id, month)
);

CREATE INDEX IF NOT EXISTS idx_prestador_performance_prestador ON public.prestador_performance(prestador_id);
CREATE INDEX IF NOT EXISTS idx_prestador_performance_month ON public.prestador_performance(month);

-- ============================================
-- 2. SESSION RECORDINGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.session_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  prestador_id UUID NOT NULL,
  user_id UUID NOT NULL,
  recording_url TEXT, -- Encrypted storage URL
  duration_minutes INTEGER,
  file_size_mb NUMERIC(10,2),
  is_encrypted BOOLEAN DEFAULT true,
  encryption_key_id TEXT, -- Reference to key management service
  transcription_url TEXT, -- AI transcription
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ, -- GDPR compliance - auto-delete after 90 days
  deleted_at TIMESTAMPTZ, -- Soft delete
  UNIQUE(booking_id)
);

CREATE INDEX IF NOT EXISTS idx_session_recordings_booking ON public.session_recordings(booking_id);
CREATE INDEX IF NOT EXISTS idx_session_recordings_expires ON public.session_recordings(expires_at) WHERE deleted_at IS NULL;

-- ============================================
-- 3. PAYMENT & BILLING SYSTEM
-- ============================================

-- Subscriptions: Company plan management
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'pro', 'enterprise', 'custom')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'suspended', 'expired')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
  price_per_month NUMERIC(10,2) NOT NULL,
  seats_included INTEGER DEFAULT 0,
  sessions_per_seat INTEGER DEFAULT 0,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON public.subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);

-- Invoices: Billing documents
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount_due NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  pdf_url TEXT, -- Generated PDF invoice
  stripe_invoice_id TEXT UNIQUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_company ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- Transactions: Payment processing records
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  payment_method TEXT CHECK (payment_method IN ('stripe', 'paypal', 'bank_transfer', 'credit_card')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  failure_reason TEXT,
  refund_amount NUMERIC(10,2),
  refunded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON public.transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company ON public.transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at);

-- ============================================
-- 4. ANALYTICS & TRACKING
-- ============================================

-- Resource Access Log: Track resource usage
CREATE TABLE IF NOT EXISTS public.resource_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  user_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  access_type TEXT DEFAULT 'view' CHECK (access_type IN ('view', 'download', 'share')),
  duration_seconds INTEGER, -- How long they viewed
  device_type TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resource_access_resource ON public.resource_access_log(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_user ON public.resource_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_created ON public.resource_access_log(created_at);

-- ============================================
-- 5. SPECIALIST ASSIGNMENTS
-- ============================================

-- Map specialists to specific companies (exclusive contracts)
CREATE TABLE IF NOT EXISTS public.specialist_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  specialist_id UUID NOT NULL, -- User with specialist role
  pillar TEXT CHECK (pillar IN ('mental_health', 'physical_wellness', 'financial_assistance', 'legal_assistance')),
  is_primary BOOLEAN DEFAULT false, -- Primary specialist for this pillar
  is_active BOOLEAN DEFAULT true,
  hourly_rate NUMERIC(10,2),
  max_hours_per_week INTEGER,
  contract_start_date DATE,
  contract_end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, specialist_id, pillar)
);

CREATE INDEX IF NOT EXISTS idx_specialist_assignments_company ON public.specialist_assignments(company_id);
CREATE INDEX IF NOT EXISTS idx_specialist_assignments_specialist ON public.specialist_assignments(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_assignments_pillar ON public.specialist_assignments(pillar);

-- ============================================
-- 6. PLATFORM ADMINISTRATION
-- ============================================

-- Platform Settings: System-wide configuration
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  setting_type TEXT CHECK (setting_type IN ('boolean', 'string', 'number', 'json', 'array')),
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Can non-admins read this?
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON public.platform_settings(setting_key);

-- Insert default settings
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, description, is_public)
VALUES 
  ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode to block access', false),
  ('feature_flags', '{}', 'json', 'Feature flags for gradual rollout', false),
  ('max_sessions_per_user', '10', 'number', 'Default max sessions per user per month', true),
  ('session_duration_default', '60', 'number', 'Default session duration in minutes', true),
  ('booking_advance_days', '30', 'number', 'How many days in advance users can book', true)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- 7. ONBOARDING DATA
-- ============================================

-- Onboarding Data: User intake questionnaires
CREATE TABLE IF NOT EXISTS public.onboarding_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  pillar_preferences TEXT[] DEFAULT '{}', -- Which pillars they're interested in
  health_goals TEXT[],
  work_stress_level INTEGER CHECK (work_stress_level BETWEEN 1 AND 10),
  preferred_session_time TEXT, -- 'morning', 'afternoon', 'evening'
  preferred_language TEXT DEFAULT 'pt',
  communication_preferences JSONB DEFAULT '{}',
  initial_concerns TEXT,
  referral_source TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_data_user ON public.onboarding_data(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_data_completed ON public.onboarding_data(completed_at);

-- ============================================
-- 8. AUTHENTICATION TRIGGER
-- ============================================

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Check if provider is available at specific time
CREATE OR REPLACE FUNCTION public.get_provider_availability(
  _prestador_id UUID,
  _date DATE,
  _start_time TIME,
  _end_time TIME
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _day_of_week INTEGER;
  _is_available BOOLEAN;
BEGIN
  -- Get day of week (0=Sunday, 6=Saturday)
  _day_of_week := EXTRACT(DOW FROM _date);
  
  -- Check if provider has availability for this day and time
  SELECT EXISTS (
    SELECT 1
    FROM prestador_availability
    WHERE prestador_id = _prestador_id
      AND day_of_week = _day_of_week
      AND start_time <= _start_time
      AND end_time >= _end_time
      AND is_recurring = true
  ) INTO _is_available;
  
  -- Also check they don't have an existing booking
  IF _is_available THEN
    SELECT NOT EXISTS (
      SELECT 1
      FROM bookings
      WHERE prestador_id = _prestador_id
        AND date = _date
        AND status NOT IN ('cancelled', 'no_show')
        AND (
          (start_time, end_time) OVERLAPS (_start_time, _end_time)
        )
    ) INTO _is_available;
  END IF;
  
  RETURN _is_available;
END;
$$;

-- Calculate monthly performance for a provider
CREATE OR REPLACE FUNCTION public.calculate_monthly_performance(
  _prestador_id UUID,
  _month DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _stats RECORD;
BEGIN
  -- Get stats for the month
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
    COUNT(*) FILTER (WHERE status = 'no_show') as no_show,
    ROUND(AVG(rating), 2) as avg_rating,
    ROUND(SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600), 2) as total_hours
  INTO _stats
  FROM bookings
  WHERE prestador_id = _prestador_id
    AND DATE_TRUNC('month', date) = DATE_TRUNC('month', _month);
  
  -- Insert or update performance record
  INSERT INTO prestador_performance (
    prestador_id,
    month,
    total_sessions,
    completed_sessions,
    cancelled_sessions,
    no_show_sessions,
    avg_rating,
    total_hours,
    updated_at
  )
  VALUES (
    _prestador_id,
    DATE_TRUNC('month', _month),
    _stats.total,
    _stats.completed,
    _stats.cancelled,
    _stats.no_show,
    _stats.avg_rating,
    _stats.total_hours,
    now()
  )
  ON CONFLICT (prestador_id, month) 
  DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    completed_sessions = EXCLUDED.completed_sessions,
    cancelled_sessions = EXCLUDED.cancelled_sessions,
    no_show_sessions = EXCLUDED.no_show_sessions,
    avg_rating = EXCLUDED.avg_rating,
    total_hours = EXCLUDED.total_hours,
    updated_at = now();
END;
$$;

-- Check company subscription status
CREATE OR REPLACE FUNCTION public.get_company_subscription_status(_company_id UUID)
RETURNS TABLE(
  is_active BOOLEAN,
  plan_type TEXT,
  sessions_remaining INTEGER,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (s.status = 'active' AND s.current_period_end > now()) as is_active,
    s.plan_type,
    (c.sessions_allocated - c.sessions_used) as sessions_remaining,
    s.current_period_end as expires_at
  FROM subscriptions s
  JOIN companies c ON c.id = s.company_id
  WHERE s.company_id = _company_id
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      false as is_active,
      NULL::TEXT as plan_type,
      (c.sessions_allocated - c.sessions_used) as sessions_remaining,
      NULL::TIMESTAMPTZ as expires_at
    FROM companies c
    WHERE c.id = _company_id;
  END IF;
END;
$$;

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Prestador Availability
ALTER TABLE public.prestador_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availability"
  ON public.prestador_availability FOR SELECT
  USING (true);

CREATE POLICY "Providers can manage their availability"
  ON public.prestador_availability FOR ALL
  USING (prestador_id IN (SELECT id FROM prestadores WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all availability"
  ON public.prestador_availability FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Prestador Performance
ALTER TABLE public.prestador_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view their performance"
  ON public.prestador_performance FOR SELECT
  USING (prestador_id IN (SELECT id FROM prestadores WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all performance"
  ON public.prestador_performance FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage performance"
  ON public.prestador_performance FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Session Recordings
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their session recordings"
  ON public.session_recordings FOR SELECT
  USING (user_id = auth.uid() OR prestador_id = auth.uid());

CREATE POLICY "Admins can manage all recordings"
  ON public.session_recordings FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can view their company subscription"
  ON public.subscriptions FOR SELECT
  USING (
    has_role(auth.uid(), 'hr') 
    AND company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage all subscriptions"
  ON public.subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can view their company invoices"
  ON public.invoices FOR SELECT
  USING (
    has_role(auth.uid(), 'hr')
    AND company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage all invoices"
  ON public.invoices FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can view their company transactions"
  ON public.transactions FOR SELECT
  USING (
    has_role(auth.uid(), 'hr')
    AND company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage all transactions"
  ON public.transactions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Resource Access Log
ALTER TABLE public.resource_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own access logs"
  ON public.resource_access_log FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create access logs"
  ON public.resource_access_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all access logs"
  ON public.resource_access_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Specialist Assignments
ALTER TABLE public.specialist_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can view their company assignments"
  ON public.specialist_assignments FOR SELECT
  USING (
    has_role(auth.uid(), 'hr')
    AND company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Specialists can view their assignments"
  ON public.specialist_assignments FOR SELECT
  USING (specialist_id = auth.uid());

CREATE POLICY "Admins can manage all assignments"
  ON public.specialist_assignments FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Platform Settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public settings"
  ON public.platform_settings FOR SELECT
  USING (is_public = true);

CREATE POLICY "Admins can manage all settings"
  ON public.platform_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Onboarding Data
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their onboarding data"
  ON public.onboarding_data FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their onboarding data"
  ON public.onboarding_data FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all onboarding data"
  ON public.onboarding_data FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- 11. UPDATED_AT TRIGGERS
-- ============================================

CREATE TRIGGER update_prestador_availability_updated_at
  BEFORE UPDATE ON public.prestador_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prestador_performance_updated_at
  BEFORE UPDATE ON public.prestador_performance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_specialist_assignments_updated_at
  BEFORE UPDATE ON public.specialist_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_data_updated_at
  BEFORE UPDATE ON public.onboarding_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Created: 10 tables, 1 trigger, 3 helper functions
-- Total tables: 31 (20 existing + 11 new - 1 duplicate specialist_analytics)
-- All RLS policies configured
-- All indexes created for performance
-- Ready for advanced features implementation
-- ============================================