-- ============================================================================
-- MISSING TABLES FOR FULL FUNCTIONALITY
-- Billing, Subscriptions, Transactions, and Platform Settings
-- Run this manually in Supabase SQL Editor AFTER DATABASE_VERIFICATION_AND_FIXES.sql
-- ============================================================================

-- ============================================================================
-- 1. SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('individual', 'family', 'corporate')),
  plan_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  sessions_included INTEGER,
  price DECIMAL(10,2),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
  start_date DATE NOT NULL,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  payment_method TEXT,
  stripe_subscription_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE subscriptions IS 'Subscription plans for users and companies';

-- ============================================================================
-- 2. INVOICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  company_id UUID REFERENCES companies(id),
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  payment_method TEXT,
  stripe_invoice_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE invoices IS 'Invoices for subscription billing';

-- ============================================================================
-- 3. TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id),
  user_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'adjustment')),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_provider TEXT DEFAULT 'stripe',
  provider_transaction_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE transactions IS 'Payment transactions and financial records';

-- ============================================================================
-- 4. PLATFORM_SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('general', 'billing', 'notifications', 'features', 'security')),
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE platform_settings IS 'System-wide configuration settings';

-- ============================================================================
-- 5. MISSING COLUMNS IN COMPANIES TABLE
-- ============================================================================

DO $$ 
BEGIN
  -- Add columns that might be missing for full company functionality
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'size') THEN
    ALTER TABLE companies ADD COLUMN size TEXT CHECK (size IN ('small', 'medium', 'large', 'enterprise'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'number_of_employees') THEN
    ALTER TABLE companies ADD COLUMN number_of_employees INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'sessions_per_employee') THEN
    ALTER TABLE companies ADD COLUMN sessions_per_employee INTEGER DEFAULT 4;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'session_model') THEN
    ALTER TABLE companies ADD COLUMN session_model TEXT DEFAULT 'pool' CHECK (session_model IN ('pool', 'fixed'));
    COMMENT ON COLUMN companies.session_model IS 'pool: shared company pool, fixed: individual employee allocation';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'price_per_session') THEN
    ALTER TABLE companies ADD COLUMN price_per_session DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'hr_contact_person') THEN
    ALTER TABLE companies ADD COLUMN hr_contact_person TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'hr_email') THEN
    ALTER TABLE companies ADD COLUMN hr_email TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'program_start_date') THEN
    ALTER TABLE companies ADD COLUMN program_start_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'contract_start_date') THEN
    ALTER TABLE companies ADD COLUMN contract_start_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'contract_end_date') THEN
    ALTER TABLE companies ADD COLUMN contract_end_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name = 'pillars') THEN
    ALTER TABLE companies ADD COLUMN pillars TEXT[] DEFAULT ARRAY['mental', 'physical', 'financial', 'legal'];
  END IF;
END $$;

-- ============================================================================
-- 6. MISSING COLUMNS IN COMPANY_EMPLOYEES TABLE
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'company_employees' AND column_name = 'position') THEN
    ALTER TABLE company_employees ADD COLUMN position TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'company_employees' AND column_name = 'sessions_quota') THEN
    ALTER TABLE company_employees ADD COLUMN sessions_quota INTEGER DEFAULT 10;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'company_employees' AND column_name = 'status') THEN
    ALTER TABLE company_employees ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'company_employees' AND column_name = 'deactivated_at') THEN
    ALTER TABLE company_employees ADD COLUMN deactivated_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'company_employees' AND column_name = 'deactivated_by') THEN
    ALTER TABLE company_employees ADD COLUMN deactivated_by UUID REFERENCES profiles(id);
  END IF;
END $$;

