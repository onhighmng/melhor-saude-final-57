-- Phase 1: Specialist Tables
-- Credentials, rates, and availability management

-- 1. Specialist Documents
CREATE TABLE IF NOT EXISTS specialist_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('license', 'diploma', 'insurance', 'certification', 'other')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INT,
  file_hash TEXT,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiry_date DATE,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'expired', 'rejected')),
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  document_number TEXT,
  issuing_authority TEXT,
  issue_date DATE,
  
  CONSTRAINT verification_dates_valid CHECK (verified_at IS NULL OR verified_at >= uploaded_at),
  CONSTRAINT expiry_after_issue CHECK (expiry_date IS NULL OR issue_date IS NULL OR expiry_date >= issue_date)
);

CREATE INDEX IF NOT EXISTS idx_specialist_documents_specialist_id ON specialist_documents(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_documents_verification_status ON specialist_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_specialist_documents_expiry_date ON specialist_documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_specialist_documents_uploaded_at ON specialist_documents(uploaded_at DESC);

-- RLS for specialist_documents
ALTER TABLE specialist_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS specialist_documents_user_own
  ON specialist_documents
  FOR SELECT
  USING (auth.uid() = specialist_id OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY IF NOT EXISTS specialist_documents_user_insert_own
  ON specialist_documents
  FOR INSERT
  WITH CHECK (auth.uid() = specialist_id);
CREATE POLICY IF NOT EXISTS specialist_documents_admin_all
  ON specialist_documents
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 2. Specialist Rates
CREATE TABLE IF NOT EXISTS specialist_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  session_duration INT NOT NULL CHECK (session_duration > 0),
  rate DECIMAL(10,2) NOT NULL CHECK (rate >= 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (length(currency) = 3),
  rate_type TEXT NOT NULL DEFAULT 'per-session' CHECK (rate_type IN ('per-session', 'hourly', 'package')),
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT effective_date_valid CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX IF NOT EXISTS idx_specialist_rates_specialist_id ON specialist_rates(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_rates_effective_from ON specialist_rates(effective_from);
CREATE INDEX IF NOT EXISTS idx_specialist_rates_service_type ON specialist_rates(service_type);

-- RLS for specialist_rates
ALTER TABLE specialist_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS specialist_rates_user_own
  ON specialist_rates
  FOR SELECT
  USING (auth.uid() = specialist_id OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'user', 'hr')
  ));
CREATE POLICY IF NOT EXISTS specialist_rates_user_manage_own
  ON specialist_rates
  FOR INSERT
  WITH CHECK (auth.uid() = specialist_id);
CREATE POLICY IF NOT EXISTS specialist_rates_user_update_own
  ON specialist_rates
  FOR UPDATE
  USING (auth.uid() = specialist_id)
  WITH CHECK (auth.uid() = specialist_id);
CREATE POLICY IF NOT EXISTS specialist_rates_admin_all
  ON specialist_rates
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 3. Specialist Working Hours
CREATE TABLE IF NOT EXISTS specialist_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_working BOOLEAN NOT NULL DEFAULT true,
  recurring BOOLEAN NOT NULL DEFAULT true,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT time_valid CHECK (end_time > start_time),
  CONSTRAINT effective_date_valid CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX IF NOT EXISTS idx_specialist_working_hours_specialist_id ON specialist_working_hours(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_working_hours_day ON specialist_working_hours(day_of_week);
CREATE INDEX IF NOT EXISTS idx_specialist_working_hours_effective ON specialist_working_hours(specialist_id, effective_from, effective_to);

-- RLS for specialist_working_hours
ALTER TABLE specialist_working_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS specialist_working_hours_user_own
  ON specialist_working_hours
  FOR SELECT
  USING (auth.uid() = specialist_id OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'user', 'hr')
  ));
CREATE POLICY IF NOT EXISTS specialist_working_hours_user_manage_own
  ON specialist_working_hours
  FOR INSERT
  WITH CHECK (auth.uid() = specialist_id);
CREATE POLICY IF NOT EXISTS specialist_working_hours_user_update_own
  ON specialist_working_hours
  FOR UPDATE
  USING (auth.uid() = specialist_id)
  WITH CHECK (auth.uid() = specialist_id);
CREATE POLICY IF NOT EXISTS specialist_working_hours_admin_all
  ON specialist_working_hours
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Grant permissions
GRANT SELECT ON specialist_documents TO authenticated;
GRANT INSERT, UPDATE ON specialist_documents TO authenticated;
GRANT SELECT ON specialist_rates TO authenticated, anon;
GRANT INSERT, UPDATE ON specialist_rates TO authenticated;
GRANT SELECT ON specialist_working_hours TO authenticated, anon;
GRANT INSERT, UPDATE ON specialist_working_hours TO authenticated;


