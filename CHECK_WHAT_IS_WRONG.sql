-- Check 1: Does the validate_access_code function return user_type?
SELECT 
  p.proname as function_name,
  pg_get_function_result(p.oid) as return_type
FROM pg_proc p
WHERE p.proname = 'validate_access_code';

-- Check 2: What does the function actually return for your specialist code?
SELECT * FROM validate_access_code('9A8EC5A9');

-- Check 3: Show all current codes with their mappings
SELECT 
  invite_code,
  role as database_role,
  CASE role
    WHEN 'hr' THEN 'hr'
    WHEN 'user' THEN 'employee'
    WHEN 'prestador' THEN 'prestador'
    WHEN 'especialista_geral' THEN 'specialist'
    ELSE 'UNMAPPED: ' || COALESCE(role, 'NULL')
  END as what_frontend_will_see,
  status,
  company_id IS NOT NULL as has_company
FROM invites
WHERE role IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;


