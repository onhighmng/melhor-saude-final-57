-- ============================================================================
-- COMPLETE DATABASE SCHEMA FOR MELHOR SAÚDE
-- Run this entire script in Supabase SQL Editor to create all tables
-- ============================================================================

-- Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS resource_access_log CASCADE;
DROP TABLE IF EXISTS session_notes CASCADE;
DROP TABLE IF EXISTS session_recordings CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS prestador_performance CASCADE;
DROP TABLE IF EXISTS prestador_schedule CASCADE;
DROP TABLE IF EXISTS prestador_availability CASCADE;
DROP TABLE IF EXISTS prestadores CASCADE;
DROP TABLE IF EXISTS specialist_assignments CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS invites CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS user_milestones CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS company_employees CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================================
-- 1. COMPANIES TABLE
-- ============================================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nuit TEXT UNIQUE,
  email TEXT NOT NULL,
  phone TEXT,
  logo_url TEXT,
  address TEXT,
  industry TEXT,
  sessions_allocated INTEGER DEFAULT 0,
  sessions_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 2. PROFILES TABLE
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('user', 'admin', 'hr', 'prestador', 'especialista_geral')),
  created_at TIMESTAMPTZ DEFAULT now(),
  has_completed_onboarding BOOLEAN DEFAULT false,
  phone TEXT,
  avatar_url TEXT,
  company_id UUID REFERENCES companies(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. USER_ROLES TABLE (for RLS policies)
-- ============================================================================
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'hr', 'prestador', 'specialist', 'especialista_geral')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- ============================================================================
-- 4. COMPANY_EMPLOYEES TABLE
-- ============================================================================
CREATE TABLE company_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID,
  sessions_allocated INTEGER DEFAULT 10,
  sessions_used INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- 5. PRESTADORES TABLE (Providers/Affiliates)
-- ============================================================================
CREATE TABLE prestadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  specialty TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT,
  photo_url TEXT,
  email TEXT,
  pillars TEXT[],
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0,
  total_sessions INTEGER DEFAULT 0
);

-- ============================================================================
-- 6. CHAT_SESSIONS TABLE
-- ============================================================================
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  provider_id UUID REFERENCES profiles(id),
  title TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  phone_escalation_reason TEXT,
  pillar TEXT
);

