-- ===================================================================
-- VERIFY DATA AND FIX SESSION
-- Run this to check what's in the database
-- ===================================================================

-- 1. Check if company exists
SELECT 'COMPANY CHECK' as check_type, 
  id::text, 
  name, 
  employee_seats, 
  sessions_allocated,
  CASE WHEN id IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM companies 
WHERE id = 'b967ebce-b0c3-4763-b3cd-35a4e67661ae'

UNION ALL

-- 2. Check if auth user exists
SELECT 'AUTH USER CHECK' as check_type,
  id::text,
  email,
  NULL as employee_seats,
  NULL as sessions_allocated,
  CASE WHEN id IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM auth.users
WHERE email = 'lorinofrodriguesjunior@gmail.com'

UNION ALL

-- 3. Check if profile exists and is linked
SELECT 'PROFILE CHECK' as check_type,
  id::text,
  email,
  NULL as employee_seats,
  NULL as sessions_allocated,
  CASE 
    WHEN company_id IS NULL THEN '❌ NOT LINKED'
    WHEN company_id = 'b967ebce-b0c3-4763-b3cd-35a4e67661ae' THEN '✅ LINKED CORRECTLY'
    ELSE '⚠️ LINKED TO WRONG COMPANY: ' || company_id::text
  END as status
FROM profiles
WHERE email = 'lorinofrodriguesjunior@gmail.com'

UNION ALL

-- 4. Check if HR role exists
SELECT 'USER ROLE CHECK' as check_type,
  user_id::text,
  role::text,
  NULL as employee_seats,
  NULL as sessions_allocated,
  CASE WHEN role = 'hr' THEN '✅ HR ROLE SET' ELSE '❌ WRONG ROLE' END as status
FROM user_roles
WHERE user_id IN (SELECT id FROM profiles WHERE email = 'lorinofrodriguesjunior@gmail.com');

-- If any are missing, run this fix:
-- (Comment this out if verification above shows everything is OK)

DO $$
DECLARE
  v_user_id UUID;
  v_profile_exists BOOLEAN;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'lorinofrodriguesjunior@gmail.com';
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ Auth user not found. Creating...';
    v_user_id := 'd94c8947-3782-47f9-9285-35f035c1e1f2';
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'lorinofrodriguesjunior@gmail.com',
      crypt('temppass123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"OnHigh management"}'::jsonb,
      NOW(), NOW(), 'authenticated', 'authenticated'
    ) ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = v_user_id) INTO v_profile_exists;
  
  IF NOT v_profile_exists THEN
    RAISE NOTICE '❌ Profile not found. Creating...';
    INSERT INTO profiles (id, email, role, company_id, is_active)
    VALUES (v_user_id, 'lorinofrodriguesjunior@gmail.com', 'hr', 'b967ebce-b0c3-4763-b3cd-35a4e67661ae', true);
  ELSE
    RAISE NOTICE '✅ Profile exists. Updating company link...';
    UPDATE profiles 
    SET company_id = 'b967ebce-b0c3-4763-b3cd-35a4e67661ae',
        role = 'hr',
        is_active = true
    WHERE id = v_user_id;
  END IF;
  
  -- Ensure HR role
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'hr')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE '✅ All fixes applied!';
END $$;



