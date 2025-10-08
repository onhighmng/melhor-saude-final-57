-- Add pre-diagnostic data columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS chat_session_id uuid REFERENCES chat_sessions(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS prediagnostic_completed boolean DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS prediagnostic_summary jsonb DEFAULT '{}'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS topic text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_source text DEFAULT 'direct';

-- Create RLS policy for prestadores to view chat messages for their bookings
CREATE POLICY "Prestadores can view chat messages for their bookings"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN chat_sessions cs ON cs.id = b.chat_session_id
    WHERE cs.id = chat_messages.session_id
    AND b.prestador_id = auth.uid()
  )
);