-- ============================================================================
-- 7. CHAT_MESSAGES TABLE
-- ============================================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id),
  sender_id UUID REFERENCES auth.users(id),
  sender_role TEXT CHECK (sender_role IN ('user', 'prestador', 'especialista_geral', 'admin')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 8. BOOKINGS TABLE (Sessions/Appointments)
-- ============================================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  provider_id UUID REFERENCES profiles(id),
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  prestador_id UUID REFERENCES prestadores(id),
  booking_source TEXT DEFAULT 'direct' CHECK (booking_source IN ('direct', 'referral', 'ai_chat', 'specialist_referral')),
  booking_date DATE,
  date DATE,
  start_time TIME,
  end_time TIME,
  pillar TEXT CHECK (pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')),
  company_id UUID REFERENCES companies(id),
  topic TEXT,
  meeting_link TEXT,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 9. RESOURCES TABLE (Articles, Videos, PDFs)
-- ============================================================================
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  pillar TEXT CHECK (pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')),
  resource_type TEXT CHECK (resource_type IN ('article', 'video', 'exercise', 'worksheet', 'guide')),
  url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- 10. INVITES TABLE (Access Codes)
-- ============================================================================
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  email TEXT,
  invite_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  sessions_allocated INTEGER DEFAULT 5,
  role TEXT CHECK (role IN ('user', 'hr', 'prestador', 'especialista_geral')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  invited_by UUID REFERENCES profiles(id),
  sent_at TIMESTAMPTZ
);

-- ============================================================================
-- 11. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- ============================================================================
-- 12. FEEDBACK TABLE
-- ============================================================================
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id UUID REFERENCES chat_sessions(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 13. USER_MILESTONES TABLE
-- ============================================================================
CREATE TABLE user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  milestone_id TEXT NOT NULL,
  milestone_label TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 14. USER_PROGRESS TABLE
-- ============================================================================
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type TEXT,
  action_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 15. SPECIALIST_ASSIGNMENTS TABLE
-- ============================================================================
CREATE TABLE specialist_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id UUID NOT NULL REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  assigned_by UUID REFERENCES profiles(id),
  pillars TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 16. ADMIN_LOGS TABLE
-- ============================================================================
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 17. SPECIALIST_ANALYTICS TABLE
-- ============================================================================
CREATE TABLE specialist_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  pillar TEXT,
  total_chats INTEGER DEFAULT 0,
  ai_resolved INTEGER DEFAULT 0,
  phone_escalated INTEGER DEFAULT 0,
  sessions_booked INTEGER DEFAULT 0,
  satisfied_users INTEGER DEFAULT 0,
  unsatisfied_users INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_company_employees_company_id ON company_employees(company_id);
CREATE INDEX idx_company_employees_user_id ON company_employees(user_id);
CREATE INDEX idx_prestadores_user_id ON prestadores(user_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_prestador_id ON bookings(prestador_id);
CREATE INDEX idx_bookings_company_id ON bookings(company_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_resources_pillar ON resources(pillar);
CREATE INDEX idx_resources_is_active ON resources(is_active);
CREATE INDEX idx_invites_invite_code ON invites(invite_code);
CREATE INDEX idx_invites_company_id ON invites(company_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Disable RLS on prestadores (open access)
ALTER TABLE prestadores DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR BOOKINGS
-- ============================================================================
CREATE POLICY "admins_view_all_bookings" ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "admins_update_all_bookings" ON bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "admins_insert_bookings" ON bookings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "admins_delete_bookings" ON bookings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "users_view_own_bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "prestadores_view_own_bookings" ON bookings
  FOR SELECT USING (
    prestador_id IN (SELECT id FROM prestadores WHERE user_id = auth.uid())
  );

CREATE POLICY "hr_view_company_bookings" ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'hr')
    AND company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "specialists_view_referred_bookings" ON bookings
  FOR SELECT USING (
    booking_source = 'specialist_referral'
    AND EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('specialist', 'especialista_geral'))
  );

-- ============================================================================
-- RLS POLICIES FOR RESOURCES
-- ============================================================================
CREATE POLICY "admins_manage_resources" ON resources
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "public_view_active_resources" ON resources
  FOR SELECT USING (is_active = true);

-- ============================================================================
-- RLS POLICIES FOR NOTIFICATIONS
-- ============================================================================
CREATE POLICY "users_view_own_notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_update_own_notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES FOR USER_ROLES
-- ============================================================================
CREATE POLICY "admins_manage_user_roles" ON user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "users_view_own_roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES FOR COMPANY_EMPLOYEES
-- ============================================================================
CREATE POLICY "admins_view_all_company_employees" ON company_employees
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "hr_view_company_employees" ON company_employees
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'hr')
    AND company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================================
-- RLS POLICIES FOR INVITES
-- ============================================================================
CREATE POLICY "admins_manage_invites" ON invites
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

CREATE POLICY "hr_manage_company_invites" ON invites
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'hr')
    AND company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================================
-- RLS POLICIES FOR ADMIN_LOGS
-- ============================================================================
CREATE POLICY "admins_view_logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Function to promote user to admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found with email: ' || user_email);
  END IF;

  -- Update profile role (if role column exists)
  UPDATE profiles SET role = 'admin' WHERE id = target_user_id;

  -- Insert or update user_roles
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN json_build_object('success', true, 'message', 'User promoted to admin successfully', 'user_id', target_user_id, 'email', user_email);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION promote_to_admin(TEXT) TO postgres;
GRANT EXECUTE ON FUNCTION promote_to_admin(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION promote_to_admin(TEXT) TO authenticated;

-- ============================================================================
-- NOTIFY SCHEMA RELOAD
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
SELECT 
  '✅ SUCCESS! All tables created.' as status,
  COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- List all tables
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '🔒 RLS Enabled' ELSE '🔓 RLS Disabled' END as security_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

