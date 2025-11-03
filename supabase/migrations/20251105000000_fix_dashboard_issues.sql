-- ============================================================================
-- Fix Dashboard Issues: Progressive Card, Sessions, Notifications
-- Date: 2025-11-05
-- Description: Fixes issues with progress bar, session allocation, and notifications
-- ============================================================================

-- ============================================================================
-- 1. FIX MILESTONE INITIALIZATION
-- Ensure initialize_user_milestones is called when onboarding is completed
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_onboarding_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When has_completed_onboarding changes from false to true, initialize milestones
  IF NEW.has_completed_onboarding = true AND (OLD.has_completed_onboarding IS NULL OR OLD.has_completed_onboarding = false) THEN
    -- Initialize milestones for the user
    PERFORM initialize_user_milestones(NEW.id);
    
    -- Mark onboarding milestone as completed
    UPDATE user_milestones
    SET completed = true, completed_at = NOW()
    WHERE user_id = NEW.id AND milestone_type = 'onboarding';
    
    -- Create welcome notification
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_handle_onboarding_completion ON profiles;

-- Create trigger for onboarding completion
CREATE TRIGGER trigger_handle_onboarding_completion
  AFTER UPDATE OF has_completed_onboarding ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_onboarding_completion();

-- ============================================================================
-- 2. FIX SESSION ALLOCATION TRACKING
-- Ensure company_employees records exist for users with companies
-- ============================================================================

CREATE OR REPLACE FUNCTION ensure_company_employee_record()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a user is assigned to a company, ensure company_employees record exists
  IF NEW.company_id IS NOT NULL THEN
    INSERT INTO company_employees (company_id, user_id, sessions_allocated, sessions_used, is_active)
    VALUES (NEW.company_id, NEW.id, 10, 0, true)
    ON CONFLICT (user_id, company_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_ensure_company_employee ON profiles;

-- Create trigger to ensure company_employee record
CREATE TRIGGER trigger_ensure_company_employee
  AFTER INSERT OR UPDATE OF company_id ON profiles
  FOR EACH ROW
  WHEN (NEW.company_id IS NOT NULL)
  EXECUTE FUNCTION ensure_company_employee_record();

-- ============================================================================
-- 3. FIX BOOKING NOTIFICATION TRIGGERS
-- Improve notification creation for bookings
-- ============================================================================

-- Update the notify_booking_created function to be more robust
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
  -- Get provider name
  SELECT name INTO v_provider_name
  FROM prestadores
  WHERE id = NEW.prestador_id;

  -- Get user profile
  SELECT id, email INTO v_user_profile
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Format booking date
  v_booking_date_formatted := TO_CHAR(NEW.booking_date, 'DD/MM/YYYY');

  -- Create notification for the user
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
  
  -- Also create notification for provider if available
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

  -- Update milestone progress if this is booking_confirmed
  IF NEW.status = 'confirmed' OR NEW.status = 'scheduled' OR NEW.status = 'pending' THEN
    -- Mark booking_confirmed milestone as completed
    UPDATE user_milestones
    SET completed = true, completed_at = NOW()
    WHERE user_id = NEW.user_id AND milestone_type = 'booking_confirmed' AND completed = false;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 4. FIX MILESTONE TRACKING FOR BOOKINGS
-- Add trigger to track session completions
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_session_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When booking status changes to 'completed', update milestones
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Insert into user_progress
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
    
    -- Update first_session milestone
    UPDATE user_milestones
    SET completed = true, completed_at = NOW()
    WHERE user_id = NEW.user_id AND milestone_type = 'first_session' AND completed = false;
    
    -- Create notification
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

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_handle_session_completion ON bookings;

-- Create trigger for session completion
CREATE TRIGGER trigger_handle_session_completion
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION handle_session_completion();

-- ============================================================================
-- 5. ADD MISSING UNIQUE CONSTRAINT ON COMPANY_EMPLOYEES
-- Prevent duplicate employee records
-- ============================================================================

-- Add unique constraint if it doesn't exist
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
-- Update the get_user_session_balance function
-- ============================================================================

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_user_session_balance(UUID);

-- Recreate with correct signature
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
  -- Get user's company
  SELECT company_id INTO v_company_id
  FROM profiles
  WHERE id = p_user_id;
  
  -- Get company sessions from company_employees
  RETURN QUERY
  SELECT
    COALESCE(ce.sessions_allocated, 0)::INTEGER AS company_quota,
    COALESCE(ce.sessions_used, 0)::INTEGER AS company_used,
    GREATEST(COALESCE(ce.sessions_allocated, 0) - COALESCE(ce.sessions_used, 0), 0)::INTEGER AS company_available,
    0::INTEGER AS personal_quota, -- TODO: Add personal session support
    0::INTEGER AS personal_used,
    0::INTEGER AS personal_available,
    GREATEST(COALESCE(ce.sessions_allocated, 0) - COALESCE(ce.sessions_used, 0), 0)::INTEGER AS total_remaining
  FROM company_employees ce
  WHERE ce.user_id = p_user_id AND ce.company_id = v_company_id
  LIMIT 1;
  
  -- If no record found, return zeros
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0::INTEGER, 0::INTEGER, 0::INTEGER, 0::INTEGER, 0::INTEGER, 0::INTEGER, 0::INTEGER;
  END IF;
END;
$$;

-- ============================================================================
-- 7. DATA MIGRATION: Fix existing users
-- Initialize milestones and company_employees for existing users
-- ============================================================================

-- Initialize milestones for users who completed onboarding but don't have milestones
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
    
    -- Mark onboarding as completed
    UPDATE user_milestones
    SET completed = true, completed_at = NOW()
    WHERE user_id = v_user.id AND milestone_type = 'onboarding';
  END LOOP;
END $$;

-- Create company_employees records for users with companies but no employee record
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
ON CONFLICT (user_id, company_id) DO NOTHING;

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION handle_onboarding_completion() TO service_role;
GRANT EXECUTE ON FUNCTION ensure_company_employee_record() TO service_role;
GRANT EXECUTE ON FUNCTION notify_booking_created() TO service_role;
GRANT EXECUTE ON FUNCTION handle_session_completion() TO service_role;
GRANT EXECUTE ON FUNCTION get_user_session_balance(UUID) TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON FUNCTION handle_onboarding_completion IS 'Initializes milestones when user completes onboarding';
COMMENT ON FUNCTION ensure_company_employee_record IS 'Ensures company_employees record exists when user is assigned to company';
COMMENT ON FUNCTION notify_booking_created IS 'Creates notifications when bookings are created';
COMMENT ON FUNCTION handle_session_completion IS 'Updates milestones and creates notifications when sessions are completed';

