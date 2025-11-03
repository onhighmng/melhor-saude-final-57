-- ============================================================================
-- QUICK CHECK - Employee Registration Status
-- ============================================================================
-- Simple queries to check current state
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================================

-- 1. Check companies
SELECT 
    '=== COMPANIES ===' as section,
    id,
    name,
    sessions_allocated,
    is_active
FROM companies
ORDER BY created_at DESC;

-- 2. Check HR users
SELECT 
    '=== HR USERS ===' as section,
    id,
    name,
    email,
    company_id
FROM profiles
WHERE role = 'hr'
ORDER BY created_at DESC;

-- 3. Check employee invites
SELECT 
    '=== EMPLOYEE INVITES ===' as section,
    invite_code,
    status,
    company_id,
    created_at
FROM invites
WHERE role = 'user' OR user_type = 'user'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check registered employees in profiles
SELECT 
    '=== EMPLOYEES IN PROFILES ===' as section,
    p.id,
    p.name,
    p.email,
    p.company_id,
    c.name as company_name
FROM profiles p
LEFT JOIN companies c ON c.id = p.company_id
WHERE p.role = 'user'
ORDER BY p.created_at DESC;

-- 5. Check company_employees table (MOST IMPORTANT!)
SELECT 
    '=== EMPLOYEES IN COMPANY_EMPLOYEES ===' as section,
    ce.id,
    ce.company_id,
    ce.user_id,
    ce.sessions_allocated,
    ce.sessions_used,
    ce.is_active,
    p.name as employee_name,
    p.email as employee_email
FROM company_employees ce
LEFT JOIN profiles p ON p.id = ce.user_id
ORDER BY ce.joined_at DESC;

-- 6. Find missing employees (in profiles but NOT in company_employees)
SELECT 
    '=== MISSING FROM COMPANY_EMPLOYEES ===' as section,
    p.id as user_id,
    p.name,
    p.email,
    p.company_id,
    'Add this employee to company_employees!' as action
FROM profiles p
LEFT JOIN company_employees ce ON ce.user_id = p.id
WHERE p.role = 'user' 
AND p.company_id IS NOT NULL
AND ce.id IS NULL;

-- 7. Verify foreign key exists
SELECT 
    '=== FOREIGN KEY CHECK ===' as section,
    constraint_name,
    table_name,
    column_name
FROM information_schema.key_column_usage
WHERE table_name = 'company_employees'
AND constraint_name = 'company_employees_user_id_fkey';

-- 8. Summary counts
SELECT 
    '=== SUMMARY ===' as section,
    (SELECT COUNT(*) FROM companies WHERE is_active = true) as companies_count,
    (SELECT COUNT(*) FROM profiles WHERE role = 'hr') as hr_users_count,
    (SELECT COUNT(*) FROM profiles WHERE role = 'user') as user_profiles_count,
    (SELECT COUNT(*) FROM company_employees) as company_employees_count,
    (SELECT COUNT(*) FROM invites WHERE role = 'user' AND status = 'pending') as pending_invites,
    (SELECT COUNT(*) FROM invites WHERE role = 'user' AND status = 'used') as used_invites;



