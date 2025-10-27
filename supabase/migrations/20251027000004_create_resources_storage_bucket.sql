-- Create resources storage bucket for resource thumbnails and files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage.objects

-- Policy: Public can view resources
DROP POLICY IF EXISTS "Public can view resources" ON storage.objects;
CREATE POLICY "Public can view resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

-- Policy: Authenticated users can upload resources
DROP POLICY IF EXISTS "Authenticated can upload resources" ON storage.objects;
CREATE POLICY "Authenticated can upload resources"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resources' AND auth.role() = 'authenticated');

-- Policy: Authenticated users can update their own resources
DROP POLICY IF EXISTS "Authenticated can update own resources" ON storage.objects;
CREATE POLICY "Authenticated can update own resources"
ON storage.objects FOR UPDATE
USING (bucket_id = 'resources' AND auth.role() = 'authenticated');

-- Policy: Authenticated users can delete their own resources
DROP POLICY IF EXISTS "Authenticated can delete own resources" ON storage.objects;
CREATE POLICY "Authenticated can delete own resources"
ON storage.objects FOR DELETE
USING (bucket_id = 'resources' AND auth.role() = 'authenticated');

