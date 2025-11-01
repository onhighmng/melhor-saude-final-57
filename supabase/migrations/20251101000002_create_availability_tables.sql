-- Migration: Availability & Scheduling Tables
-- Date: 2025-11-01
-- Description: Creates tables for managing prestador availability, breaks, vacation, and scheduling
-- Related: Comprehensive Error Audit - Prestador Flows

-- ============================================================================
-- 1. PRESTADOR BREAKS TABLE
-- Manages recurring and one-time breaks in prestador schedules
-- ============================================================================

CREATE TABLE IF NOT EXISTS prestador_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,

  -- Break timing
  break_date DATE, -- NULL for recurring breaks, specific date for one-time
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- Recurrence
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_end_date DATE,

  -- Break details
  break_type TEXT CHECK (break_type IN ('lunch', 'personal', 'buffer', 'other')),
  description TEXT,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  CONSTRAINT valid_break_time CHECK (end_time > start_time),
  CONSTRAINT valid_break_recurrence CHECK (
    (is_recurring = TRUE AND day_of_week IS NOT NULL AND break_date IS NULL) OR
    (is_recurring = FALSE AND break_date IS NOT NULL)
  ),
  CONSTRAINT valid_recurrence_end CHECK (
    recurrence_end_date IS NULL OR recurrence_end_date > break_date
  )
);

CREATE INDEX idx_prestador_breaks_prestador_id ON prestador_breaks(prestador_id);
CREATE INDEX idx_prestador_breaks_date ON prestador_breaks(break_date) WHERE break_date IS NOT NULL;
CREATE INDEX idx_prestador_breaks_day_of_week ON prestador_breaks(prestador_id, day_of_week) WHERE is_recurring = TRUE;
CREATE INDEX idx_prestador_breaks_active ON prestador_breaks(prestador_id, is_active) WHERE is_active = TRUE;

COMMENT ON TABLE prestador_breaks IS 'Manages prestador breaks including recurring (daily lunch) and one-time breaks';
COMMENT ON COLUMN prestador_breaks.day_of_week IS '0 = Sunday, 1 = Monday, ..., 6 = Saturday (for recurring breaks)';
COMMENT ON COLUMN prestador_breaks.is_recurring IS 'TRUE for weekly recurring breaks (e.g., lunch every Tuesday), FALSE for one-time breaks';

-- ============================================================================
-- 2. PRESTADOR VACATION TABLE
-- Tracks prestador vacation, leave, and time off
-- ============================================================================

CREATE TABLE IF NOT EXISTS prestador_vacation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,

  -- Vacation period
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Type and reason
  leave_type TEXT NOT NULL CHECK (leave_type IN ('vacation', 'sick_leave', 'personal', 'conference', 'training', 'other')),
  reason TEXT,

  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'canceled')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Booking management
  auto_cancel_bookings BOOLEAN DEFAULT TRUE,
  bookings_canceled_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_vacation_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_approval CHECK (
    (status IN ('approved', 'rejected') AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR
    status NOT IN ('approved', 'rejected')
  )
);

CREATE INDEX idx_prestador_vacation_prestador_id ON prestador_vacation(prestador_id);
CREATE INDEX idx_prestador_vacation_dates ON prestador_vacation(prestador_id, start_date, end_date);
CREATE INDEX idx_prestador_vacation_status ON prestador_vacation(status, requested_at DESC);
CREATE INDEX idx_prestador_vacation_pending ON prestador_vacation(prestador_id, status) WHERE status = 'pending';

COMMENT ON TABLE prestador_vacation IS 'Tracks prestador time off including vacation, sick leave, and other absences';
COMMENT ON COLUMN prestador_vacation.auto_cancel_bookings IS 'If TRUE, automatically cancel all bookings during this period';

-- ============================================================================
-- 3. PRESTADOR WORKING HOURS TABLE (Enhanced)
-- Defines regular working hours for prestadores
-- ============================================================================

