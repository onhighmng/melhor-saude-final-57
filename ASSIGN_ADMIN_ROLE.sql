-- Assign Admin Role to melhorsaude2025@gmail.com
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Create profile if it doesn't exist
INSERT INTO profiles (id, email, full_name)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', SPLIT_PART(u.email, '@', 1))
FROM auth.users u
WHERE u.email = 'melhorsaude2025@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;

-- Step 2: Assign admin role
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'admin'
FROM auth.users u
WHERE u.email = 'melhorsaude2025@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Verify it worked
SELECT 
  u.email,
  p.full_name,
  ur.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'melhorsaude2025@gmail.com';

-- Should show:
-- email: melhorsaude2025@gmail.com
-- role: admin
