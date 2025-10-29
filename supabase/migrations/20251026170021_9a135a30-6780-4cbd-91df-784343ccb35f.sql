-- Get company analytics
CREATE OR REPLACE FUNCTION public.get_company_analytics(_company_id UUID)
RETURNS TABLE (
  total_employees BIGINT,
  active_employees BIGINT,
  sessions_allocated INTEGER,
  sessions_used INTEGER,
  sessions_remaining INTEGER,
  utilization_rate NUMERIC,
  total_bookings BIGINT,
  completed_bookings BIGINT,
  cancelled_bookings BIGINT,
  avg_rating NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH company_stats AS (
    SELECT 
      c.sessions_allocated,
      c.sessions_used
    FROM companies c
    WHERE c.id = _company_id
  ),
  employee_stats AS (
    SELECT 
      COUNT(*) as total_emps,
      COUNT(*) FILTER (WHERE is_active) as active_emps
    FROM company_employees
    WHERE company_id = _company_id
  ),
  booking_stats AS (
    SELECT 
      COUNT(*) as total_books,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_books,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_books,
      AVG(rating) as average_rating
    FROM bookings
    WHERE company_id = _company_id
  )
  SELECT 
    es.total_emps::BIGINT,
    es.active_emps::BIGINT,
    cs.sessions_allocated,
    cs.sessions_used,
    (cs.sessions_allocated - cs.sessions_used) as sessions_remaining,
    CASE 
      WHEN cs.sessions_allocated > 0 
      THEN ROUND((cs.sessions_used::NUMERIC / cs.sessions_allocated::NUMERIC) * 100, 2)
      ELSE 0
    END as utilization_rate,
    bs.total_books::BIGINT,
    bs.completed_books::BIGINT,
    bs.cancelled_books::BIGINT,
    ROUND(bs.average_rating, 2)
  FROM company_stats cs
  CROSS JOIN employee_stats es
  CROSS JOIN booking_stats bs;
END;
$$;

-- Get provider performance
CREATE OR REPLACE FUNCTION public.get_provider_performance(_prestador_id UUID)
RETURNS TABLE (
  total_sessions BIGINT,
  completed_sessions BIGINT,
  cancelled_sessions BIGINT,
  avg_rating NUMERIC,
  total_hours NUMERIC,
  sessions_this_month BIGINT,
  sessions_this_week BIGINT,
  completion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_sessions,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_sessions,
    ROUND(AVG(rating), 2) as avg_rating,
    ROUND(
      SUM(
        EXTRACT(EPOCH FROM (end_time - start_time)) / 3600
      ) FILTER (WHERE start_time IS NOT NULL AND end_time IS NOT NULL),
      2
    ) as total_hours,
    COUNT(*) FILTER (
      WHERE booking_date >= date_trunc('month', now())
    ) as sessions_this_month,
    COUNT(*) FILTER (
      WHERE booking_date >= date_trunc('week', now())
    ) as sessions_this_week,
    CASE 
      WHEN COUNT(*) > 0 
      THEN ROUND(
        (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100, 
        2
      )
      ELSE 0
    END as completion_rate
  FROM bookings
  WHERE prestador_id = _prestador_id;
END;
$$;

-- Assign employee sessions
CREATE OR REPLACE FUNCTION public.assign_employee_sessions(
  _employee_id UUID,
  _quota INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _company_id UUID;
  _company_available INTEGER;
BEGIN
  SELECT company_id INTO _company_id
  FROM company_employees
  WHERE user_id = _employee_id AND is_active = true;

  IF _company_id IS NULL THEN
    RAISE EXCEPTION 'Employee not found or not active';
  END IF;

  SELECT (sessions_allocated - sessions_used) INTO _company_available
  FROM companies
  WHERE id = _company_id;

  IF _company_available < _quota THEN
    RAISE EXCEPTION 'Company does not have enough sessions available';
  END IF;

  UPDATE company_employees
  SET 
    sessions_allocated = sessions_allocated + _quota,
    updated_at = now()
  WHERE user_id = _employee_id AND company_id = _company_id;

  RETURN true;
END;
$$;

-- Book session with quota check
CREATE OR REPLACE FUNCTION public.book_session_with_quota_check(
  _user_id UUID,
  _prestador_id UUID,
  _booking_date TIMESTAMP WITH TIME ZONE,
  _session_type TEXT,
  _pillar_specialties TEXT[],
  _topic TEXT DEFAULT NULL,
  _meeting_type TEXT DEFAULT 'online',
  _start_time TIME DEFAULT NULL,
  _end_time TIME DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _booking_id UUID;
  _employee_record RECORD;
  _company_id UUID;
BEGIN
  SELECT * INTO _employee_record
  FROM company_employees
  WHERE user_id = _user_id AND is_active = true;

  IF _employee_record IS NOT NULL THEN
    IF (_employee_record.sessions_allocated - _employee_record.sessions_used) <= 0 THEN
      RAISE EXCEPTION 'No sessions available in quota';
    END IF;

    _company_id := _employee_record.company_id;
  END IF;

  INSERT INTO bookings (
    user_id,
    prestador_id,
    booking_date,
    date,
    start_time,
    end_time,
    session_type,
    pillar_specialties,
    topic,
    meeting_type,
    company_id,
    status
  ) VALUES (
    _user_id,
    _prestador_id,
    _booking_date,
    _booking_date::date,
    _start_time,
    _end_time,
    _session_type,
    _pillar_specialties,
    _topic,
    _meeting_type,
    _company_id,
    'scheduled'
  )
  RETURNING id INTO _booking_id;

  IF _employee_record IS NOT NULL THEN
    UPDATE company_employees
    SET 
      sessions_used = sessions_used + 1,
      updated_at = now()
    WHERE user_id = _user_id AND company_id = _company_id;

    UPDATE companies
    SET 
      sessions_used = sessions_used + 1,
      updated_at = now()
    WHERE id = _company_id;
  END IF;

  RETURN _booking_id;
END;
$$;

-- Get user session balance
CREATE OR REPLACE FUNCTION public.get_user_session_balance(_user_id UUID)
RETURNS TABLE (
  company_sessions_allocated INTEGER,
  company_sessions_used INTEGER,
  company_sessions_remaining INTEGER,
  company_name TEXT,
  has_company_quota BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ce.sessions_allocated, 0) as company_sessions_allocated,
    COALESCE(ce.sessions_used, 0) as company_sessions_used,
    COALESCE(ce.sessions_allocated - ce.sessions_used, 0) as company_sessions_remaining,
    c.company_name,
    (ce.id IS NOT NULL) as has_company_quota
  FROM company_employees ce
  LEFT JOIN companies c ON c.id = ce.company_id
  WHERE ce.user_id = _user_id AND ce.is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 0, 0, 0, NULL::TEXT, false;
  END IF;
END;
$$;