-- Quick diagnostic query to check admin user's role in the database
-- Run this in your Supabase SQL Editor to verify the admin user has the 'admin' role

SELECT 
  p.id,
  p.email,
  p.name,
  p.role as deprecated_role_column,
  array_agg(ur.role) as roles_from_user_roles_table,
  CASE 
    WHEN bool_or(ur.role = 'admin') THEN 'admin'
    WHEN bool_or(ur.role = 'hr') THEN 'hr'
    WHEN bool_or(ur.role = 'prestador') THEN 'prestador'
    WHEN bool_or(ur.role = 'specialist') THEN 'specialist'
    ELSE 'user'
  END as computed_primary_role
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE p.email = 'melhorsaude2025@gmail.com'
GROUP BY p.id, p.email, p.name, p.role;

-- Expected output:
-- The 'roles_from_user_roles_table' column should show: {admin}
-- The 'computed_primary_role' column should show: admin

-- If 'roles_from_user_roles_table' is empty or doesn't contain 'admin', run this fix:
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'admin'::app_role
-- FROM profiles
-- WHERE email = 'melhorsaude2025@gmail.com'
-- ON CONFLICT (user_id, role) DO NOTHING;



