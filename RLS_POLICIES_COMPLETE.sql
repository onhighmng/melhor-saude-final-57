-- ============================================================================
-- ROW LEVEL SECURITY POLICIES - COMPLETE SET
-- Melhor Saúde Platform - Security Policies
-- Run this manually in Supabase SQL Editor AFTER ALL_RPC_FUNCTIONS.sql
-- ============================================================================

-- ============================================================================
-- PART 1: ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestadores DISABLE ROW LEVEL SECURITY; -- Public access for browsing
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_help_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychological_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestador_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestador_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestador_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 2: DROP ALL EXISTING POLICIES (CLEAN SLATE)
-- ============================================================================

DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================================================
-- PART 3: PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "users_view_own_profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "admins_view_all_profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Admins can update all profiles
CREATE POLICY "admins_update_all_profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- HR can view company profiles
CREATE POLICY "hr_view_company_profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'hr'
    ) AND company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Prestadores can view other profiles (for bookings)
CREATE POLICY "prestadores_view_profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'prestador')
  );

-- Allow profile creation on signup
CREATE POLICY "allow_profile_creation" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================================
-- PART 4: COMPANIES TABLE POLICIES
-- ============================================================================

-- Admins can view all companies
CREATE POLICY "admins_view_all_companies" ON companies
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Admins can manage companies
CREATE POLICY "admins_manage_companies" ON companies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- HR can view their own company
CREATE POLICY "hr_view_own_company" ON companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND company_id = companies.id
    ) AND EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'hr'
    )
  );

-- HR can update their own company
CREATE POLICY "hr_update_own_company" ON companies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND company_id = companies.id
    ) AND EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'hr'
    )
  );

-- Employees can view their company
CREATE POLICY "employees_view_own_company" ON companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_employees 
      WHERE user_id = auth.uid() AND company_id = companies.id AND is_active = true
    )
  );

-- ============================================================================
-- PART 5: COMPANY_EMPLOYEES TABLE POLICIES
-- ============================================================================

-- Admins can view all company employees
CREATE POLICY "admins_view_all_company_employees" ON company_employees
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Admins can manage company employees
CREATE POLICY "admins_manage_company_employees" ON company_employees
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- HR can view their company employees
CREATE POLICY "hr_view_company_employees" ON company_employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'hr'
    ) AND company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- HR can manage their company employees
CREATE POLICY "hr_manage_company_employees" ON company_employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'hr'
    ) AND company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can view their own employee record
CREATE POLICY "users_view_own_employee_record" ON company_employees
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- PART 6: USER_ROLES TABLE POLICIES
-- ============================================================================

-- Admins can manage all user roles
CREATE POLICY "admins_manage_user_roles" ON user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Users can view their own roles
CREATE POLICY "users_view_own_roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Allow role creation (for registration flow)
CREATE POLICY "allow_role_creation" ON user_roles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- PART 7: BOOKINGS TABLE POLICIES
-- ============================================================================

-- Admins can view all bookings
CREATE POLICY "admins_view_all_bookings" ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Admins can manage all bookings
CREATE POLICY "admins_manage_bookings" ON bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Users can view their own bookings
CREATE POLICY "users_view_own_bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid());

-- Users can create their own bookings
CREATE POLICY "users_create_own_bookings" ON bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own bookings
CREATE POLICY "users_update_own_bookings" ON bookings
  FOR UPDATE USING (user_id = auth.uid());

-- Prestadores can view their bookings
CREATE POLICY "prestadores_view_own_bookings" ON bookings
  FOR SELECT USING (
    prestador_id IN (SELECT id FROM prestadores WHERE user_id = auth.uid())
  );

-- Prestadores can update their bookings
CREATE POLICY "prestadores_update_own_bookings" ON bookings
  FOR UPDATE USING (
    prestador_id IN (SELECT id FROM prestadores WHERE user_id = auth.uid())
  );

-- HR can view company bookings
CREATE POLICY "hr_view_company_bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'hr'
    ) AND company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Specialists can view referred bookings
CREATE POLICY "specialists_view_referred_bookings" ON bookings
  FOR SELECT USING (
    booking_source = 'specialist_referral'
    AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('specialist', 'especialista_geral')
    )
  );

-- ============================================================================
-- PART 8: CHAT_SESSIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own chat sessions
CREATE POLICY "users_view_own_chat_sessions" ON chat_sessions
  FOR SELECT USING (user_id = auth.uid());

