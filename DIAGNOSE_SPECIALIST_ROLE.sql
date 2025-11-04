-- Diagnostic query to check specialist user role
-- Run this in your Supabase SQL Editor

-- Check what roles this user has
SELECT 
    ur.user_id,
    ur.role,
    ur.created_at,
    p.email,
    p.name
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE ur.user_id = 'dea36afe-5485-43c2-b3a8-82c003727bfa';

-- Check what the RPC function returns for this user
SELECT get_user_primary_role('dea36afe-5485-43c2-b3a8-82c003727bfa'::uuid) as role;

-- Check the invite code that was used
SELECT 
    i.invite_code,
    i.role,
    i.user_type,
    i.status,
    i.email,
    i.accepted_at
FROM invites i
WHERE i.email = 'ataidefre@gmail.com'
ORDER BY i.created_at DESC
LIMIT 5;

-- Check if the function was updated correctly
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname = 'get_user_primary_role';




