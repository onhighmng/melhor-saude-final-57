-- Phase 5: Advanced Sessions & Operations
-- Cancellations, packages, recurring bookings, session documentation, and availability management

-- ==========================================
-- 1. BOOKING CANCELLATIONS (No Refunds)
-- ==========================================

CREATE TABLE IF NOT EXISTS booking_cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  cancelled_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL,
  cancellation_policy_applied TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_cancellations_booking_id 
  ON booking_cancellations(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_cancellations_cancelled_by 
  ON booking_cancellations(cancelled_by);
CREATE INDEX IF NOT EXISTS idx_booking_cancellations_created_at 
  ON booking_cancellations(created_at DESC);

-- RLS for booking_cancellations
ALTER TABLE booking_cancellations ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS booking_cancellations_view
  ON booking_cancellations
  FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid() OR provider_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS booking_cancellations_insert
  ON booking_cancellations
  FOR INSERT
  WITH CHECK (auth.uid() = cancelled_by);

CREATE POLICY IF NOT EXISTS booking_cancellations_admin_all
  ON booking_cancellations
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ==========================================
-- 2. BOOKING PACKAGES (Specialist Offerings)
-- ==========================================

CREATE TABLE IF NOT EXISTS booking_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  session_count INT NOT NULL CHECK (session_count > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (length(currency) = 3),
  discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0 
    CHECK (discount_percentage BETWEEN 0 AND 100),
  valid_for_days INT CHECK (valid_for_days IS NULL OR valid_for_days > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_packages_specialist_id 
  ON booking_packages(specialist_id);
CREATE INDEX IF NOT EXISTS idx_booking_packages_is_active 
  ON booking_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_booking_packages_created_at 
  ON booking_packages(created_at DESC);

-- RLS for booking_packages
ALTER TABLE booking_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS booking_packages_public_read
  ON booking_packages
  FOR SELECT
  USING (
    is_active = true OR auth.uid() = specialist_id OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS booking_packages_specialist_manage
  ON booking_packages
  FOR INSERT, UPDATE
  WITH CHECK (auth.uid() = specialist_id OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY IF NOT EXISTS booking_packages_specialist_delete
  ON booking_packages
  FOR DELETE
  USING (auth.uid() = specialist_id OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ==========================================
-- 3. RECURRING BOOKINGS
-- ==========================================

CREATE TABLE IF NOT EXISTS recurring_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  specialist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  next_booking_date DATE,
  last_generated_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT end_date_after_start CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_recurring_bookings_user_id 
  ON recurring_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_bookings_specialist_id 
  ON recurring_bookings(specialist_id);
CREATE INDEX IF NOT EXISTS idx_recurring_bookings_is_active 
  ON recurring_bookings(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_bookings_next_date 
  ON recurring_bookings(next_booking_date);
CREATE INDEX IF NOT EXISTS idx_recurring_bookings_frequency 
  ON recurring_bookings(frequency);

-- RLS for recurring_bookings
ALTER TABLE recurring_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS recurring_bookings_user_own
  ON recurring_bookings
  FOR SELECT
  USING (
    auth.uid() = user_id OR auth.uid() = specialist_id OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS recurring_bookings_user_manage
  ON recurring_bookings
  FOR INSERT, UPDATE
  WITH CHECK (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS recurring_bookings_user_delete
  ON recurring_bookings
  FOR DELETE
  USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ==========================================
-- 4. SESSION NOTES (Provider Documentation)
-- ==========================================

CREATE TABLE IF NOT EXISTS session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  notes TEXT NOT NULL,
  follow_up_actions TEXT,
  next_session_recommendation TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_notes_booking_id 
  ON session_notes(booking_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_provider_id 
  ON session_notes(provider_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_created_at 
  ON session_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_notes_updated_at 
  ON session_notes(updated_at DESC);

-- RLS for session_notes
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS session_notes_provider_own
  ON session_notes
  FOR SELECT
  USING (
    auth.uid() = provider_id OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS session_notes_provider_manage
  ON session_notes
  FOR INSERT, UPDATE
  WITH CHECK (
    auth.uid() = provider_id OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS session_notes_user_view
  ON session_notes
  FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid()
    )
  );

-- ==========================================
-- 5. MEETING RECORDINGS (Storage Metadata)
-- ==========================================

CREATE TABLE IF NOT EXISTS meeting_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  recording_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  duration_seconds INT CHECK (duration_seconds > 0),
  storage_size_bytes BIGINT CHECK (storage_size_bytes > 0),
  file_format TEXT CHECK (file_format IN ('mp4', 'webm', 'mov', 'mkv')),
  is_encrypted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  
  CONSTRAINT expiry_after_created CHECK (expires_at IS NULL OR expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_meeting_recordings_booking_id 
  ON meeting_recordings(booking_id);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_created_at 
  ON meeting_recordings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_expires_at 
  ON meeting_recordings(expires_at);

-- RLS for meeting_recordings
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS meeting_recordings_booking_users
  ON meeting_recordings
  FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid() OR provider_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS meeting_recordings_admin_all
  ON meeting_recordings
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ==========================================
-- 6. SPECIALIST AVAILABILITY EXCEPTIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS specialist_availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT false,
  reason TEXT NOT NULL CHECK (reason IN (
    'vacation', 'sick_leave', 'personal', 'training', 'conference', 'other'
  )),
  all_day BOOLEAN DEFAULT true,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT time_valid CHECK (
    all_day = true OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  )
);

CREATE INDEX IF NOT EXISTS idx_specialist_availability_exceptions_specialist_id 
  ON specialist_availability_exceptions(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_availability_exceptions_date 
  ON specialist_availability_exceptions(exception_date);
CREATE INDEX IF NOT EXISTS idx_specialist_availability_exceptions_is_available 
  ON specialist_availability_exceptions(is_available);
CREATE INDEX IF NOT EXISTS idx_specialist_availability_exceptions_future 
  ON specialist_availability_exceptions(exception_date) 
  WHERE exception_date >= CURRENT_DATE;

-- RLS for specialist_availability_exceptions
ALTER TABLE specialist_availability_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS specialist_availability_exceptions_user_own
  ON specialist_availability_exceptions
  FOR SELECT
  USING (
    auth.uid() = specialist_id OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'user', 'hr')
    )
  );

CREATE POLICY IF NOT EXISTS specialist_availability_exceptions_specialist_manage
  ON specialist_availability_exceptions
  FOR INSERT, UPDATE
  WITH CHECK (
    auth.uid() = specialist_id OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS specialist_availability_exceptions_specialist_delete
  ON specialist_availability_exceptions
  FOR DELETE
  USING (
    auth.uid() = specialist_id OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ==========================================
-- GRANT PERMISSIONS
-- ==========================================

GRANT SELECT, INSERT ON booking_cancellations TO authenticated;
GRANT SELECT ON booking_packages TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON booking_packages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON recurring_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON session_notes TO authenticated;
GRANT SELECT ON meeting_recordings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON specialist_availability_exceptions TO authenticated;

-- ==========================================
-- COMMENTS FOR DOCUMENTATION
-- ==========================================

COMMENT ON TABLE booking_cancellations IS 'Tracks booking cancellations. No refund processing by design - manual resolution only.';
COMMENT ON TABLE booking_packages IS 'Allows specialists to offer discounted multi-session packages with validity periods.';
COMMENT ON TABLE recurring_bookings IS 'Supports recurring sessions (weekly, biweekly, monthly) for ongoing treatment.';
COMMENT ON TABLE session_notes IS 'Provider notes on sessions for continuity and follow-up care planning.';
COMMENT ON TABLE meeting_recordings IS 'Metadata for recorded sessions stored in Supabase Storage with encryption.';
COMMENT ON TABLE specialist_availability_exceptions IS 'Vacation, sick leave, and other non-working periods for specialists.';
