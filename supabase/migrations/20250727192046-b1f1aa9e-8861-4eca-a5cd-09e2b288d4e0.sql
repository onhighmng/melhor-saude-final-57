-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "HR can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create the simplest possible policies that work
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

-- Create a simple admin policy that doesn't query the same table
CREATE POLICY "Admin user can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = 'fcbc0307-a8b9-4bb2-9eb3-0c8d319af582'::uuid 
  OR auth.uid() = user_id
);

CREATE POLICY "Admin user can update all profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() = 'fcbc0307-a8b9-4bb2-9eb3-0c8d319af582'::uuid 
  OR auth.uid() = user_id
);