-- Drop existing problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "HR can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policies without recursion
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Simple admin policy based on email instead of role function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE email = 'onhighmanagement@gmail.com' AND role = 'admin'
  )
  OR auth.uid() = user_id
);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE email = 'onhighmanagement@gmail.com' AND role = 'admin'
  )
  OR auth.uid() = user_id
);

-- HR policy for company profiles
CREATE POLICY "HR can view company profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles hr_profile
    WHERE hr_profile.user_id = auth.uid() 
    AND hr_profile.role = 'hr' 
    AND hr_profile.company = profiles.company
  )
  OR auth.uid() = user_id
);