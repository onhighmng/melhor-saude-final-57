-- Secure sensitive provider data: restrict public access to prestadores
-- Drop public-select policy
DROP POLICY IF EXISTS "Anyone can view approved prestadores" ON public.prestadores;

-- Allow only authenticated users to view approved providers
CREATE POLICY "Authenticated users can view approved prestadores"
ON public.prestadores
FOR SELECT
TO authenticated
USING (is_active = true AND is_approved = true);
