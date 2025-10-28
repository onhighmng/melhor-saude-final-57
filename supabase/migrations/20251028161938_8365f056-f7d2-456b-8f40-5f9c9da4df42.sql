-- Remove circular RLS policy on user_roles table

-- Drop the problematic admin view policy that causes infinite recursion
DROP POLICY IF EXISTS "admins_view_all_roles" ON user_roles;

-- Recreate admin management policies using has_role() function to avoid recursion
DROP POLICY IF EXISTS "admins_insert_roles" ON user_roles;
DROP POLICY IF EXISTS "admins_delete_roles" ON user_roles;

CREATE POLICY "admins_insert_roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins_delete_roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));