-- Users can create chat sessions
CREATE POLICY "users_create_chat_sessions" ON chat_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own chat sessions
CREATE POLICY "users_update_own_chat_sessions" ON chat_sessions
  FOR UPDATE USING (user_id = auth.uid());

-- Specialists can view all chat sessions
CREATE POLICY "specialists_view_all_chat_sessions" ON chat_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('specialist', 'especialista_geral')
    )
  );

-- Specialists can update chat sessions
CREATE POLICY "specialists_update_chat_sessions" ON chat_sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('specialist', 'especialista_geral')
    )
  );

-- Admins can view all chat sessions
CREATE POLICY "admins_view_all_chat_sessions" ON chat_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 9: CHAT_MESSAGES TABLE POLICIES
-- ============================================================================

-- Users can view messages from their sessions
CREATE POLICY "users_view_own_chat_messages" ON chat_messages
  FOR SELECT USING (
    session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
  );

-- Users can create messages in their sessions
CREATE POLICY "users_create_chat_messages" ON chat_messages
  FOR INSERT WITH CHECK (
    session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
  );

-- Specialists can view all chat messages
CREATE POLICY "specialists_view_all_chat_messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('specialist', 'especialista_geral')
    )
  );

-- Specialists can create messages
CREATE POLICY "specialists_create_chat_messages" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('specialist', 'especialista_geral')
    )
  );

-- Admins can view all messages
CREATE POLICY "admins_view_all_chat_messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 10: RESOURCES TABLE POLICIES
-- ============================================================================

-- Everyone can view active resources
CREATE POLICY "public_view_active_resources" ON resources
  FOR SELECT USING (is_active = true);

-- Admins can manage resources
CREATE POLICY "admins_manage_resources" ON resources
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 11: INVITES TABLE POLICIES
-- ============================================================================

-- Admins can manage all invites
CREATE POLICY "admins_manage_invites" ON invites
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- HR can view their company invites
CREATE POLICY "hr_view_company_invites" ON invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'hr'
    ) AND company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- HR can create invites for their company
CREATE POLICY "hr_create_company_invites" ON invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'hr'
    ) AND company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- HR can update their company invites
CREATE POLICY "hr_update_company_invites" ON invites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'hr'
    ) AND company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Allow public to validate invite codes (for registration)
CREATE POLICY "public_validate_invites" ON invites
  FOR SELECT USING (status = 'pending' AND (expires_at IS NULL OR expires_at > now()));

-- ============================================================================
-- PART 12: NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "users_view_own_notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "users_update_own_notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- System can create notifications for users
CREATE POLICY "system_create_notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Admins can view all notifications
CREATE POLICY "admins_view_all_notifications" ON notifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 13: FEEDBACK TABLE POLICIES
-- ============================================================================

-- Users can view their own feedback
CREATE POLICY "users_view_own_feedback" ON feedback
  FOR SELECT USING (user_id = auth.uid());