-- ============================================================================
-- 7. MISSING COLUMNS IN PRESTADORES TABLE
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'specialization') THEN
    ALTER TABLE prestadores ADD COLUMN specialization TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'qualifications') THEN
    ALTER TABLE prestadores ADD COLUMN qualifications TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'credentials') THEN
    ALTER TABLE prestadores ADD COLUMN credentials TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'video_intro_url') THEN
    ALTER TABLE prestadores ADD COLUMN video_intro_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'hourly_rate') THEN
    ALTER TABLE prestadores ADD COLUMN hourly_rate DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'cost_per_session') THEN
    ALTER TABLE prestadores ADD COLUMN cost_per_session DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'rating') THEN
    ALTER TABLE prestadores ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'total_sessions') THEN
    ALTER TABLE prestadores ADD COLUMN total_sessions INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'total_ratings') THEN
    ALTER TABLE prestadores ADD COLUMN total_ratings INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'experience_years') THEN
    ALTER TABLE prestadores ADD COLUMN experience_years INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'session_type') THEN
    ALTER TABLE prestadores ADD COLUMN session_type TEXT CHECK (session_type IN ('virtual', 'presential', 'both'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'availability') THEN
    ALTER TABLE prestadores ADD COLUMN availability JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'is_approved') THEN
    ALTER TABLE prestadores ADD COLUMN is_approved BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'approval_notes') THEN
    ALTER TABLE prestadores ADD COLUMN approval_notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'approved_by') THEN
    ALTER TABLE prestadores ADD COLUMN approved_by UUID REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'prestadores' AND column_name = 'approved_at') THEN
    ALTER TABLE prestadores ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================================================
-- 8. MISSING COLUMNS IN BOOKINGS TABLE
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'date') THEN
    ALTER TABLE bookings ADD COLUMN date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'quota_type') THEN
    ALTER TABLE bookings ADD COLUMN quota_type TEXT DEFAULT 'employer' CHECK (quota_type IN ('employer', 'personal'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'referral_notes') THEN
    ALTER TABLE bookings ADD COLUMN referral_notes TEXT;
  END IF;

  -- Sync booking_date with date column
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'bookings' AND column_name = 'booking_date') 
     AND EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'bookings' AND column_name = 'date') THEN
    UPDATE bookings SET date = booking_date WHERE date IS NULL AND booking_date IS NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- 9. MISSING COLUMNS IN SESSION_RECORDINGS TABLE
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'session_recordings' AND column_name = 'is_encrypted') THEN
    ALTER TABLE session_recordings ADD COLUMN is_encrypted BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'session_recordings' AND column_name = 'encryption_key') THEN
    ALTER TABLE session_recordings ADD COLUMN encryption_key TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'session_recordings' AND column_name = 'is_transcribed') THEN
    ALTER TABLE session_recordings ADD COLUMN is_transcribed BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'session_recordings' AND column_name = 'transcription_url') THEN
    ALTER TABLE session_recordings ADD COLUMN transcription_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'session_recordings' AND column_name = 'expires_at') THEN
    ALTER TABLE session_recordings ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'session_recordings' AND column_name = 'consent_given') THEN
    ALTER TABLE session_recordings ADD COLUMN consent_given BOOLEAN DEFAULT false;
  END IF;
END $$;

-- ============================================================================
-- 10. MISSING COLUMNS IN SESSION_NOTES TABLE
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'session_notes' AND column_name = 'outcome') THEN
    ALTER TABLE session_notes ADD COLUMN outcome TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'session_notes' AND column_name = 'is_confidential') THEN
    ALTER TABLE session_notes ADD COLUMN is_confidential BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'session_notes' AND column_name = 'tags') THEN
    ALTER TABLE session_notes ADD COLUMN tags TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'session_notes' AND column_name = 'follow_up_needed') THEN
    ALTER TABLE session_notes ADD COLUMN follow_up_needed BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'session_notes' AND column_name = 'updated_at') THEN
    ALTER TABLE session_notes ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- ============================================================================
