-- Update the handle_new_user function to assign HR role to the specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    CASE 
      WHEN NEW.email = 'onhighmanagement@gmail.com' THEN 'admin'::user_role
      WHEN NEW.email = 'lorinofrodriguesjunior@gmail.com' THEN 'hr'::user_role
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
$function$;