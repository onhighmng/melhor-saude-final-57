-- Phase 2: Booking Core Tables
-- Session types and booking status history

-- 1. Session Types
CREATE TABLE IF NOT EXISTS session_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  default_duration INT NOT NULL CHECK (default_duration > 0),
  pillar TEXT NOT NULL CHECK (pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_types_pillar ON session_types(pillar);
CREATE INDEX IF NOT EXISTS idx_session_types_is_active ON session_types(is_active);

-- RLS for session_types
ALTER TABLE session_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS session_types_public_read
  ON session_types
  FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY IF NOT EXISTS session_types_admin_all
  ON session_types
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 2. Booking Status History
CREATE TABLE IF NOT EXISTS booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL CHECK (new_status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking_id ON booking_status_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_status_history_new_status ON booking_status_history(new_status);
CREATE INDEX IF NOT EXISTS idx_booking_status_history_created_at ON booking_status_history(created_at DESC);

-- RLS for booking_status_history
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS booking_status_history_view
  ON booking_status_history
  FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid() OR provider_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY IF NOT EXISTS booking_status_history_admin_all
  ON booking_status_history
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Grant permissions
GRANT SELECT ON session_types TO authenticated, anon;
GRANT ALL ON session_types TO authenticated;
GRANT SELECT ON booking_status_history TO authenticated;
GRANT INSERT ON booking_status_history TO authenticated;



