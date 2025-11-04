-- ============================================================================
-- ALL NOTIFICATION EMAIL TEMPLATES
-- Date: 2025-11-04
-- Purpose: Create email templates for all notification types
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTION: Generate Email HTML Wrapper
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_email_html(
  p_header_color TEXT,
  p_header_title TEXT,
  p_body_content TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN format($html$
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
      <div style="background-color: %s; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">%s</h1>
      </div>
      <div style="background-color: white; padding: 40px; border-radius: 0 0 8px 8px;">
        %s
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 13px; color: #9ca3af; text-align: center; margin: 0;">
          Melhor Saúde - Plataforma de Bem-Estar<br>
          <a href="https://melhorsaude.com/settings/notifications" style="color: #3b82f6; text-decoration: none;">
            Gerir Preferências de Notificações
          </a>
        </p>
      </div>
    </div>
  $html$, p_header_color, p_header_title, p_body_content);
END;
$$;

-- ============================================================================
-- 1. BOOKING CANCELLED EMAIL
-- ============================================================================

CREATE OR REPLACE FUNCTION send_booking_cancelled_email(
  p_user_id UUID,
  p_booking_id UUID,
  p_provider_name TEXT,
  p_booking_date TEXT,
  p_cancellation_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
  v_email_body TEXT;
BEGIN
  -- Get user name
  SELECT raw_user_meta_data->>'name' INTO v_user_name
  FROM auth.users WHERE id = p_user_id;
  
  v_email_body := format($body$
    <p style="font-size: 18px; color: #374151;">Olá <strong>%s</strong>,</p>
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Informamos que a sua sessão com <strong>%s</strong> marcada para <strong>%s</strong> foi cancelada.
    </p>
    %s
    <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <p style="color: #1e40af; margin: 0;">
        <strong>💡 Nota:</strong> A sessão foi devolvida à sua quota e pode reagendar quando desejar.
      </p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://melhorsaude.com/dashboard" 
         style="background-color: #3b82f6; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
        Ver Dashboard
      </a>
    </div>
  $body$,
    COALESCE(v_user_name, 'utilizador'),
    p_provider_name,
    p_booking_date,
    CASE 
      WHEN p_cancellation_reason IS NOT NULL 
      THEN format('<div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;"><p style="color: #92400e; margin: 0;"><strong>Motivo:</strong> %s</p></div>', p_cancellation_reason)
      ELSE ''
    END
  );
  
  PERFORM queue_notification_email(
    p_user_id,
    'booking_cancelled',
    '❌ Sessão Cancelada - Melhor Saúde',
    generate_email_html('#ef4444', '❌ Sessão Cancelada', v_email_body),
    jsonb_build_object('booking_id', p_booking_id)
  );
END;
$$;

-- ============================================================================
-- 2. MILESTONE ACHIEVED EMAIL
-- ============================================================================

CREATE OR REPLACE FUNCTION send_milestone_achieved_email(
  p_user_id UUID,
  p_milestone_type TEXT,
  p_milestone_label TEXT,
  p_points INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
  v_email_body TEXT;
  v_milestone_icon TEXT;
BEGIN
  SELECT raw_user_meta_data->>'name' INTO v_user_name
  FROM auth.users WHERE id = p_user_id;
  
  v_milestone_icon := CASE p_milestone_type
    WHEN 'onboarding' THEN '🎉'
    WHEN 'first_session' THEN '🎯'
    WHEN 'five_sessions' THEN '⭐'
    WHEN 'ten_sessions' THEN '🏆'
    WHEN 'goal_completed' THEN '✅'
    ELSE '🎊'
  END;
  
  v_email_body := format($body$
    <p style="font-size: 18px; color: #374151;">Olá <strong>%s</strong>,</p>
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Parabéns! Acabou de conquistar um novo marco na sua jornada de bem-estar!
    </p>
    <div style="background-color: #ecfdf5; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center; border-left: 4px solid #10b981;">
      <div style="font-size: 48px; margin-bottom: 15px;">%s</div>
      <h2 style="color: #065f46; font-size: 24px; margin: 10px 0;">%s</h2>
      <p style="color: #059669; font-size: 18px; font-weight: 600; margin: 10px 0;">+%s pontos</p>
    </div>
    <p style="font-size: 15px; color: #6b7280; text-align: center;">
      Continue assim! Cada passo conta na sua jornada de bem-estar.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://melhorsaude.com/dashboard" 
         style="background-color: #10b981; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
        Ver Progresso
      </a>
    </div>
  $body$,
    COALESCE(v_user_name, 'utilizador'),
    v_milestone_icon,
    p_milestone_label,
    p_points
  );
  
  PERFORM queue_notification_email(
    p_user_id,
    'milestone_achieved',
    format('%s Novo Marco Conquistado!', v_milestone_icon),
    generate_email_html('#10b981', format('%s Marco Conquistado!', v_milestone_icon), v_email_body),
    jsonb_build_object('milestone_type', p_milestone_type, 'points', p_points)
  );
END;
$$;

-- ============================================================================
-- 3. GOAL PROGRESS EMAIL  
-- ============================================================================

CREATE OR REPLACE FUNCTION send_goal_progress_email(
  p_user_id UUID,
  p_goal_title TEXT,
  p_progress_percentage INTEGER,
  p_pillar TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
  v_email_body TEXT;
  v_pillar_name TEXT;
  v_pillar_icon TEXT;
BEGIN
  SELECT raw_user_meta_data->>'name' INTO v_user_name
  FROM auth.users WHERE id = p_user_id;
  
  -- Map pillar to readable name and icon
  SELECT 
    CASE p_pillar
      WHEN 'saude_mental' THEN 'Saúde Mental'
      WHEN 'bem_estar_fisico' THEN 'Bem-Estar Físico'
      WHEN 'assistencia_financeira' THEN 'Assistência Financeira'
      WHEN 'assistencia_juridica' THEN 'Assistência Jurídica'
      ELSE p_pillar
    END,
    CASE p_pillar
      WHEN 'saude_mental' THEN '🧠'
      WHEN 'bem_estar_fisico' THEN '💪'
      WHEN 'assistencia_financeira' THEN '💰'
      WHEN 'assistencia_juridica' THEN '⚖️'
      ELSE '🎯'
    END
  INTO v_pillar_name, v_pillar_icon;
  
  v_email_body := format($body$
    <p style="font-size: 18px; color: #374151;">Olá <strong>%s</strong>,</p>
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Está a fazer um ótimo progresso no seu objetivo!
    </p>
    <div style="background-color: #f0f9ff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
      <p style="color: #1e40af; margin: 5px 0;"><strong>%s %s</strong></p>
      <h3 style="color: #1e3a8a; margin: 10px 0 15px 0;">%s</h3>
      <div style="background-color: #dbeafe; border-radius: 10px; overflow: hidden; height: 20px; margin: 15px 0;">
        <div style="background-color: #3b82f6; height: 100%%; width: %s%%;"></div>
      </div>
      <p style="color: #3b82f6; font-size: 18px; font-weight: 600; margin: 10px 0;">%s%% completo</p>
    </div>
    <p style="font-size: 15px; color: #6b7280; text-align: center;">
      Continue focado nos seus objetivos. Está no caminho certo!
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://melhorsaude.com/dashboard?tab=goals" 
         style="background-color: #3b82f6; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
        Ver Objetivos
      </a>
    </div>
  $body$,
    COALESCE(v_user_name, 'utilizador'),
    v_pillar_icon,
    v_pillar_name,
    p_goal_title,
    p_progress_percentage,
    p_progress_percentage
  );
  
  PERFORM queue_notification_email(
    p_user_id,
    'goal_progress',
    '📈 Progresso no Objetivo - Melhor Saúde',
    generate_email_html('#3b82f6', '📈 Progresso no Objetivo', v_email_body),
    jsonb_build_object('goal_title', p_goal_title, 'progress', p_progress_percentage)
  );
END;
$$;

-- ============================================================================
-- 4. MESSAGE FROM SPECIALIST EMAIL
-- ============================================================================

CREATE OR REPLACE FUNCTION send_message_from_specialist_email(
  p_user_id UUID,
  p_specialist_name TEXT,
  p_message_preview TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
  v_email_body TEXT;
BEGIN
  SELECT raw_user_meta_data->>'name' INTO v_user_name
  FROM auth.users WHERE id = p_user_id;
  
  v_email_body := format($body$
    <p style="font-size: 18px; color: #374151;">Olá <strong>%s</strong>,</p>
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Recebeu uma nova mensagem de <strong>%s</strong>.
    </p>
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #8b5cf6;">
      <p style="color: #4b5563; font-style: italic; margin: 0;">
        "%s"
      </p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://melhorsaude.com/messages" 
         style="background-color: #8b5cf6; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
        Ver Mensagem
      </a>
    </div>
  $body$,
    COALESCE(v_user_name, 'utilizador'),
    p_specialist_name,
    LEFT(p_message_preview, 150) || CASE WHEN LENGTH(p_message_preview) > 150 THEN '...' ELSE '' END
  );
  
  PERFORM queue_notification_email(
    p_user_id,
    'message_from_specialist',
    format('💬 Nova Mensagem de %s', p_specialist_name),
    generate_email_html('#8b5cf6', '💬 Nova Mensagem', v_email_body),
    jsonb_build_object('specialist_name', p_specialist_name)
  );
END;
$$;

-- ============================================================================
-- 5. CHAT ESCALATION EMAIL (For Specialists)
-- ============================================================================

CREATE OR REPLACE FUNCTION send_chat_escalation_email(
  p_specialist_id UUID,
  p_user_name TEXT,
  p_escalation_reason TEXT,
  p_chat_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_specialist_name TEXT;
  v_email_body TEXT;
BEGIN
  SELECT raw_user_meta_data->>'name' INTO v_specialist_name
  FROM auth.users WHERE id = p_specialist_id;
  
  v_email_body := format($body$
    <p style="font-size: 18px; color: #374151;">Olá <strong>%s</strong>,</p>
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Um utilizador necessita de assistência especializada.
    </p>
    <div style="background-color: #fef3c7; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
      <p style="color: #92400e; margin: 5px 0;"><strong>👤 Utilizador:</strong> %s</p>
      <p style="color: #92400e; margin: 5px 0;"><strong>📋 Motivo:</strong> %s</p>
    </div>
    <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="color: #991b1b; margin: 0;">
        <strong>⚠️ Ação necessária:</strong> Por favor, contacte o utilizador o mais breve possível.
      </p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://melhorsaude.com/specialist/chats/%s" 
         style="background-color: #f59e0b; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
        Ver Conversa
      </a>
    </div>
  $body$,
    COALESCE(v_specialist_name, 'especialista'),
    p_user_name,
    p_escalation_reason,
    p_chat_id
  );
  
  PERFORM queue_notification_email(
    p_specialist_id,
    'chat_escalation',
    '🚨 Assistência Necessária - Utilizador Aguarda Contacto',
    generate_email_html('#f59e0b', '🚨 Assistência Necessária', v_email_body),
    jsonb_build_object('chat_id', p_chat_id, 'user_name', p_user_name)
  );
END;
$$;

-- ============================================================================
-- 6. NEW RESOURCE AVAILABLE EMAIL
-- ============================================================================

CREATE OR REPLACE FUNCTION send_new_resource_email(
  p_user_id UUID,
  p_resource_title TEXT,
  p_resource_type TEXT,
  p_pillar TEXT,
  p_resource_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
  v_email_body TEXT;
  v_resource_icon TEXT;
  v_pillar_name TEXT;
BEGIN
  SELECT raw_user_meta_data->>'name' INTO v_user_name
  FROM auth.users WHERE id = p_user_id;
  
  v_resource_icon := CASE p_resource_type
    WHEN 'article' THEN '📰'
    WHEN 'video' THEN '🎥'
    WHEN 'exercise' THEN '🧘'
    WHEN 'worksheet' THEN '📝'
    WHEN 'guide' THEN '📚'
    ELSE '📄'
  END;
  
  v_pillar_name := CASE p_pillar
    WHEN 'saude_mental' THEN 'Saúde Mental'
    WHEN 'bem_estar_fisico' THEN 'Bem-Estar Físico'
    WHEN 'assistencia_financeira' THEN 'Assistência Financeira'
    WHEN 'assistencia_juridica' THEN 'Assistência Jurídica'
    ELSE p_pillar
  END;
  
  v_email_body := format($body$
    <p style="font-size: 18px; color: #374151;">Olá <strong>%s</strong>,</p>
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Novo recurso disponível para si!
    </p>
    <div style="background-color: #f0fdf4; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
      <div style="font-size: 36px; text-align: center; margin-bottom: 15px;">%s</div>
      <h3 style="color: #065f46; margin: 10px 0;">%s</h3>
      <p style="color: #059669; margin: 5px 0;"><strong>Categoria:</strong> %s</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://melhorsaude.com/resources/%s" 
         style="background-color: #10b981; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
        Ver Recurso
      </a>
    </div>
  $body$,
    COALESCE(v_user_name, 'utilizador'),
    v_resource_icon,
    p_resource_title,
    v_pillar_name,
    p_resource_id
  );
  
  PERFORM queue_notification_email(
    p_user_id,
    'new_resource',
    format('%s Novo Recurso Disponível - %s', v_resource_icon, v_pillar_name),
    generate_email_html('#10b981', format('%s Novo Recurso', v_resource_icon), v_email_body),
    jsonb_build_object('resource_id', p_resource_id, 'resource_type', p_resource_type)
  );
END;
$$;

-- ============================================================================
-- 7. SYSTEM ALERT EMAIL
-- ============================================================================

CREATE OR REPLACE FUNCTION send_system_alert_email(
  p_user_id UUID,
  p_alert_title TEXT,
  p_alert_message TEXT,
  p_alert_priority TEXT DEFAULT 'normal',
  p_action_url TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
  v_email_body TEXT;
  v_header_color TEXT;
  v_alert_icon TEXT;
BEGIN
  SELECT raw_user_meta_data->>'name' INTO v_user_name
  FROM auth.users WHERE id = p_user_id;
  
  v_header_color := CASE p_alert_priority
    WHEN 'urgent' THEN '#dc2626'
    WHEN 'high' THEN '#f59e0b'
    ELSE '#3b82f6'
  END;
  
  v_alert_icon := CASE p_alert_priority
    WHEN 'urgent' THEN '🚨'
    WHEN 'high' THEN '⚠️'
    ELSE 'ℹ️'
  END;
  
  v_email_body := format($body$
    <p style="font-size: 18px; color: #374151;">Olá <strong>%s</strong>,</p>
    <div style="background-color: #f0f9ff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid %s;">
      <h3 style="color: #1e3a8a; margin: 0 0 15px 0;">%s %s</h3>
      <p style="color: #1e40af; margin: 0; line-height: 1.6;">%s</p>
    </div>
    %s
  $body$,
    COALESCE(v_user_name, 'utilizador'),
    v_header_color,
    v_alert_icon,
    p_alert_title,
    p_alert_message,
    CASE 
      WHEN p_action_url IS NOT NULL 
      THEN format('<div style="text-align: center; margin: 30px 0;"><a href="%s" style="background-color: %s; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Ver Detalhes</a></div>', p_action_url, v_header_color)
      ELSE ''
    END
  );
  
  PERFORM queue_notification_email(
    p_user_id,
    'system_alert',
    format('%s %s - Melhor Saúde', v_alert_icon, p_alert_title),
    generate_email_html(v_header_color, format('%s Notificação do Sistema', v_alert_icon), v_email_body),
    jsonb_build_object('priority', p_alert_priority, 'action_url', p_action_url)
  );
END;
$$;

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION generate_email_html(TEXT, TEXT, TEXT) TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION send_booking_cancelled_email(UUID, UUID, TEXT, TEXT, TEXT) TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION send_milestone_achieved_email(UUID, TEXT, TEXT, INTEGER) TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION send_goal_progress_email(UUID, TEXT, INTEGER, TEXT) TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION send_message_from_specialist_email(UUID, TEXT, TEXT) TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION send_chat_escalation_email(UUID, TEXT, TEXT, UUID) TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION send_new_resource_email(UUID, TEXT, TEXT, TEXT, UUID) TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION send_system_alert_email(UUID, TEXT, TEXT, TEXT, TEXT) TO service_role, authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

