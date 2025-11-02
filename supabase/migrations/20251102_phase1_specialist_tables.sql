-- Phase 1: Specialist Tables
-- Purpose: Documents, rates, working hours for specialist onboarding
-- Date: November 2, 2025

-- ============================================================================
-- 1. SPECIALIST DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.specialist_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'license', 'certification', 'insurance', 'background_check', 'other'
  )),
  document_url TEXT NOT NULL,
  storage_path TEXT,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN (
    'pending', 'approved', 'rejected', 'expired'
  )),
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_specialist_documents_specialist_id ON public.specialist_documents(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_documents_verification_status ON public.specialist_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_specialist_documents_created_at ON public.specialist_documents(created_at DESC);

ALTER TABLE public.specialist_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "specialists_view_own"
  ON public.specialist_documents FOR SELECT
  USING (auth.uid() = specialist_id);

CREATE POLICY "specialists_insert_own"
  ON public.specialist_documents FOR INSERT
  WITH CHECK (auth.uid() = specialist_id);

CREATE POLICY "admin_view_all"
  ON public.specialist_documents FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- 2. SPECIALIST RATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.specialist_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  hourly_rate DECIMAL(10, 2) NOT NULL CHECK (hourly_rate > 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (length(currency) = 3),
  min_booking_duration INTEGER DEFAULT 30 CHECK (min_booking_duration > 0),
  max_bookings_per_day INTEGER,
  rate_type TEXT DEFAULT 'fixed' CHECK (rate_type IN ('fixed', 'variable', 'negotiable')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_specialist_rates_specialist_id ON public.specialist_rates(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_rates_is_active ON public.specialist_rates(is_active);

ALTER TABLE public.specialist_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_view_active"
  ON public.specialist_rates FOR SELECT
  USING (is_active = true);

CREATE POLICY "specialists_manage_own"
  ON public.specialist_rates FOR ALL
  USING (auth.uid() = specialist_id);

CREATE POLICY "admin_view_all"
  ON public.specialist_rates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- 3. SPECIALIST WORKING HOURS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.specialist_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  break_start TIME,
  break_end TIME,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_times CHECK (end_time > start_time),
  CONSTRAINT valid_break CHECK (
    break_start IS NULL OR break_end IS NULL OR break_end > break_start
  ),
  CONSTRAINT break_within_hours CHECK (
    break_start IS NULL OR (break_start >= start_time AND break_end <= end_time)
  )
);

CREATE INDEX IF NOT EXISTS idx_specialist_working_hours_specialist_id ON public.specialist_working_hours(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_working_hours_day_of_week ON public.specialist_working_hours(day_of_week);

ALTER TABLE public.specialist_working_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_view_available"
  ON public.specialist_working_hours FOR SELECT
  USING (is_available = true);

CREATE POLICY "specialists_manage_own"
  ON public.specialist_working_hours FOR ALL
  USING (auth.uid() = specialist_id);

CREATE POLICY "admin_view_all"
  ON public.specialist_working_hours FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.specialist_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.specialist_rates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.specialist_working_hours TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.specialist_documents IS 'License, certification, and verification documents for specialists';
COMMENT ON TABLE public.specialist_rates IS 'Hourly rates and booking constraints per specialist';
COMMENT ON TABLE public.specialist_working_hours IS 'Availability schedule: day/time, breaks, and notes';

DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Phase 1 specialist tables created';
END
$$;
