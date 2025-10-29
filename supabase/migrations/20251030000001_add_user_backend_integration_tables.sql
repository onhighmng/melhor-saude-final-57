-- ============================================
-- USER BACKEND INTEGRATION MIGRATIONS
-- Adds tables and columns for onboarding, milestones, notifications, and goals
-- ============================================

-- 1. Add has_completed_onboarding flag to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(has_completed_onboarding);

-- 2. Create user_milestones table for journey tracking
CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN (
    'onboarding', 'specialist', 'first_session', 'resources', 
    'ratings', 'goal', 'chat_interaction', 'booking_confirmed'
  )),
  label TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, milestone_type)
);

CREATE INDEX IF NOT EXISTS idx_user_milestones_user ON user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_completed ON user_milestones(completed);

-- 3. Create user_goals table for personalized objectives
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pillar TEXT NOT NULL CHECK (pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')),
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  source TEXT DEFAULT 'onboarding' CHECK (source IN ('onboarding', 'manual', 'system')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_user_goals_user ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_goals_pillar ON user_goals(pillar);

-- 4. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'booking_confirmed', 'booking_cancelled', 'session_reminder', 
    'new_resource', 'milestone_achieved', 'message_from_specialist',
    'session_completed', 'goal_progress'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- 5. Enable RLS on new tables
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for user_milestones
DROP POLICY IF EXISTS "Users can view their own milestones" ON user_milestones;
CREATE POLICY "Users can view their own milestones"
  ON user_milestones FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own milestones" ON user_milestones;
CREATE POLICY "Users can insert their own milestones"
  ON user_milestones FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own milestones" ON user_milestones;
CREATE POLICY "Users can update their own milestones"
  ON user_milestones FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all milestones" ON user_milestones;
CREATE POLICY "Admins can view all milestones"
  ON user_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 7. RLS Policies for user_goals
DROP POLICY IF EXISTS "Users can view their own goals" ON user_goals;
CREATE POLICY "Users can view their own goals"
  ON user_goals FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own goals" ON user_goals;
CREATE POLICY "Users can insert their own goals"
  ON user_goals FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own goals" ON user_goals;
CREATE POLICY "Users can update their own goals"
  ON user_goals FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all goals" ON user_goals;
CREATE POLICY "Admins can view all goals"
  ON user_goals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 8. RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 9. Create function to initialize default milestones for new users
CREATE OR REPLACE FUNCTION initialize_user_milestones(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_milestones (user_id, milestone_type, label, points)
  VALUES
    (p_user_id, 'onboarding', 'Concluiu o onboarding', 10),
    (p_user_id, 'specialist', 'Falou com um especialista', 20),
    (p_user_id, 'first_session', 'Fez a primeira sessão', 25),
    (p_user_id, 'resources', 'Usou recursos da plataforma', 15),
    (p_user_id, 'ratings', 'Avaliou 3 sessões efetuadas', 20),
    (p_user_id, 'goal', 'Atingiu 1 objetivo pessoal', 10)
  ON CONFLICT (user_id, milestone_type) DO NOTHING;
END;
$$;

-- 10. Create function to generate goals from onboarding data
CREATE OR REPLACE FUNCTION generate_goals_from_onboarding(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_onboarding RECORD;
  v_pillar TEXT;
BEGIN
  -- Get onboarding data
  SELECT * INTO v_onboarding
  FROM onboarding_data
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Generate goals based on pillar preferences
  FOREACH v_pillar IN ARRAY v_onboarding.pillar_preferences
  LOOP
    IF v_pillar = 'saude_mental' THEN
      INSERT INTO user_goals (user_id, pillar, title, description, target_value)
      VALUES (
        p_user_id,
        'saude_mental',
        'Reduzir stress e ansiedade',
        'Melhorar bem-estar mental através de sessões regulares',
        5
      ) ON CONFLICT DO NOTHING;
    ELSIF v_pillar = 'bem_estar_fisico' THEN
      INSERT INTO user_goals (user_id, pillar, title, description, target_value)
      VALUES (
        p_user_id,
        'bem_estar_fisico',
        'Melhorar condição física',
        'Adotar hábitos mais saudáveis',
        5
      ) ON CONFLICT DO NOTHING;
    ELSIF v_pillar = 'assistencia_financeira' THEN
      INSERT INTO user_goals (user_id, pillar, title, description, target_value)
      VALUES (
        p_user_id,
        'assistencia_financeira',
        'Estabilidade financeira',
        'Organizar finanças pessoais',
        3
      ) ON CONFLICT DO NOTHING;
    ELSIF v_pillar = 'assistencia_juridica' THEN
      INSERT INTO user_goals (user_id, pillar, title, description, target_value)
      VALUES (
        p_user_id,
        'assistencia_juridica',
        'Resolver questões legais',
        'Obter apoio jurídico necessário',
        3
      ) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- 11. Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_action_url, p_metadata)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION initialize_user_milestones(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_goals_from_onboarding(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;

