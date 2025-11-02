-- Migration: Create resources table
-- Purpose: Support resource management (articles, videos, PDFs) by pillar
-- Date: November 2, 2025

CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  pillar TEXT NOT NULL DEFAULT 'saude_mental'
    CHECK (pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')),
  resource_type TEXT NOT NULL DEFAULT 'article'
    CHECK (resource_type IN ('article', 'video', 'pdf')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_resources_pillar ON public.resources(pillar);
CREATE INDEX IF NOT EXISTS idx_resources_is_active ON public.resources(is_active);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON public.resources(created_at DESC);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Policy: Public/users can view active resources
CREATE POLICY IF NOT EXISTS "resources_public_view"
  ON public.resources FOR SELECT
  USING (is_active = true);

-- Policy: Admins can manage all resources
CREATE POLICY IF NOT EXISTS "resources_admin_all"
  ON public.resources FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Grants
GRANT SELECT ON public.resources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.resources TO authenticated;

-- Comments
COMMENT ON TABLE public.resources IS 'Educational resources by pillar (articles, videos, PDFs)';
COMMENT ON COLUMN public.resources.pillar IS 'Resource category: saude_mental, bem_estar_fisico, assistencia_financeira, assistencia_juridica';
COMMENT ON COLUMN public.resources.resource_type IS 'Content type: article, video, or pdf';
COMMENT ON COLUMN public.resources.is_active IS 'Active/visible to users';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: resources table created with RLS policies';
END
$$;
