-- Create support tickets system for admin support management

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  ticket_number TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')) DEFAULT 'open',
  category TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_company_id ON support_tickets(company_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);

-- Create trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own tickets"
  ON support_tickets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "HR can view company tickets"
  ON support_tickets FOR SELECT
  USING (
    has_role(auth.uid(), 'hr') AND 
    company_id IN (
      SELECT company_id FROM company_employees 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all tickets"
  ON support_tickets FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tickets"
  ON support_tickets FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for support_ticket_messages
CREATE POLICY "Admins can view all messages"
  ON support_ticket_messages FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages on their tickets"
  ON support_ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create messages"
  ON support_ticket_messages FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create messages on their tickets"
  ON support_ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(nextval('ticket_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for ticket numbers
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;

-- Create trigger for ticket number generation
CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL)
  EXECUTE FUNCTION generate_ticket_number();