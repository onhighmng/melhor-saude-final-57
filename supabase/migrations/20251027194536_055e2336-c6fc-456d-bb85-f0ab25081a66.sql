-- Phase 2: Self-Help Content System Database Tables

-- Create self_help_content table
CREATE TABLE IF NOT EXISTS self_help_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('psicologica', 'juridica', 'medica', 'financeira')),
  content_type TEXT DEFAULT 'article',
  author TEXT,
  content_body TEXT,
  thumbnail_url TEXT,
  summary TEXT,
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Create psychological_tests table
CREATE TABLE IF NOT EXISTS psychological_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  test_type TEXT,
  questions JSONB NOT NULL,
  scoring_rules JSONB NOT NULL,
  interpretation_guide JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES psychological_tests(id),
  user_id UUID REFERENCES auth.users(id),
  answers JSONB NOT NULL,
  score NUMERIC,
  interpretation TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  consent_given BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Create content_views table for analytics
CREATE TABLE IF NOT EXISTS content_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES self_help_content(id),
  user_id UUID REFERENCES auth.users(id),
  viewed_at TIMESTAMPTZ DEFAULT now(),
  duration_seconds INTEGER
);

-- Enable RLS
ALTER TABLE self_help_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychological_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for self_help_content
CREATE POLICY "Anyone can view published content" ON self_help_content
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage content" ON self_help_content
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for psychological_tests
CREATE POLICY "Anyone can view active tests" ON psychological_tests
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tests" ON psychological_tests
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for test_results
CREATE POLICY "Users can submit test results" ON test_results
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_anonymous = true);

CREATE POLICY "Users can view own test results" ON test_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all test results" ON test_results
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for content_views
CREATE POLICY "Users can track content views" ON content_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own content views" ON content_views
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all content views" ON content_views
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Create RPC function for incrementing view counts
CREATE OR REPLACE FUNCTION increment_content_views(content_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE self_help_content 
  SET view_count = view_count + 1,
      updated_at = now()
  WHERE id = content_id;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_self_help_content_category ON self_help_content(category) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_self_help_content_published ON self_help_content(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_views_content_id ON content_views(content_id, viewed_at);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id, completed_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_self_help_content_updated_at BEFORE UPDATE ON self_help_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_psychological_tests_updated_at BEFORE UPDATE ON psychological_tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();