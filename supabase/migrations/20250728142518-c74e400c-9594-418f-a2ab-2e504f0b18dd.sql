-- Create the missing INSERT policy for photos bucket
-- First drop if exists to avoid conflicts, then recreate
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;

CREATE POLICY "Users can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);