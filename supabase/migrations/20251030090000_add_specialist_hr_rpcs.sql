-- Add specialist and HR dashboard RPCs and company bookings listing

-- Helper: get_specialist_dashboard_stats
CREATE OR REPLACE FUNCTION public.get_specialist_dashboard_stats(p_user_id uuid)
RETURNS TABLE(
  total_sessions integer,
  upcoming_sessions integer,
  attended_sessions integer,
  completion_rate numeric,
  average_rating numeric,
  next_session jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prestador_id uuid;
BEGIN
  SELECT id INTO v_prestador_id FROM public.prestadores WHERE user_id = p_user_id LIMIT 1;

  IF v_prestador_id IS NULL THEN
    RETURN QUERY SELECT 0, 0, 0, 0::numeric, NULL::numeric, NULL::jsonb;
    RETURN;
  END IF;

  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*)::int AS total_sessions,
      COUNT(*) FILTER (WHERE status IN ('pending','pending_confirmation','confirmed','rescheduled') AND date >= current_date)::int AS upcoming_sessions,
      COUNT(*) FILTER (WHERE status = 'completed')::int AS attended_sessions,
      CASE WHEN COUNT(*) FILTER (WHERE status IN ('completed','cancelled','no_show')) > 0
           THEN ROUND((COUNT(*) FILTER (WHERE status = 'completed')::numeric / NULLIF(COUNT(*) FILTER (WHERE status IN ('completed','cancelled','no_show')),0)::numeric) * 100, 2)
           ELSE 0 END AS completion_rate
    FROM public.bookings b
    WHERE b.prestador_id = v_prestador_id
  ), next AS (
    SELECT to_jsonb(b.*) AS js
    FROM public.bookings b
    WHERE b.prestador_id = v_prestador_id
      AND b.status IN ('pending','pending_confirmation','confirmed','rescheduled')
      AND b.date >= current_date
    ORDER BY b.date ASC, b.start_time ASC
    LIMIT 1
  ), ratings AS (
    SELECT AVG(rating)::numeric AS avg_rating
    FROM public.bookings b
    WHERE b.prestador_id = v_prestador_id AND b.rating IS NOT NULL
  )
  SELECT
    stats.total_sessions,
    stats.upcoming_sessions,
    stats.attended_sessions,
    COALESCE(stats.completion_rate, 0)::numeric,
    COALESCE(ratings.avg_rating, NULL)::numeric,
    (SELECT js FROM next)
  FROM stats, ratings;
END;
$$;

-- Helper: get_company_dashboard_stats
CREATE OR REPLACE FUNCTION public.get_company_dashboard_stats(p_company_id uuid)
RETURNS TABLE(
  active_employees integer,
  sessions_this_month integer,
  attendance_rate numeric,
  top_areas jsonb,
  upcoming_sessions jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH employees AS (
    SELECT COUNT(*)::int AS cnt
    FROM public.profiles p
    WHERE p.company_id = p_company_id AND p.is_active IS NOT FALSE
  ), month_sessions AS (
    SELECT COUNT(*)::int AS cnt
    FROM public.bookings b
    WHERE b.company_id = p_company_id
      AND date_trunc('month', b.date::timestamp) = date_trunc('month', now())
  ), attendance AS (
    SELECT CASE WHEN COUNT(*) FILTER (WHERE status IN ('completed','cancelled','no_show')) > 0
                THEN ROUND((COUNT(*) FILTER (WHERE status = 'completed')::numeric / NULLIF(COUNT(*) FILTER (WHERE status IN ('completed','cancelled','no_show')),0)::numeric) * 100, 2)
                ELSE 0 END AS rate
    FROM public.bookings b
    WHERE b.company_id = p_company_id
  ), areas AS (
    SELECT jsonb_agg(obj ORDER BY obj->>'count' DESC) AS agg
    FROM (
      SELECT jsonb_build_object('pillar', b.pillar, 'count', COUNT(*)) AS obj
      FROM public.bookings b
      WHERE b.company_id = p_company_id
      GROUP BY b.pillar
      LIMIT 5
    ) s
  ), upcoming AS (
    SELECT to_jsonb(array_agg(row_to_json(x) ORDER BY x.date, x.start_time)) AS arr
    FROM (
      SELECT b.id, b.date, b.start_time, b.status, b.pillar
      FROM public.bookings b
      WHERE b.company_id = p_company_id
        AND b.status IN ('pending','pending_confirmation','confirmed','rescheduled')
        AND b.date >= current_date
      ORDER BY b.date ASC, b.start_time ASC
      LIMIT 10
    ) x
  )
  SELECT
    (SELECT cnt FROM employees),
    (SELECT cnt FROM month_sessions),
    (SELECT rate FROM attendance),
    COALESCE((SELECT agg FROM areas), '[]'::jsonb),
    COALESCE((SELECT arr FROM upcoming), '[]'::jsonb);
END;
$$;

-- Listing: list_company_bookings
CREATE OR REPLACE FUNCTION public.list_company_bookings(
  p_company_id uuid,
  p_status text DEFAULT NULL,
  p_from timestamptz DEFAULT NULL,
  p_to timestamptz DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  prestador_id uuid,
  date date,
  start_time text,
  status text,
  pillar text,
  session_type text,
  rating numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id, b.user_id, b.prestador_id, b.date, b.start_time, b.status, b.pillar, b.session_type, b.rating
  FROM public.bookings b
  WHERE b.company_id = p_company_id
    AND (p_status IS NULL OR b.status = p_status)
    AND (p_from IS NULL OR (b.date::timestamp >= p_from))
    AND (p_to IS NULL OR (b.date::timestamp <= p_to))
  ORDER BY b.date DESC, b.start_time DESC;
END;
$$;
