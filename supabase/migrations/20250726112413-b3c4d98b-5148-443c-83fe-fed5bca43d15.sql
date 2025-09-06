-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'hr', 'user', 'prestador');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  company TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create sessions table for session management
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  used_sessions INTEGER NOT NULL DEFAULT 0,
  company_sessions INTEGER NOT NULL DEFAULT 0,
  used_company_sessions INTEGER NOT NULL DEFAULT 0,
  personal_sessions INTEGER NOT NULL DEFAULT 0,
  used_personal_sessions INTEGER NOT NULL DEFAULT 0,
  company_name TEXT,
  plan_type TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create password_resets table
CREATE TABLE public.password_resets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on password_resets
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = _user_id AND role = _role AND is_active = true
  )
$$;

-- Security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() AND is_active = true
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR can view company profiles" 
ON public.profiles FOR SELECT 
USING (
  public.has_role(auth.uid(), 'hr') AND 
  company = (SELECT company FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" 
ON public.user_sessions FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all sessions" 
ON public.user_sessions FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR can view company user sessions" 
ON public.user_sessions FOR SELECT 
USING (
  public.has_role(auth.uid(), 'hr') AND 
  user_id IN (
    SELECT user_id FROM public.profiles 
    WHERE company = (SELECT company FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for password_resets
CREATE POLICY "Users can view their own password resets" 
ON public.password_resets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert password resets" 
ON public.password_resets FOR INSERT 
WITH CHECK (true);