-- Users can create feedback
CREATE POLICY "users_create_feedback" ON feedback
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all feedback
CREATE POLICY "admins_view_all_feedback" ON feedback
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Prestadores can view feedback for their sessions
CREATE POLICY "prestadores_view_session_feedback" ON feedback
  FOR SELECT USING (
    session_id IN (
      SELECT cs.id FROM chat_sessions cs
      WHERE cs.provider_id = auth.uid()
    ) OR
    booking_id IN (
      SELECT b.id FROM bookings b
      JOIN prestadores p ON p.id = b.prestador_id
      WHERE p.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PART 14: ADMIN_LOGS TABLE POLICIES
-- ============================================================================

-- Admins can view all logs
CREATE POLICY "admins_view_logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Admins can create logs
CREATE POLICY "admins_create_logs" ON admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 15: SPECIALIST_ASSIGNMENTS TABLE POLICIES
-- ============================================================================

-- Admins can manage assignments
CREATE POLICY "admins_manage_specialist_assignments" ON specialist_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Specialists can view their own assignments
CREATE POLICY "specialists_view_own_assignments" ON specialist_assignments
  FOR SELECT USING (specialist_id = auth.uid());

-- HR can view company specialist assignments
CREATE POLICY "hr_view_company_specialist_assignments" ON specialist_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'hr'
    ) AND company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- PART 16: USER_MILESTONES TABLE POLICIES
-- ============================================================================

-- Users can view their own milestones
CREATE POLICY "users_view_own_milestones" ON user_milestones
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own milestones
CREATE POLICY "users_update_own_milestones" ON user_milestones
  FOR UPDATE USING (user_id = auth.uid());

-- System can create milestones
CREATE POLICY "system_create_milestones" ON user_milestones
  FOR INSERT WITH CHECK (true);

-- Admins can view all milestones
CREATE POLICY "admins_view_all_milestones" ON user_milestones
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 17: USER_PROGRESS TABLE POLICIES
-- ============================================================================

-- Users can view their own progress
CREATE POLICY "users_view_own_progress" ON user_progress
  FOR SELECT USING (user_id = auth.uid());

-- Users can create their own progress entries
CREATE POLICY "users_create_own_progress" ON user_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all progress
CREATE POLICY "admins_view_all_progress" ON user_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 18: SELF_HELP_CONTENT TABLE POLICIES
-- ============================================================================

-- Everyone can view published content
CREATE POLICY "public_view_published_content" ON self_help_content
  FOR SELECT USING (is_published = true);

-- Admins can manage content
CREATE POLICY "admins_manage_content" ON self_help_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Creators can view their own content
CREATE POLICY "creators_view_own_content" ON self_help_content
  FOR SELECT USING (created_by = auth.uid());

-- Creators can update their own content
CREATE POLICY "creators_update_own_content" ON self_help_content
  FOR UPDATE USING (created_by = auth.uid());

-- ============================================================================
-- PART 19: CONTENT_VIEWS TABLE POLICIES
-- ============================================================================

-- Users can view their own content views
CREATE POLICY "users_view_own_content_views" ON content_views
  FOR SELECT USING (user_id = auth.uid());

-- Users can create content views
CREATE POLICY "users_create_content_views" ON content_views
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all content views
CREATE POLICY "admins_view_all_content_views" ON content_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 20: ONBOARDING_DATA TABLE POLICIES
-- ============================================================================

-- Users can view their own onboarding data
CREATE POLICY "users_view_own_onboarding" ON onboarding_data
  FOR SELECT USING (user_id = auth.uid());

-- Users can create their own onboarding data
CREATE POLICY "users_create_own_onboarding" ON onboarding_data
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own onboarding data
CREATE POLICY "users_update_own_onboarding" ON onboarding_data
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can view all onboarding data
CREATE POLICY "admins_view_all_onboarding" ON onboarding_data
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 21: SESSION_NOTES TABLE POLICIES
-- ============================================================================

-- Prestadores can view their own session notes
CREATE POLICY "prestadores_view_own_session_notes" ON session_notes
  FOR SELECT USING (
    prestador_id IN (SELECT id FROM prestadores WHERE user_id = auth.uid())
  );

-- Prestadores can create session notes
CREATE POLICY "prestadores_create_session_notes" ON session_notes
  FOR INSERT WITH CHECK (
    prestador_id IN (SELECT id FROM prestadores WHERE user_id = auth.uid())
  );

-- Prestadores can update their own session notes
CREATE POLICY "prestadores_update_session_notes" ON session_notes
  FOR UPDATE USING (
    prestador_id IN (SELECT id FROM prestadores WHERE user_id = auth.uid())
  );

-- Admins can view all session notes
CREATE POLICY "admins_view_all_session_notes" ON session_notes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 22: CHANGE_REQUESTS TABLE POLICIES
-- ============================================================================

-- Prestadores can view their own change requests
CREATE POLICY "prestadores_view_own_change_requests" ON change_requests
  FOR SELECT USING (
    prestador_id IN (SELECT id FROM prestadores WHERE user_id = auth.uid())
  );

-- Prestadores can create change requests
CREATE POLICY "prestadores_create_change_requests" ON change_requests
  FOR INSERT WITH CHECK (
    prestador_id IN (SELECT id FROM prestadores WHERE user_id = auth.uid())
  );

-- Admins can manage all change requests
CREATE POLICY "admins_manage_change_requests" ON change_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 23: PSYCHOLOGICAL_TESTS TABLE POLICIES
-- ============================================================================

-- Everyone can view active tests
CREATE POLICY "public_view_active_tests" ON psychological_tests
  FOR SELECT USING (is_active = true);

-- Admins can manage tests
CREATE POLICY "admins_manage_tests" ON psychological_tests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 24: TEST_RESULTS TABLE POLICIES
-- ============================================================================

-- Users can view their own test results
CREATE POLICY "users_view_own_test_results" ON test_results
  FOR SELECT USING (user_id = auth.uid());

-- Users can create test results
CREATE POLICY "users_create_test_results" ON test_results
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all test results
CREATE POLICY "admins_view_all_test_results" ON test_results
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 25: PRESTADOR TABLES POLICIES
-- ============================================================================

-- Everyone can view availability
CREATE POLICY "public_view_prestador_availability" ON prestador_availability
  FOR SELECT USING (true);

-- Prestadores can manage their own availability
CREATE POLICY "prestadores_manage_own_availability" ON prestador_availability
  FOR ALL USING (
    prestador_id IN (SELECT id FROM prestadores WHERE user_id = auth.uid())
  );

-- Everyone can view schedule
CREATE POLICY "public_view_prestador_schedule" ON prestador_schedule
  FOR SELECT USING (true);

-- Prestadores can manage their own schedule
CREATE POLICY "prestadores_manage_own_schedule" ON prestador_schedule
  FOR ALL USING (
    prestador_id IN (SELECT id FROM prestadores WHERE user_id = auth.uid())
  );

-- Prestadores can view their own performance
CREATE POLICY "prestadores_view_own_performance" ON prestador_performance
  FOR SELECT USING (
    prestador_id IN (SELECT id FROM prestadores WHERE user_id = auth.uid())
  );

-- Admins can view all performance
CREATE POLICY "admins_view_all_performance" ON prestador_performance
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 26: SESSION_RECORDINGS POLICIES
-- ============================================================================

-- Users can view recordings of their own sessions
CREATE POLICY "users_view_own_session_recordings" ON session_recordings
  FOR SELECT USING (
    booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid())
  );

