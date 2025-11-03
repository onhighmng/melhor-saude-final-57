-- ============================================================================
-- ALL RPC FUNCTIONS - COMPLETE SET
-- Melhor Saúde Platform - Database Functions
-- Run this manually in Supabase SQL Editor AFTER DATABASE_VERIFICATION_AND_FIXES.sql
-- ============================================================================

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function: is_admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;

-- ============================================================================
-- Function: has_role (uuid, text)
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

GRANT EXECUTE ON FUNCTION has_role(UUID, TEXT) TO authenticated, anon;

-- ============================================================================
-- Function: get_user_primary_role
CREATE OR REPLACE FUNCTION get_user_primary_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Check for admin first (highest priority)
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user_id AND role = 'admin') THEN
    RETURN 'admin';
  END IF;
  
  -- Then check for specialist roles
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user_id AND role = 'especialista_geral') THEN
    RETURN 'especialista_geral';
  END IF;
  
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user_id AND role = 'specialist') THEN
    RETURN 'specialist';
  END IF;
  
  -- Then HR
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user_id AND role = 'hr') THEN
    RETURN 'hr';
  END IF;
  
  -- Then prestador
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user_id AND role = 'prestador') THEN
    RETURN 'prestador';
  END IF;
  
  -- Default to user
  RETURN 'user';
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_primary_role(UUID) TO authenticated, anon;

-- ============================================================================
-- ADMIN FUNCTIONS
-- ============================================================================

-- Function: promote_to_admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found with email: ' || user_email);
  END IF;

  -- Update profile role
  UPDATE profiles SET role = 'admin' WHERE id = target_user_id;

  -- Insert or update user_roles
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN json_build_object('success', true, 'message', 'User promoted to admin successfully', 'user_id', target_user_id, 'email', user_email);
END;
$$;

GRANT EXECUTE ON FUNCTION promote_to_admin(TEXT) TO postgres, service_role, authenticated;

