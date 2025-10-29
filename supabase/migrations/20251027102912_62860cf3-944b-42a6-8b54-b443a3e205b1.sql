-- Function: cancel_booking_with_refund
-- Cancels a booking and refunds the session quota to the user if applicable
CREATE OR REPLACE FUNCTION cancel_booking_with_refund(
  _booking_id UUID,
  _user_id UUID,
  _company_id UUID,
  _cancellation_reason TEXT,
  _refund_quota BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _booking RECORD;
  _refund_amount INTEGER := 0;
BEGIN
  -- Get booking details with lock
  SELECT * INTO _booking
  FROM bookings
  WHERE id = _booking_id AND user_id = _user_id
  FOR UPDATE;

  -- Check if booking exists and belongs to user
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Booking not found or unauthorized'
    );
  END IF;

  -- Check if booking is already cancelled
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
    updated_at = now()
  WHERE id = _booking_id;

  -- Refund session quota if company-provided and refund is allowed
  IF _company_id IS NOT NULL AND _refund_quota = true THEN
    -- Refund to employee quota
    UPDATE company_employees
    SET 
      sessions_used = GREATEST(0, sessions_used - 1),
      updated_at = now()
    WHERE user_id = _user_id AND company_id = _company_id;

    -- Refund to company quota
    UPDATE companies
    SET 
      sessions_used = GREATEST(0, sessions_used - 1),
      updated_at = now()
    WHERE id = _company_id;

    _refund_amount := 1;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'refunded', _refund_amount > 0,
    'refund_amount', _refund_amount
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cancel_booking_with_refund(UUID, UUID, UUID, TEXT, BOOLEAN) TO authenticated;

COMMENT ON FUNCTION cancel_booking_with_refund IS 'Cancels a booking and refunds session quota based on cancellation policy';