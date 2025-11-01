-- Migration: Payment & Billing Tables
-- Date: 2025-11-01
-- Description: Creates payment integration tables for Stripe and general billing
-- Related: SECURITY_IMPROVEMENTS.md - Phase 1

-- ============================================================================
-- 1. STRIPE CUSTOMERS TABLE
-- Maps users/companies to Stripe customer IDs
-- ============================================================================

CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

  -- Stripe integration
  stripe_customer_id TEXT NOT NULL UNIQUE,
  stripe_account_id TEXT, -- For multi-tenant scenarios

  -- Customer details (cached from Stripe)
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,

  -- Billing details
  default_payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  currency TEXT DEFAULT 'EUR',
  balance INTEGER DEFAULT 0, -- In cents, negative = credit

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  CONSTRAINT customer_owner CHECK (
    (user_id IS NOT NULL AND company_id IS NULL) OR
    (user_id IS NULL AND company_id IS NOT NULL)
  )
);

CREATE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_stripe_customers_company_id ON stripe_customers(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);

COMMENT ON TABLE stripe_customers IS 'Maps internal users/companies to Stripe customer records';
COMMENT ON COLUMN stripe_customers.balance IS 'Customer balance in cents (negative = has credit, positive = owes money)';

-- ============================================================================
-- 2. PAYMENT METHODS TABLE
-- Stores payment methods (cards, bank accounts, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_customer_id UUID NOT NULL REFERENCES stripe_customers(id) ON DELETE CASCADE,

  -- Stripe integration
  stripe_payment_method_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account', 'sepa_debit', 'paypal')),

  -- Card details (for cards only)
  card_brand TEXT, -- visa, mastercard, amex, etc.
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,

  -- Bank account details (for bank transfers)
  bank_name TEXT,
  bank_account_last4 TEXT,

  -- Status
  is_default BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'failed', 'removed')),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_payment_methods_customer_id ON payment_methods(stripe_customer_id);
CREATE INDEX idx_payment_methods_stripe_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(stripe_customer_id, is_default) WHERE is_default = TRUE;

COMMENT ON TABLE payment_methods IS 'Stores payment methods for customers with PCI-compliant tokenization';
COMMENT ON COLUMN payment_methods.stripe_payment_method_id IS 'Stripe payment method token - actual card data stored securely by Stripe';

-- ============================================================================
-- 3. PAYMENT INTENTS TABLE
-- Tracks Stripe payment intents (in-progress payments)
-- ============================================================================

CREATE TABLE IF NOT EXISTS stripe_payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_customer_id UUID REFERENCES stripe_customers(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

  -- Stripe integration
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  stripe_payment_method_id TEXT,

  -- Payment details
  amount INTEGER NOT NULL, -- In cents
  currency TEXT NOT NULL DEFAULT 'EUR',
  description TEXT,

  -- Status tracking
  status TEXT NOT NULL CHECK (status IN (
    'requires_payment_method',
    'requires_confirmation',
    'requires_action',
    'processing',
    'requires_capture',
    'succeeded',
    'canceled'
  )),

  -- Cancellation
  cancellation_reason TEXT,
  canceled_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  succeeded_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB,

  CONSTRAINT valid_amount CHECK (amount > 0)
);

CREATE INDEX idx_payment_intents_customer_id ON stripe_payment_intents(stripe_customer_id);
CREATE INDEX idx_payment_intents_booking_id ON stripe_payment_intents(booking_id);
CREATE INDEX idx_payment_intents_invoice_id ON stripe_payment_intents(invoice_id);
CREATE INDEX idx_payment_intents_stripe_id ON stripe_payment_intents(stripe_payment_intent_id);
CREATE INDEX idx_payment_intents_status ON stripe_payment_intents(status, created_at DESC);

COMMENT ON TABLE stripe_payment_intents IS 'Tracks Stripe payment intents for in-progress payments';

-- ============================================================================
-- 4. TRANSACTIONS TABLE (Enhanced)
-- Comprehensive transaction log for all payment activities
-- ============================================================================

