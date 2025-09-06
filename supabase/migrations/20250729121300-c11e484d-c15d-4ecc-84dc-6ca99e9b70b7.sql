-- Add RLS policy to allow prestadores to create bookings for their clients
CREATE POLICY "Prestadores can create bookings for clients" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  prestador_id IN (
    SELECT prestadores.id
    FROM prestadores
    WHERE prestadores.user_id = auth.uid()
    AND prestadores.is_active = true
    AND prestadores.is_approved = true
  )
);