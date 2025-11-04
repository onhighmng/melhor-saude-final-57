-- ============================================================================
-- FIX SPECIALIST CALENDAR PERMISSIONS
-- This migration fixes all permissions for specialists to manage their sessions
-- ============================================================================

-- ============================================================================
-- STEP 1: Fix RLS Policies for Bookings
-- ============================================================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "authenticated_update_bookings" ON bookings;
DROP POLICY IF EXISTS "authenticated_delete_bookings" ON bookings;
DROP POLICY IF EXISTS "authenticated_insert_bookings" ON bookings;

-- Create proper SELECT policy (authenticated users can view their own bookings)
CREATE POLICY "users_view_own_bookings" ON bookings
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    -- Prestadores can view bookings assigned to them
    EXISTS (
      SELECT 1 FROM prestadores
      WHERE prestadores.id = bookings.prestador_id
      AND prestadores.user_id = auth.uid()
    )
    OR
    -- Admins can view all bookings
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    -- Especialistas gerais can view all bookings
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'especialista_geral'
    )
    OR
    -- HR from same company can view bookings
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr'
      AND profiles.company_id = bookings.company_id
    )
  );

-- CREATE policy for authenticated users
CREATE POLICY "authenticated_create_bookings" ON bookings
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- UPDATE policy: users, prestadores, and specialists can update bookings
CREATE POLICY "authorized_update_bookings" ON bookings
  FOR UPDATE
  USING (
    -- User can update their own bookings
    auth.uid() = user_id
    OR
    -- Prestador assigned to the booking can update it
    EXISTS (
      SELECT 1 FROM prestadores
      WHERE prestadores.id = bookings.prestador_id
      AND prestadores.user_id = auth.uid()
    )
    OR
    -- Specialists can update bookings
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('especialista_geral', 'admin')
    )
  )
  WITH CHECK (
    -- Same conditions for WITH CHECK
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM prestadores
      WHERE prestadores.id = bookings.prestador_id
      AND prestadores.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('especialista_geral', 'admin')
    )
  );

-- DELETE policy: only admins can hard delete
CREATE POLICY "admin_delete_bookings" ON bookings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- STEP 2: Create Helper Functions for Specialists
-- ============================================================================

-- Function to get prestador_id from user_id
CREATE OR REPLACE FUNCTION get_prestador_id_for_user(user_uuid UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM prestadores WHERE user_id = user_uuid LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_prestador_id_for_user(UUID) TO authenticated;

-- ============================================================================
-- STEP 3: Cancel Booking Function for Specialists/Prestadores
-- ============================================================================

CREATE OR REPLACE FUNCTION cancel_booking_as_specialist(
  _booking_id UUID,
  _cancellation_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _booking RECORD;
  _prestador_id UUID;
  _is_admin BOOLEAN;
  _is_specialist BOOLEAN;
BEGIN
  -- Get the prestador_id for the current user
  SELECT id INTO _prestador_id
  FROM prestadores
  WHERE user_id = auth.uid();
  
  -- Check if user is admin or specialist
  SELECT 
    (role = 'admin') AS is_admin,
    (role = 'especialista_geral') AS is_specialist
  INTO _is_admin, _is_specialist
  FROM profiles
  WHERE id = auth.uid();

  -- Get booking details
  SELECT * INTO _booking
  FROM bookings
  WHERE id = _booking_id;

  -- Check if booking exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Booking not found'
    );
  END IF;

  -- Check authorization: must be assigned prestador, admin, or specialist
  IF _booking.prestador_id != _prestador_id AND NOT _is_admin AND NOT _is_specialist THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to cancel this booking'
    );
  END IF;

  -- Check if already cancelled
  IF _booking.status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Booking already cancelled'
    );
  END IF;

  -- Update booking status
  UPDATE bookings
  SET 
    status = 'cancelled',
    cancellation_reason = COALESCE(_cancellation_reason, cancellation_reason),
    cancelled_by = auth.uid(),
    cancelled_at = now(),
    updated_at = now()
  WHERE id = _booking_id;

  -- Refund session quota if applicable
  IF _booking.company_id IS NOT NULL THEN
    -- Refund to employee
    UPDATE company_employees
    SET 
      sessions_used = GREATEST(0, sessions_used - 1),
      updated_at = now()
    WHERE user_id = _booking.user_id 
      AND company_id = _booking.company_id;

    -- Refund to company
    UPDATE companies
    SET 
      sessions_used = GREATEST(0, sessions_used - 1),
      updated_at = now()
    WHERE id = _booking.company_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Booking cancelled successfully'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_booking_as_specialist(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION cancel_booking_as_specialist IS 'Allows specialists and prestadores to cancel bookings assigned to them';

-- ============================================================================
-- STEP 4: Update Meeting Link Function
-- ============================================================================

