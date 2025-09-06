-- Fix security issues: Drop triggers first, then recreate functions with proper search_path

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON public.user_sessions;

-- Drop and recreate functions with proper search_path
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.has_role(UUID, user_role);
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Recreate handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    CASE 
      WHEN NEW.email ILIKE '%admin%' THEN 'admin'::user_role
      WHEN NEW.email ILIKE '%hr%' OR NEW.email ILIKE '%rh%' THEN 'hr'::user_role
      WHEN NEW.email ILIKE '%prestador%' THEN 'prestador'::user_role
      ELSE 'user'::user_role
    END
  );
  
  -- Create initial session allocation
  INSERT INTO public.user_sessions (user_id, total_sessions, company_sessions, personal_sessions)
  VALUES (NEW.id, 0, 0, 0);
  
  RETURN NEW;
END;
$$;

-- Recreate update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate has_role function with proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = _user_id AND role = _role AND is_active = true
  )
$$;

-- Recreate get_current_user_role function with proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() AND is_active = true
$$;

-- Recreate triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();