-- ============================================================================
-- INTEGRATE EMAIL NOTIFICATIONS WITH EXISTING TRIGGERS
-- Date: 2025-11-04
-- Purpose: Update existing triggers to send emails based on user preferences
-- ============================================================================

-- ============================================================================
-- 1. UPDATE handle_onboarding_completion TO SEND MILESTONE EMAIL
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_onboarding_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_welcome_title TEXT;
  v_welcome_body TEXT;
BEGIN
  -- Initialize milestones
  INSERT INTO user_milestones (user_id, milestone_type, label, target_value, progress_value)
  VALUES 
    (NEW.id, 'onboarding', 'Bem-vindo!', 1, 1),
    (NEW.id, 'first_session', 'Primeira Sessão', 1, 0),
    (NEW.id, 'five_sessions', '5 Sessões Completas', 5, 0),
    (NEW.id, 'ten_sessions', '10 Sessões Completas', 10, 0),
    (NEW.id, 'goal_completed', 'Primeiro Objetivo Alcançado', 1, 0)
  ON CONFLICT (user_id, milestone_type) 
  DO UPDATE SET 
    progress_value = EXCLUDED.progress_value,
    completed = CASE WHEN EXCLUDED.progress_value >= user_milestones.target_value THEN true ELSE false END,
    completed_at = CASE WHEN EXCLUDED.progress_value >= user_milestones.target_value THEN NOW() ELSE NULL END;
  
  -- Mark onboarding as complete
  UPDATE user_milestones 
  SET completed = true, completed_at = NOW(), progress_value = 1
  WHERE user_id = NEW.id AND milestone_type = 'onboarding';
  
  -- Create in-app notification
  INSERT INTO notifications (user_id, type, title, message, priority, metadata)
  VALUES (
    NEW.id,
    'milestone_achieved',
    '🎉 Bem-vindo à Melhor Saúde!',
    'Parabéns por completar o seu perfil! A sua jornada de bem-estar começa agora.',
    'high',
    jsonb_build_object('milestone_type', 'onboarding', 'points', 10)
  );
  
  -- Queue welcome email (already in 20251104000000_enable_email_notifications.sql)
  PERFORM queue_email(
    recipient_email := NEW.email,
    recipient_user_id := NEW.id,
    email_type := 'welcome',
    subject := '🎉 Bem-vindo à Melhor Saúde!',
    body_html := format($email$
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
        <div style="background-color: #10b981; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Bem-vindo à Melhor Saúde!</h1>
        </div>
        <div style="background-color: white; padding: 40px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 18px; color: #374151;">Olá <strong>%s</strong>,</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            É um prazer tê-lo(a) connosco! A sua jornada de bem-estar já começou.
          </p>
          <div style="background-color: #ecfdf5; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #065f46; margin: 0 0 15px 0;">✨ Próximos Passos:</h3>
            <ul style="color: #059669; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
              <li>Explore os prestadores disponíveis</li>
              <li>Agende a sua primeira sessão</li>
              <li>Defina os seus objetivos de bem-estar</li>
              <li>Aceda aos recursos personalizados</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://melhorsaude.com/dashboard" 
               style="background-color: #10b981; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              Ir para o Dashboard
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 13px; color: #9ca3af; text-align: center; margin: 0;">
            Melhor Saúde - Plataforma de Bem-Estar<br>
            <a href="https://melhorsaude.com/settings/notifications" style="color: #3b82f6; text-decoration: none;">
              Gerir Preferências de Notificações
            </a>
          </p>
        </div>
      </div>
    $email$, COALESCE((NEW.raw_user_meta_data->>'name')::TEXT, 'utilizador')),
    metadata := jsonb_build_object('milestone_type', 'onboarding')
  );
  
  -- Send milestone achievement email
  PERFORM send_milestone_achieved_email(
    NEW.id,
    'onboarding',
    'Bem-vindo!',
    10
  );
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. ADD TRIGGER FOR BOOKING CANCELLATIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_booking_cancellation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_provider_user_id UUID;
  v_provider_name TEXT;
  v_booking_date_formatted TEXT;
  v_cancellation_reason TEXT;
