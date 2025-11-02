-- ============================================================================
-- DEBUG EMPLOYEE REGISTRATION FLOW
-- ============================================================================
-- Use this to check if employees are properly registering and appearing
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================================

-- SECTION 1: Check Current State
-- ============================================================================

-- 1.1: Check all companies
SELECT 
    id,
    name,
    email,
    sessions_allocated,
    is_active,
    created_at
FROM companies
ORDER BY created_at DESC;

-- 1.2: Check all HR users
SELECT 
    id,
    name,
    email,
    role,
    company_id,
    created_at
FROM profiles
WHERE role = 'hr'
ORDER BY created_at DESC;

-- 1.3: Check all employee invites generated
SELECT 
    invite_code,
    role,
    user_type,
    status,
    company_id,
    invited_by,
    created_at,
    accepted_at
FROM invites
WHERE role = 'user' OR user_type = 'user'
ORDER BY created_at DESC
LIMIT 20;

-- 1.4: Check all user profiles (employees)
SELECT 
    p.id,
    p.name,
    p.email,
    p.role,
    p.company_id,
    c.name as company_name,
    p.created_at
FROM profiles p
LEFT JOIN companies c ON c.id = p.company_id
WHERE p.role = 'user'
ORDER BY p.created_at DESC;

-- 1.5: Check company_employees table (THE CRITICAL TABLE)
SELECT 
    ce.id,
    ce.user_id,
    ce.company_id,
    ce.sessions_allocated,
    ce.sessions_used,
    ce.is_active,
    ce.joined_at,
    p.name as employee_name,
    p.email as employee_email,
    c.name as company_name
FROM company_employees ce
LEFT JOIN profiles p ON p.id = ce.user_id
LEFT JOIN companies c ON c.id = ce.company_id
ORDER BY ce.joined_at DESC;

-- ============================================================================
-- SECTION 2: Find Registration Issues
-- ============================================================================

-- 2.1: Find users who are in profiles but NOT in company_employees
-- (These users registered but weren't properly added to company_employees)
SELECT 
    p.id,
    p.name,
    p.email,
    p.role,
    p.company_id,
    c.name as company_name,
    p.created_at,
    'MISSING from company_employees!' as issue
FROM profiles p
LEFT JOIN company_employees ce ON ce.user_id = p.id
LEFT JOIN companies c ON c.id = p.company_id
WHERE p.role = 'user' 
AND p.company_id IS NOT NULL
AND ce.id IS NULL;

-- 2.2: Find invites that were used but user not in company_employees
-- (Registration completed but company_employees record missing)
SELECT 
    i.invite_code,
    i.status,
    i.company_id,
    c.name as company_name,
    i.created_at,
    i.accepted_at,
    'Invite used but no company_employees record!' as issue
FROM invites i
LEFT JOIN companies c ON c.id = i.company_id
WHERE i.status = 'used'
AND i.role = 'user'
AND i.company_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM company_employees ce 
    WHERE ce.company_id = i.company_id
);

-- 2.3: Check for orphaned company_employees records
-- (Records in company_employees but profile doesn't exist)
SELECT 
    ce.*,
    'Profile missing!' as issue
FROM company_employees ce
LEFT JOIN profiles p ON p.id = ce.user_id
WHERE p.id IS NULL;

-- ============================================================================
-- SECTION 3: Statistics & Summary
-- ============================================================================

-- 3.1: Registration summary by company
SELECT 
    c.id,
    c.name as company_name,
    c.sessions_allocated as company_sessions,
    COUNT(DISTINCT ce.user_id) as employees_in_company_employees,
    COUNT(DISTINCT p.id) as employees_in_profiles,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'pending') as pending_invites,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'used') as used_invites
FROM companies c
LEFT JOIN company_employees ce ON ce.company_id = c.id
LEFT JOIN profiles p ON p.company_id = c.id AND p.role = 'user'
LEFT JOIN invites i ON i.company_id = c.id AND i.role = 'user'
GROUP BY c.id, c.name, c.sessions_allocated
ORDER BY c.created_at DESC;

