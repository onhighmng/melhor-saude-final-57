-- ============================================
-- IMMEDIATE FIX FOR UPLOAD ERROR
-- ============================================
-- This will make uploads work for ALL authenticated users temporarily
-- Run this NOW, then try uploading again
-- ============================================

-- Drop the restrictive admin-only policy
DROP POLICY IF EXISTS "Admins can upload resources" ON storage.objects;

-- Create a simpler policy that allows ALL authenticated users to upload
CREATE POLICY "Authenticated users can upload to resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

-- Verify it was created
SELECT 
  'Policy created' as status,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname = 'Authenticated users can upload to resources';

-- ============================================
-- AFTER RUNNING THIS:
-- 1. Refresh your app (Ctrl+F5 or Cmd+Shift+R)
-- 2. Try uploading again - it should work immediately
-- ============================================