BEGIN
  -- Only process if status changed to cancelled
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    
    v_booking_date_formatted := TO_CHAR(NEW.booking_date, 'DD/MM/YYYY às HH24:MI');
    v_cancellation_reason := NEW.metadata->>'cancellation_reason';
    
    -- Get provider name
    IF NEW.prestador_id IS NOT NULL THEN
      SELECT p.user_id, au.raw_user_meta_data->>'name'
      INTO v_provider_user_id, v_provider_name
      FROM prestadores p
      JOIN auth.users au ON au.id = p.user_id
      WHERE p.id = NEW.prestador_id;
    END IF;
    
    -- Create in-app notification for user
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      related_booking_id,
      priority
    ) VALUES (
      NEW.user_id,
      'booking_cancelled',
      'Sessão Cancelada',
      format('A sua sessão com %s foi cancelada.', COALESCE(v_provider_name, 'o prestador')),
      NEW.id,
      'high'
    );
    
    -- Send cancellation email to user
    PERFORM send_booking_cancelled_email(
      NEW.user_id,
      NEW.id,
      COALESCE(v_provider_name, 'o prestador'),
      v_booking_date_formatted,
      v_cancellation_reason
    );
    
    -- Notify provider if exists
    IF v_provider_user_id IS NOT NULL THEN
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_booking_id,
        priority
      ) VALUES (
        v_provider_user_id,
        'booking_cancelled',
        'Sessão Cancelada',
        'Uma sessão foi cancelada.',
        NEW.id,
        'normal'
      );
      
      -- Send email to provider (reuse same function, it works for providers too)
      PERFORM queue_notification_email(
        v_provider_user_id,
        'booking_cancelled',
        '❌ Sessão Cancelada - Melhor Saúde',
        format($email$
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
            <div style="background-color: #ef4444; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">❌ Sessão Cancelada</h1>
            </div>
            <div style="background-color: white; padding: 40px; border-radius: 0 0 8px 8px;">
              <p style="font-size: 18px; color: #374151;">Olá <strong>%s</strong>,</p>
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Informamos que uma sessão agendada para <strong>%s</strong> foi cancelada.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://melhorsaude.com/provider/bookings" 
                   style="background-color: #3b82f6; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                  Ver Agendamentos
                </a>
              </div>
            </div>
          </div>
        $email$, COALESCE(v_provider_name, 'prestador'), v_booking_date_formatted),
        jsonb_build_object('booking_id', NEW.id)
      );
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_booking_cancellation ON bookings;
CREATE TRIGGER trigger_booking_cancellation
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_booking_cancellation();

-- ============================================================================
-- 3. ADD TRIGGER FOR GOAL PROGRESS
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_goal_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify on significant progress milestones: 25%, 50%, 75%, 100%
  IF NEW.progress_percentage >= 25 AND OLD.progress_percentage < 25 AND NEW.progress_percentage != 100 THEN
    PERFORM send_goal_progress_email(NEW.user_id, NEW.title, 25, NEW.pillar);
  ELSIF NEW.progress_percentage >= 50 AND OLD.progress_percentage < 50 AND NEW.progress_percentage != 100 THEN
    PERFORM send_goal_progress_email(NEW.user_id, NEW.title, 50, NEW.pillar);
  ELSIF NEW.progress_percentage >= 75 AND OLD.progress_percentage < 75 AND NEW.progress_percentage != 100 THEN
    PERFORM send_goal_progress_email(NEW.user_id, NEW.title, 75, NEW.pillar);
  ELSIF NEW.progress_percentage = 100 AND OLD.progress_percentage < 100 THEN
    -- Goal completed
    PERFORM send_goal_progress_email(NEW.user_id, NEW.title, 100, NEW.pillar);
    
    -- Also send milestone achievement
    PERFORM send_milestone_achieved_email(
      NEW.user_id,
      'goal_completed',
      'Objetivo Alcançado: ' || NEW.title,
      50
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_goal_progress ON user_goals;
CREATE TRIGGER trigger_goal_progress
  AFTER UPDATE OF progress_percentage ON user_goals
  FOR EACH ROW
  WHEN (NEW.progress_percentage IS DISTINCT FROM OLD.progress_percentage)
  EXECUTE FUNCTION notify_goal_progress();

-- ============================================================================
-- 4. COMMENTS
-- ============================================================================

COMMENT ON FUNCTION handle_onboarding_completion IS 'Sends welcome and milestone emails when onboarding completes';
COMMENT ON FUNCTION handle_booking_cancellation IS 'Notifies users and providers via email when bookings are cancelled';
COMMENT ON FUNCTION notify_goal_progress IS 'Sends progress emails at milestone percentages (25%, 50%, 75%, 100%)';

