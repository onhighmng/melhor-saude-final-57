-- ========================================
-- FIX: Update ataidefre user to especialista_geral role
-- ========================================

-- Update role in profiles table
UPDATE profiles
SET role = 'especialista_geral'
WHERE email = 'ataidefre@gmail.com';

-- Insert or update role in user_roles table
INSERT INTO user_roles (user_id, role)
SELECT 
  id,
  'especialista_geral'
FROM profiles
WHERE email = 'ataidefre@gmail.com'
ON CONFLICT (user_id, role) 
DO NOTHING;

-- Verify the fix
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role as profile_role,
  ur.role as user_roles_role
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE p.email = 'ataidefre@gmail.com';
