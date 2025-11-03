-- Fix for specialist user that has wrong role
-- This script will:
-- 1. Check current role
-- 2. Delete any 'user' role entries for this user
-- 3. Add 'especialista_geral' role if not present
-- 4. Verify the fix

-- Step 1: Check current state
DO $$
BEGIN
    RAISE NOTICE '=== CURRENT STATE ===';
    RAISE NOTICE 'Checking roles for user: dea36afe-5485-43c2-b3a8-82c003727bfa';
END $$;

-- Display current roles
SELECT 
    'Current roles:' as info,
    ur.role,
    ur.created_at
FROM user_roles ur
WHERE ur.user_id = 'dea36afe-5485-43c2-b3a8-82c003727bfa';

-- Step 2: Remove incorrect 'user' role if it exists
-- (Specialists should NOT have 'user' role)
DELETE FROM user_roles 
WHERE user_id = 'dea36afe-5485-43c2-b3a8-82c003727bfa' 
  AND role = 'user';

-- Step 3: Ensure 'especialista_geral' role exists
INSERT INTO user_roles (user_id, role)
VALUES (
    'dea36afe-5485-43c2-b3a8-82c003727bfa',
    'especialista_geral'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Update profile role to match (for backward compatibility)
UPDATE profiles 
SET role = 'especialista_geral'
WHERE id = 'dea36afe-5485-43c2-b3a8-82c003727bfa';

-- Step 5: Verify the fix
DO $$
DECLARE
    user_role TEXT;
BEGIN
    RAISE NOTICE '=== VERIFICATION ===';
    
    -- Get role from RPC function
    SELECT get_user_primary_role('dea36afe-5485-43c2-b3a8-82c003727bfa'::uuid) INTO user_role;
    
    RAISE NOTICE 'Role from get_user_primary_role(): %', user_role;
    
    IF user_role = 'especialista_geral' THEN
        RAISE NOTICE '✅ SUCCESS! User now has especialista_geral role';
    ELSE
        RAISE WARNING '❌ FAILED! User still has role: %', user_role;
    END IF;
END $$;

-- Final check: Display all roles for this user
SELECT 
    '=== FINAL ROLES ===' as info,
    ur.role,
    ur.created_at
FROM user_roles ur
WHERE ur.user_id = 'dea36afe-5485-43c2-b3a8-82c003727bfa';

