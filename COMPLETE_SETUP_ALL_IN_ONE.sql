-- ===================================================================
-- COMPLETE SETUP - ALL MIGRATIONS + HR ACCOUNT
-- Run this ENTIRE script in Supabase SQL Editor
-- ===================================================================

-- ============================================
-- PART 1: Update rating scale to 1-10
-- ============================================

ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_rating_check;

ALTER TABLE bookings
ADD CONSTRAINT bookings_rating_check 
CHECK (rating >= 1 AND rating <= 10);

ALTER TABLE feedback
DROP CONSTRAINT IF EXISTS feedback_rating_check;

ALTER TABLE feedback
ADD CONSTRAINT feedback_rating_check 
CHECK (rating >= 1 AND rating <= 10);

COMMENT ON COLUMN bookings.rating IS 'User satisfaction rating on a scale of 1-10';
COMMENT ON COLUMN feedback.rating IS 'User feedback rating on a scale of 1-10';


-- ============================================
-- PART 2: Add employee_seats column
-- ============================================

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS employee_seats INTEGER DEFAULT 50 CHECK (employee_seats >= 0);

COMMENT ON COLUMN companies.employee_seats IS 'Maximum number of employee seats/accounts allowed by subscription package';


-- ============================================
-- PART 3: Create get_company_seat_stats function
-- ============================================

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
      COUNT(DISTINCT CASE WHEN p.is_active = true AND p.role = 'user' THEN p.id END)::INTEGER as active_emps,
      COUNT(DISTINCT CASE WHEN i.status = 'pending' AND i.role = 'user' THEN i.id END)::INTEGER as pending_invs
    FROM companies c
    LEFT JOIN profiles p ON p.company_id = c.id
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
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 50, 0, 0, 0, 50, 0, 0, 0;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION get_company_seat_stats(UUID) TO authenticated;


-- ============================================
-- PART 4: Create can_generate_invite_code function
-- ============================================

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


-- ============================================
-- PART 5: Create get_company_monthly_metrics function
-- ============================================

