-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active companies"
  ON public.companies FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all companies"
  ON public.companies FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR can view their own company"
  ON public.companies FOR SELECT
  USING (
    public.has_role(auth.uid(), 'hr') 
    AND id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "HR can update their own company"
  ON public.companies FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'hr') 
    AND id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Enable RLS on company_employees
ALTER TABLE public.company_employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own employee record"
  ON public.company_employees FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "HR can view their company employees"
  ON public.company_employees FOR SELECT
  USING (
    public.has_role(auth.uid(), 'hr') 
    AND company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all employees"
  ON public.company_employees FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage employees"
  ON public.company_employees FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR can manage their company employees"
  ON public.company_employees FOR ALL
  USING (
    public.has_role(auth.uid(), 'hr') 
    AND company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Enable RLS on invites
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view invites by code"
  ON public.invites FOR SELECT
  USING (true);

CREATE POLICY "HR can create invites for their company"
  ON public.invites FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'hr') 
    AND company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage invites"
  ON public.invites FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR can manage their company invites"
  ON public.invites FOR ALL
  USING (
    public.has_role(auth.uid(), 'hr') 
    AND company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Enable RLS on admin_logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs"
  ON public.admin_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert logs"
  ON public.admin_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on prestador_schedule
ALTER TABLE public.prestador_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active schedules"
  ON public.prestador_schedule FOR SELECT
  USING (is_available = true);

CREATE POLICY "Providers can manage their own schedule"
  ON public.prestador_schedule FOR ALL
  USING (
    prestador_id IN (SELECT id FROM public.prestadores WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all schedules"
  ON public.prestador_schedule FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on session_notes
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage their own notes"
  ON public.session_notes FOR ALL
  USING (
    prestador_id IN (SELECT id FROM public.prestadores WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all notes"
  ON public.session_notes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on resources
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active resources"
  ON public.resources FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all resources"
  ON public.resources FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on change_requests
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view their own requests"
  ON public.change_requests FOR SELECT
  USING (
    prestador_id IN (SELECT id FROM public.prestadores WHERE user_id = auth.uid())
  );

CREATE POLICY "Providers can create requests"
  ON public.change_requests FOR INSERT
  WITH CHECK (
    prestador_id IN (SELECT id FROM public.prestadores WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all requests"
  ON public.change_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));