-- Check if prestador_availability needs enhancement or creation
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'prestador_availability') THEN
    -- Enhance existing table
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'prestador_availability' AND column_name = 'timezone') THEN
      ALTER TABLE prestador_availability ADD COLUMN timezone TEXT DEFAULT 'Europe/Lisbon';
      ALTER TABLE prestador_availability ADD COLUMN is_available BOOLEAN DEFAULT TRUE;
      ALTER TABLE prestador_availability ADD COLUMN buffer_before_minutes INTEGER DEFAULT 0;
      ALTER TABLE prestador_availability ADD COLUMN buffer_after_minutes INTEGER DEFAULT 0;
      ALTER TABLE prestador_availability ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
      ALTER TABLE prestador_availability ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
  ELSE
    -- Create new table
    CREATE TABLE prestador_availability (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      prestador_id UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,

      -- Day of week (0 = Sunday, 6 = Saturday)
      day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),

      -- Time slots
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,

      -- Timezone
      timezone TEXT NOT NULL DEFAULT 'Europe/Lisbon',

      -- Availability status
      is_available BOOLEAN NOT NULL DEFAULT TRUE,

      -- Buffer times (in minutes)
      buffer_before_minutes INTEGER DEFAULT 0 CHECK (buffer_before_minutes >= 0),
      buffer_after_minutes INTEGER DEFAULT 0 CHECK (buffer_after_minutes >= 0),

      -- Metadata
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CONSTRAINT valid_availability_time CHECK (end_time > start_time),
      CONSTRAINT unique_prestador_day_time UNIQUE (prestador_id, day_of_week, start_time, end_time)
    );

    CREATE INDEX idx_prestador_availability_prestador ON prestador_availability(prestador_id);
    CREATE INDEX idx_prestador_availability_day ON prestador_availability(prestador_id, day_of_week);
    CREATE INDEX idx_prestador_availability_active ON prestador_availability(prestador_id, is_available) WHERE is_available = TRUE;

    COMMENT ON TABLE prestador_availability IS 'Defines regular weekly working hours for prestadores';
    COMMENT ON COLUMN prestador_availability.day_of_week IS '0 = Sunday, 1 = Monday, ..., 6 = Saturday';
    COMMENT ON COLUMN prestador_availability.buffer_before_minutes IS 'Buffer time before appointments (for prep/review)';
    COMMENT ON COLUMN prestador_availability.buffer_after_minutes IS 'Buffer time after appointments (for notes/cleanup)';
  END IF;
END $$;

-- ============================================================================
-- 4. BOOKING CONFLICTS TABLE
-- Tracks and resolves scheduling conflicts
-- ============================================================================

CREATE TABLE IF NOT EXISTS booking_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,

  -- Conflicting bookings
  booking_id_1 UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  booking_id_2 UUID REFERENCES bookings(id) ON DELETE CASCADE,

  -- Conflict details
  conflict_type TEXT NOT NULL CHECK (conflict_type IN (
    'double_booking',
    'overlapping_times',
    'vacation_conflict',
    'break_conflict',
    'unavailable_time',
    'other'
  )),
  conflict_date DATE NOT NULL,
  conflict_start_time TIME NOT NULL,
  conflict_end_time TIME NOT NULL,

  -- Resolution
  status TEXT NOT NULL DEFAULT 'unresolved' CHECK (status IN ('unresolved', 'resolved', 'ignored')),
  resolution_method TEXT CHECK (resolution_method IN ('canceled_booking', 'rescheduled', 'vacation_adjusted', 'manual', 'auto_resolved')),
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  -- Detection
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  detection_method TEXT CHECK (detection_method IN ('automatic', 'user_report', 'admin_review')),

  -- Metadata
  metadata JSONB
);

CREATE INDEX idx_booking_conflicts_prestador ON booking_conflicts(prestador_id);
CREATE INDEX idx_booking_conflicts_bookings ON booking_conflicts(booking_id_1, booking_id_2);
CREATE INDEX idx_booking_conflicts_unresolved ON booking_conflicts(prestador_id, status) WHERE status = 'unresolved';
CREATE INDEX idx_booking_conflicts_date ON booking_conflicts(conflict_date, detected_at DESC);

COMMENT ON TABLE booking_conflicts IS 'Tracks scheduling conflicts and their resolution';
COMMENT ON COLUMN booking_conflicts.booking_id_2 IS 'NULL for conflicts with vacation/breaks, otherwise second conflicting booking';

