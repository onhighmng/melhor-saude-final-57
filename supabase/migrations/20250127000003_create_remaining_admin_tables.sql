-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_resolucao', 'resolvido')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  sender_type TEXT CHECK (sender_type IN ('user', 'admin')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Resource recommendations (AI-assisted)
CREATE TABLE IF NOT EXISTS resource_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  pillar TEXT NOT NULL,
  reason TEXT,
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'viewed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- System alerts (internal monitoring)
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('pending_call', 'negative_feedback', 'inactive_user', 'low_quota', 'session_today')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  entity_type TEXT,
  entity_id UUID,
  message TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage support tickets" ON support_tickets FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "HR can view company tickets" ON support_tickets FOR SELECT USING (
  has_role(auth.uid(), 'hr') AND company_id IN (
    SELECT company_id FROM company_employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage support messages" ON support_messages FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own recommendations" ON resource_recommendations FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage alerts" ON system_alerts FOR ALL USING (has_role(auth.uid(), 'admin'));

