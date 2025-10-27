-- Create provider_payments table for financial tracking
CREATE TABLE IF NOT EXISTS provider_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID NOT NULL REFERENCES prestadores(id),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  amount_gross DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  amount_net DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_payments_prestador ON provider_payments(prestador_id);
CREATE INDEX IF NOT EXISTS idx_provider_payments_booking ON provider_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_provider_payments_date ON provider_payments(payment_date DESC);

ALTER TABLE provider_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy for prestadores (view own payments)
DROP POLICY IF EXISTS "Prestadores can view own payments" ON provider_payments;
CREATE POLICY "Prestadores can view own payments"
  ON provider_payments FOR SELECT
  USING (
    prestador_id IN (
      SELECT id FROM prestadores WHERE user_id = auth.uid()
    )
  );

-- RLS Policy for admins (view all payments)
DROP POLICY IF EXISTS "Admins can view all payments" ON provider_payments;
CREATE POLICY "Admins can view all payments"
  ON provider_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

