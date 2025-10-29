-- Change requests table (for AdminChangeRequestsTab)
CREATE TABLE IF NOT EXISTS change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID REFERENCES prestadores(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('profile_update', 'schedule_change', 'availability_change')),
  requested_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_change_requests_prestador ON change_requests(prestador_id);
CREATE INDEX idx_change_requests_status ON change_requests(status);

-- Chat sessions table (for AdminMatchingTab)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pillar TEXT NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated')),
  phone_contact_made BOOLEAN DEFAULT false,
  session_booked_by_specialist UUID REFERENCES prestadores(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX idx_chat_sessions_escalated ON chat_sessions(phone_contact_made) WHERE phone_contact_made = true;

-- Specialist call logs table
CREATE TABLE IF NOT EXISTS specialist_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  specialist_id UUID REFERENCES auth.users(id),
  booking_id UUID REFERENCES bookings(id),
  call_status TEXT DEFAULT 'pending' CHECK (call_status IN ('pending', 'completed', 'failed')),
  session_booked BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_specialist_call_logs_specialist ON specialist_call_logs(specialist_id);
CREATE INDEX idx_specialist_call_logs_chat_session ON specialist_call_logs(chat_session_id);

-- RLS Policies
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all change requests"
  ON change_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage change requests"
  ON change_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all chat sessions"
  ON chat_sessions FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'especialista_geral'));

CREATE POLICY "Users can view own chat sessions"
  ON chat_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Specialists can view assigned logs"
  ON specialist_call_logs FOR SELECT
  USING (specialist_id = auth.uid() OR has_role(auth.uid(), 'admin'));

