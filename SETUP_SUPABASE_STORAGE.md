# Supabase Storage Setup for Resources

## Required Storage Bucket

To support file uploads for resources, you need to create a storage bucket in Supabase.

## Steps:

### 1. Create Storage Bucket
Go to **Supabase Dashboard → Storage**

1. Click **"New bucket"**
2. Name: `resources`
3. Public bucket: **Yes** (so resources can be accessed publicly)
4. Click **"Create bucket"**

### 2. Set Bucket Policies (Optional but Recommended)

After creating the bucket, you may want to set policies:

**Allow authenticated users to upload:**
```sql
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');
```

**Allow public read access:**
```sql
CREATE POLICY "Public can read resources"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resources');
```

**Allow admins to delete:**
```sql
CREATE POLICY "Admins can delete resources"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resources' AND
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);
```

## File Types Supported

- **Resource files**: PDF, DOC, DOCX, MP4, MOV, AVI
- **Thumbnails**: Any image format (JPG, PNG, GIF, WEBP, etc.)

## How It Works

1. Admin uploads a file (PDF, video, etc.) OR enters a URL
2. If file is uploaded:
   - File is stored in `resources` bucket
   - Public URL is generated automatically
   - URL is saved to `resources.url` column
3. Same process for thumbnail images
4. If URL is entered manually, file upload is skipped

## Notes

- File names are randomized to prevent conflicts
- Old files are NOT automatically deleted when updating (manual cleanup needed)
- Maximum file size depends on your Supabase plan