-- ============================================================================
-- Function: assign_role_to_user
CREATE OR REPLACE FUNCTION assign_role_to_user(p_email TEXT, p_role TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN 'ERROR: User not found with email ' || p_email;
  END IF;
  
  -- Validate role
  IF p_role NOT IN ('user', 'admin', 'hr', 'prestador', 'specialist', 'especialista_geral') THEN
    RETURN 'ERROR: Invalid role ' || p_role;
  END IF;
  
  -- Update profile
  UPDATE profiles SET role = p_role WHERE id = v_user_id;
  
  -- Insert into user_roles
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, p_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN 'SUCCESS: Role ' || p_role || ' assigned to ' || p_email;
END;
$$;

GRANT EXECUTE ON FUNCTION assign_role_to_user(TEXT, TEXT) TO postgres, service_role, authenticated;

-- ============================================================================
-- INVITE CODE FUNCTIONS
-- ============================================================================

-- Function: generate_access_code
CREATE OR REPLACE FUNCTION generate_access_code(
  p_user_type TEXT,
  p_company_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_expires_days INTEGER DEFAULT 30
)
RETURNS TABLE(invite_code TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMPTZ;
  v_role TEXT;
  v_sessions INTEGER;
BEGIN
  -- Validate user_type
  IF p_user_type NOT IN ('user', 'hr', 'prestador', 'specialist', 'admin') THEN
    RAISE EXCEPTION 'Invalid user_type: %', p_user_type;
  END IF;

  -- Set role based on user_type
  v_role := CASE 
    WHEN p_user_type = 'specialist' THEN 'especialista_geral'
    ELSE p_user_type
  END;

  -- Generate unique code
  v_code := upper(substring(md5(random()::text) from 1 for 8));
  v_expires_at := now() + (p_expires_days || ' days')::interval;

  -- Default sessions allocation
  v_sessions := CASE 
    WHEN p_user_type = 'user' THEN 5
    WHEN p_user_type = 'hr' THEN 0
    WHEN p_user_type = 'prestador' THEN 0
    WHEN p_user_type = 'specialist' THEN 0
    ELSE 0
  END;

  -- Insert invite
  INSERT INTO invites (
    invite_code,
    company_id,
    role,
    user_type,
    status,
    sessions_allocated,
    expires_at,
    invited_by,
    metadata,
    created_at
  ) VALUES (
    v_code,
    p_company_id,
    v_role,
    p_user_type,
    'pending',
    v_sessions,
    v_expires_at,
    auth.uid(),
    p_metadata,
    now()
  );

  RETURN QUERY SELECT v_code, v_expires_at;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER) TO authenticated;

-- ============================================================================
-- Function: validate_access_code
CREATE OR REPLACE FUNCTION validate_access_code(p_code TEXT)
RETURNS TABLE(
  id UUID,
  user_type TEXT,
  role TEXT,
  company_id UUID,
  company_name TEXT,
  expires_at TIMESTAMPTZ,
  status TEXT,
  metadata JSONB,
  sessions_allocated INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.user_type,
    i.role,
    i.company_id,
    c.name as company_name,
    i.expires_at,
    i.status,
    i.metadata,
    i.sessions_allocated
  FROM invites i
  LEFT JOIN companies c ON c.id = i.company_id
  WHERE i.invite_code = p_code
    AND i.status = 'pending'
    AND (i.expires_at IS NULL OR i.expires_at > now());
END;
$$;

GRANT EXECUTE ON FUNCTION validate_access_code(TEXT) TO authenticated, anon;

-- ============================================================================
-- Function: promote_user_from_code
CREATE OR REPLACE FUNCTION promote_user_from_code(p_user_id UUID, p_invite_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite RECORD;
  v_result JSON;
BEGIN
  -- Get invite details
  SELECT * INTO v_invite
  FROM invites
  WHERE invite_code = p_invite_code
    AND status = 'pending'
    AND (expires_at IS NULL OR expires_at > now());

  IF v_invite IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid or expired invite code'
    );
  END IF;

  -- Update profile
  UPDATE profiles
  SET 
    role = v_invite.role,
    company_id = v_invite.company_id,
    updated_at = now()
  WHERE id = p_user_id;

  -- Add role to user_roles
  INSERT INTO user_roles (user_id, role)
  VALUES (p_user_id, v_invite.role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- If company employee, create company_employees record
  IF v_invite.company_id IS NOT NULL AND v_invite.user_type = 'user' THEN
    INSERT INTO company_employees (
      company_id,
      user_id,
      sessions_allocated,
      sessions_used,
      is_active
    ) VALUES (
      v_invite.company_id,
      p_user_id,
      v_invite.sessions_allocated,
      0,
      true
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- Mark invite as accepted
  UPDATE invites
  SET 
    status = 'accepted',
    accepted_at = now()
  WHERE id = v_invite.id;

  RETURN json_build_object(
    'success', true,
    'role', v_invite.role,
    'company_id', v_invite.company_id,
    'sessions_allocated', v_invite.sessions_allocated
  );
END;
$$;

GRANT EXECUTE ON FUNCTION promote_user_from_code(UUID, TEXT) TO authenticated;

-- ============================================================================
-- Function: can_generate_invite_code
CREATE OR REPLACE FUNCTION can_generate_invite_code(p_company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company RECORD;
  v_active_employees INTEGER;
  v_pending_invites INTEGER;
BEGIN
  -- Get company details
  SELECT * INTO v_company FROM companies WHERE id = p_company_id;
  
  IF v_company IS NULL THEN
    RETURN false;
  END IF;

  -- Count active employees
  SELECT COUNT(*) INTO v_active_employees
  FROM company_employees
  WHERE company_id = p_company_id AND is_active = true;

  -- Count pending invites
  SELECT COUNT(*) INTO v_pending_invites
  FROM invites
  WHERE company_id = p_company_id 
    AND status = 'pending'
    AND (expires_at IS NULL OR expires_at > now());

  -- Check if total (active + pending) is less than employee_seats
  RETURN (v_active_employees + v_pending_invites) < COALESCE(v_company.employee_seats, 50);
END;
$$;

GRANT EXECUTE ON FUNCTION can_generate_invite_code(UUID) TO authenticated;

-- ============================================================================
-- BOOKING FUNCTIONS
-- ============================================================================

-- Function: book_session_with_quota_check
CREATE OR REPLACE FUNCTION book_session_with_quota_check(
  _user_id UUID,
  _prestador_id UUID,
  _booking_date DATE,
  _start_time TIME,
  _end_time TIME,
  _pillar_specialties TEXT[],
  _session_type TEXT,
  _topic TEXT DEFAULT NULL,
  _meeting_type TEXT DEFAULT 'virtual'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_company_employee RECORD;
  v_booking_id UUID;
BEGIN
  -- Get company employee record
  SELECT * INTO v_company_employee
  FROM company_employees
  WHERE user_id = _user_id AND is_active = true
  LIMIT 1;

  -- Check if user has sessions available
  IF v_company_employee IS NULL THEN
    RAISE EXCEPTION 'User is not an active company employee';
  END IF;

  IF (v_company_employee.sessions_allocated - v_company_employee.sessions_used) <= 0 THEN
    RAISE EXCEPTION 'No sessions available. Please contact your HR department.';
  END IF;

  -- Create booking
  INSERT INTO bookings (
    user_id,
    prestador_id,
    company_id,
    booking_date,
    start_time,
    end_time,
    pillar_specialties,
    session_type,
    topic,
    meeting_type,
    status,
    scheduled_at
  ) VALUES (
    _user_id,
    _prestador_id,
    v_company_employee.company_id,
    _booking_date,
    _start_time,
    _end_time,
    _pillar_specialties,
    _session_type,
    _topic,
    _meeting_type,
    'pending',
    (_booking_date::text || ' ' || _start_time::text)::timestamptz
  ) RETURNING id INTO v_booking_id;

  -- Increment sessions_used
  UPDATE company_employees
  SET 
    sessions_used = sessions_used + 1,
    updated_at = now()
  WHERE id = v_company_employee.id;

  -- Update company totals
  UPDATE companies
  SET 
    sessions_used = sessions_used + 1,
    updated_at = now()
  WHERE id = v_company_employee.company_id;

  RETURN v_booking_id;
END;
$$;

GRANT EXECUTE ON FUNCTION book_session_with_quota_check(UUID, UUID, DATE, TIME, TIME, TEXT[], TEXT, TEXT, TEXT) TO authenticated;

-- ============================================================================
-- Function: cancel_booking_with_refund
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
AS $$
DECLARE
  v_booking RECORD;
  v_result JSONB;
BEGIN
  -- Get booking details
  SELECT * INTO v_booking FROM bookings WHERE id = _booking_id;

  IF v_booking IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Booking not found');
  END IF;

  IF v_booking.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Booking already cancelled');
  END IF;

  -- Update booking status
  UPDATE bookings
  SET 
    status = 'cancelled',
    cancellation_reason = _cancellation_reason,
    cancelled_by = _user_id,
    cancelled_at = now(),
    updated_at = now()
  WHERE id = _booking_id;

  -- Refund quota if requested
  IF _refund_quota THEN
    -- Refund to employee
    UPDATE company_employees
    SET 
      sessions_used = GREATEST(sessions_used - 1, 0),
      updated_at = now()
    WHERE user_id = _user_id AND company_id = _company_id;

    -- Refund to company
    UPDATE companies
    SET 
      sessions_used = GREATEST(sessions_used - 1, 0),
      updated_at = now()
    WHERE id = _company_id;

    v_result := jsonb_build_object(
      'success', true,
      'message', 'Booking cancelled and quota refunded',
      'refunded', true
    );
  ELSE
    v_result := jsonb_build_object(
      'success', true,
      'message', 'Booking cancelled without refund',
      'refunded', false
    );
  END IF;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_booking_with_refund(UUID, UUID, UUID, TEXT, BOOLEAN) TO authenticated;

-- ============================================================================
-- Function: complete_booking_session
CREATE OR REPLACE FUNCTION complete_booking_session(
  p_booking_id UUID,
  p_notes TEXT,
  p_rating INTEGER DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
BEGIN
  -- Get booking
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;

  IF v_booking IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Booking not found');
  END IF;

  -- Update booking
  UPDATE bookings
  SET 
    status = 'completed',
    notes = p_notes,
    rating = p_rating,
    updated_at = now()
  WHERE id = p_booking_id;

  -- Update prestador performance
  UPDATE prestadores
  SET 
    total_sessions = total_sessions + 1
  WHERE id = v_booking.prestador_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Session completed successfully'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION complete_booking_session(UUID, TEXT, INTEGER) TO authenticated;

-- ============================================================================
-- Function: get_provider_availability
CREATE OR REPLACE FUNCTION get_provider_availability(
  _prestador_id UUID,
  _date DATE,
  _start_time TIME,
  _end_time TIME
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
AS $$
BEGIN
  -- Check if provider has any conflicting bookings
  RETURN NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE prestador_id = _prestador_id
      AND booking_date = _date
      AND status IN ('pending', 'confirmed')
      AND (
        (start_time, end_time) OVERLAPS (_start_time, _end_time)
      )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_provider_availability(UUID, DATE, TIME, TIME) TO authenticated, anon;

-- ============================================================================
-- ANALYTICS FUNCTIONS
-- ============================================================================

-- Function: get_company_analytics
CREATE OR REPLACE FUNCTION get_company_analytics(_company_id UUID)
RETURNS TABLE(
  total_employees BIGINT,
  active_employees BIGINT,
  sessions_allocated INTEGER,
  sessions_used INTEGER,
  sessions_remaining INTEGER,
  total_bookings BIGINT,
  completed_bookings BIGINT,
  cancelled_bookings BIGINT,
  avg_rating NUMERIC,
  utilization_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM company_employees WHERE company_id = _company_id)::BIGINT as total_employees,
    (SELECT COUNT(*) FROM company_employees WHERE company_id = _company_id AND is_active = true)::BIGINT as active_employees,
    COALESCE(c.sessions_allocated, 0) as sessions_allocated,
    COALESCE(c.sessions_used, 0) as sessions_used,
    COALESCE(c.sessions_allocated - c.sessions_used, 0) as sessions_remaining,
    (SELECT COUNT(*) FROM bookings WHERE company_id = _company_id)::BIGINT as total_bookings,
    (SELECT COUNT(*) FROM bookings WHERE company_id = _company_id AND status = 'completed')::BIGINT as completed_bookings,
    (SELECT COUNT(*) FROM bookings WHERE company_id = _company_id AND status = 'cancelled')::BIGINT as cancelled_bookings,
    (SELECT COALESCE(AVG(rating), 0) FROM bookings WHERE company_id = _company_id AND rating IS NOT NULL) as avg_rating,
    CASE 
      WHEN c.sessions_allocated > 0 THEN (c.sessions_used::NUMERIC / c.sessions_allocated::NUMERIC * 100)
      ELSE 0 
    END as utilization_rate
  FROM companies c
  WHERE c.id = _company_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_company_analytics(UUID) TO authenticated;

-- ============================================================================
-- Function: get_company_seat_stats
CREATE OR REPLACE FUNCTION get_company_seat_stats(p_company_id UUID)
RETURNS TABLE(
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
  SELECT
    COALESCE(c.employee_seats, 50) as employee_seats,
    (SELECT COUNT(*)::INTEGER FROM company_employees WHERE company_id = p_company_id AND is_active = true) as active_employees,
    (SELECT COUNT(*)::INTEGER FROM invites WHERE company_id = p_company_id AND status = 'pending' AND (expires_at IS NULL OR expires_at > now())) as pending_invites,
    (
      (SELECT COUNT(*)::INTEGER FROM company_employees WHERE company_id = p_company_id AND is_active = true) +
      (SELECT COUNT(*)::INTEGER FROM invites WHERE company_id = p_company_id AND status = 'pending' AND (expires_at IS NULL OR expires_at > now()))
    ) as total_used_seats,
    (
      COALESCE(c.employee_seats, 50) -
      (SELECT COUNT(*)::INTEGER FROM company_employees WHERE company_id = p_company_id AND is_active = true) -
      (SELECT COUNT(*)::INTEGER FROM invites WHERE company_id = p_company_id AND status = 'pending' AND (expires_at IS NULL OR expires_at > now()))
    ) as available_seats,
    COALESCE(c.sessions_allocated, 0) as sessions_allocated,
    COALESCE(c.sessions_used, 0) as sessions_used,
    COALESCE(c.sessions_allocated - c.sessions_used, 0) as sessions_available
  FROM companies c
  WHERE c.id = p_company_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_company_seat_stats(UUID) TO authenticated;

-- ============================================================================
-- Function: get_user_session_balance
CREATE OR REPLACE FUNCTION get_user_session_balance(_user_id UUID)
RETURNS TABLE(
  has_company_quota BOOLEAN,
  company_name TEXT,
  company_sessions_allocated INTEGER,
  company_sessions_used INTEGER,
  company_sessions_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXISTS(SELECT 1 FROM company_employees WHERE user_id = _user_id AND is_active = true) as has_company_quota,
    c.name as company_name,
    ce.sessions_allocated as company_sessions_allocated,
    ce.sessions_used as company_sessions_used,
    (ce.sessions_allocated - ce.sessions_used) as company_sessions_remaining
  FROM company_employees ce
  JOIN companies c ON c.id = ce.company_id
  WHERE ce.user_id = _user_id AND ce.is_active = true
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_session_balance(UUID) TO authenticated;

-- ============================================================================
-- Function: get_provider_performance
CREATE OR REPLACE FUNCTION get_provider_performance(_prestador_id UUID)
RETURNS TABLE(
  total_sessions BIGINT,
  completed_sessions BIGINT,
  cancelled_sessions BIGINT,
  sessions_this_week BIGINT,
  sessions_this_month BIGINT,
  avg_rating NUMERIC,
  total_hours NUMERIC,
  completion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_sessions,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_sessions,
    COUNT(*) FILTER (WHERE status = 'cancelled')::BIGINT as cancelled_sessions,
    COUNT(*) FILTER (WHERE booking_date >= CURRENT_DATE - INTERVAL '7 days')::BIGINT as sessions_this_week,
    COUNT(*) FILTER (WHERE booking_date >= CURRENT_DATE - INTERVAL '30 days')::BIGINT as sessions_this_month,
    COALESCE(AVG(rating) FILTER (WHERE rating IS NOT NULL), 0) as avg_rating,
    COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time))/3600), 0) as total_hours,
    CASE 
      WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC * 100)
      ELSE 0 
    END as completion_rate
  FROM bookings
  WHERE prestador_id = _prestador_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_provider_performance(UUID) TO authenticated;

-- ============================================================================
-- Function: get_platform_utilization
CREATE OR REPLACE FUNCTION get_platform_utilization()
RETURNS TABLE(
  total_users BIGINT,
  active_companies BIGINT,
  total_sessions BIGINT,
  platform_utilization_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM profiles)::BIGINT as total_users,
    (SELECT COUNT(*) FROM companies WHERE is_active = true)::BIGINT as active_companies,
    (SELECT COUNT(*) FROM bookings)::BIGINT as total_sessions,
    (
      SELECT 
        CASE 
          WHEN SUM(sessions_allocated) > 0 THEN (SUM(sessions_used)::NUMERIC / SUM(sessions_allocated)::NUMERIC * 100)
          ELSE 0 
        END
      FROM companies WHERE is_active = true
    ) as platform_utilization_rate;
END;
$$;

GRANT EXECUTE ON FUNCTION get_platform_utilization() TO authenticated;

-- ============================================================================
-- Function: get_prestador_performance (admin view)
CREATE OR REPLACE FUNCTION get_prestador_performance(p_start_date DATE, p_end_date DATE)
RETURNS TABLE(
  provider_id UUID,
  provider_name TEXT,
  provider_email TEXT,
  total_sessions BIGINT,
  completed_sessions BIGINT,
  cancelled_sessions BIGINT,
  avg_rating NUMERIC,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as provider_id,
    p.name as provider_name,
    p.email as provider_email,
    COUNT(b.id)::BIGINT as total_sessions,
    COUNT(b.id) FILTER (WHERE b.status = 'completed')::BIGINT as completed_sessions,
    COUNT(b.id) FILTER (WHERE b.status = 'cancelled')::BIGINT as cancelled_sessions,
    COALESCE(AVG(b.rating) FILTER (WHERE b.rating IS NOT NULL), 0) as avg_rating,
    p.is_active
  FROM prestadores p
  LEFT JOIN bookings b ON b.prestador_id = p.id 
    AND b.booking_date BETWEEN p_start_date AND p_end_date
  GROUP BY p.id, p.name, p.email, p.is_active
  ORDER BY total_sessions DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_prestador_performance(DATE, DATE) TO authenticated;

-- ============================================================================
-- Function: get_specialist_performance
CREATE OR REPLACE FUNCTION get_specialist_performance(p_start_date DATE, p_end_date DATE)
RETURNS TABLE(
  specialist_id UUID,
  specialist_name TEXT,
  specialist_email TEXT,
  total_cases BIGINT,
  resolved_cases BIGINT,
  referred_cases BIGINT,
  avg_satisfaction_rating NUMERIC,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as specialist_id,
    p.name as specialist_name,
    p.email as specialist_email,
    COUNT(cs.id)::BIGINT as total_cases,
    COUNT(cs.id) FILTER (WHERE cs.ai_resolution = true)::BIGINT as resolved_cases,
    COUNT(cs.id) FILTER (WHERE cs.session_booked_by_specialist IS NOT NULL)::BIGINT as referred_cases,
    CASE 
      WHEN COUNT(cs.id) FILTER (WHERE cs.satisfaction_rating = 'satisfied') > 0 THEN
        (COUNT(cs.id) FILTER (WHERE cs.satisfaction_rating = 'satisfied')::NUMERIC / NULLIF(COUNT(cs.id) FILTER (WHERE cs.satisfaction_rating IS NOT NULL), 0)::NUMERIC * 100)
      ELSE 0
    END as avg_satisfaction_rating,
    p.is_active
  FROM profiles p
  LEFT JOIN chat_sessions cs ON cs.provider_id = p.id 
    AND cs.created_at::DATE BETWEEN p_start_date AND p_end_date
  WHERE EXISTS (SELECT 1 FROM user_roles WHERE user_id = p.id AND role IN ('especialista_geral', 'specialist'))
  GROUP BY p.id, p.name, p.email, p.is_active
  ORDER BY total_cases DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_specialist_performance(DATE, DATE) TO authenticated;

-- ============================================================================
-- NOTIFICATION FUNCTIONS
-- ============================================================================

-- Function: create_notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT DEFAULT 'general',
  p_title TEXT DEFAULT 'Nova Notificação',
  p_message TEXT DEFAULT '',
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    metadata,
    is_read,
    created_at
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    COALESCE(p_metadata, jsonb_build_object('action_url', p_action_url)),
    false,
    now()
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;

-- ============================================================================
-- EMPLOYEE FUNCTIONS
-- ============================================================================

-- Function: assign_employee_sessions
CREATE OR REPLACE FUNCTION assign_employee_sessions(_employee_id UUID, _quota INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  UPDATE company_employees
  SET 
    sessions_allocated = _quota,
    updated_at = now()
  WHERE id = _employee_id;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION assign_employee_sessions(UUID, INTEGER) TO authenticated;

-- ============================================================================
-- DASHBOARD DATA FUNCTIONS
-- ============================================================================

-- Function: get_user_dashboard_data
CREATE OR REPLACE FUNCTION get_user_dashboard_data(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (SELECT row_to_json(p.*) FROM profiles p WHERE id = p_user_id),
    'roles', (SELECT json_agg(role) FROM user_roles WHERE user_id = p_user_id),
    'company', (
      SELECT row_to_json(ce.*)
      FROM company_employees ce
      WHERE ce.user_id = p_user_id AND ce.is_active = true
      LIMIT 1
    ),
    'upcoming_bookings', (
      SELECT COALESCE(json_agg(b.*), '[]'::json)
      FROM bookings b
      WHERE b.user_id = p_user_id 
        AND b.status IN ('pending', 'confirmed')
        AND b.booking_date >= CURRENT_DATE
      ORDER BY b.booking_date, b.start_time
      LIMIT 5
    ),
    'recent_activity', (
      SELECT COALESCE(json_agg(up.*), '[]'::json)
      FROM user_progress up
      WHERE up.user_id = p_user_id
      ORDER BY up.created_at DESC
      LIMIT 10
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_dashboard_data(UUID) TO authenticated;

-- ============================================================================
-- HR DASHBOARD FUNCTIONS
-- ============================================================================

-- Function: get_hr_company_metrics
CREATE OR REPLACE FUNCTION get_hr_company_metrics(p_company_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'company', (SELECT row_to_json(c.*) FROM companies c WHERE id = p_company_id),
    'seat_stats', (SELECT row_to_json(s.*) FROM get_company_seat_stats(p_company_id) s),
    'analytics', (SELECT row_to_json(a.*) FROM get_company_analytics(p_company_id) a),
    'recent_bookings', (
      SELECT COALESCE(json_agg(b.*), '[]'::json)
      FROM bookings b
      WHERE b.company_id = p_company_id
      ORDER BY b.created_at DESC
      LIMIT 10
    ),
    'pending_invites', (
      SELECT COALESCE(json_agg(i.*), '[]'::json)
      FROM invites i
      WHERE i.company_id = p_company_id AND i.status = 'pending'
      ORDER BY i.created_at DESC
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_hr_company_metrics(UUID) TO authenticated;

-- Function: get_company_monthly_metrics
CREATE OR REPLACE FUNCTION get_company_monthly_metrics(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_bookings', COUNT(*),
    'completed_sessions', COUNT(*) FILTER (WHERE status = 'completed'),
    'cancelled_sessions', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'avg_rating', COALESCE(AVG(rating) FILTER (WHERE rating IS NOT NULL), 0),
    'sessions_by_pillar', (
      SELECT json_object_agg(pillar, cnt)
      FROM (
        SELECT pillar, COUNT(*) as cnt
        FROM bookings
        WHERE company_id = p_company_id
          AND booking_date BETWEEN p_start_date AND p_end_date
          AND pillar IS NOT NULL
        GROUP BY pillar
      ) sub
    )
  ) INTO v_result
  FROM bookings
  WHERE company_id = p_company_id
    AND booking_date BETWEEN p_start_date AND p_end_date;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_company_monthly_metrics(UUID, DATE, DATE) TO authenticated;

-- ============================================================================
-- SPECIALIST FUNCTIONS
-- ============================================================================

-- Function: get_specialist_escalated_chats
CREATE OR REPLACE FUNCTION get_specialist_escalated_chats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(row_to_json(cs.*)), '[]'::json)
    FROM chat_sessions cs
    WHERE cs.status = 'open'
      AND cs.phone_escalation_reason IS NOT NULL
    ORDER BY cs.created_at DESC
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_specialist_escalated_chats() TO authenticated;

-- Function: refer_to_prestador
CREATE OR REPLACE FUNCTION refer_to_prestador(
  p_chat_session_id UUID,
  p_prestador_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session RECORD;
BEGIN
  -- Get chat session
  SELECT * INTO v_session FROM chat_sessions WHERE id = p_chat_session_id;

  IF v_session IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Chat session not found');
  END IF;

  -- Update chat session
  UPDATE chat_sessions
  SET 
    session_booked_by_specialist = auth.uid(),
    status = 'closed',
    updated_at = now()
  WHERE id = p_chat_session_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Referral created successfully',
    'chat_session_id', p_chat_session_id,
    'prestador_id', p_prestador_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION refer_to_prestador(UUID, UUID, TEXT) TO authenticated;

-- Function: get_prestador_sessions
CREATE OR REPLACE FUNCTION get_prestador_sessions(p_prestador_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(row_to_json(b.*)), '[]'::json)
    FROM bookings b
    WHERE b.prestador_id = p_prestador_id
    ORDER BY b.booking_date DESC, b.start_time DESC
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_prestador_sessions(UUID) TO authenticated;

-- ============================================================================
-- SUBSCRIPTION FUNCTIONS
-- ============================================================================

-- Function: get_company_subscription_status
CREATE OR REPLACE FUNCTION get_company_subscription_status(_company_id UUID)
RETURNS TABLE(
  is_active BOOLEAN,
  plan_type TEXT,
  sessions_remaining INTEGER,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.is_active,
    c.plan_type,
    (c.sessions_allocated - c.sessions_used) as sessions_remaining,
    NULL::TIMESTAMPTZ as expires_at
  FROM companies c
  WHERE c.id = _company_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_company_subscription_status(UUID) TO authenticated;

-- ============================================================================
-- ONBOARDING FUNCTIONS
-- ============================================================================

-- Function: generate_goals_from_onboarding
CREATE OR REPLACE FUNCTION generate_goals_from_onboarding(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_onboarding RECORD;
  v_goal TEXT;
BEGIN
  SELECT * INTO v_onboarding FROM onboarding_data WHERE user_id = p_user_id;

  IF v_onboarding IS NULL THEN
    RETURN;
  END IF;

  -- Generate goals based on health_goals
  IF v_onboarding.health_goals IS NOT NULL THEN
    FOREACH v_goal IN ARRAY v_onboarding.health_goals
    LOOP
      INSERT INTO user_goals (user_id, goal_title, goal_description, status, progress_percentage)
      VALUES (p_user_id, v_goal, 'Generated from onboarding', 'active', 0)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_goals_from_onboarding(UUID) TO authenticated;

-- Function: initialize_user_milestones
CREATE OR REPLACE FUNCTION initialize_user_milestones(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_milestones (user_id, milestone_id, milestone_label, points, completed)
  VALUES
    (p_user_id, 'complete_onboarding', 'Complete Onboarding', 10, false),
    (p_user_id, 'first_session', 'Book First Session', 20, false),
    (p_user_id, 'complete_5_sessions', 'Complete 5 Sessions', 50, false),
    (p_user_id, 'streak_7_days', '7 Day Streak', 30, false)
  ON CONFLICT DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION initialize_user_milestones(UUID) TO authenticated;

-- Function: get_user_journey_data
CREATE OR REPLACE FUNCTION get_user_journey_data(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_build_object(
    'milestones', (
      SELECT COALESCE(json_agg(um.*), '[]'::json)
      FROM user_milestones um
      WHERE um.user_id = p_user_id
      ORDER BY um.completed DESC, um.points DESC
    ),
    'progress', (
      SELECT COALESCE(json_agg(up.*), '[]'::json)
      FROM user_progress up
      WHERE up.user_id = p_user_id
      ORDER BY up.action_date DESC
      LIMIT 20
    ),
    'goals', (
      SELECT COALESCE(json_agg(ug.*), '[]'::json)
      FROM user_goals ug
      WHERE ug.user_id = p_user_id AND ug.status = 'active'
      ORDER BY ug.target_date NULLS LAST
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_journey_data(UUID) TO authenticated;

-- ============================================================================
-- CONTENT FUNCTIONS
-- ============================================================================

-- Function: increment_content_views
CREATE OR REPLACE FUNCTION increment_content_views(content_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE self_help_content
  SET view_count = view_count + 1
  WHERE id = content_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_content_views(UUID) TO authenticated, anon;

-- ============================================================================
-- PERFORMANCE TRACKING
-- ============================================================================

-- Function: calculate_monthly_performance
CREATE OR REPLACE FUNCTION calculate_monthly_performance(
  _prestador_id UUID,
  _month TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_stats RECORD;
BEGIN
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
    COALESCE(AVG(rating) FILTER (WHERE rating IS NOT NULL), 0) as avg_rating
  INTO v_stats
  FROM bookings
  WHERE prestador_id = _prestador_id
    AND TO_CHAR(booking_date, 'YYYY-MM') = _month;

  INSERT INTO prestador_performance (
    prestador_id,
    month,
    total_sessions,
    completed_sessions,
    cancelled_sessions,
    avg_rating
  ) VALUES (
    _prestador_id,
    _month,
    v_stats.total,
    v_stats.completed,
    v_stats.cancelled,
    v_stats.avg_rating
  )
  ON CONFLICT (prestador_id, month) DO UPDATE
  SET
    total_sessions = v_stats.total,
    completed_sessions = v_stats.completed,
    cancelled_sessions = v_stats.cancelled,
    avg_rating = v_stats.avg_rating,
    updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION calculate_monthly_performance(UUID, TEXT) TO authenticated;

-- ============================================================================
-- REFRESH SCHEMA CACHE
-- ============================================================================

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT '✅ ALL RPC FUNCTIONS CREATED SUCCESSFULLY!' as status;
SELECT 'All database functions are now available.' as message;
SELECT 'Proceed to run RLS_POLICIES_COMPLETE.sql next.' as next_step;



