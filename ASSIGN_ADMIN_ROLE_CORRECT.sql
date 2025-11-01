-- Assign Admin Role to melhorsaude2025@gmail.com
-- CORRECTED VERSION - Uses 'name' column (NOT NULL)

-- Step 1: Create/update profile with name (required)
INSERT INTO profiles (id, email, name)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', SPLIT_PART(u.email, '@', 1), 'User')
FROM auth.users u
WHERE u.email = 'melhorsaude2025@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, name = COALESCE(EXCLUDED.name, profiles.name, SPLIT_PART(EXCLUDED.email, '@', 1));

-- Step 2: Assign admin role
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'admin'
FROM auth.users u
WHERE u.email = 'melhorsaude2025@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Verify it worked
SELECT 
  u.email,
  p.name,
  ur.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'melhorsaude2025@gmail.com';

-- Expected result:
-- email: melhorsaude2025@gmail.com
-- name: melhorsaude2025 (or name from metadata)
-- role: admin
