-- Create RPC function for atomic company deactivation with cascade
CREATE OR REPLACE FUNCTION deactivate_company(
  _company_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_employees_deactivated INT;
  v_bookings_cancelled INT;
BEGIN
  -- Deactivate company
  UPDATE companies
  SET is_active = false, deactivated_at = NOW()
  WHERE id = _company_id;

  -- Deactivate all employees
  WITH deactivated AS (
    UPDATE company_employees
    SET is_active = false, deactivated_at = NOW()
    WHERE company_id = _company_id
    RETURNING user_id
  )
  SELECT COUNT(*) INTO v_employees_deactivated FROM deactivated;

  -- Cancel future bookings for employees
  UPDATE bookings
  SET status = 'cancelled', 
      cancellation_reason = 'company_deactivated',
      cancelled_at = NOW()
  WHERE user_id IN (
    SELECT user_id FROM company_employees WHERE company_id = _company_id
  )
  AND scheduled_for > NOW()
  AND status IN ('scheduled', 'confirmed')
  RETURNING COUNT(*) INTO v_bookings_cancelled;

  v_result := jsonb_build_object(
    'success', true,
    'employees_deactivated', v_employees_deactivated,
    'bookings_cancelled', v_bookings_cancelled
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION deactivate_company(UUID) TO authenticated;

