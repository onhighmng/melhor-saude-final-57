-- Create Session Management System tables

-- Create company_plans table for different company subscription plans
CREATE TABLE public.company_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'basic', -- basic, premium, enterprise
  total_sessions INTEGER NOT NULL DEFAULT 0,
  sessions_per_user INTEGER NOT NULL DEFAULT 0,
  price_per_session DECIMAL(10,2),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, quarterly, yearly
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on company_plans
ALTER TABLE public.company_plans ENABLE ROW LEVEL SECURITY;

-- Create session_allocations table for tracking session allocations
CREATE TABLE public.session_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_plan_id UUID REFERENCES public.company_plans(id),
  allocated_by UUID REFERENCES auth.users(id),
  allocation_type TEXT NOT NULL DEFAULT 'company', -- company, personal, bonus
  sessions_allocated INTEGER NOT NULL DEFAULT 0,
  sessions_used INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on session_allocations
ALTER TABLE public.session_allocations ENABLE ROW LEVEL SECURITY;

-- Create session_usage table for detailed session usage tracking
CREATE TABLE public.session_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_allocation_id UUID NOT NULL REFERENCES public.session_allocations(id),
  prestador_id UUID, -- Will reference prestadores table when created
  session_type TEXT NOT NULL DEFAULT 'individual', -- individual, group, emergency
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  session_duration INTEGER, -- in minutes
  session_status TEXT NOT NULL DEFAULT 'completed', -- scheduled, completed, cancelled, no_show
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on session_usage
ALTER TABLE public.session_usage ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_session_allocations_user_id ON public.session_allocations(user_id);
CREATE INDEX idx_session_allocations_company_plan_id ON public.session_allocations(company_plan_id);
CREATE INDEX idx_session_usage_user_id ON public.session_usage(user_id);
CREATE INDEX idx_session_usage_session_date ON public.session_usage(session_date);
CREATE INDEX idx_session_usage_allocation_id ON public.session_usage(session_allocation_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_company_plans_updated_at
  BEFORE UPDATE ON public.company_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_session_allocations_updated_at
  BEFORE UPDATE ON public.session_allocations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_session_usage_updated_at
  BEFORE UPDATE ON public.session_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate user session balance
CREATE OR REPLACE FUNCTION public.calculate_user_session_balance(p_user_id UUID)
RETURNS TABLE (
  total_allocated INTEGER,
  total_used INTEGER,
  total_remaining INTEGER,
  company_allocated INTEGER,
  company_used INTEGER,
  company_remaining INTEGER,
  personal_allocated INTEGER,
  personal_used INTEGER,
  personal_remaining INTEGER
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH allocation_summary AS (
    SELECT 
      allocation_type,
      COALESCE(SUM(sessions_allocated), 0) as allocated,
      COALESCE(SUM(sessions_used), 0) as used
    FROM session_allocations 
    WHERE user_id = p_user_id AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    GROUP BY allocation_type
  ),
  company_data AS (
    SELECT 
      COALESCE(allocated, 0) as company_allocated,
      COALESCE(used, 0) as company_used
    FROM allocation_summary 
    WHERE allocation_type = 'company'
  ),
  personal_data AS (
    SELECT 
      COALESCE(allocated, 0) as personal_allocated,
      COALESCE(used, 0) as personal_used
    FROM allocation_summary 
    WHERE allocation_type = 'personal'
  )
  SELECT 
    (COALESCE(c.company_allocated, 0) + COALESCE(p.personal_allocated, 0))::INTEGER as total_allocated,
    (COALESCE(c.company_used, 0) + COALESCE(p.personal_used, 0))::INTEGER as total_used,
    (COALESCE(c.company_allocated, 0) + COALESCE(p.personal_allocated, 0) - 
     COALESCE(c.company_used, 0) - COALESCE(p.personal_used, 0))::INTEGER as total_remaining,
    COALESCE(c.company_allocated, 0)::INTEGER as company_allocated,
    COALESCE(c.company_used, 0)::INTEGER as company_used,
    (COALESCE(c.company_allocated, 0) - COALESCE(c.company_used, 0))::INTEGER as company_remaining,
    COALESCE(p.personal_allocated, 0)::INTEGER as personal_allocated,
    COALESCE(p.personal_used, 0)::INTEGER as personal_used,
    (COALESCE(p.personal_allocated, 0) - COALESCE(p.personal_used, 0))::INTEGER as personal_remaining
  FROM 
    (SELECT 1) as dummy
    LEFT JOIN company_data c ON true
    LEFT JOIN personal_data p ON true;
$$;

-- Create function to use a session
CREATE OR REPLACE FUNCTION public.use_session(
  p_user_id UUID,
  p_allocation_type TEXT DEFAULT 'company',
  p_session_type TEXT DEFAULT 'individual',
  p_session_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  p_prestador_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allocation_id UUID;
  v_usage_id UUID;
BEGIN
  -- Find an active allocation with available sessions
  SELECT id INTO v_allocation_id
  FROM session_allocations
  WHERE user_id = p_user_id 
    AND allocation_type = p_allocation_type
    AND is_active = true
    AND sessions_used < sessions_allocated
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_allocation_id IS NULL THEN
    RAISE EXCEPTION 'No available sessions for allocation type: %', p_allocation_type;
  END IF;

  -- Update the allocation to mark one session as used
  UPDATE session_allocations 
  SET sessions_used = sessions_used + 1,
      updated_at = now()
  WHERE id = v_allocation_id;

  -- Create usage record
  INSERT INTO session_usage (
    user_id, 
    session_allocation_id, 
    prestador_id,
    session_type, 
    session_date, 
    notes
  ) VALUES (
    p_user_id, 
    v_allocation_id, 
    p_prestador_id,
    p_session_type, 
    p_session_date, 
    p_notes
  ) RETURNING id INTO v_usage_id;

  RETURN v_usage_id;
END;
$$;

-- RLS Policies for company_plans
CREATE POLICY "Admins can manage all company plans" 
ON public.company_plans FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR can view their company plan" 
ON public.company_plans FOR SELECT 
USING (
  public.has_role(auth.uid(), 'hr') AND 
  company_name = (SELECT company FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for session_allocations
CREATE POLICY "Users can view their own allocations" 
ON public.session_allocations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all allocations" 
ON public.session_allocations FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR can view company user allocations" 
ON public.session_allocations FOR SELECT 
USING (
  public.has_role(auth.uid(), 'hr') AND 
  user_id IN (
    SELECT user_id FROM public.profiles 
    WHERE company = (SELECT company FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "HR can create company allocations" 
ON public.session_allocations FOR INSERT 
WITH CHECK (
  public.has_role(auth.uid(), 'hr') AND 
  allocation_type = 'company' AND
  user_id IN (
    SELECT user_id FROM public.profiles 
    WHERE company = (SELECT company FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- RLS Policies for session_usage
CREATE POLICY "Users can view their own usage" 
ON public.session_usage FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own usage records" 
ON public.session_usage FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage" 
ON public.session_usage FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR can view company user usage" 
ON public.session_usage FOR SELECT 
USING (
  public.has_role(auth.uid(), 'hr') AND 
  user_id IN (
    SELECT user_id FROM public.profiles 
    WHERE company = (SELECT company FROM public.profiles WHERE user_id = auth.uid())
  )
);