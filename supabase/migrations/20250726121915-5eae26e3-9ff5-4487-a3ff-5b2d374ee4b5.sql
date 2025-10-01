-- Create file_uploads table for comprehensive file management
CREATE TABLE public.file_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL, -- MIME type
  file_category TEXT NOT NULL CHECK (file_category IN ('photo', 'video', 'document', 'avatar', 'other')),
  bucket_name TEXT NOT NULL,
  public_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}', -- additional file metadata (dimensions, duration, etc.)
  upload_source TEXT DEFAULT 'web', -- web, mobile, api
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- for temporary files
  is_processed BOOLEAN DEFAULT false, -- for files that need processing
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on file_uploads
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Create additional storage buckets for general file management
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('temp-uploads', 'temp-uploads', false) ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX idx_file_uploads_user_id ON public.file_uploads(user_id);
CREATE INDEX idx_file_uploads_category ON public.file_uploads(file_category);
CREATE INDEX idx_file_uploads_bucket ON public.file_uploads(bucket_name);
CREATE INDEX idx_file_uploads_created_at ON public.file_uploads(created_at);
CREATE INDEX idx_file_uploads_expires_at ON public.file_uploads(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_file_uploads_processing_status ON public.file_uploads(processing_status);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_file_uploads_updated_at
  BEFORE UPDATE ON public.file_uploads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to track file access
CREATE OR REPLACE FUNCTION public.track_file_access(p_file_id UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE file_uploads 
  SET access_count = access_count + 1,
      last_accessed_at = now()
  WHERE id = p_file_id;
$$;

-- Create function to cleanup expired files
CREATE OR REPLACE FUNCTION public.cleanup_expired_files()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INTEGER := 0;
  v_file RECORD;
BEGIN
  -- Find expired files
  FOR v_file IN 
    SELECT id, bucket_name, file_path 
    FROM file_uploads 
    WHERE expires_at IS NOT NULL AND expires_at < now()
  LOOP
    -- Delete from storage
    PERFORM storage.delete_object(v_file.bucket_name, v_file.file_path);
    
    -- Delete from database
    DELETE FROM file_uploads WHERE id = v_file.id;
    
    v_deleted_count := v_deleted_count + 1;
  END LOOP;
  
  RETURN v_deleted_count;
END;
$$;

-- RLS Policies for file_uploads
CREATE POLICY "Users can view their own files" 
ON public.file_uploads FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public files" 
ON public.file_uploads FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create their own files" 
ON public.file_uploads FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" 
ON public.file_uploads FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" 
ON public.file_uploads FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all files" 
ON public.file_uploads FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies for documents bucket
CREATE POLICY "Users can view their own documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for photos bucket
CREATE POLICY "Anyone can view public photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'photos');

CREATE POLICY "Users can upload photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own photos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for videos bucket
CREATE POLICY "Anyone can view public videos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'videos');

CREATE POLICY "Users can upload videos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own videos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for temp-uploads bucket
CREATE POLICY "Users can manage their temp uploads" 
ON storage.objects FOR ALL 
USING (bucket_id = 'temp-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);