-- Add RLS policy to allow prestadores to search for users by email for booking purposes
CREATE POLICY "Prestadores can search users by email for bookings" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM prestadores 
    WHERE prestadores.user_id = auth.uid() 
    AND prestadores.is_active = true 
    AND prestadores.is_approved = true
  )
);