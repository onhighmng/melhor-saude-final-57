-- Phase 3: Notifications & Communication
-- Email templates, preferences, logs, and company invitations

-- 1. Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_key ON email_templates(key);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);

-- RLS for email_templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS email_templates_public_read
  ON email_templates
  FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY IF NOT EXISTS email_templates_admin_all
  ON email_templates
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 2. Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  email_reminders BOOLEAN DEFAULT true,
  email_marketing BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  notification_frequency TEXT DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly', 'never')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- RLS for notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS notification_preferences_user_own
  ON notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY IF NOT EXISTS notification_preferences_user_update_own
  ON notification_preferences
  FOR INSERT, UPDATE
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS notification_preferences_admin_all
  ON notification_preferences
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 3. Communication Logs
CREATE TABLE IF NOT EXISTS communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('email', 'sms', 'push', 'in_app')),
  recipient TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  template_key TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'failed', 'bounced', 'complained')),
  error_message TEXT,
  external_id TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_communication_logs_user_id ON communication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_message_type ON communication_logs(message_type);
CREATE INDEX IF NOT EXISTS idx_communication_logs_status ON communication_logs(status);
CREATE INDEX IF NOT EXISTS idx_communication_logs_created_at ON communication_logs(created_at DESC);

-- RLS for communication_logs
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS communication_logs_user_own
  ON communication_logs
  FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY IF NOT EXISTS communication_logs_admin_all
  ON communication_logs
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 4. Booking Reminders
CREATE TABLE IF NOT EXISTS booking_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email', 'sms', 'push')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  communication_log_id UUID REFERENCES communication_logs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_reminders_booking_id ON booking_reminders(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_status ON booking_reminders(status);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_scheduled_for ON booking_reminders(scheduled_for);

-- RLS for booking_reminders
ALTER TABLE booking_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS booking_reminders_booking_users
  ON booking_reminders
  FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid() OR provider_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY IF NOT EXISTS booking_reminders_admin_all
  ON booking_reminders
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 5. Company Employee Invitations
CREATE TABLE IF NOT EXISTS company_employee_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'hr')),
  invited_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rejected_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_company_employee_invitations_company_id ON company_employee_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_employee_invitations_email ON company_employee_invitations(email);
CREATE INDEX IF NOT EXISTS idx_company_employee_invitations_status ON company_employee_invitations(status);
CREATE INDEX IF NOT EXISTS idx_company_employee_invitations_token ON company_employee_invitations(token);
CREATE INDEX IF NOT EXISTS idx_company_employee_invitations_expires_at ON company_employee_invitations(expires_at);

-- RLS for company_employee_invitations
ALTER TABLE company_employee_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS company_employee_invitations_company_users
  ON company_employee_invitations
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_employees WHERE user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY IF NOT EXISTS company_employee_invitations_admin_all
  ON company_employee_invitations
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Grant permissions
GRANT SELECT ON email_templates TO authenticated, anon;
GRANT ALL ON email_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notification_preferences TO authenticated;
GRANT INSERT, SELECT ON communication_logs TO authenticated;
GRANT SELECT, INSERT ON booking_reminders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON company_employee_invitations TO authenticated;




