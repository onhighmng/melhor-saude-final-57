-- Check if get_user_primary_role function exists and its signature
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'get_user_primary_role';

-- Test the function with both users
SELECT 
  u.email,
  public.get_user_primary_role(u.id) as role_from_function,
  u.id as user_id
FROM auth.users u
ORDER BY u.email;

