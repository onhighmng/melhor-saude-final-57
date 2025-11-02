-- QUICK FIX: Link your existing auth session to Test Company
-- Run this in Supabase SQL Editor

-- 1. Disable problematic triggers
DROP TRIGGER IF EXISTS sync_profile_name_trigger ON profiles CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create Test Company (if doesn't exist)
INSERT INTO companies (
  id, name, email, employee_seats, sessions_allocated, is_active, plan_type
) VALUES (
  'b967ebce-b0c3-4763-b3cd-35a4e67661ae',
  'OnHigh Management',
  'lorinofrodriguesjunior@gmail.com',
  50,
  200,
  true,
  'business'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  employee_seats = EXCLUDED.employee_seats,
  sessions_allocated = EXCLUDED.sessions_allocated,
  is_active = EXCLUDED.is_active;

-- 3. Create auth user (if doesn't exist)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role
) VALUES (
  'd94c8947-3782-47f9-9285-35f035c1e1f2',
  '00000000-0000-0000-0000-000000000000',
  'lorinofrodriguesjunior@gmail.com',
  crypt('temppass123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"OnHigh management"}'::jsonb,
  NOW(), NOW(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- 4. Create/update profile
INSERT INTO profiles (id, email, role, company_id, is_active)
VALUES (
  'd94c8947-3782-47f9-9285-35f035c1e1f2',
  'lorinofrodriguesjunior@gmail.com',
  'hr',
  'b967ebce-b0c3-4763-b3cd-35a4e67661ae',
  true
) ON CONFLICT (id) DO UPDATE SET
  company_id = 'b967ebce-b0c3-4763-b3cd-35a4e67661ae',
  role = 'hr',
  is_active = true;

-- 5. Add HR role
INSERT INTO user_roles (user_id, role)
VALUES ('d94c8947-3782-47f9-9285-35f035c1e1f2', 'hr')
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Verify everything
SELECT '✅ Company' as item, id::text, name, employee_seats 
FROM companies WHERE id = 'b967ebce-b0c3-4763-b3cd-35a4e67661ae'
UNION ALL
SELECT '✅ Auth User' as item, id::text, email, null 
FROM auth.users WHERE id = 'd94c8947-3782-47f9-9285-35f035c1e1f2'
UNION ALL
SELECT '✅ Profile' as item, id::text, email || ' (role: ' || role || ')', null 
FROM profiles WHERE id = 'd94c8947-3782-47f9-9285-35f035c1e1f2'
UNION ALL
SELECT '✅ User Role' as item, user_id::text, role::text, null 
FROM user_roles WHERE user_id = 'd94c8947-3782-47f9-9285-35f035c1e1f2';
