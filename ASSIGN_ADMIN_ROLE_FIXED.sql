-- Assign Admin Role to melhorsaude2025@gmail.com
-- FIXED VERSION - Only uses columns that definitely exist

-- Step 1: Create/update profile (using only id and email)
INSERT INTO profiles (id, email)
SELECT 
  u.id,
  u.email
FROM auth.users u
WHERE u.email = 'melhorsaude2025@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email;

-- Step 2: Assign admin role
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'admin'
FROM auth.users u
WHERE u.email = 'melhorsaude2025@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Verify it worked
SELECT 
  u.email,
  ur.role,
  p.email as profile_email
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'melhorsaude2025@gmail.com';

-- Expected result:
-- email: melhorsaude2025@gmail.com
-- role: admin
-- profile_email: melhorsaude2025@gmail.com