CREATE OR REPLACE FUNCTION update_meeting_link_as_specialist(
  _booking_id UUID,
  _meeting_link TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _booking RECORD;
  _prestador_id UUID;
  _is_admin BOOLEAN;
  _is_specialist BOOLEAN;
BEGIN
  -- Validate meeting link
  IF _meeting_link IS NULL OR trim(_meeting_link) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Meeting link cannot be empty'
    );
  END IF;

  -- Get the prestador_id for the current user
  SELECT id INTO _prestador_id
  FROM prestadores
  WHERE user_id = auth.uid();
  
  -- Check if user is admin or specialist
  SELECT 
    (role = 'admin') AS is_admin,
    (role = 'especialista_geral') AS is_specialist
  INTO _is_admin, _is_specialist
  FROM profiles
  WHERE id = auth.uid();

  -- Get booking details
  SELECT * INTO _booking
  FROM bookings
  WHERE id = _booking_id;

  -- Check if booking exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Booking not found'
    );
  END IF;

  -- Check authorization
  IF _booking.prestador_id != _prestador_id AND NOT _is_admin AND NOT _is_specialist THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to update this booking'
    );
  END IF;

  -- Update meeting link
  UPDATE bookings
  SET 
    meeting_link = _meeting_link,
    updated_at = now()
  WHERE id = _booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Meeting link updated successfully',
    'meeting_link', _meeting_link
  );
END;
$$;

GRANT EXECUTE ON FUNCTION update_meeting_link_as_specialist(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION update_meeting_link_as_specialist IS 'Allows specialists and prestadores to update meeting links for their assigned bookings';

-- ============================================================================
-- STEP 5: Reschedule Booking Function
-- ============================================================================

CREATE OR REPLACE FUNCTION reschedule_booking_as_specialist(
  _booking_id UUID,
  _new_booking_date DATE,
  _new_start_time TIME,
  _new_end_time TIME DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _booking RECORD;
  _prestador_id UUID;
  _is_admin BOOLEAN;
  _is_specialist BOOLEAN;
  _calculated_end_time TIME;
BEGIN
  -- Get the prestador_id for the current user
  SELECT id INTO _prestador_id
  FROM prestadores
  WHERE user_id = auth.uid();
  
  -- Check if user is admin or specialist
  SELECT 
    (role = 'admin') AS is_admin,
    (role = 'especialista_geral') AS is_specialist
  INTO _is_admin, _is_specialist
  FROM profiles
  WHERE id = auth.uid();

  -- Get booking details
  SELECT * INTO _booking
  FROM bookings
  WHERE id = _booking_id;

  -- Check if booking exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Booking not found'
    );
  END IF;

  -- Check authorization
  IF _booking.prestador_id != _prestador_id AND NOT _is_admin AND NOT _is_specialist THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to reschedule this booking'
    );
  END IF;

  -- Calculate end time if not provided (assume 1 hour session)
  IF _new_end_time IS NULL THEN
    _calculated_end_time := _new_start_time + interval '1 hour';
  ELSE
    _calculated_end_time := _new_end_time;
  END IF;

  -- Store the original scheduled time if not already rescheduled
  IF _booking.rescheduled_from IS NULL THEN
    UPDATE bookings
    SET rescheduled_from = _booking_id
    WHERE id = _booking_id;
  END IF;

  -- Update booking with new date and time
  UPDATE bookings
  SET 
    booking_date = _new_booking_date,
    start_time = _new_start_time,
    end_time = _calculated_end_time,
    rescheduled_at = now(),
    updated_at = now()
  WHERE id = _booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Booking rescheduled successfully',
    'new_date', _new_booking_date,
    'new_time', _new_start_time
  );
END;
$$;

GRANT EXECUTE ON FUNCTION reschedule_booking_as_specialist(UUID, DATE, TIME, TIME) TO authenticated;

COMMENT ON FUNCTION reschedule_booking_as_specialist IS 'Allows specialists and prestadores to reschedule bookings assigned to them';

-- ============================================================================
-- STEP 6: Create Indexes for Performance
-- ============================================================================

-- Index for prestador lookups by user_id
CREATE INDEX IF NOT EXISTS idx_prestadores_user_id ON prestadores(user_id);

-- Index for booking lookups by prestador_id
CREATE INDEX IF NOT EXISTS idx_bookings_prestador_id ON bookings(prestador_id);

-- Index for booking status
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Index for cancelled bookings
CREATE INDEX IF NOT EXISTS idx_bookings_cancelled_by ON bookings(cancelled_by) WHERE cancelled_by IS NOT NULL;

-- ============================================================================
-- STEP 7: Verification Query
-- ============================================================================

-- Run this to verify the setup:
/*
SELECT 
  'RLS Policies' as check_type,
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY cmd, policyname;

-- Check functions exist
SELECT 
  'Functions' as check_type,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'cancel_booking_as_specialist',
    'update_meeting_link_as_specialist',
    'reschedule_booking_as_specialist',
    'get_prestador_id_for_user'
  )
ORDER BY routine_name;
*/





