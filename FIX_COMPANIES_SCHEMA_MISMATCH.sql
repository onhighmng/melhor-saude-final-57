-- ============================================================================
-- FIX COMPANIES TABLE SCHEMA MISMATCH
-- ============================================================================
-- This migration resolves conflicts between two different companies schemas
-- and creates a unified, comprehensive table with all required columns.
--
-- ISSUE: Two different CREATE TABLE statements exist:
--   - One with: company_name, contact_email, contact_phone, plan_type, final_notes
--   - One with: name, email, phone, industry, size, number_of_employees, etc.
--
-- SOLUTION: Merge both schemas, adding missing columns and ensuring data migration
-- ============================================================================

-- Step 1: Add missing columns from Schema B (if they don't exist)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS nuit TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS size TEXT CHECK (size IN ('small', 'medium', 'large', 'enterprise'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS number_of_employees INTEGER DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sessions_per_employee INTEGER DEFAULT 4;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS session_model TEXT DEFAULT 'pool' CHECK (session_model IN ('pool', 'fixed'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS price_per_session DECIMAL(10,2);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hr_contact_person TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hr_email TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS program_start_date DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contract_start_date DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contract_end_date DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS pillars TEXT[] DEFAULT ARRAY['mental', 'physical', 'financial', 'legal'];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Step 2: Add missing columns from Schema A (if they don't exist)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'basic' CHECK (plan_type IN ('basic', 'premium', 'enterprise', 'professional'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS final_notes TEXT;

-- Step 3: Migrate data from old column names to new standard names
-- (Only if data exists in old columns and new columns are NULL)
UPDATE companies 
SET name = COALESCE(name, company_name)
WHERE name IS NULL AND company_name IS NOT NULL;

UPDATE companies 
SET email = COALESCE(email, contact_email)
WHERE email IS NULL AND contact_email IS NOT NULL;

UPDATE companies 
SET phone = COALESCE(phone, contact_phone)
WHERE phone IS NULL AND contact_phone IS NOT NULL;

-- Step 4: Ensure NOT NULL constraints on critical columns
-- (After data migration)
-- Only set NOT NULL if there are no NULL values
DO $$ 
BEGIN
  -- Check if any name is NULL before setting constraint
  IF NOT EXISTS (SELECT 1 FROM companies WHERE name IS NULL) THEN
    ALTER TABLE companies ALTER COLUMN name SET NOT NULL;
  ELSE
    RAISE NOTICE 'Skipping name NOT NULL constraint - NULL values exist';
  END IF;
  
  -- Check if any email is NULL before setting constraint
  IF NOT EXISTS (SELECT 1 FROM companies WHERE email IS NULL) THEN
    ALTER TABLE companies ALTER COLUMN email SET NOT NULL;
  ELSE
    RAISE NOTICE 'Skipping email NOT NULL constraint - NULL values exist';
  END IF;
END $$;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_nuit ON companies(nuit);

-- Add UNIQUE constraint on nuit if no duplicates exist
DO $$
BEGIN
  -- Only add unique constraint if nuit column exists and has no duplicates
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'nuit'
  ) THEN
    -- Check for duplicate nuit values
    IF NOT EXISTS (
      SELECT nuit FROM companies 
      WHERE nuit IS NOT NULL 
      GROUP BY nuit 
      HAVING COUNT(*) > 1
    ) THEN
      -- Safe to add unique constraint
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'companies'::regclass 
        AND conname = 'companies_nuit_key'
      ) THEN
        ALTER TABLE companies ADD CONSTRAINT companies_nuit_key UNIQUE (nuit);
        RAISE NOTICE 'Added UNIQUE constraint on nuit';
      END IF;
    ELSE
      RAISE NOTICE 'Skipping UNIQUE constraint on nuit - duplicate values exist';
    END IF;
  END IF;
END $$;

-- Step 6: Update sessions_allocated and sessions_used constraints if needed
-- Drop existing constraints first if they exist
ALTER TABLE companies DROP CONSTRAINT IF EXISTS check_sessions_allocated_positive;
ALTER TABLE companies DROP CONSTRAINT IF EXISTS check_sessions_used_positive;

-- Re-add the constraints
ALTER TABLE companies ADD CONSTRAINT check_sessions_allocated_positive 
  CHECK (sessions_allocated >= 0);
ALTER TABLE companies ADD CONSTRAINT check_sessions_used_positive 
  CHECK (sessions_used >= 0);

-- Step 7: Add trigger to update updated_at timestamp
-- Create or replace the function (safe to run multiple times)
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create it
DROP TRIGGER IF EXISTS trigger_update_companies_timestamp ON companies;
CREATE TRIGGER trigger_update_companies_timestamp
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_companies_updated_at();

-- ============================================================================
-- VERIFICATION QUERIES (run these to verify the fix)
-- ============================================================================

-- Check schema is complete
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'companies'
ORDER BY ordinal_position;

-- Check for any NULL values in critical columns
SELECT 
  COUNT(*) as total_companies,
  COUNT(name) as has_name,
  COUNT(email) as has_email,
  COUNT(company_name) as has_company_name,
  COUNT(contact_email) as has_contact_email,
  COUNT(plan_type) as has_plan_type,
  COUNT(industry) as has_industry,
  COUNT(sessions_allocated) as has_sessions_allocated
FROM companies;

-- Show sample data to verify migration worked
SELECT 
  id,
  name,
  company_name,
  email,
  contact_email,
  plan_type,
  industry,
  sessions_allocated,
  is_active
FROM companies
LIMIT 5;

-- ============================================================================
-- NOTES FOR FRONTEND TEAM:
-- ============================================================================
-- After this migration, you can access company data using EITHER:
--   - company.name OR company.company_name (both exist)
--   - company.email OR company.contact_email (both exist)
--   - company.phone OR company.contact_phone (both exist)
--
-- RECOMMENDATION: Update frontend code to use the standard column names:
--   - USE: company.name, company.email, company.phone
--   - DEPRECATE: company.company_name, company.contact_email, company.contact_phone
--
-- ALL columns from both schemas are now available:
--   ✅ name, company_name, email, contact_email, phone, contact_phone
--   ✅ plan_type, final_notes (Schema A)
--   ✅ industry, size, number_of_employees, sessions_per_employee (Schema B)
--   ✅ hr_contact_person, hr_email, contract dates, pillars (Schema B)
-- ============================================================================

