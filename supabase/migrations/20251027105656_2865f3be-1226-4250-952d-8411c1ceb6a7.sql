-- Phase 1: Deprecate profiles.role in favor of user_roles table
-- Make profiles.role nullable (safe migration path)
ALTER TABLE profiles ALTER COLUMN role DROP NOT NULL;

-- Create helper function to get primary role from user_roles
CREATE OR REPLACE FUNCTION get_user_primary_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  primary_role TEXT;
BEGIN
  -- Priority: admin > hr > prestador > specialist > user
  SELECT 
    CASE 
      WHEN bool_or(role = 'admin') THEN 'admin'
      WHEN bool_or(role = 'hr') THEN 'hr'
      WHEN bool_or(role = 'prestador') THEN 'prestador'
      WHEN bool_or(role = 'specialist') THEN 'specialist'
      ELSE 'user'
    END INTO primary_role
  FROM user_roles
  WHERE user_roles.user_id = get_user_primary_role.user_id;
  
  RETURN COALESCE(primary_role, 'user');
END;
$$;

-- Update handle_new_user trigger to use user_roles instead of profiles.role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get role from metadata, default to 'user'
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'user');

  -- Insert into profiles (without role column)
  INSERT INTO public.profiles (id, name, email, company_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    (NEW.raw_user_meta_data ->> 'company_id')::UUID
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;