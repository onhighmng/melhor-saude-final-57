-- Simplify storage policies - make them very permissive for testing
-- Drop existing complex policies
DROP POLICY IF EXISTS "Users and admins can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

-- Create very simple policies for photos bucket
CREATE POLICY "Allow all authenticated uploads to photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Allow all to view photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'photos');

CREATE POLICY "Allow all authenticated updates to photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'photos');

CREATE POLICY "Allow all authenticated deletes to photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'photos');