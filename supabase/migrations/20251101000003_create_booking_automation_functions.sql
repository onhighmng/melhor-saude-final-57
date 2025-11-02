-- Migration: Booking Automation Functions
-- Date: 2025-11-01
-- Description: Creates RPC functions for booking conflict detection and reminder scheduling

-- ============================================================================
-- 1. DETECT BOOKING CONFLICTS
-- Automatically detects and logs conflicts when creating/updating bookings
-- ============================================================================

CREATE OR REPLACE FUNCTION detect_booking_conflicts(
  p_booking_id UUID,
  p_prestador_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
)
RETURNS JSONB AS $$
DECLARE
  v_conflicts JSONB;
  v_conflict_count INTEGER := 0;
  v_conflict_id UUID;
BEGIN
  -- Initialize conflicts array
  v_conflicts := '[]'::JSONB;

  -- 1. Check for overlapping bookings with same prestador
  FOR v_conflict_id IN
    SELECT id
    FROM bookings
    WHERE prestador_id = p_prestador_id
    AND id != p_booking_id -- Exclude the booking being checked
    AND date = p_date
    AND status NOT IN ('canceled', 'completed')
    AND NOT (time::TIME + (duration || ' minutes')::INTERVAL <= p_start_time::TIME OR time::TIME >= p_end_time::TIME)
  LOOP
    -- Log the conflict
    INSERT INTO booking_conflicts (
      prestador_id,
      booking_id_1,
      booking_id_2,
      conflict_type,
      conflict_date,
      conflict_start_time,
      conflict_end_time,
      detection_method
    ) VALUES (
      p_prestador_id,
      p_booking_id,
      v_conflict_id,
      'overlapping_times',
      p_date,
      p_start_time,
      p_end_time,
      'automatic'
    )
    ON CONFLICT DO NOTHING; -- Prevent duplicate conflict logs

    v_conflicts := v_conflicts || jsonb_build_object(
      'type', 'double_booking',
      'booking_id', v_conflict_id
    );
    v_conflict_count := v_conflict_count + 1;
  END LOOP;

  -- 2. Check for conflicts with prestador breaks
  IF EXISTS (
    SELECT 1
    FROM prestador_breaks pb
    WHERE pb.prestador_id = p_prestador_id
    AND pb.is_active = TRUE
    AND (
      -- Recurring breaks
      (pb.is_recurring = TRUE AND pb.day_of_week = EXTRACT(DOW FROM p_date))
      OR
      -- One-time breaks
      (pb.is_recurring = FALSE AND pb.break_date = p_date)
    )
    AND NOT (pb.end_time <= p_start_time OR pb.start_time >= p_end_time)
  ) THEN
    -- Log the conflict
    INSERT INTO booking_conflicts (
      prestador_id,
      booking_id_1,
      booking_id_2,
      conflict_type,
      conflict_date,
      conflict_start_time,
      conflict_end_time,
      detection_method
    ) VALUES (
      p_prestador_id,
      p_booking_id,
      NULL, -- No second booking
      'break_conflict',
      p_date,
      p_start_time,
      p_end_time,
      'automatic'
    )
    ON CONFLICT DO NOTHING;

    v_conflicts := v_conflicts || jsonb_build_object(
      'type', 'break_conflict'
    );
    v_conflict_count := v_conflict_count + 1;
  END IF;

  -- 3. Check for conflicts with vacation
  IF EXISTS (
    SELECT 1
    FROM prestador_vacation pv
    WHERE pv.prestador_id = p_prestador_id
    AND pv.status = 'approved'
    AND pv.start_date <= p_date
    AND pv.end_date >= p_date
  ) THEN
    -- Log the conflict
    INSERT INTO booking_conflicts (
      prestador_id,
      booking_id_1,
      booking_id_2,
      conflict_type,
      conflict_date,
      conflict_start_time,
      conflict_end_time,
      detection_method
    ) VALUES (
      p_prestador_id,
      p_booking_id,
      NULL,
      'vacation_conflict',
      p_date,
      p_start_time,
      p_end_time,
      'automatic'
    )
    ON CONFLICT DO NOTHING;

    v_conflicts := v_conflicts || jsonb_build_object(
      'type', 'vacation_conflict'
    );
    v_conflict_count := v_conflict_count + 1;
  END IF;

  -- 4. Check if time is outside prestador's working hours
  IF NOT EXISTS (
    SELECT 1
    FROM prestador_availability pa
    WHERE pa.prestador_id = p_prestador_id
    AND pa.is_available = TRUE
    AND pa.day_of_week = EXTRACT(DOW FROM p_date)
    AND pa.start_time <= p_start_time
    AND pa.end_time >= p_end_time
  ) THEN
    -- Log the conflict
    INSERT INTO booking_conflicts (
      prestador_id,
      booking_id_1,
      booking_id_2,
      conflict_type,
      conflict_date,
      conflict_start_time,
      conflict_end_time,
      detection_method
    ) VALUES (
      p_prestador_id,
      p_booking_id,
      NULL,
      'unavailable_time',
      p_date,
      p_start_time,
      p_end_time,
      'automatic'
    )
    ON CONFLICT DO NOTHING;

    v_conflicts := v_conflicts || jsonb_build_object(
      'type', 'outside_working_hours'
    );
    v_conflict_count := v_conflict_count + 1;
  END IF;

  -- Return conflicts
  RETURN jsonb_build_object(
    'has_conflicts', v_conflict_count > 0,
    'conflict_count', v_conflict_count,
    'conflicts', v_conflicts
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION detect_booking_conflicts IS 'Detects and logs scheduling conflicts for a booking. Returns JSONB with conflict details.';

-- ============================================================================
-- 2. SCHEDULE BOOKING REMINDERS
-- Creates reminder records for a booking
-- ============================================================================

CREATE OR REPLACE FUNCTION schedule_booking_reminders(
  p_booking_id UUID,
  p_user_email TEXT,
  p_booking_datetime TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
  v_reminder_24h TIMESTAMPTZ;
  v_reminder_1h TIMESTAMPTZ;
  v_reminders_created INTEGER := 0;
BEGIN
  -- Calculate reminder times
  v_reminder_24h := p_booking_datetime - INTERVAL '24 hours';
  v_reminder_1h := p_booking_datetime - INTERVAL '1 hour';

  -- Only schedule if booking is in the future
  IF p_booking_datetime <= NOW() THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'message', 'Booking is in the past',
      'reminders_created', 0
    );
  END IF;

  -- Schedule 24-hour reminder (only if booking is more than 24h away)
  IF v_reminder_24h > NOW() THEN
    INSERT INTO booking_reminders (
      booking_id,
      reminder_type,
      scheduled_for,
      delivery_method,
      recipient_email,
      status
    ) VALUES (
      p_booking_id,
      '24_hours',
      v_reminder_24h,
      'email',
      p_user_email,
      'pending'
    )
    ON CONFLICT DO NOTHING;

    v_reminders_created := v_reminders_created + 1;
  END IF;

  -- Schedule 1-hour reminder (only if booking is more than 1h away)
  IF v_reminder_1h > NOW() THEN
    INSERT INTO booking_reminders (
      booking_id,
      reminder_type,
      scheduled_for,
      delivery_method,
      recipient_email,
      status
    ) VALUES (
      p_booking_id,
      '1_hour',
      v_reminder_1h,
      'email',
      p_user_email,
      'pending'
    )
    ON CONFLICT DO NOTHING;

    v_reminders_created := v_reminders_created + 1;
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'reminders_created', v_reminders_created,
    'reminder_24h_at', CASE WHEN v_reminder_24h > NOW() THEN v_reminder_24h ELSE NULL END,
    'reminder_1h_at', CASE WHEN v_reminder_1h > NOW() THEN v_reminder_1h ELSE NULL END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION schedule_booking_reminders IS 'Schedules 24-hour and 1-hour reminder notifications for a booking';

-- ============================================================================
-- 3. GET PENDING REMINDERS
-- Retrieves reminders that need to be sent (for cron job)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_pending_reminders(
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
  reminder_id UUID,
  booking_id UUID,
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  prestador_name TEXT,
  booking_date DATE,
  booking_time TIME,
  pillar TEXT,
  reminder_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    br.id AS reminder_id,
    b.id AS booking_id,
    b.user_id,
    p.email AS user_email,
    p.name AS user_name,
    prest.name AS prestador_name,
    b.date AS booking_date,
    b.time AS booking_time,
    b.pillar,
    br.reminder_type
  FROM booking_reminders br
  JOIN bookings b ON br.booking_id = b.id
  JOIN profiles p ON b.user_id = p.id
  LEFT JOIN prestadores pr ON b.prestador_id = pr.id
  LEFT JOIN profiles prest ON pr.user_id = prest.id
  WHERE br.status = 'pending'
  AND br.scheduled_for <= NOW()
  AND b.status NOT IN ('canceled', 'completed')
  ORDER BY br.scheduled_for ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_pending_reminders IS 'Returns pending reminders ready to be sent (for cron job processing)';

-- ============================================================================
-- 4. MARK REMINDER AS SENT
-- Updates reminder status after successful delivery
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_reminder_sent(
  p_reminder_id UUID,
  p_success BOOLEAN DEFAULT TRUE,
  p_failure_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_success THEN
    UPDATE booking_reminders
    SET status = 'sent', sent_at = NOW()
    WHERE id = p_reminder_id;
  ELSE
    UPDATE booking_reminders
    SET status = 'failed', failure_reason = p_failure_reason
    WHERE id = p_reminder_id;
  END IF;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION mark_reminder_sent IS 'Marks a reminder as sent or failed after delivery attempt';

-- ============================================================================
-- 5. AUTO-CANCEL CONFLICTING BOOKINGS (for vacation)
-- Cancels bookings that conflict with approved vacation
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_cancel_vacation_bookings(
  p_vacation_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_vacation RECORD;
  v_canceled_count INTEGER := 0;
BEGIN
  -- Get vacation details
  SELECT prestador_id, start_date, end_date, auto_cancel_bookings
  INTO v_vacation
  FROM prestador_vacation
  WHERE id = p_vacation_id;

  IF NOT FOUND OR NOT v_vacation.auto_cancel_bookings THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'message', 'Vacation not found or auto-cancel disabled'
    );
  END IF;

  -- Cancel all bookings during vacation period
  UPDATE bookings
  SET
    status = 'canceled',
    cancelation_reason = 'Prestador on vacation',
    updated_at = NOW()
  WHERE prestador_id = v_vacation.prestador_id
  AND date BETWEEN v_vacation.start_date AND v_vacation.end_date
  AND status NOT IN ('canceled', 'completed');

  GET DIAGNOSTICS v_canceled_count = ROW_COUNT;

  -- Update vacation record with cancellation count
  UPDATE prestador_vacation
  SET bookings_canceled_count = v_canceled_count
  WHERE id = p_vacation_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'canceled_count', v_canceled_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION auto_cancel_vacation_bookings IS 'Automatically cancels bookings that conflict with approved vacation';

-- ============================================================================
-- 6. GET ADMIN SECURITY DASHBOARD STATS
-- Returns security metrics for admin dashboard
-- ============================================================================

CREATE OR REPLACE FUNCTION get_security_dashboard_stats(
  p_days INTEGER DEFAULT 7
)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
  v_start_date TIMESTAMPTZ;
BEGIN
  v_start_date := NOW() - (p_days || ' days')::INTERVAL;

  -- Build comprehensive security stats
  WITH stats AS (
    SELECT
      -- Failed login attempts
      (SELECT COUNT(*) FROM user_login_attempts WHERE success = FALSE AND attempted_at >= v_start_date) AS failed_logins,
      -- Successful logins
      (SELECT COUNT(*) FROM user_login_attempts WHERE success = TRUE AND attempted_at >= v_start_date) AS successful_logins,
      -- Account lockouts
      (SELECT COUNT(*) FROM account_lockouts WHERE locked_at >= v_start_date) AS account_lockouts,
      -- Active lockouts
      (SELECT COUNT(*) FROM account_lockouts WHERE is_active = TRUE AND unlock_at > NOW()) AS active_lockouts,
      -- Password resets
      (SELECT COUNT(*) FROM password_reset_tokens WHERE created_at >= v_start_date) AS password_resets,
      -- New devices
      (SELECT COUNT(*) FROM user_device_fingerprints WHERE first_seen_at >= v_start_date) AS new_devices,
      -- High severity security events
      (SELECT COUNT(*) FROM security_logs WHERE severity IN ('high', 'critical') AND created_at >= v_start_date) AS high_severity_events,
      -- Unresolved critical events
      (SELECT COUNT(*) FROM security_logs WHERE severity = 'critical' AND resolved_at IS NULL) AS unresolved_critical,
      -- Active sessions
      (SELECT COUNT(*) FROM user_sessions WHERE is_active = TRUE AND expires_at > NOW()) AS active_sessions
  )
  SELECT jsonb_build_object(
    'period_days', p_days,
    'failed_logins', failed_logins,
    'successful_logins', successful_logins,
    'login_success_rate', CASE WHEN (failed_logins + successful_logins) > 0
      THEN ROUND((successful_logins::NUMERIC / (failed_logins + successful_logins)) * 100, 2)
      ELSE 100 END,
    'account_lockouts', account_lockouts,
    'active_lockouts', active_lockouts,
    'password_resets', password_resets,
    'new_devices', new_devices,
    'high_severity_events', high_severity_events,
    'unresolved_critical', unresolved_critical,
    'active_sessions', active_sessions
  ) INTO v_stats
  FROM stats;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_security_dashboard_stats IS 'Returns comprehensive security metrics for admin dashboard';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION detect_booking_conflicts TO service_role;
GRANT EXECUTE ON FUNCTION schedule_booking_reminders TO service_role;
GRANT EXECUTE ON FUNCTION get_pending_reminders TO service_role;
GRANT EXECUTE ON FUNCTION mark_reminder_sent TO service_role;
GRANT EXECUTE ON FUNCTION auto_cancel_vacation_bookings TO service_role;
GRANT EXECUTE ON FUNCTION get_security_dashboard_stats TO service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

INSERT INTO admin_logs (action, admin_id, details, created_at)
VALUES (
  'migration_applied',
  NULL,
  jsonb_build_object(
    'migration', '20251101000003_create_booking_automation_functions',
    'functions_created', ARRAY[
      'detect_booking_conflicts',
      'schedule_booking_reminders',
      'get_pending_reminders',
      'mark_reminder_sent',
      'auto_cancel_vacation_bookings',
      'get_security_dashboard_stats'
    ],
    'status', 'success'
  ),
  NOW()
);
