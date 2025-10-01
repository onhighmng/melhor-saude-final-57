-- Add pillar field to prestadores table
ALTER TABLE prestadores ADD COLUMN pillar TEXT;

-- Create booking assignments table for round-robin tracking
CREATE TABLE prestador_booking_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar TEXT NOT NULL,
  prestador_id UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
  assignment_count INTEGER DEFAULT 0,
  last_assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for efficient pillar-based queries
CREATE INDEX idx_prestador_booking_assignments_pillar ON prestador_booking_assignments(pillar);
CREATE INDEX idx_prestador_booking_assignments_prestador_id ON prestador_booking_assignments(prestador_id);

-- Enable RLS on booking assignments table
ALTER TABLE prestador_booking_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for booking assignments
CREATE POLICY "Admins can manage all booking assignments" 
ON prestador_booking_assignments 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can manage booking assignments" 
ON prestador_booking_assignments 
FOR ALL 
TO authenticated 
USING (true);

CREATE POLICY "Anyone can view booking assignments for scheduling" 
ON prestador_booking_assignments 
FOR SELECT 
TO authenticated 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_prestador_booking_assignments_updated_at
BEFORE UPDATE ON prestador_booking_assignments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();