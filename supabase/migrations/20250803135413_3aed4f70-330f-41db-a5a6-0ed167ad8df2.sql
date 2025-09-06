-- Update the specific user to admin role
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE email = 'melhorsaude2025@gmail.com';

-- Create admin invitation system table
CREATE TABLE public.admin_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  used_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin invitations
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin invitations
CREATE POLICY "Admins can manage all invitations" 
ON public.admin_invitations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create trigger for updated_at
CREATE TRIGGER update_admin_invitations_updated_at
  BEFORE UPDATE ON public.admin_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function to handle admin invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role user_role;
  user_company text;
  company_record record;
  invitation_record record;
BEGIN
  -- Check if this user was invited as an admin
  SELECT * INTO invitation_record
  FROM admin_invitations 
  WHERE email = NEW.email 
    AND used_at IS NULL 
    AND expires_at > now()
  LIMIT 1;
  
  -- If admin invitation exists, mark as used and assign admin role
  IF invitation_record.id IS NOT NULL THEN
    UPDATE admin_invitations 
    SET used_at = now() 
    WHERE id = invitation_record.id;
    
    user_role := 'admin'::user_role;
    user_company := NULL;
  ELSE
    -- Existing logic for other users
    SELECT company_name INTO user_company
    FROM company_organizations 
    WHERE contact_email = NEW.email AND is_active = true
    LIMIT 1;
    
    -- Determine role based on email and company match
    IF NEW.email = 'onhighmanagement@gmail.com' OR NEW.email = 'melhorsaude2025@gmail.com' THEN
      user_role := 'admin'::user_role;
      user_company := NULL;
    ELSIF NEW.email = 'lorinofrodriguesjunior@gmail.com' THEN
      user_role := 'hr'::user_role;
      user_company := NULL;
    ELSIF user_company IS NOT NULL THEN
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
$function$;