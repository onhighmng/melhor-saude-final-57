-- Create prestador_cases table for tracking provider case history
CREATE TABLE public.prestador_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prestador_id UUID NOT NULL REFERENCES public.prestadores(id) ON DELETE CASCADE,
  case_title TEXT NOT NULL,
  case_description TEXT,
  specialty_area TEXT,
  session_count INTEGER DEFAULT 1,
  outcome_summary TEXT,
  anonymized_notes TEXT, -- anonymized case notes for portfolio
  difficulty_level TEXT CHECK (difficulty_level IN ('basic', 'intermediate', 'advanced', 'complex')),
  case_status TEXT NOT NULL DEFAULT 'active' CHECK (case_status IN ('active', 'completed', 'archived')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on prestador_cases
ALTER TABLE public.prestador_cases ENABLE ROW LEVEL SECURITY;

-- Create storage buckets for prestador files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prestador-photos', 'prestador-photos', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('prestador-videos', 'prestador-videos', true);

-- Create indexes for better performance
CREATE INDEX idx_prestador_cases_prestador_id ON public.prestador_cases(prestador_id);
CREATE INDEX idx_prestador_cases_status ON public.prestador_cases(case_status);
CREATE INDEX idx_prestador_cases_specialty ON public.prestador_cases(specialty_area);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_prestador_cases_updated_at
  BEFORE UPDATE ON public.prestador_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for prestador_cases
CREATE POLICY "Prestadores can manage their own cases" 
ON public.prestador_cases FOR ALL 
USING (
  prestador_id IN (
    SELECT id FROM prestadores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all prestador cases" 
ON public.prestador_cases FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies for prestador photos
CREATE POLICY "Anyone can view prestador photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'prestador-photos');

CREATE POLICY "Prestadores can upload their own photos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'prestador-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Prestadores can update their own photos" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'prestador-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Prestadores can delete their own photos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'prestador-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for prestador videos
CREATE POLICY "Anyone can view prestador videos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'prestador-videos');

CREATE POLICY "Prestadores can upload their own videos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'prestador-videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Prestadores can update their own videos" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'prestador-videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Prestadores can delete their own videos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'prestador-videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);