-- Remove video and download columns from self_help_content table
ALTER TABLE public.self_help_content 
  DROP COLUMN IF EXISTS video_url,
  DROP COLUMN IF EXISTS download_url;

-- Update the content_type enum to only include 'article'
ALTER TYPE content_type RENAME TO content_type_old;
CREATE TYPE content_type AS ENUM ('article');

-- Update the table to use the new enum
ALTER TABLE public.self_help_content 
  ALTER COLUMN content_type TYPE content_type USING 'article'::content_type;

-- Drop the old enum type
DROP TYPE content_type_old;