-- ============================================================================
-- 5. BOOKING REMINDERS TABLE
-- Tracks reminder emails/notifications sent for bookings
-- ============================================================================

CREATE TABLE IF NOT EXISTS booking_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  -- Reminder details
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24_hours', '1_hour', 'custom')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,

  -- Delivery
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'sms', 'push', 'in_app')),
  recipient_email TEXT,
  recipient_phone TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'canceled')),
  failure_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_reminder_delivery CHECK (
    (delivery_method = 'email' AND recipient_email IS NOT NULL) OR
    (delivery_method = 'sms' AND recipient_phone IS NOT NULL) OR
    delivery_method IN ('push', 'in_app')
  )
);

CREATE INDEX idx_booking_reminders_booking ON booking_reminders(booking_id);
CREATE INDEX idx_booking_reminders_scheduled ON booking_reminders(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_booking_reminders_status ON booking_reminders(status, scheduled_for);

COMMENT ON TABLE booking_reminders IS 'Tracks reminder notifications for upcoming bookings';

-- ============================================================================
-- 6. PRESTADOR CALENDAR SYNC TABLE
-- Tracks external calendar integrations (Google Calendar, Outlook, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS prestador_calendar_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID NOT NULL UNIQUE REFERENCES prestadores(id) ON DELETE CASCADE,

  -- Integration details
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft', 'apple', 'ical')),
  calendar_id TEXT NOT NULL,
  calendar_name TEXT,

  -- OAuth tokens (encrypted)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Sync settings
  sync_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sync_direction TEXT NOT NULL DEFAULT 'two_way' CHECK (sync_direction IN ('one_way_to_provider', 'one_way_from_provider', 'two_way')),
  auto_create_events BOOLEAN DEFAULT TRUE,
  auto_block_busy_times BOOLEAN DEFAULT TRUE,

  -- Last sync
  last_synced_at TIMESTAMPTZ,
  last_sync_status TEXT CHECK (last_sync_status IN ('success', 'failed', 'partial')),
  last_sync_error TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calendar_sync_prestador ON prestador_calendar_sync(prestador_id);
CREATE INDEX idx_calendar_sync_enabled ON prestador_calendar_sync(prestador_id, sync_enabled) WHERE sync_enabled = TRUE;

COMMENT ON TABLE prestador_calendar_sync IS 'Manages external calendar integrations for prestadores';
COMMENT ON COLUMN prestador_calendar_sync.access_token_encrypted IS 'MUST be encrypted at rest using application-level encryption';

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

CREATE TRIGGER update_prestador_breaks_updated_at
    BEFORE UPDATE ON prestador_breaks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prestador_vacation_updated_at
    BEFORE UPDATE ON prestador_vacation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prestador_availability_updated_at
    BEFORE UPDATE ON prestador_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_sync_updated_at
    BEFORE UPDATE ON prestador_calendar_sync
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE prestador_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestador_vacation ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestador_calendar_sync ENABLE ROW LEVEL SECURITY;

-- prestador_breaks policies
CREATE POLICY "Prestadores can manage their own breaks"
  ON prestador_breaks FOR ALL
  USING (
    prestador_id IN (
      SELECT id FROM prestadores WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    prestador_id IN (
      SELECT id FROM prestadores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all breaks"
  ON prestador_breaks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- prestador_vacation policies
CREATE POLICY "Prestadores can view and request their own vacation"
  ON prestador_vacation FOR ALL
  USING (
    prestador_id IN (
      SELECT id FROM prestadores WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    prestador_id IN (
      SELECT id FROM prestadores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can approve/reject vacation requests"
  ON prestador_vacation FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- booking_conflicts policies
CREATE POLICY "Prestadores can view their own conflicts"
  ON booking_conflicts FOR SELECT
  USING (
    prestador_id IN (
      SELECT id FROM prestadores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all conflicts"
  ON booking_conflicts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- booking_reminders policies
CREATE POLICY "Users can view reminders for their bookings"
  ON booking_reminders FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid()
    )
  );

-- prestador_calendar_sync policies
CREATE POLICY "Prestadores can manage their own calendar sync"
  ON prestador_calendar_sync FOR ALL
  USING (
    prestador_id IN (
      SELECT id FROM prestadores WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    prestador_id IN (
      SELECT id FROM prestadores WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if prestador is available at specific date/time
CREATE OR REPLACE FUNCTION is_prestador_available(
  p_prestador_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
)
RETURNS BOOLEAN AS $$
DECLARE
  v_day_of_week INTEGER;
  v_has_working_hours BOOLEAN;
  v_has_break BOOLEAN;
  v_on_vacation BOOLEAN;
BEGIN
  -- Get day of week (0 = Sunday)
  v_day_of_week := EXTRACT(DOW FROM p_date);

  -- Check if prestador has working hours for this day
  SELECT EXISTS (
    SELECT 1 FROM prestador_availability
    WHERE prestador_id = p_prestador_id
    AND day_of_week = v_day_of_week
    AND is_available = TRUE
    AND start_time <= p_start_time
    AND end_time >= p_end_time
  ) INTO v_has_working_hours;

  IF NOT v_has_working_hours THEN
    RETURN FALSE;
  END IF;

  -- Check if there's a break during this time
  SELECT EXISTS (
    SELECT 1 FROM prestador_breaks
    WHERE prestador_id = p_prestador_id
    AND is_active = TRUE
    AND (
      (is_recurring = TRUE AND day_of_week = v_day_of_week)
      OR (is_recurring = FALSE AND break_date = p_date)
    )
    AND NOT (end_time <= p_start_time OR start_time >= p_end_time) -- Overlaps
  ) INTO v_has_break;

  IF v_has_break THEN
    RETURN FALSE;
  END IF;

  -- Check if prestador is on vacation
  SELECT EXISTS (
    SELECT 1 FROM prestador_vacation
    WHERE prestador_id = p_prestador_id
    AND status = 'approved'
    AND start_date <= p_date
    AND end_date >= p_date
  ) INTO v_on_vacation;

  IF v_on_vacation THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION is_prestador_available IS 'Checks if a prestador is available at a specific date and time, considering working hours, breaks, and vacation';

-- Get next available slot for prestador
CREATE OR REPLACE FUNCTION get_next_available_slot(
  p_prestador_id UUID,
  p_after_date DATE DEFAULT CURRENT_DATE,
  p_duration_minutes INTEGER DEFAULT 60
)
RETURNS TABLE(
  available_date DATE,
  start_time TIME,
  end_time TIME
) AS $$
DECLARE
  v_date DATE;
  v_max_date DATE;
BEGIN
  v_date := p_after_date;
  v_max_date := p_after_date + INTERVAL '30 days';

  WHILE v_date <= v_max_date LOOP
    FOR start_time, end_time IN
      SELECT pa.start_time, pa.start_time + (p_duration_minutes || ' minutes')::INTERVAL
      FROM prestador_availability pa
      WHERE pa.prestador_id = p_prestador_id
      AND pa.is_available = TRUE
      AND pa.day_of_week = EXTRACT(DOW FROM v_date)
    LOOP
      IF is_prestador_available(
        p_prestador_id,
        v_date,
        start_time,
        (start_time + (p_duration_minutes || ' minutes')::INTERVAL)::TIME
      ) THEN
        available_date := v_date;
        RETURN NEXT;
      END IF;
    END LOOP;

    v_date := v_date + 1;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_next_available_slot IS 'Finds the next available time slot for a prestador within the next 30 days';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON prestador_breaks TO service_role;
GRANT ALL ON prestador_vacation TO service_role;
GRANT ALL ON booking_conflicts TO service_role;
GRANT ALL ON booking_reminders TO service_role;
GRANT ALL ON prestador_calendar_sync TO service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

INSERT INTO admin_logs (action, admin_id, details, created_at)
VALUES (
  'migration_applied',
  NULL,
  jsonb_build_object(
    'migration', '20251101000002_create_availability_tables',
    'tables_created', ARRAY[
      'prestador_breaks',
      'prestador_vacation',
      'prestador_availability (enhanced)',
      'booking_conflicts',
      'booking_reminders',
      'prestador_calendar_sync'
    ],
    'status', 'success'
  ),
  NOW()
);
