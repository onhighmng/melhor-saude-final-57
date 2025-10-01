-- Fix storage and file upload policies for admin users
-- Admins should be able to upload photos for providers

-- Update storage policies to allow admins to upload for anyone
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;

CREATE POLICY "Users and admins can upload photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'photos' AND 
  (
    auth.role() = 'authenticated' AND 
    (
      auth.uid()::text = (storage.foldername(name))[1] OR 
      has_role(auth.uid(), 'admin'::user_role)
    )
  )
);

-- Update file_uploads policies for admins
DROP POLICY IF EXISTS "Users can create their own files" ON file_uploads;
DROP POLICY IF EXISTS "Edge functions can insert files" ON file_uploads;

CREATE POLICY "Users and admins can create files" 
ON file_uploads 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'admin'::user_role) OR
  auth.role() = 'service_role'
);