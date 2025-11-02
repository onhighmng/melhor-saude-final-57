-- ========================================
-- FIX: Add missing columns to company_employees
-- ========================================

-- Add is_active column
ALTER TABLE company_employees 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add status column  
ALTER TABLE company_employees 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add check constraint for status
DO $$ BEGIN
  ALTER TABLE company_employees 
  ADD CONSTRAINT company_employees_status_check 
  CHECK (status IN ('active', 'inactive', 'pending'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Update existing records to have default values
UPDATE company_employees 
SET is_active = true 
WHERE is_active IS NULL;

UPDATE company_employees 
SET status = 'active' 
WHERE status IS NULL;

-- Verify the changes
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'company_employees' 
ORDER BY ordinal_position;

