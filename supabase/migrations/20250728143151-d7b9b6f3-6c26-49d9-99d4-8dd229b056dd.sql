-- Let's check what storage policies exist and recreate them properly
-- First, drop all existing policies on storage.objects for photos bucket
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

-- Create comprehensive storage policies for photos bucket
-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- Allow everyone to view photos (since they're public)
CREATE POLICY "Anyone can view photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'photos');

-- Allow users to update/delete their own photos  
CREATE POLICY "Users can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);