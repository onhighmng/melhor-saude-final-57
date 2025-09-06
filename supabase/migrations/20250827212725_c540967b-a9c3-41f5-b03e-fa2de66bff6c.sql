-- Make temp-uploads bucket public for video access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'temp-uploads';

-- Create policy to allow public access to videos in temp-uploads bucket
CREATE POLICY "Allow public access to temp-uploads"
ON storage.objects
FOR SELECT
USING (bucket_id = 'temp-uploads');