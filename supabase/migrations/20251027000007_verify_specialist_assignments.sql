-- Verify specialist_assignments table exists and create if not
CREATE TABLE IF NOT EXISTS specialist_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  specialist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pillar TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  hourly_rate DECIMAL(10,2),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(company_id, specialist_id, pillar)
);

CREATE INDEX IF NOT EXISTS idx_specialist_assignments_company ON specialist_assignments(company_id);
CREATE INDEX IF NOT EXISTS idx_specialist_assignments_specialist ON specialist_assignments(specialist_id);

ALTER TABLE specialist_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policy for admins
DROP POLICY IF EXISTS "Admins can manage assignments" ON specialist_assignments;
CREATE POLICY "Admins can manage assignments"
  ON specialist_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