-- 3.2: Overall system statistics
SELECT 
    (SELECT COUNT(*) FROM companies WHERE is_active = true) as active_companies,
    (SELECT COUNT(*) FROM profiles WHERE role = 'hr') as hr_users,
    (SELECT COUNT(*) FROM profiles WHERE role = 'user') as user_profiles,
    (SELECT COUNT(*) FROM company_employees) as employee_records,
    (SELECT COUNT(*) FROM invites WHERE role = 'user' AND status = 'pending') as pending_invites,
    (SELECT COUNT(*) FROM invites WHERE role = 'user' AND status = 'used') as used_invites;

-- ============================================================================
-- SECTION 4: Fix Missing Records
-- ============================================================================

-- 4.1: Generate INSERT statements for users missing from company_employees
-- Copy the output and run it to fix missing records
SELECT 
    format(
        'INSERT INTO company_employees (company_id, user_id, sessions_allocated, sessions_used, is_active, joined_at) VALUES (%L, %L, 10, 0, true, %L);',
        p.company_id,
        p.id,
        p.created_at
    ) as fix_sql
FROM profiles p
LEFT JOIN company_employees ce ON ce.user_id = p.id
WHERE p.role = 'user' 
AND p.company_id IS NOT NULL
AND ce.id IS NULL;

-- 4.2: MANUAL FIX TEMPLATE
-- If you need to add an employee manually, use this:
/*
INSERT INTO company_employees (
    company_id,
    user_id,
    sessions_allocated,
    sessions_used,
    is_active,
    joined_at
) VALUES (
    'b967ebce-b0c3-4763-b3cd-35a4e67661ae', -- Replace with actual company_id
    'user-profile-id-here',                  -- Replace with actual user ID from profiles
    10,                                      -- Default sessions quota
    0,                                       -- No sessions used yet
    true,                                    -- Active status
    NOW()                                    -- Current timestamp
);
*/

-- ============================================================================
-- SECTION 5: Test Data (Optional - for development only)
-- ============================================================================

-- 5.1: Create test employee (ONLY FOR TESTING)
-- Uncomment and modify if you want to create test data
/*
DO $$
DECLARE
    v_company_id UUID := 'b967ebce-b0c3-4763-b3cd-35a4e67661ae'; -- Your company ID
    v_test_email TEXT := 'test.employee@testcompany.com';
    v_user_id UUID;
BEGIN
    -- Check if test user already exists
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_test_email;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Cannot create test employee - auth.users is managed by Supabase Auth';
        RAISE NOTICE 'Use the actual registration flow to add employees';
    ELSE
        -- Add to company_employees if missing
        INSERT INTO company_employees (company_id, user_id, sessions_allocated, sessions_used, is_active)
        VALUES (v_company_id, v_user_id, 10, 0, true)
        ON CONFLICT (company_id, user_id) DO NOTHING;
        
        RAISE NOTICE 'Test employee added to company_employees';
    END IF;
END $$;
*/

-- ============================================================================
-- SECTION 6: Verify Foreign Keys & Constraints
-- ============================================================================

-- 6.1: Verify foreign key exists
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

-- 6.2: Verify all required columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'company_employees'
ORDER BY ordinal_position;

-- ============================================================================
-- END OF DIAGNOSTIC SCRIPT
-- ============================================================================

-- Summary of what to check:
-- 1. Are there employees in company_employees table?
--    → If NO: Check if they're in profiles but not in company_employees
-- 2. Are invite codes being used?
--    → Check invites table for status = 'used'
-- 3. Is the foreign key constraint in place?
--    → Check Section 6.1 output
-- 4. Are there users in profiles but not in company_employees?
--    → Check Section 2.1 output - these need to be fixed!

DO $$ 
BEGIN
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Diagnostic script completed!';
    RAISE NOTICE 'Review the results above to identify any issues.';
    RAISE NOTICE '====================================';
END $$;

