-- Fix critical RLS vulnerability in bookings table
-- Current policies use USING (true) which allows any authenticated user to access ALL bookings
-- This exposes sensitive healthcare data including mental health sessions, meeting links, and patient-provider relationships

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete their bookings" ON bookings;

-- Create properly scoped policies for users
CREATE POLICY "users_view_own_bookings" ON bookings 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "users_create_own_bookings" ON bookings 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_bookings" ON bookings 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "users_delete_own_bookings" ON bookings 
FOR DELETE 
USING (user_id = auth.uid());

-- Providers can view bookings assigned to them
CREATE POLICY "prestadores_view_assigned_bookings" ON bookings 
FOR SELECT 
USING (
  prestador_id IN (
    SELECT id FROM prestadores WHERE user_id = auth.uid()
  )
);

-- Providers can update their assigned bookings (e.g., add notes, confirm sessions)
CREATE POLICY "prestadores_update_assigned_bookings" ON bookings 
FOR UPDATE 
USING (
  prestador_id IN (
    SELECT id FROM prestadores WHERE user_id = auth.uid()
  )
);

-- HR can view bookings from their company
CREATE POLICY "hr_view_company_bookings" ON bookings 
FOR SELECT 
USING (
  has_role(auth.uid(), 'hr'::app_role) AND
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid() AND company_id IS NOT NULL
  )
);

-- Admins have full access for system management and analytics
CREATE POLICY "admins_view_all_bookings" ON bookings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins_update_all_bookings" ON bookings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins_delete_all_bookings" ON bookings 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));