-- 11. MISSING COLUMNS IN RESOURCES TABLE
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'resources' AND column_name = 'type') THEN
    ALTER TABLE resources ADD COLUMN type TEXT CHECK (type IN ('article', 'video', 'podcast', 'guide', 'exercise'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'resources' AND column_name = 'tags') THEN
    ALTER TABLE resources ADD COLUMN tags TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'resources' AND column_name = 'media_url') THEN
    ALTER TABLE resources ADD COLUMN media_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'resources' AND column_name = 'duration') THEN
    ALTER TABLE resources ADD COLUMN duration INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'resources' AND column_name = 'difficulty_level') THEN
    ALTER TABLE resources ADD COLUMN difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'resources' AND column_name = 'is_premium') THEN
    ALTER TABLE resources ADD COLUMN is_premium BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'resources' AND column_name = 'view_count') THEN
    ALTER TABLE resources ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'resources' AND column_name = 'rating') THEN
    ALTER TABLE resources ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'resources' AND column_name = 'total_ratings') THEN
    ALTER TABLE resources ADD COLUMN total_ratings INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'resources' AND column_name = 'is_published') THEN
    ALTER TABLE resources ADD COLUMN is_published BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'resources' AND column_name = 'published_at') THEN
    ALTER TABLE resources ADD COLUMN published_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'resources' AND column_name = 'created_by') THEN
    ALTER TABLE resources ADD COLUMN created_by UUID REFERENCES profiles(id);
  END IF;
END $$;

-- ============================================================================
-- 12. MISSING COLUMNS IN FEEDBACK TABLE
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'feedback' AND column_name = 'category') THEN
    ALTER TABLE feedback ADD COLUMN category TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'feedback' AND column_name = 'message') THEN
    ALTER TABLE feedback ADD COLUMN message TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'feedback' AND column_name = 'status') THEN
    ALTER TABLE feedback ADD COLUMN status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'feedback' AND column_name = 'admin_response') THEN
    ALTER TABLE feedback ADD COLUMN admin_response TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'feedback' AND column_name = 'responded_by') THEN
    ALTER TABLE feedback ADD COLUMN responded_by UUID REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'feedback' AND column_name = 'responded_at') THEN
    ALTER TABLE feedback ADD COLUMN responded_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================================================
-- 13. MISSING COLUMNS IN ONBOARDING_DATA TABLE
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'onboarding_data' AND column_name = 'wellbeing_score') THEN
    ALTER TABLE onboarding_data ADD COLUMN wellbeing_score INTEGER CHECK (wellbeing_score BETWEEN 1 AND 10);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'onboarding_data' AND column_name = 'difficulty_areas') THEN
    ALTER TABLE onboarding_data ADD COLUMN difficulty_areas TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'onboarding_data' AND column_name = 'main_goals') THEN
    ALTER TABLE onboarding_data ADD COLUMN main_goals TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'onboarding_data' AND column_name = 'improvement_signs') THEN
    ALTER TABLE onboarding_data ADD COLUMN improvement_signs TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'onboarding_data' AND column_name = 'frequency') THEN
    ALTER TABLE onboarding_data ADD COLUMN frequency TEXT;
  END IF;
END $$;

-- ============================================================================
-- 14. CREATE INDEXES FOR NEW TABLES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_start_date ON subscriptions(start_date);

CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_transactions_invoice_id ON transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_platform_settings_setting_key ON platform_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON platform_settings(category);

-- ============================================================================
-- 15. ENABLE RLS ON NEW TABLES
-- ============================================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 16. CREATE RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Subscriptions policies
CREATE POLICY "users_view_own_subscriptions" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "companies_view_own_subscriptions" ON subscriptions
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "admins_manage_subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Invoices policies
CREATE POLICY "companies_view_own_invoices" ON invoices
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "admins_manage_invoices" ON invoices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Transactions policies
CREATE POLICY "users_view_own_transactions" ON transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "companies_view_own_transactions" ON transactions
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "admins_manage_transactions" ON transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Platform settings policies
CREATE POLICY "admins_manage_platform_settings" ON platform_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "public_view_public_settings" ON platform_settings
  FOR SELECT USING (is_public = true);

-- ============================================================================
-- REFRESH SCHEMA CACHE
-- ============================================================================

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT '✅ MISSING TABLES AND COLUMNS ADDED SUCCESSFULLY!' as status;
SELECT 'Added: subscriptions, invoices, transactions, platform_settings' as new_tables;
SELECT 'Added missing columns to existing tables for full functionality.' as enhanced;
SELECT 'All billing and configuration features are now supported.' as message;





