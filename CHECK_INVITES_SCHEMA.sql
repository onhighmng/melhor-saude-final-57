-- Check what columns actually exist in invites table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'invites'
ORDER BY ordinal_position;

-- Check what constraints exist
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'invites'::regclass;

-- Check current function signature
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as returns
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'generate_access_code';

-- Try to see if there are any sample invites
SELECT 
  invite_code,
  role,
  status,
  company_id IS NULL as no_company,
  email IS NULL as no_email,
  metadata IS NOT NULL as has_metadata,
  created_at
FROM invites
ORDER BY created_at DESC
LIMIT 5;




