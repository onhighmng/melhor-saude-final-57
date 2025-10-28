-- Atomic function to cancel booking and refund session quota
CREATE OR REPLACE FUNCTION cancel_booking_with_refund(
  _booking_id UUID,
  _user_id UUID,
  _company_id UUID,
  _cancellation_reason TEXT,
  _refund_quota BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Update booking status (columns already exist from migration 20250126000002)
  UPDATE bookings 
  SET 
    status = 'cancelled',
    cancellation_reason = _cancellation_reason,
    cancelled_at = NOW(),
    cancelled_by = _user_id
  WHERE id = _booking_id;

  -- Refund session quota if requested (for >24h cancellations)
  IF _refund_quota THEN
    -- Atomic decrement for company_employees
    UPDATE company_employees 
    SET sessions_used = GREATEST(sessions_used - 1, 0)
    WHERE user_id = _user_id;

    -- Atomic decrement for companies
    UPDATE companies 
    SET sessions_used = GREATEST(sessions_used - 1, 0)
    WHERE id = _company_id;
  END IF;

  v_result := jsonb_build_object(
    'success', true,
    'refunded', _refund_quota
  );

  RETURN v_result;
END;
$$;

