-- ===================================================================
-- FIX EXISTING PRESTADOR ACCOUNTS WITH WRONG ROLES
-- ===================================================================
-- This script fixes prestador accounts that were created before the
-- routing fix and have 'user' role instead of 'prestador' role
-- ===================================================================

-- STEP 1: Find all accounts that should be prestadores but have wrong role
-- Run this first to see which accounts need fixing
SELECT 
  p.id,
  p.email,
  p.name,
  ARRAY_AGG(ur.role) as current_roles,
  CASE 
    WHEN EXISTS (SELECT 1 FROM prestadores pr WHERE pr.user_id = p.id) THEN 'Should be prestador'
    ELSE 'OK'
  END as status
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE EXISTS (SELECT 1 FROM prestadores pr WHERE pr.user_id = p.id)
GROUP BY p.id, p.email, p.name
HAVING NOT bool_or(ur.role = 'prestador');

-- STEP 2: Fix a SPECIFIC prestador account (replace EMAIL with actual email)
-- OPTION A: If you know the email
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'REPLACE_WITH_PRESTADOR_EMAIL'; -- ⚠️ CHANGE THIS
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', v_email;
  END IF;
  
  -- Remove incorrect 'user' role if it exists
  DELETE FROM user_roles
  WHERE user_id = v_user_id
    AND role = 'user';
  
  -- Add correct 'prestador' role
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'prestador')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Update profile role column if it exists
  UPDATE profiles
  SET role = 'prestador'
  WHERE id = v_user_id;
  
  RAISE NOTICE '✅ Fixed user: % (ID: %)', v_email, v_user_id;
  RAISE NOTICE '   - Removed "user" role';
  RAISE NOTICE '   - Added "prestador" role';
END $$;

-- STEP 3: Fix ALL prestador accounts that have wrong roles
-- (Use this if you have multiple accounts to fix)
DO $$
DECLARE
  v_user RECORD;
  v_fixed_count INTEGER := 0;
BEGIN
  -- Find all users who have prestador records but wrong roles
  FOR v_user IN
    SELECT DISTINCT p.id, p.email, p.name
    FROM profiles p
    INNER JOIN prestadores pr ON pr.user_id = p.id
    LEFT JOIN user_roles ur ON ur.user_id = p.id
    WHERE NOT EXISTS (
      SELECT 1 FROM user_roles ur2 
      WHERE ur2.user_id = p.id 
      AND ur2.role = 'prestador'
    )
  LOOP
    -- Remove incorrect 'user' role
    DELETE FROM user_roles
    WHERE user_id = v_user.id
      AND role = 'user';
    
    -- Add correct 'prestador' role
    INSERT INTO user_roles (user_id, role)
    VALUES (v_user.id, 'prestador')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Update profile role column if it exists
    UPDATE profiles
    SET role = 'prestador'
    WHERE id = v_user.id;
    
    v_fixed_count := v_fixed_count + 1;
    RAISE NOTICE '✅ Fixed: % (ID: %)', v_user.email, v_user.id;
  END LOOP;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ Total prestador accounts fixed: %', v_fixed_count;
END $$;

-- STEP 4: Verify the fix worked
-- Run this to confirm all prestadores now have correct role
SELECT 
  p.id,
  p.email,
  p.name,
  ARRAY_AGG(ur.role) as roles,
  CASE 
    WHEN bool_or(ur.role = 'prestador') THEN '✅ Correct'
    ELSE '❌ Still Wrong'
  END as status
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE EXISTS (SELECT 1 FROM prestadores pr WHERE pr.user_id = p.id)
GROUP BY p.id, p.email, p.name
ORDER BY p.email;

-- STEP 5: Test the get_user_primary_role function
-- Replace USER_ID with the actual UUID of the prestador
-- SELECT get_user_primary_role('REPLACE_WITH_USER_ID');
-- Expected result: 'prestador'

