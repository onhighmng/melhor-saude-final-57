-- Migration: Fix Booking Data Synchronization Issues
-- Date: 2025-11-03
-- Purpose: Add triggers for notifications, quota management, and indexes for performance

-- =====================================================
-- 1. ADD INDEXES FOR BETTER QUERY PERFORMANCE
-- =====================================================

-- Index for booking_date queries (used frequently for fetching user sessions)
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);

-- Composite index for user-specific date queries
CREATE INDEX IF NOT EXISTS idx_bookings_user_date ON bookings(user_id, booking_date);

-- Index for status queries (used to filter future vs past sessions)
CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON bookings(status, booking_date);

-- =====================================================
-- 2. NOTIFICATION TRIGGER FOR NEW BOOKINGS
-- =====================================================

-- Function to create notification when booking is created
CREATE OR REPLACE FUNCTION notify_booking_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider_name TEXT;
  v_booking_date_formatted TEXT;
BEGIN
  -- Get provider name for the notification message
  SELECT name INTO v_provider_name
  FROM prestadores
  WHERE id = NEW.prestador_id;

  -- Format the booking date
  v_booking_date_formatted := TO_CHAR(NEW.booking_date, 'DD/MM/YYYY');

  -- Create notification for the user
  INSERT INTO notifications (
    user_id, 
    type, 
    title, 
    message, 
    related_booking_id, 
    priority,
    metadata
  )
  VALUES (
    NEW.user_id,
    'booking_confirmed',
    'Sessão Agendada',
    'A sua sessão com ' || COALESCE(v_provider_name, 'o prestador') || 
    ' foi agendada para ' || v_booking_date_formatted || ' às ' || 
    TO_CHAR(NEW.start_time, 'HH24:MI') || '.',
    NEW.id,
    'high',
    jsonb_build_object(
      'booking_id', NEW.id,
      'prestador_id', NEW.prestador_id,
      'booking_date', NEW.booking_date,
      'start_time', NEW.start_time
    )
  );

  RETURN NEW;
END;
$$;

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS booking_notification_trigger ON bookings;

CREATE TRIGGER booking_notification_trigger
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_created();

-- =====================================================
-- 3. QUOTA MANAGEMENT TRIGGER FOR SESSION COMPLETION
-- =====================================================

-- Function to update quota when session is completed
CREATE OR REPLACE FUNCTION update_quota_on_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only increment quota if status changed TO 'completed' (and wasn't already completed)
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Increment employee sessions_used
    IF NEW.user_id IS NOT NULL THEN
      UPDATE company_employees 
      SET 
        sessions_used = sessions_used + 1,
        updated_at = NOW()
      WHERE user_id = NEW.user_id
        AND company_id = NEW.company_id;
    END IF;
    
    -- Increment company sessions_used
    IF NEW.company_id IS NOT NULL THEN
      UPDATE companies 
      SET 
        sessions_used = sessions_used + 1,
        updated_at = NOW()
      WHERE id = NEW.company_id;
    END IF;

    -- Create completion notification
    INSERT INTO notifications (
      user_id, 
      type, 
      title, 
      message, 
      related_booking_id, 
      priority
    )
    VALUES (
      NEW.user_id,
      'session_completed',
      'Sessão Concluída',
      'A sua sessão foi marcada como concluída. Por favor, avalie a sua experiência.',
      NEW.id,
      'normal'
    );
  END IF;

  -- Refund quota if session is cancelled (and wasn't previously cancelled)
  IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status NOT IN ('cancelled', 'completed')) THEN
    
    -- Only refund if the booking was previously confirmed/scheduled (not if it was just pending)
    IF OLD.status IN ('confirmed', 'scheduled') THEN
      
      -- Decrement employee sessions_used (but don't go below 0)
      IF NEW.user_id IS NOT NULL THEN
        UPDATE company_employees 
        SET 
          sessions_used = GREATEST(0, sessions_used - 1),
          updated_at = NOW()
        WHERE user_id = NEW.user_id
          AND company_id = NEW.company_id;
      END IF;
      
      -- Decrement company sessions_used (but don't go below 0)
      IF NEW.company_id IS NOT NULL THEN
        UPDATE companies 
        SET 
          sessions_used = GREATEST(0, sessions_used - 1),
          updated_at = NOW()
        WHERE id = NEW.company_id;
      END IF;
    END IF;

    -- Create cancellation notification
    INSERT INTO notifications (
      user_id, 
      type, 
      title, 
      message, 
      related_booking_id, 
      priority
    )
    VALUES (
      NEW.user_id,
      'booking_cancelled',
      'Sessão Cancelada',
      'A sua sessão foi cancelada.' || 
      CASE WHEN OLD.status IN ('confirmed', 'scheduled') 
           THEN ' A sessão foi devolvida à sua quota.' 
           ELSE '' 
      END,
      NEW.id,
      'normal'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS quota_management_trigger ON bookings;

CREATE TRIGGER quota_management_trigger
  AFTER INSERT OR UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_quota_on_completion();

-- =====================================================
-- 4. GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION notify_booking_created() TO authenticated;
GRANT EXECUTE ON FUNCTION update_quota_on_completion() TO authenticated;

-- =====================================================
-- 5. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION notify_booking_created() IS 
  'Automatically creates a notification when a new booking is inserted';

COMMENT ON FUNCTION update_quota_on_completion() IS 
  'Automatically updates quota counters when booking status changes to completed or cancelled';

COMMENT ON TRIGGER booking_notification_trigger ON bookings IS 
  'Creates notification for user when booking is created';

COMMENT ON TRIGGER quota_management_trigger ON bookings IS 
  'Manages quota increments/decrements based on booking status changes';





