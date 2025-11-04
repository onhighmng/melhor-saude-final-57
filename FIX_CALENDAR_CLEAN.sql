-- ============================================================================
-- CLEAN FIX: Drop everything first, then recreate
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Drop ALL existing policies and functions
-- ============================================================================

-- Drop all bookings policies
DROP POLICY IF EXISTS "users_view_own_bookings" ON bookings;
DROP POLICY IF EXISTS "authenticated_create_bookings" ON bookings;
DROP POLICY IF EXISTS "authorized_update_bookings" ON bookings;
DROP POLICY IF EXISTS "admin_delete_bookings" ON bookings;
DROP POLICY IF EXISTS "authenticated_update_bookings" ON bookings;
DROP POLICY IF EXISTS "authenticated_delete_bookings" ON bookings;
DROP POLICY IF EXISTS "authenticated_insert_bookings" ON bookings;

-- Drop functions
DROP FUNCTION IF EXISTS cancel_booking_as_specialist(UUID, TEXT);
DROP FUNCTION IF EXISTS update_meeting_link_as_specialist(UUID, TEXT);
DROP FUNCTION IF EXISTS reschedule_booking_as_specialist(UUID, DATE, TIME, TIME);
DROP FUNCTION IF EXISTS get_prestador_id_for_user(UUID);

-- ============================================================================
-- STEP 2: Create proper SELECT policy
-- ============================================================================

CREATE POLICY "users_view_own_bookings" ON bookings
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM prestadores
      WHERE prestadores.id = bookings.prestador_id
      AND prestadores.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'especialista_geral')
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr'
      AND profiles.company_id = bookings.company_id
    )
  );

-- ============================================================================
-- STEP 3: CREATE policy
-- ============================================================================

CREATE POLICY "authenticated_create_bookings" ON bookings
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- STEP 4: UPDATE policy
-- ============================================================================

CREATE POLICY "authorized_update_bookings" ON bookings
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM prestadores
      WHERE prestadores.id = bookings.prestador_id
      AND prestadores.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('especialista_geral', 'admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM prestadores
      WHERE prestadores.id = bookings.prestador_id
      AND prestadores.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('especialista_geral', 'admin')
    )
  );

-- ============================================================================
-- STEP 5: DELETE policy (admins only)
-- ============================================================================

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
-- STEP 6: Helper Function
-- ============================================================================

CREATE FUNCTION get_prestador_id_for_user(user_uuid UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM prestadores WHERE user_id = user_uuid LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_prestador_id_for_user(UUID) TO authenticated;

-- ============================================================================
-- STEP 7: Cancel Booking Function
-- ============================================================================

CREATE FUNCTION cancel_booking_as_specialist(
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
  SELECT id INTO _prestador_id FROM prestadores WHERE user_id = auth.uid();
  
  SELECT 
    (role = 'admin') AS is_admin,
    (role = 'especialista_geral') AS is_specialist
  INTO _is_admin, _is_specialist
  FROM profiles WHERE id = auth.uid();

  SELECT * INTO _booking FROM bookings WHERE id = _booking_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
  END IF;

  IF _booking.prestador_id != _prestador_id AND NOT _is_admin AND NOT _is_specialist THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  IF _booking.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already cancelled');
  END IF;

  UPDATE bookings
  SET 
    status = 'cancelled',
    cancellation_reason = COALESCE(_cancellation_reason, cancellation_reason),
    cancelled_by = auth.uid(),
    cancelled_at = now(),
    updated_at = now()
  WHERE id = _booking_id;

  IF _booking.company_id IS NOT NULL THEN
    UPDATE company_employees
    SET sessions_used = GREATEST(0, sessions_used - 1), updated_at = now()
    WHERE user_id = _booking.user_id AND company_id = _booking.company_id;

    UPDATE companies
    SET sessions_used = GREATEST(0, sessions_used - 1), updated_at = now()
    WHERE id = _booking.company_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Booking cancelled successfully');
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_booking_as_specialist(UUID, TEXT) TO authenticated;

-- ============================================================================
-- STEP 8: Update Meeting Link Function
-- ============================================================================

CREATE FUNCTION update_meeting_link_as_specialist(
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
  IF _meeting_link IS NULL OR trim(_meeting_link) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Link cannot be empty');
  END IF;

  SELECT id INTO _prestador_id FROM prestadores WHERE user_id = auth.uid();
  
  SELECT 
    (role = 'admin') AS is_admin,
    (role = 'especialista_geral') AS is_specialist
  INTO _is_admin, _is_specialist
  FROM profiles WHERE id = auth.uid();

  SELECT * INTO _booking FROM bookings WHERE id = _booking_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
  END IF;

  IF _booking.prestador_id != _prestador_id AND NOT _is_admin AND NOT _is_specialist THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  UPDATE bookings SET meeting_link = _meeting_link, updated_at = now() WHERE id = _booking_id;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Link updated successfully',
    'meeting_link', _meeting_link
  );
END;
$$;

GRANT EXECUTE ON FUNCTION update_meeting_link_as_specialist(UUID, TEXT) TO authenticated;

-- ============================================================================
-- STEP 9: Reschedule Booking Function
-- ============================================================================

CREATE FUNCTION reschedule_booking_as_specialist(
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
  SELECT id INTO _prestador_id FROM prestadores WHERE user_id = auth.uid();
  
  SELECT 
    (role = 'admin') AS is_admin,
    (role = 'especialista_geral') AS is_specialist
  INTO _is_admin, _is_specialist
  FROM profiles WHERE id = auth.uid();

  SELECT * INTO _booking FROM bookings WHERE id = _booking_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
  END IF;

  IF _booking.prestador_id != _prestador_id AND NOT _is_admin AND NOT _is_specialist THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  IF _new_end_time IS NULL THEN
    _calculated_end_time := _new_start_time + interval '1 hour';
  ELSE
    _calculated_end_time := _new_end_time;
  END IF;

  IF _booking.rescheduled_from IS NULL THEN
    UPDATE bookings SET rescheduled_from = _booking_id WHERE id = _booking_id;
  END IF;

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

-- ============================================================================
-- STEP 10: Create Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_prestadores_user_id ON prestadores(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_prestador_id ON bookings(prestador_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_cancelled_by ON bookings(cancelled_by) WHERE cancelled_by IS NOT NULL;

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check policies (should show 4)
SELECT 
  'Policies' as type,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY cmd, policyname;

-- Check functions (should show 4)
SELECT 
  'Functions' as type,
  routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%specialist%'
ORDER BY routine_name;

-- Success message
SELECT '✅ ALL DONE! The calendar buttons should now work!' as status;




