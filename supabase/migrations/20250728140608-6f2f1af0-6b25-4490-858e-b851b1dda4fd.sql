-- Update the handle_new_user function to check for HR role based on company contact email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  user_role user_role;
  user_company text;
  company_record record;
BEGIN
  -- Check if email matches any company contact email
  SELECT company_name INTO user_company
  FROM company_organizations 
  WHERE contact_email = NEW.email AND is_active = true
  LIMIT 1;
  
  -- Determine role based on email and company match
  IF NEW.email = 'onhighmanagement@gmail.com' THEN
    user_role := 'admin'::user_role;
    user_company := NULL;
  ELSIF NEW.email = 'lorinofrodriguesjunior@gmail.com' THEN
    user_role := 'hr'::user_role;
    user_company := NULL;
  ELSIF user_company IS NOT NULL THEN
    -- If email matches a company contact email, assign HR role
    user_role := 'hr'::user_role;
  ELSIF NEW.email ILIKE '%admin%' THEN
    user_role := 'admin'::user_role;
    user_company := NULL;
  ELSIF NEW.email ILIKE '%hr%' OR NEW.email ILIKE '%rh%' THEN
    user_role := 'hr'::user_role;
    user_company := NULL;
  ELSIF NEW.email ILIKE '%prestador%' THEN
    user_role := 'prestador'::user_role;
    user_company := NULL;
  ELSE
    user_role := 'user'::user_role;
    user_company := NULL;
  END IF;
  
  -- Insert the profile
  INSERT INTO public.profiles (user_id, name, email, role, company)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    user_role,
    user_company
  );
  
  -- Create initial session allocation
  INSERT INTO public.user_sessions (user_id, total_sessions, company_sessions, personal_sessions)
  VALUES (NEW.id, 0, 0, 0);
  
  RETURN NEW;
END;
$$;