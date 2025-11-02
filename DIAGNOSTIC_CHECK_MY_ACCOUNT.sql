-- ============================================
-- DIAGNOSTIC: Prove Account Exists with Admin Role
-- ============================================
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- 0. Check if you are logged in
SELECT 
  '0. LOGIN CHECK' as check_type,
  auth.uid() as your_user_id,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'YES - You are logged in'
    ELSE 'NO - Not logged in'
  END as status;

-- 1. Show ALL users in auth.users
SELECT 
  '1. ALL AUTH USERS' as check_type,
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Show ALL profiles
SELECT 
  '2. ALL PROFILES' as check_type,
  id as user_id,
  email,
  role as profile_role,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- 3. Show YOUR specific profile
SELECT 
  '3. YOUR PROFILE' as check_type,
  id as user_id,
  email,
  role as profile_role,
  created_at
FROM public.profiles
WHERE id = auth.uid();

-- 4. Show ALL user_roles entries
SELECT 
  '4. ALL USER_ROLES' as check_type,
  ur.user_id,
  p.email,
  ur.role,
  ur.created_at
FROM public.user_roles ur
LEFT JOIN public.profiles p ON p.id = ur.user_id
ORDER BY ur.created_at DESC
LIMIT 20;

-- 5. Show YOUR specific roles
SELECT 
  '5. YOUR USER_ROLES' as check_type,
  user_id,
  role,
  created_at,
  CASE 
    WHEN role = 'admin' THEN 'YES - Has admin role'
    ELSE 'NO - Has ' || role || ' role (not admin)'
  END as status
FROM public.user_roles
WHERE user_id = auth.uid();

-- 6. Combined view - what system sees for YOU
SELECT 
  '6. YOUR COMBINED VIEW' as check_type,
  p.id as user_id,
  p.email,
  p.role as profile_role,
  COALESCE(array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), ARRAY[]::text[]) as all_user_roles,
  CASE 
    WHEN 'admin' = ANY(array_agg(ur.role)) THEN 'YES - Is Admin via user_roles'
    WHEN p.role = 'admin' THEN 'PROBLEM - Admin in profile but NOT in user_roles'
    ELSE 'NO - NOT ADMIN'
  END as admin_status
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
WHERE p.id = auth.uid()
GROUP BY p.id, p.email, p.role;

-- 7. Check resources storage bucket
SELECT 
  '7. STORAGE BUCKET' as check_type,
  id,
  name,
  public as is_public,
  file_size_limit
FROM storage.buckets
WHERE id = 'resources';

-- 8. Check storage RLS policies
SELECT 
  '8. STORAGE POLICIES' as check_type,
  policyname as policy_name,
  cmd as operation
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname ILIKE '%resource%'
ORDER BY policyname;

-- 9. Upload permission test
SELECT 
  '9. UPLOAD TEST' as check_type,
  auth.uid() as your_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN 'CANNOT CHECK - Not logged in'
    WHEN EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN 'YES - Can upload (has admin in user_roles)'
    WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN 'NO - Has admin in profile but NOT in user_roles (THIS IS YOUR PROBLEM)'
    ELSE 'NO - No admin access at all'
  END as upload_permission_status;

-- ============================================
-- What to look for:
-- Check 0: Should say "YES - You are logged in"
-- Check 6: Should say "YES - Is Admin via user_roles"
-- Check 9: Should say "YES - Can upload"
-- 
-- If Check 9 says "NO - Has admin in profile but NOT in user_roles"
-- Then run FIX_STORAGE_AND_ADMIN_ROLE.sql
-- ============================================
