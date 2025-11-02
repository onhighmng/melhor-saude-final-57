-- ============================================================================
-- FIX: Companies Table Schema Mismatch
-- Problem: Conflicting column names causing data inconsistency
-- Solution: Standardize on 'name', 'email', 'phone' (more flexible naming)
-- ============================================================================

-- Step 1: Ensure all data is in the correct columns
-- Migrate data from old columns to new columns if they exist

DO $$
BEGIN
  -- Check if company_name column exists and migrate data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'company_name'
  ) THEN
    -- Copy data from company_name to name if name is empty
    UPDATE companies 
    SET name = company_name 
    WHERE name IS NULL OR name = '';
    
    -- Drop the redundant column
    ALTER TABLE companies DROP COLUMN IF EXISTS company_name;
  END IF;

  -- Check if contact_email column exists and migrate data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'contact_email'
  ) THEN
    -- Copy data from contact_email to email if email is empty
    UPDATE companies 
    SET email = COALESCE(email, contact_email);
    
    -- Drop the redundant column
    ALTER TABLE companies DROP COLUMN IF EXISTS contact_email;
  END IF;

  -- Check if contact_phone column exists and migrate data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'contact_phone'
  ) THEN
    -- Copy data from contact_phone to phone if phone is empty
    UPDATE companies 
    SET phone = COALESCE(phone, contact_phone);
    
    -- Drop the redundant column
    ALTER TABLE companies DROP COLUMN IF EXISTS contact_phone;
  END IF;
END $$;

-- Step 2: Ensure the correct columns exist with proper constraints
ALTER TABLE companies 
  ALTER COLUMN name SET NOT NULL;

ALTER TABLE companies 
  ALTER COLUMN email SET NOT NULL;

-- Step 3: Add any missing columns from the comprehensive schema
ALTER TABLE companies 
  ADD COLUMN IF NOT EXISTS nuit TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS size TEXT CHECK (size IN ('small', 'medium', 'large', 'enterprise')),
  ADD COLUMN IF NOT EXISTS number_of_employees INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sessions_per_employee INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS session_model TEXT DEFAULT 'pool' CHECK (session_model IN ('pool', 'fixed')),
  ADD COLUMN IF NOT EXISTS price_per_session DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS hr_contact_person TEXT,
  ADD COLUMN IF NOT EXISTS hr_email TEXT,
  ADD COLUMN IF NOT EXISTS program_start_date DATE,
  ADD COLUMN IF NOT EXISTS contract_start_date DATE,
  ADD COLUMN IF NOT EXISTS contract_end_date DATE,
  ADD COLUMN IF NOT EXISTS pillars TEXT[] DEFAULT ARRAY['mental', 'physical', 'financial', 'legal'],
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Step 4: Ensure proper indexes
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_nuit ON companies(nuit);

-- Step 5: Verify the final schema
COMMENT ON TABLE companies IS 'Unified companies table - DO NOT create duplicate schemas';
COMMENT ON COLUMN companies.name IS 'Company name (primary identifier)';
COMMENT ON COLUMN companies.email IS 'Company contact email';
COMMENT ON COLUMN companies.phone IS 'Company contact phone';

-- Step 6: Display current schema for verification
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'companies'
ORDER BY ordinal_position;