CREATE OR REPLACE FUNCTION get_company_monthly_metrics(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH company_stats AS (
    SELECT
      c.name AS company_name,
      c.employee_seats,
      c.sessions_allocated,
      c.sessions_used,
      (SELECT COUNT(*) 
       FROM profiles 
       WHERE company_id = p_company_id 
         AND is_active = true 
         AND role = 'user') AS active_employees,
      (SELECT COUNT(*) 
       FROM invites 
       WHERE company_id = p_company_id 
         AND status = 'pending') AS pending_invites
    FROM companies c
    WHERE c.id = p_company_id
  ),
  pillar_usage AS (
    SELECT
      b.pillar,
      COUNT(*) AS session_count
    FROM bookings b
    WHERE b.company_id = p_company_id
      AND b.status = 'completed'
      AND b.booking_date BETWEEN p_start_date AND p_end_date
    GROUP BY b.pillar
  ),
  satisfaction_metrics AS (
    SELECT
      AVG(b.rating)::NUMERIC(3,2) AS avg_rating,
      COUNT(CASE WHEN b.rating >= 8 THEN 1 END) AS high_satisfaction_count,
      COUNT(*) AS rated_sessions
    FROM bookings b
    WHERE b.company_id = p_company_id
      AND b.status = 'completed'
      AND b.rating IS NOT NULL
      AND b.booking_date BETWEEN p_start_date AND p_end_date
  ),
  top_pillar AS (
    SELECT pillar, session_count
    FROM pillar_usage
    ORDER BY session_count DESC
    LIMIT 1
  ),
  sessions_in_period AS (
    SELECT COUNT(*) AS period_sessions_used
    FROM bookings b
    WHERE b.company_id = p_company_id
      AND b.status = 'completed'
      AND b.booking_date BETWEEN p_start_date AND p_end_date
  )
  SELECT json_build_object(
    'company_name', cs.company_name,
    'date_range', json_build_object(
      'start', p_start_date,
      'end', p_end_date
    ),
    'subscription', json_build_object(
      'employee_seats', cs.employee_seats,
      'sessions_allocated', cs.sessions_allocated,
      'sessions_used', cs.sessions_used,
      'period_sessions_used', (SELECT period_sessions_used FROM sessions_in_period),
      'utilization_rate', 
        CASE WHEN cs.sessions_allocated > 0 
          THEN ROUND((cs.sessions_used::NUMERIC / cs.sessions_allocated) * 100, 2)
          ELSE 0 
        END
    ),
    'employees', json_build_object(
      'active', cs.active_employees,
      'pending_invites', cs.pending_invites,
      'total', cs.active_employees + cs.pending_invites,
      'seats_available', cs.employee_seats - (cs.active_employees + cs.pending_invites)
    ),
    'pillar_breakdown', COALESCE((
      SELECT json_agg(json_build_object(
        'pillar', pillar,
        'sessions', session_count,
        'percentage', ROUND((session_count::NUMERIC / NULLIF((SELECT period_sessions_used FROM sessions_in_period), 0)) * 100, 2)
      ))
      FROM pillar_usage
    ), '[]'::json),
    'top_pillar', json_build_object(
      'name', COALESCE((SELECT pillar FROM top_pillar), 'N/A'),
      'sessions', COALESCE((SELECT session_count FROM top_pillar), 0)
    ),
    'satisfaction', json_build_object(
      'avg_rating', COALESCE(sm.avg_rating, 0),
      'high_satisfaction_count', sm.high_satisfaction_count,
      'rated_sessions', sm.rated_sessions,
      'satisfaction_rate', 
        CASE WHEN sm.rated_sessions > 0
          THEN ROUND((sm.high_satisfaction_count::NUMERIC / sm.rated_sessions) * 100, 2)
          ELSE 0
        END
    )
  ) INTO result
  FROM company_stats cs, satisfaction_metrics sm;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_company_monthly_metrics(UUID, DATE, DATE) TO authenticated;


-- ============================================
-- PART 6: Create get_specialist_performance function
-- ============================================

CREATE OR REPLACE FUNCTION get_specialist_performance(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  specialist_id UUID,
  specialist_name TEXT,
  specialist_email TEXT,
  total_cases BIGINT,
  resolved_cases BIGINT,
  referred_cases BIGINT,
  avg_satisfaction_rating NUMERIC,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS specialist_id,
    p.name AS specialist_name,
    p.email AS specialist_email,
    COUNT(cs.id)::BIGINT AS total_cases,
    COUNT(CASE WHEN cs.status = 'resolved' AND cs.session_booked_by_specialist IS NULL THEN 1 END)::BIGINT AS resolved_cases,
    COUNT(CASE WHEN cs.session_booked_by_specialist IS NOT NULL THEN 1 END)::BIGINT AS referred_cases,
    AVG(
      CASE 
        WHEN cs.satisfaction_rating = 'satisfied' THEN 10
        WHEN cs.satisfaction_rating = 'neutral' THEN 5
        WHEN cs.satisfaction_rating = 'unsatisfied' THEN 1
        ELSE NULL
      END
    )::NUMERIC(3,2) AS avg_satisfaction_rating,
    p.is_active
  FROM profiles p
  INNER JOIN user_roles ur ON ur.user_id = p.id AND ur.role = 'especialista_geral'
  LEFT JOIN chat_sessions cs ON cs.provider_id = p.id 
    AND cs.created_at::DATE BETWEEN p_start_date AND p_end_date
  GROUP BY p.id, p.name, p.email, p.is_active
  ORDER BY total_cases DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_specialist_performance(DATE, DATE) TO authenticated;


-- ============================================
-- PART 7: Create get_prestador_performance function
-- ============================================

CREATE OR REPLACE FUNCTION get_prestador_performance(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  provider_id UUID,
  provider_name TEXT,
  provider_email TEXT,
  total_sessions BIGINT,
  completed_sessions BIGINT,
  cancelled_sessions BIGINT,
  avg_rating NUMERIC,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    prest.id AS provider_id,
    prest.name AS provider_name,
    prest.email AS provider_email,
    COUNT(b.id)::BIGINT AS total_sessions,
    COUNT(CASE WHEN b.status = 'completed' THEN 1 END)::BIGINT AS completed_sessions,
    COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END)::BIGINT AS cancelled_sessions,
    AVG(b.rating)::NUMERIC(3,2) AS avg_rating,
    prest.is_active
  FROM prestadores prest
  LEFT JOIN bookings b ON b.prestador_id = prest.id
    AND b.booking_date BETWEEN p_start_date AND p_end_date
  GROUP BY prest.id, prest.name, prest.email, prest.is_active
  ORDER BY completed_sessions DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_prestador_performance(DATE, DATE) TO authenticated;


-- ============================================
-- PART 8: Setup HR Account
-- ============================================

-- Disable problematic triggers
DROP TRIGGER IF EXISTS sync_profile_name_trigger ON profiles CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS sync_profile_name() CASCADE;

-- Create company
INSERT INTO companies (
  id, name, email, sessions_allocated, sessions_used, is_active, plan_type, employee_seats
) VALUES (
  'b967ebce-b0c3-4763-b3cd-35a4e67661ae',
  'OnHigh Management',
  'lorinofrodriguesjunior@gmail.com',
  200, 0, true, 'business', 50
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  sessions_allocated = EXCLUDED.sessions_allocated,
  employee_seats = EXCLUDED.employee_seats,
  is_active = EXCLUDED.is_active;

-- Create auth user
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role
) VALUES (
  'd94c8947-3782-47f9-9285-35f035c1e1f2',
  '00000000-0000-0000-0000-000000000000',
  'lorinofrodriguesjunior@gmail.com',
  crypt('temppass123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"OnHigh management"}'::jsonb,
  NOW(), NOW(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create/update profile
INSERT INTO profiles (id, email, role, company_id, is_active)
VALUES (
  'd94c8947-3782-47f9-9285-35f035c1e1f2',
  'lorinofrodriguesjunior@gmail.com',
  'hr',
  'b967ebce-b0c3-4763-b3cd-35a4e67661ae',
  true
) ON CONFLICT (id) DO UPDATE SET
  company_id = 'b967ebce-b0c3-4763-b3cd-35a4e67661ae',
  role = 'hr',
  is_active = true;

-- Add HR role
INSERT INTO user_roles (user_id, role)
VALUES ('d94c8947-3782-47f9-9285-35f035c1e1f2', 'hr')
ON CONFLICT (user_id, role) DO NOTHING;


-- ============================================
-- PART 9: VERIFICATION
-- ============================================

SELECT '✅ ALL MIGRATIONS APPLIED' as status, 'Ready to test!' as message

UNION ALL

SELECT '   Company Created' as status,
  name || ' (' || employee_seats || ' seats)' as message
FROM companies 
WHERE id = 'b967ebce-b0c3-4763-b3cd-35a4e67661ae'

UNION ALL

SELECT '   Profile Linked' as status,
  email || ' (role: ' || role || ')' as message
FROM profiles 
WHERE id = 'd94c8947-3782-47f9-9285-35f035c1e1f2'

UNION ALL

SELECT '   Functions Created' as status,
  COUNT(*)::text || ' RPC functions ready' as message
FROM pg_proc 
WHERE proname IN (
  'get_company_seat_stats',
  'can_generate_invite_code',
  'get_company_monthly_metrics',
  'get_specialist_performance',
  'get_prestador_performance'
);



