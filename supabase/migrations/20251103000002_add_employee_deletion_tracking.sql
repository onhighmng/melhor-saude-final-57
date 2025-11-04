-- ============================================
-- Migration: Add employee deletion tracking
-- Purpose: Track when employees are deleted and enforce 30-day seat availability delay
-- Date: 2025-11-03
-- ============================================

-- Add deleted_at column to company_employees table if it doesn't exist
ALTER TABLE company_employees 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add comment for clarity
COMMENT ON COLUMN company_employees.deleted_at IS 'Timestamp when employee was deleted. Seat becomes available 30 days after this date';

-- Update the get_company_seat_stats function to account for seats in the 30-day grace period
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
      -- Count active employees (not deleted or deleted less than 30 days ago)
      (SELECT COUNT(*) 
       FROM company_employees ce
       WHERE ce.company_id = p_company_id 
       AND ce.is_active = true
       AND (ce.deleted_at IS NULL OR ce.deleted_at > NOW() - INTERVAL '30 days')
      ) as active_emps,
      -- Count pending invites
      (SELECT COUNT(*) 
       FROM invites i
       WHERE i.company_id = p_company_id 
       AND i.status = 'pending'
       AND i.expires_at > NOW()
      ) as pending_invs
    FROM companies c
    WHERE c.id = p_company_id
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

-- Update comment
COMMENT ON FUNCTION get_company_seat_stats IS 'Returns comprehensive seat and session statistics for a company. Seats from deleted employees only become available 30 days after deletion.';



