-- ============================================================================
-- DASHBOARD FIXES - STANDALONE SCRIPT
-- Run this directly in Supabase SQL Editor
-- Date: 2025-11-05
-- ============================================================================

-- ============================================================================
-- 1. FIX MILESTONE INITIALIZATION
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_onboarding_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.has_completed_onboarding = true AND (OLD.has_completed_onboarding IS NULL OR OLD.has_completed_onboarding = false) THEN
    PERFORM initialize_user_milestones(NEW.id);
    
    UPDATE user_milestones
    SET completed = true, completed_at = NOW()
    WHERE user_id = NEW.id AND milestone_type = 'onboarding';
    
    INSERT INTO notifications (user_id, type, title, message, priority, metadata)
    VALUES (
      NEW.id,
      'milestone_achieved',
      '🎉 Bem-vindo!',
      'Parabéns por completar o onboarding! Agora pode explorar todos os recursos da plataforma.',
      'high',
      '{"milestone": "onboarding", "points": 10}'::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_handle_onboarding_completion ON profiles;

CREATE TRIGGER trigger_handle_onboarding_completion
  AFTER UPDATE OF has_completed_onboarding ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_onboarding_completion();

-- ============================================================================
-- 2. FIX SESSION ALLOCATION TRACKING
-- ============================================================================

CREATE OR REPLACE FUNCTION ensure_company_employee_record()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.company_id IS NOT NULL THEN
    INSERT INTO company_employees (company_id, user_id, sessions_allocated, sessions_used, is_active)
    VALUES (NEW.company_id, NEW.id, 10, 0, true)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_ensure_company_employee ON profiles;

CREATE TRIGGER trigger_ensure_company_employee
  AFTER INSERT OR UPDATE OF company_id ON profiles
  FOR EACH ROW
  WHEN (NEW.company_id IS NOT NULL)
  EXECUTE FUNCTION ensure_company_employee_record();

-- ============================================================================
-- 3. FIX BOOKING NOTIFICATION TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_booking_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider_name TEXT;
  v_booking_date_formatted TEXT;
  v_user_profile RECORD;
BEGIN
  SELECT name INTO v_provider_name
  FROM prestadores
  WHERE id = NEW.prestador_id;

  SELECT id, email INTO v_user_profile
  FROM profiles
  WHERE id = NEW.user_id;
  
  v_booking_date_formatted := TO_CHAR(NEW.booking_date, 'DD/MM/YYYY');

  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_booking_id,
    priority,
    metadata
  )
  VALUES (
    NEW.user_id,
    'booking_confirmed',
    '✅ Sessão Confirmada',
    format('A sua sessão com %s foi agendada para %s às %s.',
      COALESCE(v_provider_name, 'especialista'),
      v_booking_date_formatted,
      NEW.start_time::TEXT
    ),
    NEW.id,
    'high',
    jsonb_build_object(
      'booking_id', NEW.id,
      'prestador_id', NEW.prestador_id,
      'booking_date', NEW.booking_date,
      'start_time', NEW.start_time
    )
  );
  
  IF NEW.prestador_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      related_booking_id,
      priority,
      metadata
    )
    SELECT
      p.user_id,
      'booking_confirmed',
      '📅 Nova Sessão Agendada',
      format('Nova sessão agendada para %s às %s.',
        v_booking_date_formatted,
        NEW.start_time::TEXT
      ),
      NEW.id,
      'normal',
      jsonb_build_object(
        'booking_id', NEW.id,
        'user_id', NEW.user_id,
        'booking_date', NEW.booking_date,
        'start_time', NEW.start_time
      )
    FROM prestadores p
    WHERE p.id = NEW.prestador_id AND p.user_id IS NOT NULL;
  END IF;

  IF NEW.status = 'confirmed' OR NEW.status = 'scheduled' OR NEW.status = 'pending' THEN
    UPDATE user_milestones
    SET completed = true, completed_at = NOW()
    WHERE user_id = NEW.user_id AND milestone_type = 'booking_confirmed' AND completed = false;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_booking_created ON bookings;
DROP TRIGGER IF EXISTS booking_notification_trigger ON bookings;

CREATE TRIGGER trigger_notify_booking_created
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_created();

