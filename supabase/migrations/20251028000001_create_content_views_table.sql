-- Create content_views table for tracking resource views
CREATE TABLE IF NOT EXISTS content_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'article', 'video', 'tool', 'test'
  resource_id TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_content_views_user ON content_views(user_id);
CREATE INDEX idx_content_views_resource ON content_views(resource_type, resource_id);
CREATE INDEX idx_content_views_viewed_at ON content_views(viewed_at DESC);

-- RLS Policies
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content views"
  ON content_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content views"
  ON content_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can view all content views for analytics"
  ON content_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'company_hr')
    )
  );




