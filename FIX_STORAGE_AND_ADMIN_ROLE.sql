-- ============================================
-- FIX STORAGE UPLOAD AND ADMIN ROLE ASSIGNMENT
-- ============================================
-- This script will:
-- 1. Show all existing users
-- 2. Add admin role to ALL users (or specific email)
-- 3. Verify storage bucket permissions
-- ============================================

-- STEP 1: Show all users so you can see who exists
SELECT 
  '1. ALL USERS' as info,
  p.id,
  p.email,
  p.role as profile_role,
  COALESCE(array_agg(DISTINCT ur.role), ARRAY[]::text[]) as user_roles
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
GROUP BY p.id, p.email, p.role
ORDER BY p.created_at DESC;

-- ============================================
-- STEP 2: CHOOSE ONE OF THE FOLLOWING OPTIONS
-- ============================================

-- OPTION A: Give admin to ALL users (recommended if you only have 1-2 users)
-- Uncomment the lines below to run:

/*
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
  p.id,
  'admin',
  now()
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.id AND ur.role = 'admin'
);

SELECT 'Admin role added to all users' as result;
*/

-- OPTION B: Give admin to specific user by EMAIL
-- Replace 'your-email@example.com' with YOUR actual email
-- Uncomment the lines below and edit the email:

/*
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
  p.id,
  'admin',
  now()
FROM public.profiles p
WHERE p.email = 'your-email@example.com'  -- ← CHANGE THIS TO YOUR EMAIL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'admin'
  );

SELECT 'Admin role added to specified user' as result;
*/

-- OPTION C: Give admin to specific user by ID
-- Replace 'user-id-here' with the ID from STEP 1 above
-- Uncomment the lines below and edit the ID:

/*
INSERT INTO public.user_roles (user_id, role, created_at)
VALUES ('user-id-here', 'admin', now())  -- ← CHANGE THIS TO YOUR USER ID
ON CONFLICT DO NOTHING;

SELECT 'Admin role added to specified user ID' as result;
*/

-- ============================================
-- STEP 3: VERIFY THE FIX
-- ============================================

-- Check user roles again
SELECT 
  '3. VERIFY ROLES ADDED' as info,
  p.id,
  p.email,
  p.role as profile_role,
  COALESCE(array_agg(DISTINCT ur.role), ARRAY[]::text[]) as user_roles,
  CASE 
    WHEN 'admin' = ANY(array_agg(ur.role)) THEN '✅ HAS ADMIN - Can upload'
    ELSE '❌ NO ADMIN - Cannot upload'
  END as upload_permission
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
GROUP BY p.id, p.email, p.role
ORDER BY p.created_at DESC;

-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. First, run the entire script to see STEP 1 results
-- 2. Choose OPTION A, B, or C from STEP 2
-- 3. UNCOMMENT the chosen option (remove /* and */)
-- 4. If using OPTION B or C, EDIT the email or ID
-- 5. Run the entire script again
-- 6. Check STEP 3 to verify the fix worked
-- 7. Try uploading files in your app again
-- ============================================
