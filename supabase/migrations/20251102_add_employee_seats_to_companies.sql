-- ============================================
-- Migration: Add employee seats tracking to companies
-- Purpose: Allow companies to generate access codes based on subscription limits
-- Date: 2025-11-02
-- ============================================

-- Add employee_seats column to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS employee_seats INTEGER DEFAULT 50 CHECK (employee_seats >= 0);

-- Add comments for clarity
COMMENT ON COLUMN companies.employee_seats IS 'Maximum number of employee seats/accounts allowed by subscription package';
COMMENT ON COLUMN companies.sessions_allocated IS 'Total therapy sessions allocated to the company (pool of sessions)';
COMMENT ON COLUMN companies.sessions_used IS 'Total therapy sessions used by all employees';

-- Create or replace function to get company seat statistics
CREATE OR REPLACE FUNCTION get_company_seat_stats(p_company_id UUID)
RETURNS TABLE (
  employee_seats INTEGER,
  active_employees INTEGER,
  pending_invites INTEGER,
  total_used_seats INTEGER,
  available_seats INTEGER,
  sessions_allocated INTEGER,
  sessions_used INTEGER,
  sessions_available INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      c.employee_seats as total_seats,
      c.sessions_allocated,
      c.sessions_used,
      COUNT(DISTINCT ce.user_id) FILTER (WHERE ce.user_id IS NOT NULL)::INTEGER as active_emps,
      COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'pending' AND i.role = 'user')::INTEGER as pending_invs
    FROM companies c
    LEFT JOIN company_employees ce ON ce.company_id = c.id
    LEFT JOIN invites i ON i.company_id = c.id 
    WHERE c.id = p_company_id
    GROUP BY c.id, c.employee_seats, c.sessions_allocated, c.sessions_used
  )
  SELECT 
    COALESCE(s.total_seats, 50)::INTEGER,
    COALESCE(s.active_emps, 0)::INTEGER,
    COALESCE(s.pending_invs, 0)::INTEGER,
    (COALESCE(s.active_emps, 0) + COALESCE(s.pending_invs, 0))::INTEGER as total_used,
    (COALESCE(s.total_seats, 50) - (COALESCE(s.active_emps, 0) + COALESCE(s.pending_invs, 0)))::INTEGER as available,
    COALESCE(s.sessions_allocated, 0)::INTEGER,
    COALESCE(s.sessions_used, 0)::INTEGER,
    (COALESCE(s.sessions_allocated, 0) - COALESCE(s.sessions_used, 0))::INTEGER as sessions_avail
  FROM stats s;
  
  -- If no company found, return default values
  IF NOT FOUND THEN
    RETURN QUERY SELECT 50, 0, 0, 0, 50, 0, 0, 0;
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_company_seat_stats(UUID) TO authenticated;

-- Update existing companies to have a default of 50 seats if not set
UPDATE companies 
SET employee_seats = 50 
WHERE employee_seats IS NULL;

-- Create index for better performance on company lookups
CREATE INDEX IF NOT EXISTS idx_company_employees_lookup ON company_employees(company_id, user_id);
CREATE INDEX IF NOT EXISTS idx_invites_company_status ON invites(company_id, status) WHERE status = 'pending';

-- Add function to validate if company can generate more codes
CREATE OR REPLACE FUNCTION can_generate_invite_code(p_company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available_seats INTEGER;
BEGIN
  SELECT available_seats INTO v_available_seats
  FROM get_company_seat_stats(p_company_id);
  
  RETURN COALESCE(v_available_seats, 0) > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION can_generate_invite_code(UUID) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION get_company_seat_stats IS 'Returns comprehensive seat and session statistics for a company';
COMMENT ON FUNCTION can_generate_invite_code IS 'Checks if company has available seats to generate more invite codes';

