-- =====================================================
-- TEMPORARY: Disable RLS on profiles and user_roles
-- =====================================================
-- This is a temporary diagnostic fix to allow login to work
-- while we debug the RLS policy issues
-- 
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

BEGIN;

-- Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_roles table  
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

COMMIT;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'user_roles')
  AND schemaname = 'public';

-- Expected output should show:
-- rls_enabled = false for both tables



