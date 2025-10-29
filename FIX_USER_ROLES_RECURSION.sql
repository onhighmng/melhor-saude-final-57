-- CRITICAL FIX: Remove infinite recursion in user_roles RLS policy
-- The error: "infinite recursion detected in policy for relation user_roles"
-- This happens when is_admin() function queries user_roles, triggering the policy again

BEGIN;

-- Step 1: Update is_admin() function to completely bypass RLS
-- SECURITY DEFINER + SET row_security = off ensures no recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off  -- CRITICAL: This prevents recursion
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin'::public.app_role 
     FROM public.user_roles 
     WHERE user_id = auth.uid()),
    false
  );
$$;

-- Step 2: Drop the problematic policy
DROP POLICY IF EXISTS "admins_can_view_all_roles" ON "public"."user_roles";

-- Step 3: Recreate policy using the now-safe function
-- Since is_admin() has row_security = off, it won't trigger recursion
CREATE POLICY "admins_can_view_all_roles" ON "public"."user_roles"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (public.is_admin());

-- Step 4: Ensure users can view their own roles (essential for login)
DROP POLICY IF EXISTS "users_can_view_their_own_role" ON "public"."user_roles";
CREATE POLICY "users_can_view_their_own_role" ON "public"."user_roles"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

COMMIT;

SELECT 'SUCCESS: Fixed infinite recursion in user_roles RLS policy. Login should now work!' as result;