-- Check if transactions table exists and has old structure
DO $$
BEGIN
  -- If the table exists but lacks new columns, alter it
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'transactions') THEN
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'stripe_payment_intent_id') THEN
      ALTER TABLE transactions ADD COLUMN stripe_payment_intent_id TEXT;
      ALTER TABLE transactions ADD COLUMN payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL;
      ALTER TABLE transactions ADD COLUMN stripe_charge_id TEXT;
      ALTER TABLE transactions ADD COLUMN stripe_refund_id TEXT;
      ALTER TABLE transactions ADD COLUMN failure_code TEXT;
      ALTER TABLE transactions ADD COLUMN failure_message TEXT;
      ALTER TABLE transactions ADD COLUMN currency TEXT DEFAULT 'EUR';
      ALTER TABLE transactions ADD COLUMN fee_amount INTEGER DEFAULT 0;
      ALTER TABLE transactions ADD COLUMN net_amount INTEGER;
      ALTER TABLE transactions ADD COLUMN metadata JSONB;
    END IF;
  ELSE
    -- Create the table if it doesn't exist
    CREATE TABLE transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
      booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
      invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

      -- Stripe integration
      stripe_customer_id UUID REFERENCES stripe_customers(id) ON DELETE SET NULL,
      stripe_payment_intent_id TEXT,
      payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
      stripe_charge_id TEXT,
      stripe_refund_id TEXT,

      -- Transaction details
      type TEXT NOT NULL CHECK (type IN ('charge', 'refund', 'payout', 'adjustment', 'credit')),
      status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
      amount INTEGER NOT NULL, -- In cents
      currency TEXT DEFAULT 'EUR',
      description TEXT,

      -- Fees and net
      fee_amount INTEGER DEFAULT 0, -- Platform/Stripe fee in cents
      net_amount INTEGER, -- Amount after fees

      -- Failure details
      failure_code TEXT,
      failure_message TEXT,

      -- Provider tracking
      provider TEXT CHECK (provider IN ('stripe', 'paypal', 'bank_transfer', 'manual')),

      -- Timestamps
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      processed_at TIMESTAMPTZ,

      -- Metadata
      metadata JSONB,

      CONSTRAINT valid_transaction_amount CHECK (amount != 0)
    );

    CREATE INDEX idx_transactions_user_id ON transactions(user_id, created_at DESC);
    CREATE INDEX idx_transactions_company_id ON transactions(company_id, created_at DESC);
    CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);
    CREATE INDEX idx_transactions_invoice_id ON transactions(invoice_id);
    CREATE INDEX idx_transactions_stripe_payment_intent ON transactions(stripe_payment_intent_id);
    CREATE INDEX idx_transactions_status ON transactions(status, created_at DESC);
    CREATE INDEX idx_transactions_type ON transactions(type, created_at DESC);
  END IF;
END $$;

COMMENT ON TABLE transactions IS 'Comprehensive transaction log for all payment activities';
COMMENT ON COLUMN transactions.fee_amount IS 'Platform and payment processor fees in cents';
COMMENT ON COLUMN transactions.net_amount IS 'Amount received after fees (amount - fee_amount)';

-- ============================================================================
-- 5. REFUNDS TABLE
-- Tracks refund requests and processing
-- ============================================================================

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  -- Stripe integration
  stripe_refund_id TEXT UNIQUE,

  -- Refund details
  amount INTEGER NOT NULL, -- In cents
  currency TEXT NOT NULL DEFAULT 'EUR',
  reason TEXT CHECK (reason IN ('duplicate', 'fraudulent', 'requested_by_customer', 'canceled_booking', 'other')),
  description TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled')),

  -- Processing
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  failure_reason TEXT,

  -- Metadata
  metadata JSONB,

  CONSTRAINT valid_refund_amount CHECK (amount > 0)
);

CREATE INDEX idx_refunds_transaction_id ON refunds(transaction_id);
CREATE INDEX idx_refunds_booking_id ON refunds(booking_id);
CREATE INDEX idx_refunds_stripe_id ON refunds(stripe_refund_id);
CREATE INDEX idx_refunds_status ON refunds(status, requested_at DESC);

COMMENT ON TABLE refunds IS 'Tracks refund requests and processing status';

-- ============================================================================
-- 6. SUBSCRIPTION PLANS TABLE
-- Defines available subscription tiers
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Stripe integration
  stripe_product_id TEXT UNIQUE,
  stripe_price_id TEXT UNIQUE,

  -- Pricing
  amount INTEGER NOT NULL, -- In cents per billing cycle
  currency TEXT NOT NULL DEFAULT 'EUR',
  interval TEXT NOT NULL CHECK (interval IN ('day', 'week', 'month', 'year')),
  interval_count INTEGER NOT NULL DEFAULT 1,

  -- Features
  sessions_included INTEGER NOT NULL DEFAULT 0,
  max_employees INTEGER,
  features JSONB, -- Array of feature flags

  -- Availability
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_plan_amount CHECK (amount >= 0),
  CONSTRAINT valid_interval_count CHECK (interval_count > 0)
);

CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active, is_public) WHERE is_active = TRUE;

COMMENT ON TABLE subscription_plans IS 'Defines subscription tiers and pricing';

-- ============================================================================
-- 7. COMPANY SUBSCRIPTIONS TABLE (Enhanced)
-- Tracks company subscription status
-- ============================================================================

-- Enhance existing subscriptions table if needed
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'subscriptions') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'stripe_subscription_id') THEN
      ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id TEXT UNIQUE;
      ALTER TABLE subscriptions ADD COLUMN plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL;
      ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE;
      ALTER TABLE subscriptions ADD COLUMN canceled_at TIMESTAMPTZ;
      ALTER TABLE subscriptions ADD COLUMN trial_end TIMESTAMPTZ;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 8. INVOICES TABLE (Enhanced)
-- Enhanced invoice tracking
-- ============================================================================

-- Enhance existing invoices table
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'invoices') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'stripe_invoice_id') THEN
      ALTER TABLE invoices ADD COLUMN stripe_invoice_id TEXT UNIQUE;
      ALTER TABLE invoices ADD COLUMN invoice_number TEXT UNIQUE;
      ALTER TABLE invoices ADD COLUMN due_date TIMESTAMPTZ;
      ALTER TABLE invoices ADD COLUMN paid_at TIMESTAMPTZ;
      ALTER TABLE invoices ADD COLUMN currency TEXT DEFAULT 'EUR';
      ALTER TABLE invoices ADD COLUMN subtotal INTEGER;
      ALTER TABLE invoices ADD COLUMN tax_amount INTEGER;
      ALTER TABLE invoices ADD COLUMN total_amount INTEGER;
      ALTER TABLE invoices ADD COLUMN invoice_pdf_url TEXT;
      ALTER TABLE invoices ADD COLUMN metadata JSONB;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

CREATE TRIGGER update_stripe_customers_updated_at
    BEFORE UPDATE ON stripe_customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_intents_updated_at
    BEFORE UPDATE ON stripe_payment_intents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- stripe_customers policies
CREATE POLICY "Users can view their own Stripe customer record"
  ON stripe_customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "HR can view their company's Stripe customer record"
  ON stripe_customers FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "Admins can view all Stripe customer records"
  ON stripe_customers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- payment_methods policies
CREATE POLICY "Users can view their own payment methods"
  ON payment_methods FOR SELECT
  USING (
    stripe_customer_id IN (
      SELECT id FROM stripe_customers WHERE user_id = auth.uid()
    )
  );

-- subscription_plans policies (public read)
CREATE POLICY "Anyone can view active public subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = TRUE AND is_public = TRUE);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Calculate net amount after fees
CREATE OR REPLACE FUNCTION calculate_net_amount(
  p_amount INTEGER,
  p_fee_amount INTEGER
)
RETURNS INTEGER AS $$
BEGIN
  RETURN p_amount - p_fee_amount;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Check if payment method is expired
CREATE OR REPLACE FUNCTION is_payment_method_expired(p_payment_method_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_exp_month INTEGER;
  v_exp_year INTEGER;
BEGIN
  SELECT card_exp_month, card_exp_year
  INTO v_exp_month, v_exp_year
  FROM payment_methods
  WHERE id = p_payment_method_id;

  IF v_exp_month IS NULL OR v_exp_year IS NULL THEN
    RETURN FALSE; -- Not a card
  END IF;

  RETURN make_date(v_exp_year, v_exp_month, 1) < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON stripe_customers TO service_role;
GRANT ALL ON payment_methods TO service_role;
GRANT ALL ON stripe_payment_intents TO service_role;
GRANT ALL ON refunds TO service_role;
GRANT ALL ON subscription_plans TO service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

INSERT INTO admin_logs (action, admin_id, details, created_at)
VALUES (
  'migration_applied',
  NULL,
  jsonb_build_object(
    'migration', '20251101000001_create_payment_tables',
    'tables_created', ARRAY[
      'stripe_customers',
      'payment_methods',
      'stripe_payment_intents',
      'transactions (enhanced)',
      'refunds',
      'subscription_plans',
      'subscriptions (enhanced)',
      'invoices (enhanced)'
    ],
    'status', 'success'
  ),
  NOW()
);
