-- Create enum for content categories
CREATE TYPE content_category AS ENUM ('psicologica', 'juridica', 'medica');

-- Create enum for content types  
CREATE TYPE content_type AS ENUM ('article', 'video', 'download');

-- Create self-help content table
CREATE TABLE public.self_help_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category content_category NOT NULL,
  content_type content_type NOT NULL,
  author TEXT NOT NULL,
  content_body TEXT,
  video_url TEXT,
  download_url TEXT,
  thumbnail_url TEXT,
  summary TEXT,
  tags TEXT[],
  view_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create content access analytics table
CREATE TABLE public.content_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES self_help_content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT,
  user_agent TEXT,
  ip_address INET
);

-- Create psychological tests table
CREATE TABLE public.psychological_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  test_type TEXT NOT NULL, -- PHQ-9, GAD-7, etc.
  questions JSONB NOT NULL,
  scoring_rules JSONB NOT NULL,
  interpretation_guide JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test results table
CREATE TABLE public.test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES psychological_tests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- nullable for anonymous tests
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  interpretation TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.self_help_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychological_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for self_help_content
CREATE POLICY "Anyone can view published content" 
ON public.self_help_content 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage all content" 
ON public.self_help_content 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- RLS Policies for content_analytics
CREATE POLICY "Admins can view all analytics" 
ON public.content_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "System can create analytics" 
ON public.content_analytics 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for psychological_tests
CREATE POLICY "Anyone can view active tests" 
ON public.psychological_tests 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all tests" 
ON public.psychological_tests 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- RLS Policies for test_results
CREATE POLICY "Users can view their own results" 
ON public.test_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own results" 
ON public.test_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all results" 
ON public.test_results 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create function to update view count
CREATE OR REPLACE FUNCTION public.increment_content_view_count(content_id UUID, user_id_param UUID DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update view count
  UPDATE self_help_content 
  SET view_count = view_count + 1 
  WHERE id = content_id;
  
  -- Log analytics
  INSERT INTO content_analytics (content_id, user_id)
  VALUES (content_id, user_id_param);
END;
$$;

-- Create function to get content analytics
CREATE OR REPLACE FUNCTION public.get_content_analytics()
RETURNS TABLE(
  content_id UUID,
  title TEXT,
  category TEXT,
  total_views BIGINT,
  daily_views BIGINT,
  weekly_views BIGINT,
  monthly_views BIGINT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id as content_id,
    c.title,
    c.category::TEXT,
    COUNT(ca.id) as total_views,
    COUNT(CASE WHEN ca.accessed_at >= CURRENT_DATE THEN 1 END) as daily_views,
    COUNT(CASE WHEN ca.accessed_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as weekly_views,
    COUNT(CASE WHEN ca.accessed_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as monthly_views
  FROM self_help_content c
  LEFT JOIN content_analytics ca ON c.id = ca.content_id
  WHERE c.is_published = true
  GROUP BY c.id, c.title, c.category
  ORDER BY total_views DESC;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_self_help_content_updated_at
BEFORE UPDATE ON public.self_help_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_psychological_tests_updated_at
BEFORE UPDATE ON public.psychological_tests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample psychological tests
INSERT INTO public.psychological_tests (name, description, test_type, questions, scoring_rules, interpretation_guide) VALUES
(
  'PHQ-9 - Questionário de Depressão',
  'O PHQ-9 é uma ferramenta de rastreio para depressão que avalia sintomas depressivos nas últimas duas semanas.',
  'PHQ-9',
  '[
    {
      "id": 1,
      "question": "Pouco interesse ou prazer em fazer as coisas",
      "options": [
        {"value": 0, "text": "Nenhuma vez"},
        {"value": 1, "text": "Vários dias"},
        {"value": 2, "text": "Mais da metade dos dias"},
        {"value": 3, "text": "Quase todos os dias"}
      ]
    },
    {
      "id": 2,
      "question": "Sentir-se em baixo, deprimido ou sem esperança",
      "options": [
        {"value": 0, "text": "Nenhuma vez"},
        {"value": 1, "text": "Vários dias"},
        {"value": 2, "text": "Mais da metade dos dias"},
        {"value": 3, "text": "Quase todos os dias"}
      ]
    },
    {
      "id": 3,
      "question": "Problemas para adormecer, manter o sono ou dormir demais",
      "options": [
        {"value": 0, "text": "Nenhuma vez"},
        {"value": 1, "text": "Vários dias"},
        {"value": 2, "text": "Mais da metade dos dias"},
        {"value": 3, "text": "Quase todos os dias"}
      ]
    },
    {
      "id": 4,
      "question": "Sentir-se cansado ou com pouca energia",
      "options": [
        {"value": 0, "text": "Nenhuma vez"},
        {"value": 1, "text": "Vários dias"},
        {"value": 2, "text": "Mais da metade dos dias"},
        {"value": 3, "text": "Quase todos os dias"}
      ]
    },
    {
      "id": 5,
      "question": "Falta de apetite ou comer demais",
      "options": [
        {"value": 0, "text": "Nenhuma vez"},
        {"value": 1, "text": "Vários dias"},
        {"value": 2, "text": "Mais da metade dos dias"},
        {"value": 3, "text": "Quase todos os dias"}
      ]
    }
  ]',
  '{
    "total_possible": 15,
    "calculation": "sum_all_answers"
  }',
  '{
    "ranges": [
      {"min": 0, "max": 4, "level": "minimal", "description": "Sintomas mínimos de depressão"},
      {"min": 5, "max": 9, "level": "mild", "description": "Sintomas leves de depressão"},
      {"min": 10, "max": 14, "level": "moderate", "description": "Sintomas moderados de depressão"},
      {"min": 15, "max": 15, "level": "severe", "description": "Sintomas severos de depressão"}
    ],
    "recommendation": "Este questionário é apenas uma ferramenta de rastreio. Para um diagnóstico adequado, consulte sempre um profissional de saúde mental."
  }'
),
(
  'GAD-7 - Questionário de Ansiedade',
  'O GAD-7 é usado para rastrear transtorno de ansiedade generalizada.',
  'GAD-7',
  '[
    {
      "id": 1,
      "question": "Sentir-se nervoso, ansioso ou muito tenso",
      "options": [
        {"value": 0, "text": "Nenhuma vez"},
        {"value": 1, "text": "Vários dias"},
        {"value": 2, "text": "Mais da metade dos dias"},
        {"value": 3, "text": "Quase todos os dias"}
      ]
    },
    {
      "id": 2,
      "question": "Não conseguir parar ou controlar as preocupações",
      "options": [
        {"value": 0, "text": "Nenhuma vez"},
        {"value": 1, "text": "Vários dias"},
        {"value": 2, "text": "Mais da metade dos dias"},
        {"value": 3, "text": "Quase todos os dias"}
      ]
    },
    {
      "id": 3,
      "question": "Preocupar-se excessivamente com diferentes coisas",
      "options": [
        {"value": 0, "text": "Nenhuma vez"},
        {"value": 1, "text": "Vários dias"},
        {"value": 2, "text": "Mais da metade dos dias"},
        {"value": 3, "text": "Quase todos os dias"}
      ]
    },
    {
      "id": 4,
      "question": "Ter dificuldade para relaxar",
      "options": [
        {"value": 0, "text": "Nenhuma vez"},
        {"value": 1, "text": "Vários dias"},
        {"value": 2, "text": "Mais da metade dos dias"},
        {"value": 3, "text": "Quase todos os dias"}
      ]
    }
  ]',
  '{
    "total_possible": 12,
    "calculation": "sum_all_answers"
  }',
  '{
    "ranges": [
      {"min": 0, "max": 4, "level": "minimal", "description": "Ansiedade mínima"},
      {"min": 5, "max": 9, "level": "mild", "description": "Ansiedade leve"},
      {"min": 10, "max": 12, "level": "moderate", "description": "Ansiedade moderada"}
    ],
    "recommendation": "Este questionário é apenas uma ferramenta de rastreio. Para um diagnóstico adequado, consulte sempre um profissional de saúde mental."
  }'
);