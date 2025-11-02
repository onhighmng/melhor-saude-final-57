-- MANUAL ADMIN PROMOTION SCRIPT
-- Use this AFTER you've created your account through the signup flow

-- Step 1: First, check if your user exists
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'melhorsaude2025@gmail.com';

-- If you see your user above, copy the ID and continue below
-- If NOT, you need to sign up first!

-- ============================================================================
-- Step 2: Promote to Admin (replace USER_ID_HERE with your actual UUID from above)
-- ============================================================================

-- Option A: If your user ID is in the auth.users table:
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'melhorsaude2025@gmail.com';

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found! Please sign up first at your app''s registration page.';
  END IF;

  -- Create profile if it doesn't exist
  INSERT INTO profiles (id, email, role, full_name)
  VALUES (target_user_id, 'melhorsaude2025@gmail.com', 'admin', 'Admin User')
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin';

  -- Add admin role
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE '✅ User promoted to admin successfully!';
  RAISE NOTICE 'User ID: %', target_user_id;
  RAISE NOTICE 'Email: melhorsaude2025@gmail.com';
  RAISE NOTICE 'Role: admin';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Log out of your app';
  RAISE NOTICE '2. Log back in';
  RAISE NOTICE '3. Visit the admin dashboard';
END $$;

-- ============================================================================
-- Step 3: Verify it worked
-- ============================================================================

SELECT 
  au.id,
  au.email,
  p.role as profile_role,
  ur.role as user_role,
  CASE 
    WHEN p.role = 'admin' AND ur.role = 'admin' THEN '✅ ADMIN SETUP COMPLETE'
    ELSE '❌ NOT ADMIN YET'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN user_roles ur ON ur.user_id = au.id
WHERE au.email = 'melhorsaude2025@gmail.com';

