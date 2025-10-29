-- =====================================================
-- DEPRECATE profiles.role COLUMN - SECURITY FIX
-- =====================================================
-- This migration deprecates the profiles.role column to prevent
-- privilege escalation attacks. All role management should use
-- the user_roles table.

-- Mark profiles.role as deprecated
COMMENT ON COLUMN public.profiles.role IS 'DEPRECATED: Use user_roles table. This column will be removed in future version.';

-- Make profiles.role nullable (to allow gradual migration)
ALTER TABLE public.profiles ALTER COLUMN role DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT NULL;

-- Create computed function for primary role
CREATE OR REPLACE FUNCTION public.get_user_primary_role(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = $1 AND role = 'admin') THEN 'admin'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = $1 AND role = 'hr') THEN 'hr'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = $1 AND role = 'prestador') THEN 'prestador'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = $1 AND role = 'specialist') THEN 'specialist'
    ELSE 'user'
  END;
$$;

-- Update trigger to stop writing to profiles.role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile WITHOUT role
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create default user role in user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger to ensure it's active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

