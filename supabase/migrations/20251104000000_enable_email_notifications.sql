-- ============================================================================
-- EMAIL NOTIFICATION SYSTEM
-- Date: 2025-11-04
-- Purpose: Enable automatic email notifications for bookings and events
-- ============================================================================

-- ============================================================================
-- 1. ENABLE PG_NET EXTENSION FOR HTTP REQUESTS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ============================================================================
-- 2. CREATE EMAIL QUEUE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL CHECK (email_type IN (
    'booking_confirmation',
    'booking_cancellation',
    'booking_reminder',
    'session_completed',
    'session_reminder_24h',
    'session_reminder_1h',
    'welcome',
    'milestone_achieved'
  )),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Indexes for email_queue
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_recipient_user ON email_queue(recipient_user_id);

-- Enable RLS
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Admin can view all email queue
CREATE POLICY "Admins can view email queue"
  ON email_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 3. CREATE FUNCTION TO QUEUE EMAILS
-- ============================================================================

CREATE OR REPLACE FUNCTION queue_email(
  p_recipient_email TEXT,
  p_recipient_user_id UUID,
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
  v_email_id UUID;
BEGIN
  -- Insert into email queue
  INSERT INTO email_queue (
    recipient_email,
    recipient_user_id,
    email_type,
    subject,
    body_html,
    metadata,
    status
  )
  VALUES (
    p_recipient_email,
    p_recipient_user_id,
    p_email_type,
    p_subject,
    p_body_html,
    p_metadata,
    'pending'
  )
  RETURNING id INTO v_email_id;

  RETURN v_email_id;
END;
$$;

-- ============================================================================
-- 4. CREATE FUNCTION TO SEND EMAIL VIA EDGE FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION send_queued_email(p_email_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email RECORD;
  v_request_id BIGINT;
  v_supabase_url TEXT;
  v_service_role_key TEXT;
BEGIN
  -- Get email from queue
  SELECT * INTO v_email
  FROM email_queue
  WHERE id = p_email_id
  AND status IN ('pending', 'failed')
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Update status to sending
  UPDATE email_queue
  SET status = 'sending',
      attempts = attempts + 1,
      last_attempt_at = NOW()
  WHERE id = p_email_id;

  -- Get Supabase URL from environment (you'll need to set this)
  -- For now, we'll use a placeholder approach
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_role_key := current_setting('app.settings.service_role_key', true);

  -- Call send-booking-email edge function using pg_net
  SELECT net.http_post(
    url := v_supabase_url || '/functions/v1/send-booking-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_role_key
    ),
    body := jsonb_build_object(
      'to', v_email.recipient_email,
      'subject', v_email.subject,
      'html', v_email.body_html,
      'type', v_email.email_type,
      'metadata', v_email.metadata
    )
  ) INTO v_request_id;

  -- Mark as sent (we'll update this based on webhook response in production)
  UPDATE email_queue
  SET status = 'sent',
      sent_at = NOW()
  WHERE id = p_email_id;

  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    -- Mark as failed
    UPDATE email_queue
    SET status = 'failed',
        error_message = SQLERRM
    WHERE id = p_email_id;
    
    RETURN FALSE;
END;
$$;

-- ============================================================================
-- 5. UPDATE BOOKING NOTIFICATION TRIGGER TO QUEUE EMAILS
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_booking_created_with_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider_name TEXT;
  v_booking_date_formatted TEXT;
  v_user_profile RECORD;
  v_email_body TEXT;
BEGIN
  -- Get provider name
  SELECT name INTO v_provider_name
  FROM prestadores
  WHERE id = NEW.prestador_id;

  -- Get user profile with email
  SELECT id, email, name INTO v_user_profile
  FROM auth.users u
  WHERE u.id = NEW.user_id;
  
  -- Format booking date
  v_booking_date_formatted := TO_CHAR(NEW.booking_date, 'DD/MM/YYYY');

  -- Create in-app notification
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

  -- Queue email notification
  IF v_user_profile.email IS NOT NULL THEN
    v_email_body := format('
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">✅ Sessão Confirmada</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #374151;">Olá %s,</p>
          <p style="font-size: 16px; color: #374151;">
            A sua sessão com <strong>%s</strong> foi confirmada!
          </p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 5px 0; color: #6b7280;"><strong>Data:</strong> %s</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Hora:</strong> %s</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Prestador:</strong> %s</p>
          </div>
          <p style="font-size: 14px; color: #6b7280;">
            Receberá lembretes 24 horas e 1 hora antes da sessão.
          </p>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">
            Melhor Saúde - Plataforma de Bem-Estar
          </p>
        </div>
      </div>
    ',
      COALESCE(v_user_profile.name, 'utilizador'),
      COALESCE(v_provider_name, 'o especialista'),
      v_booking_date_formatted,
      NEW.start_time::TEXT,
      COALESCE(v_provider_name, 'Especialista')
    );

    PERFORM queue_email(
      p_recipient_email := v_user_profile.email,
      p_recipient_user_id := NEW.user_id,
      p_email_type := 'booking_confirmation',
      p_subject := '✅ Sessão Confirmada - Melhor Saúde',
      p_body_html := v_email_body,
      p_metadata := jsonb_build_object(
        'booking_id', NEW.id,
        'prestador_id', NEW.prestador_id,
        'booking_date', NEW.booking_date
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_notify_booking_created ON bookings;

CREATE TRIGGER trigger_notify_booking_created
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_created_with_email();

-- ============================================================================
-- 6. CREATE SESSION COMPLETION EMAIL TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_session_completion_with_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_profile RECORD;
  v_email_body TEXT;
BEGIN
  -- Only process when status changes to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Get user profile
    SELECT id, email, name INTO v_user_profile
    FROM auth.users
    WHERE id = NEW.user_id;

    -- Create in-app notification
    INSERT INTO notifications (user_id, type, title, message, related_booking_id, priority)
    VALUES (
      NEW.user_id,
      'session_completed',
      '🎉 Sessão Concluída',
      'A sua sessão foi marcada como concluída. Por favor, avalie a sua experiência!',
      NEW.id,
      'normal'
    );

    -- Queue email if user has email
    IF v_user_profile.email IS NOT NULL THEN
      v_email_body := format('
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">🎉 Sessão Concluída</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #374151;">Olá %s,</p>
            <p style="font-size: 16px; color: #374151;">
              A sua sessão foi concluída com sucesso!
            </p>
            <p style="font-size: 16px; color: #374151;">
              Como foi a sua experiência? A sua opinião é muito importante para nós.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="%s/feedback/%s" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Avaliar Sessão
              </a>
            </div>
            <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">
              Melhor Saúde - Plataforma de Bem-Estar
            </p>
          </div>
        </div>
      ',
        COALESCE(v_user_profile.name, 'utilizador'),
        current_setting('app.settings.app_url', true),
        NEW.id::text
      );

      PERFORM queue_email(
        p_recipient_email := v_user_profile.email,
        p_recipient_user_id := NEW.user_id,
        p_email_type := 'session_completed',
        p_subject := '🎉 Sessão Concluída - Avalie a sua Experiência',
        p_body_html := v_email_body,
        p_metadata := jsonb_build_object('booking_id', NEW.id)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_session_completion_email ON bookings;

CREATE TRIGGER trigger_session_completion_email
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION notify_session_completion_with_email();

-- ============================================================================
-- 7. CREATE FUNCTION TO PROCESS EMAIL QUEUE (for cron job or manual trigger)
-- ============================================================================

CREATE OR REPLACE FUNCTION process_email_queue(p_batch_size INTEGER DEFAULT 10)
RETURNS TABLE (
  processed INTEGER,
  succeeded INTEGER,
  failed INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_id UUID;
  v_processed INTEGER := 0;
  v_succeeded INTEGER := 0;
  v_failed INTEGER := 0;
  v_success BOOLEAN;
BEGIN
  -- Process pending emails
  FOR v_email_id IN
    SELECT id
    FROM email_queue
    WHERE status = 'pending'
    AND attempts < 3
    ORDER BY created_at
    LIMIT p_batch_size
  LOOP
    v_processed := v_processed + 1;
    
    -- Try to send email
    v_success := send_queued_email(v_email_id);
    
    IF v_success THEN
      v_succeeded := v_succeeded + 1;
    ELSE
      v_failed := v_failed + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_processed, v_succeeded, v_failed;
END;
$$;

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON email_queue TO authenticated;
GRANT EXECUTE ON FUNCTION queue_email(TEXT, UUID, TEXT, TEXT, TEXT, JSONB) TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION send_queued_email(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION process_email_queue(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION notify_booking_created_with_email() TO service_role;
GRANT EXECUTE ON FUNCTION notify_session_completion_with_email() TO service_role;

-- ============================================================================
-- 9. ADD COMMENTS
-- ============================================================================

COMMENT ON TABLE email_queue IS 'Queue for email notifications to be sent via edge functions';
COMMENT ON FUNCTION queue_email IS 'Queues an email to be sent via edge function';
COMMENT ON FUNCTION send_queued_email IS 'Sends a queued email via pg_net to edge function';
COMMENT ON FUNCTION process_email_queue IS 'Processes batch of pending emails from queue';
COMMENT ON FUNCTION notify_booking_created_with_email IS 'Creates notification and queues email when booking is created';
COMMENT ON FUNCTION notify_session_completion_with_email IS 'Creates notification and queues email when session is completed';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
