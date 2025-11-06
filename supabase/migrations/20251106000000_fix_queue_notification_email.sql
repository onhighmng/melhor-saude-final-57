-- ============================================================================
-- FIX EMAIL NOTIFICATION SYSTEM
-- Date: 2025-11-06
-- Purpose: Create missing queue_notification_email function and update constraints
-- ============================================================================

-- ============================================================================
-- 1. FIRST, CHECK AND LOG EXISTING EMAIL TYPES (for debugging)
-- ============================================================================

DO $$
DECLARE
  v_email_types TEXT;
BEGIN
  SELECT string_agg(DISTINCT email_type, ', ') INTO v_email_types
  FROM email_queue;

  RAISE NOTICE 'Existing email types in queue: %', COALESCE(v_email_types, 'none');
END $$;

-- ============================================================================
-- 2. UPDATE EMAIL TYPE CONSTRAINT TO INCLUDE ALL EMAIL TYPES
-- ============================================================================

-- Drop the old constraint
ALTER TABLE email_queue DROP CONSTRAINT IF EXISTS email_queue_email_type_check;

-- Add new constraint with ALL possible email types (comprehensive list)
ALTER TABLE email_queue ADD CONSTRAINT email_queue_email_type_check
CHECK (email_type IN (
  -- Original types
  'booking_confirmation',
  'booking_cancellation',
  'booking_reminder',
  'session_completed',
  'session_reminder_24h',
  'session_reminder_1h',
  'welcome',
  'milestone_achieved',
  -- New types from notification templates
  'booking_cancelled',
  'goal_progress',
  'message_from_specialist',
  'chat_escalation',
  'new_resource',
  'system_alert',
  -- Additional potential types
  'password_reset',
  'email_verification',
  'session_reminder',
  'booking_reminder_24h',
  'booking_reminder_1h',
  'onboarding_complete',
  'milestone',
  'notification'
));

-- ============================================================================
-- 3. CREATE QUEUE_NOTIFICATION_EMAIL WRAPPER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION queue_notification_email(
  p_user_id UUID,
  p_email_type TEXT,
  p_subject TEXT,
  p_body_html TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
  v_email_id UUID;
BEGIN
  -- Fetch user's email from auth.users
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;

  -- If user not found or no email, raise an exception
  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'User with ID % not found or has no email address', p_user_id;
  END IF;

  -- Call the existing queue_email function
  v_email_id := queue_email(
    p_recipient_email := v_user_email,
    p_recipient_user_id := p_user_id,
    p_email_type := p_email_type,
    p_subject := p_subject,
    p_body_html := p_body_html,
    p_metadata := p_metadata
  );

  RETURN v_email_id;
END;
$$;

-- ============================================================================
-- 4. GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION queue_notification_email(UUID, TEXT, TEXT, TEXT, JSONB)
TO service_role, authenticated;

-- ============================================================================
-- 5. ADD COMMENT
-- ============================================================================

COMMENT ON FUNCTION queue_notification_email IS
'Wrapper function that fetches user email and queues notification email.
This function is used by notification triggers to simplify email queueing.';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