-- ============================================================================
-- 4. FIX MILESTONE TRACKING FOR BOOKINGS
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_session_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO user_progress (user_id, pillar, action_type, action_date, metadata)
    VALUES (
      NEW.user_id,
      NEW.pillar,
      'session_completed',
      NOW(),
      jsonb_build_object(
        'booking_id', NEW.id,
        'prestador_id', NEW.prestador_id
      )
    );
    
    UPDATE user_milestones
    SET completed = true, completed_at = NOW()
    WHERE user_id = NEW.user_id AND milestone_type = 'first_session' AND completed = false;
    
    INSERT INTO notifications (user_id, type, title, message, related_booking_id, priority)
    VALUES (
      NEW.user_id,
      'session_completed',
      '🎉 Sessão Concluída',
      'A sua sessão foi marcada como concluída. Obrigado por participar!',
      NEW.id,
      'normal'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_handle_session_completion ON bookings;

CREATE TRIGGER trigger_handle_session_completion
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION handle_session_completion();

-- ============================================================================
-- 5. ADD UNIQUE CONSTRAINT ON COMPANY_EMPLOYEES
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'company_employees_user_company_unique'
  ) THEN
    ALTER TABLE company_employees
    ADD CONSTRAINT company_employees_user_company_unique
    UNIQUE (user_id, company_id);
  END IF;
END $$;

-- ============================================================================
-- 6. FIX USER SESSION BALANCE CALCULATION
-- ============================================================================

DROP FUNCTION IF EXISTS get_user_session_balance(UUID);

CREATE OR REPLACE FUNCTION get_user_session_balance(p_user_id UUID)
RETURNS TABLE (
  company_quota INTEGER,
  company_used INTEGER,
  company_available INTEGER,
  personal_quota INTEGER,
  personal_used INTEGER,
  personal_available INTEGER,
  total_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  SELECT company_id INTO v_company_id
  FROM profiles
  WHERE id = p_user_id;
  
  RETURN QUERY
  SELECT
    COALESCE(ce.sessions_allocated, 0)::INTEGER AS company_quota,
    COALESCE(ce.sessions_used, 0)::INTEGER AS company_used,
    GREATEST(COALESCE(ce.sessions_allocated, 0) - COALESCE(ce.sessions_used, 0), 0)::INTEGER AS company_available,
    0::INTEGER AS personal_quota,
    0::INTEGER AS personal_used,
    0::INTEGER AS personal_available,
    GREATEST(COALESCE(ce.sessions_allocated, 0) - COALESCE(ce.sessions_used, 0), 0)::INTEGER AS total_remaining
  FROM company_employees ce
  WHERE ce.user_id = p_user_id AND ce.company_id = v_company_id
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0::INTEGER, 0::INTEGER, 0::INTEGER, 0::INTEGER, 0::INTEGER, 0::INTEGER, 0::INTEGER;
  END IF;
END;
$$;

-- ============================================================================
-- 7. DATA MIGRATION: Fix existing users
-- ============================================================================

DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN
    SELECT id FROM profiles
    WHERE has_completed_onboarding = true
    AND id NOT IN (SELECT DISTINCT user_id FROM user_milestones)
  LOOP
    PERFORM initialize_user_milestones(v_user.id);
    
    UPDATE user_milestones
    SET completed = true, completed_at = NOW()
    WHERE user_id = v_user.id AND milestone_type = 'onboarding';
  END LOOP;
END $$;

INSERT INTO company_employees (company_id, user_id, sessions_allocated, sessions_used, is_active)
SELECT
  p.company_id,
  p.id,
  10 AS sessions_allocated,
  0 AS sessions_used,
  true AS is_active
FROM profiles p
WHERE p.company_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM company_employees ce
  WHERE ce.user_id = p.id AND ce.company_id = p.company_id
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION handle_onboarding_completion() TO service_role;
GRANT EXECUTE ON FUNCTION ensure_company_employee_record() TO service_role;
GRANT EXECUTE ON FUNCTION notify_booking_created() TO service_role;
GRANT EXECUTE ON FUNCTION handle_session_completion() TO service_role;
GRANT EXECUTE ON FUNCTION get_user_session_balance(UUID) TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after to verify the fixes)
-- ============================================================================

-- Check if milestones were created
-- SELECT user_id, milestone_type, completed, created_at FROM user_milestones ORDER BY created_at DESC LIMIT 10;

-- Check if company_employees were created
-- SELECT u.id, u.email, ce.sessions_allocated, ce.sessions_used FROM profiles u 
-- LEFT JOIN company_employees ce ON ce.user_id = u.id WHERE u.company_id IS NOT NULL LIMIT 5;

-- Check session balance function
-- SELECT * FROM get_user_session_balance('<your-user-id>');

-- Check recent notifications
-- SELECT user_id, type, title, message, created_at FROM notifications ORDER BY created_at DESC LIMIT 10;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Dashboard fixes applied successfully!';
  RAISE NOTICE '📊 Check the verification queries above to confirm everything is working.';
END $$;


