-- Create resources table for wellness content
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  pillar TEXT CHECK (pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')),
  type TEXT CHECK (type IN ('pdf', 'video', 'article', 'guide')) NOT NULL,
  file_url TEXT,
  video_url TEXT,
  duration TEXT,
  thumbnail TEXT,
  is_public BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create resource access log for tracking
CREATE TABLE IF NOT EXISTS resource_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ DEFAULT now(),
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_access_log ENABLE ROW LEVEL SECURITY;

-- Resources policies
CREATE POLICY "users_view_public_resources" ON resources
  FOR SELECT USING (is_public = true);

CREATE POLICY "users_view_premium_resources" ON resources
  FOR SELECT USING (
    is_premium = true AND EXISTS (
      SELECT 1 FROM company_employees ce
      JOIN subscriptions s ON ce.company_id = s.company_id
      WHERE ce.user_id = auth.uid() AND s.status = 'active'
    )
  );

CREATE POLICY "admins_manage_resources" ON resources
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Resource access log policies
CREATE POLICY "users_log_own_access" ON resource_access_log
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_view_own_access" ON resource_access_log
  FOR SELECT USING (user_id = auth.uid());

-- Seed initial resources from mock data
INSERT INTO resources (title, description, pillar, type, file_url, video_url, duration, thumbnail) VALUES
  ('Guia de Gestão de Stress', 'Técnicas práticas para gerir o stress no dia a dia', 'saude_mental', 'pdf', '/resources/stress-guide.pdf', NULL, NULL, '/lovable-uploads/676d62ef-5d2a-46ab-9c4f-1c94521aabed.png'),
  ('Meditação Guiada - 10 minutos', 'Sessão de meditação para relaxamento', 'saude_mental', 'video', NULL, 'https://example.com/meditation-video', '10 min', '/lovable-uploads/5d2071d4-8909-4e5f-b30d-cf52091ffba9.png'),
  ('Como Melhorar o Sono', 'Dicas e estratégias para uma boa noite de sono', 'saude_mental', 'article', '/resources/sleep-article.html', NULL, NULL, '/lovable-uploads/8e8fac57-f901-4bea-b185-7628c8f592be.png');