-- Prestadores can view recordings of their sessions
CREATE POLICY "prestadores_view_session_recordings" ON session_recordings
  FOR SELECT USING (
    booking_id IN (
      SELECT b.id FROM bookings b
      JOIN prestadores p ON p.id = b.prestador_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Admins can view all recordings
CREATE POLICY "admins_view_all_recordings" ON session_recordings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 27: USER_GOALS POLICIES
-- ============================================================================

-- Users can manage their own goals
CREATE POLICY "users_manage_own_goals" ON user_goals
  FOR ALL USING (user_id = auth.uid());

-- Admins can view all goals
CREATE POLICY "admins_view_all_goals" ON user_goals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 28: SPECIALIST_CALL_LOGS POLICIES
-- ============================================================================

-- Specialists can view their own call logs
CREATE POLICY "specialists_view_own_call_logs" ON specialist_call_logs
  FOR SELECT USING (specialist_id = auth.uid());

-- Specialists can create call logs
CREATE POLICY "specialists_create_call_logs" ON specialist_call_logs
  FOR INSERT WITH CHECK (specialist_id = auth.uid());

-- Admins can view all call logs
CREATE POLICY "admins_view_all_call_logs" ON specialist_call_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 29: RESOURCE_ACCESS_LOG POLICIES
-- ============================================================================

-- Users can view their own access logs
CREATE POLICY "users_view_own_access_logs" ON resource_access_log
  FOR SELECT USING (user_id = auth.uid());

-- Users can create access logs
CREATE POLICY "users_create_access_logs" ON resource_access_log
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all access logs
CREATE POLICY "admins_view_all_access_logs" ON resource_access_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 30: ADMIN_ANALYTICS POLICIES
-- ============================================================================

-- Admins can manage admin analytics
CREATE POLICY "admins_manage_admin_analytics" ON admin_analytics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- PART 31: SPECIALIST_ANALYTICS POLICIES
-- ============================================================================

-- Admins can view specialist analytics
CREATE POLICY "admins_view_specialist_analytics" ON specialist_analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Specialists can view analytics
CREATE POLICY "specialists_view_analytics" ON specialist_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('specialist', 'especialista_geral')
    )
  );

-- ============================================================================
-- REFRESH SCHEMA CACHE
-- ============================================================================

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT '✅ ALL RLS POLICIES CREATED SUCCESSFULLY!' as status;
SELECT 'Row Level Security is now fully configured.' as message;
SELECT 'Proceed to run TRIGGERS_AND_AUTOMATION.sql next.' as next_step;





