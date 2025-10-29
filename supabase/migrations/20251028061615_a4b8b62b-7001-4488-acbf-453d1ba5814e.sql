-- Add weight and assigned_by columns to specialist_assignments table
ALTER TABLE specialist_assignments 
ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES profiles(id);

COMMENT ON COLUMN specialist_assignments.weight IS 'Weight for specialist matching algorithm (higher = more priority)';
COMMENT ON COLUMN specialist_assignments.assigned_by IS 'Admin who assigned this specialist';