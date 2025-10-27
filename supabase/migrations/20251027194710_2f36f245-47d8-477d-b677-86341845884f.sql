-- Fix security warning for increment_content_views function
DROP FUNCTION IF EXISTS increment_content_views(UUID);

CREATE OR REPLACE FUNCTION increment_content_views(content_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE self_help_content 
  SET view_count = view_count + 1,
      updated_at = now()
  WHERE id = content_id;
END;
$$;