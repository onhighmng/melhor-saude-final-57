-- Create admin_actions table for audit logging
CREATE TABLE public.admin_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'user', 'prestador', 'company', 'change_request'
  target_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Create company_organizations table
CREATE TABLE public.company_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL UNIQUE,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  billing_contact TEXT,
  plan_type TEXT NOT NULL DEFAULT 'basic',
  total_employees INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  sessions_allocated INTEGER DEFAULT 0,
  sessions_used INTEGER DEFAULT 0,
  monthly_budget NUMERIC(10,2),
  contract_start_date DATE,
  contract_end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_organizations ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_actions
CREATE POLICY "Admins can view all admin actions"
ON public.admin_actions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "System can create admin actions"
ON public.admin_actions
FOR INSERT
WITH CHECK (true);

-- RLS policies for company_organizations
CREATE POLICY "Admins can manage all company organizations"
ON public.company_organizations
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "HR can view their own company organization"
ON public.company_organizations
FOR SELECT
USING (
  has_role(auth.uid(), 'hr'::user_role) 
  AND company_name = (
    SELECT company FROM profiles WHERE user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_admin_actions_admin_user_id ON public.admin_actions(admin_user_id);
CREATE INDEX idx_admin_actions_target ON public.admin_actions(target_type, target_id);
CREATE INDEX idx_admin_actions_created_at ON public.admin_actions(created_at DESC);
CREATE INDEX idx_company_organizations_company_name ON public.company_organizations(company_name);
CREATE INDEX idx_company_organizations_is_active ON public.company_organizations(is_active);

-- Create trigger for updated_at on company_organizations
CREATE TRIGGER update_company_organizations_updated_at
BEFORE UPDATE ON public.company_organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_admin_user_id UUID,
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_action_id UUID;
BEGIN
  INSERT INTO admin_actions (
    admin_user_id,
    action_type,
    target_type,
    target_id,
    details,
    metadata
  ) VALUES (
    p_admin_user_id,
    p_action_type,
    p_target_type,
    p_target_id,
    p_details,
    p_metadata
  ) RETURNING id INTO v_action_id;
  
  RETURN v_action_id;
END;
$$;

-- Create function to get admin analytics
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS TABLE(
  total_users INTEGER,
  active_users INTEGER,
  total_prestadores INTEGER,
  active_prestadores INTEGER,
  total_companies INTEGER,
  total_bookings INTEGER,
  pending_change_requests INTEGER,
  sessions_allocated INTEGER,
  sessions_used INTEGER
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM profiles WHERE role = 'user')::INTEGER as total_users,
    (SELECT COUNT(*)::INTEGER FROM profiles WHERE role = 'user' AND is_active = true)::INTEGER as active_users,
    (SELECT COUNT(*)::INTEGER FROM prestadores)::INTEGER as total_prestadores,
    (SELECT COUNT(*)::INTEGER FROM prestadores WHERE is_active = true AND is_approved = true)::INTEGER as active_prestadores,
    (SELECT COUNT(DISTINCT company)::INTEGER FROM profiles WHERE company IS NOT NULL)::INTEGER as total_companies,
    (SELECT COUNT(*)::INTEGER FROM bookings)::INTEGER as total_bookings,
    (SELECT COUNT(*)::INTEGER FROM change_requests WHERE status = 'pending')::INTEGER as pending_change_requests,
    (SELECT COALESCE(SUM(sessions_allocated), 0)::INTEGER FROM session_allocations WHERE is_active = true)::INTEGER as sessions_allocated,
    (SELECT COALESCE(SUM(sessions_used), 0)::INTEGER FROM session_allocations WHERE is_active = true)::INTEGER as sessions_used;
$$;