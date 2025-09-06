-- First, let's check if the photos bucket exists and create storage policies for it
-- Create storage policies for the photos bucket to allow uploads

-- Policy to allow users to upload their own photos
CREATE POLICY "Users can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to view all photos (since they're public)
CREATE POLICY "Anyone can view photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'photos');

-- Policy to allow users to update their own photos
CREATE POLICY "Users can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to delete their own photos
CREATE POLICY "Users can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);