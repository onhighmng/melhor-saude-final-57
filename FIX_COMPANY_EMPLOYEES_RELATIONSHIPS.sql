-- ============================================================================
-- FIX COMPANY EMPLOYEES TABLE - MISSING FOREIGN KEY & COLUMNS
-- ============================================================================
-- Run this in: Supabase Dashboard > SQL Editor
-- Purpose: Add missing foreign key constraint to allow profile joins
--          Add missing columns for data consistency
-- Date: 2025-11-02
-- ============================================================================

-- STEP 1: Add missing foreign key constraint from company_employees to profiles
-- This allows PostgREST to join company_employees with profiles data automatically
-- ============================================================================

ALTER TABLE company_employees 
DROP CONSTRAINT IF EXISTS company_employees_user_id_fkey;

ALTER TABLE company_employees 
ADD CONSTRAINT company_employees_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- STEP 2: Add indexes for better query performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_company_employees_user_id 
ON company_employees(user_id);

CREATE INDEX IF NOT EXISTS idx_company_employees_company_id 
ON company_employees(company_id);

CREATE INDEX IF NOT EXISTS idx_company_employees_active 
ON company_employees(is_active) 
WHERE is_active = true;

-- STEP 3: Ensure all required columns exist
-- ============================================================================

DO $$ 
BEGIN
    -- Add is_active column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_employees' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE company_employees 
        ADD COLUMN is_active BOOLEAN DEFAULT true;
        
        RAISE NOTICE 'Added is_active column';
    END IF;
    
    -- Add created_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_employees' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE company_employees 
        ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
        
        RAISE NOTICE 'Added created_at column';
    END IF;
    
    -- Add updated_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_employees' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE company_employees 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
        
        RAISE NOTICE 'Added updated_at column';
    END IF;
    
    -- Add department column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_employees' 
        AND column_name = 'department'
    ) THEN
        ALTER TABLE company_employees 
        ADD COLUMN department TEXT;
        
        RAISE NOTICE 'Added department column';
    END IF;
    
    -- Add position column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_employees' 
        AND column_name = 'position'
    ) THEN
        ALTER TABLE company_employees 
        ADD COLUMN position TEXT;
        
        RAISE NOTICE 'Added position column';
    END IF;
    
END $$;

-- STEP 4: Update RLS policies to allow proper data access
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own company employees" ON company_employees;
DROP POLICY IF EXISTS "HR can view their company employees" ON company_employees;
DROP POLICY IF EXISTS "Admins can view all company employees" ON company_employees;
DROP POLICY IF EXISTS "HR can manage their company employees" ON company_employees;
DROP POLICY IF EXISTS "Admins can manage all company employees" ON company_employees;

-- Enable RLS
ALTER TABLE company_employees ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own company's employees
CREATE POLICY "Users can view their own company employees"
ON company_employees FOR SELECT
USING (
    company_id IN (
        SELECT company_id 
        FROM profiles 
        WHERE id = auth.uid()
    )
);

-- Policy: HR can view their company's employees
CREATE POLICY "HR can view their company employees"
ON company_employees FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'hr'
        AND profiles.company_id = company_employees.company_id
    )
);

-- Policy: Admins can view all employees
CREATE POLICY "Admins can view all company employees"
ON company_employees FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Policy: HR can manage their company's employees
CREATE POLICY "HR can manage their company employees"
ON company_employees FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'hr'
        AND profiles.company_id = company_employees.company_id
    )
);

-- Policy: Admins can manage all employees
CREATE POLICY "Admins can manage all company employees"
ON company_employees FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- STEP 5: Verification queries
-- ============================================================================

-- Verify foreign keys
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'company_employees';

-- Verify columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'company_employees'
ORDER BY ordinal_position;

-- Verify indexes
SELECT 
    indexname, 
    indexdef
FROM pg_indexes
WHERE tablename = 'company_employees';

-- Verify RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'company_employees';

-- Test the join (should work now without 400 error)
SELECT 
    ce.id,
    ce.company_id,
    ce.user_id,
    ce.is_active,
    p.name,
    p.email,
    p.avatar_url
FROM company_employees ce
LEFT JOIN profiles p ON p.id = ce.user_id
LIMIT 5;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ Company employees table fixed successfully!';
    RAISE NOTICE '✅ Foreign key constraint added';
    RAISE NOTICE '✅ Missing columns added';
    RAISE NOTICE '✅ Indexes created';
    RAISE NOTICE '✅ RLS policies updated';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 You can now refresh your application and the 400 errors should be gone!';
END $$;




