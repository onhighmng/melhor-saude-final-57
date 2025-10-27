-- Create session_access_log table to track when users join sessions
CREATE TABLE IF NOT EXISTS session_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_session_access_log_booking ON session_access_log(booking_id);
CREATE INDEX IF NOT EXISTS idx_session_access_log_user ON session_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_session_access_log_accessed ON session_access_log(accessed_at DESC);

-- Enable RLS
ALTER TABLE session_access_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own access logs
CREATE POLICY "Users can view own access logs"
  ON session_access_log FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own access logs
CREATE POLICY "Users can insert own access logs"
  ON session_access_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Admins can view all access logs
CREATE POLICY "Admins can view all access logs"
  ON session_access_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

