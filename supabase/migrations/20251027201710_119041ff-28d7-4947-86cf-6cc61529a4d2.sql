-- Phase 6: Tables & Seed Data (Final)

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can view their chat messages') THEN
    CREATE POLICY "Users can view their chat messages" ON public.chat_messages FOR SELECT
    USING (session_id IN (SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'System can insert chat messages') THEN
    CREATE POLICY "System can insert chat messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Create session_notes table
CREATE TABLE IF NOT EXISTS public.session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  prestador_id UUID NOT NULL,
  notes TEXT NOT NULL,
  private_notes TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_notes_booking ON public.session_notes(booking_id);
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'session_notes' AND policyname = 'Providers can manage their session notes') THEN
    CREATE POLICY "Providers can manage their session notes" ON public.session_notes FOR ALL
    USING (prestador_id IN (SELECT id FROM public.prestadores WHERE user_id = auth.uid()));
  END IF;
END $$;

-- Seed companies (using valid values: basic, premium, enterprise)
INSERT INTO public.companies (id, company_name, contact_email, plan_type, sessions_allocated, sessions_used, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Empresa Demo SA', 'rh@empresademo.com', 'enterprise', 50, 5, true),
  ('22222222-2222-2222-2222-222222222222', 'Tech Solutions Lda', 'hr@techsolutions.com', 'premium', 100, 15, true),
  ('33333333-3333-3333-3333-333333333333', 'StartUp Inovadora', 'admin@startup.com', 'basic', 20, 3, true)
ON CONFLICT (id) DO NOTHING;

-- Seed providers
INSERT INTO public.prestadores (id, name, email, specialties, pillar_specialties, languages, is_active, biography, session_duration) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dra. Ana Silva', 'ana.silva@onhigh.com', 
   ARRAY['Psicologia Clínica', 'Ansiedade'], ARRAY['saude_mental'], ARRAY['Português', 'Inglês'],
   true, 'Psicóloga com 10 anos de experiência.', 60),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Dr. João Santos', 'joao.santos@onhigh.com', 
   ARRAY['Medicina do Trabalho'], ARRAY['bem_estar_fisico'], ARRAY['Português'],
   true, 'Médico especialista em saúde ocupacional.', 45),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Dra. Maria Costa', 'maria.costa@onhigh.com', 
   ARRAY['Direito Trabalhista'], ARRAY['assistencia_juridica'], ARRAY['Português'],
   true, 'Advogada especializada em direito laboral.', 60),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Dr. Pedro Alves', 'pedro.alves@onhigh.com', 
   ARRAY['Consultoria Financeira'], ARRAY['assistencia_financeira'], ARRAY['Português'],
   true, 'Consultor financeiro certificado.', 45)
ON CONFLICT (id) DO NOTHING;

-- Seed provider availability
INSERT INTO public.prestador_availability (prestador_id, day_of_week, start_time, end_time) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, '09:00', '18:00'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, '09:00', '18:00'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, '10:00', '17:00')
ON CONFLICT DO NOTHING;

-- Seed self-help content (using valid categories: psicologica, juridica, medica, financeira)
INSERT INTO public.self_help_content (title, category, content_type, author, content_body, summary, is_published, published_at) VALUES
  ('Gestão de Stress', 'psicologica', 'article', 'Equipa OnHigh',
   'O stress laboral é uma realidade comum.',
   'Guia prático para gerir o stress.', true, now()),
  ('Direitos Laborais', 'juridica', 'guide', 'Dra. Maria Costa',
   'Conheça os seus direitos como trabalhador.',
   'Informação essencial sobre direitos laborais.', true, now()),
  ('Planeamento Financeiro', 'financeira', 'guide', 'Dr. Pedro Alves',
   'Organize as suas finanças pessoais.',
   'Guia de planeamento financeiro.', true, now())
ON CONFLICT DO NOTHING;