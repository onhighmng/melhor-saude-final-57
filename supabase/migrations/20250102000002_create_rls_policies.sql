-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestador_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestador_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestador_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_data ENABLE ROW LEVEL SECURITY;

-- Profiles table policies
CREATE POLICY "users_view_own_profile" ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "admins_view_all_profiles" ON profiles FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "hr_view_company_employees" ON profiles FOR SELECT 
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Companies table policies
CREATE POLICY "users_view_company" ON companies FOR SELECT 
  USING (
    id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "hr_view_own_company" ON companies FOR SELECT 
  USING (
    id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "admins_view_all_companies" ON companies FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Bookings table policies
CREATE POLICY "users_view_own_bookings" ON bookings FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "users_create_own_bookings" ON bookings FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_bookings" ON bookings FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "prestadores_view_assigned_bookings" ON bookings FOR SELECT 
  USING (
    prestador_id IN (
      SELECT id FROM prestadores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "prestadores_update_assigned_bookings" ON bookings FOR UPDATE 
  USING (
    prestador_id IN (
      SELECT id FROM prestadores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "hr_view_company_bookings" ON bookings FOR SELECT 
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "admins_view_all_bookings" ON bookings FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admins_update_all_bookings" ON bookings FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Prestadores table policies
CREATE POLICY "prestadores_view_own" ON prestadores FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "prestadores_update_own" ON prestadores FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "all_view_approved_prestadores" ON prestadores FOR SELECT 
  USING (is_approved = true AND is_active = true);

CREATE POLICY "admins_view_all_prestadores" ON prestadores FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admins_update_all_prestadores" ON prestadores FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Company employees policies
CREATE POLICY "users_view_own_employee_record" ON company_employees FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "hr_view_company_employees" ON company_employees FOR SELECT 
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "admins_view_all_employees" ON company_employees FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "hr_update_company_employees" ON company_employees FOR UPDATE 
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Resources policies
CREATE POLICY "all_view_published_free_resources" ON resources FOR SELECT 
  USING (is_published = true AND is_premium = false);

CREATE POLICY "users_view_published_premium" ON resources FOR SELECT 
  USING (
    is_published = true AND is_premium = true AND
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "admins_manage_resources" ON resources FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Session notes policies
CREATE POLICY "prestadores_view_own_notes" ON session_notes FOR SELECT 
  USING (
    prestador_id IN (
      SELECT id FROM prestadores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "prestadores_insert_own_notes" ON session_notes FOR INSERT 
  WITH CHECK (
    prestador_id IN (
      SELECT id FROM prestadores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "prestadores_update_own_notes" ON session_notes FOR UPDATE 
  USING (
    prestador_id IN (
      SELECT id FROM prestadores WHERE user_id = auth.uid()
    )
  );

-- Admin logs policies
CREATE POLICY "admins_view_all_logs" ON admin_logs FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admins_insert_logs" ON admin_logs FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Specialist assignments policies
CREATE POLICY "specialists_view_own_assignments" ON specialist_assignments FOR SELECT 
  USING (specialist_id = auth.uid());

CREATE POLICY "admins_manage_assignments" ON specialist_assignments FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Feedback policies
CREATE POLICY "users_view_own_feedback" ON feedback FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "users_insert_feedback" ON feedback FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins_view_all_feedback" ON feedback FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admins_update_feedback" ON feedback FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Onboarding data policies
CREATE POLICY "users_view_own_onboarding" ON onboarding_data FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "users_insert_onboarding" ON onboarding_data FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_onboarding" ON onboarding_data FOR UPDATE 
  USING (user_id = auth.uid());

-- Platform settings policies
CREATE POLICY "admins_view_settings" ON platform_settings FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admins_update_settings" ON platform_settings FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

