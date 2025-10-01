-- Create change_requests table for prestador change requests
CREATE TABLE public.change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prestador_id UUID NOT NULL,
  prestador_name TEXT NOT NULL,
  field TEXT NOT NULL,
  field_label TEXT NOT NULL,
  current_value TEXT NOT NULL,
  requested_value TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable RLS on change_requests
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes for change_requests
CREATE INDEX idx_change_requests_prestador_id ON public.change_requests(prestador_id);
CREATE INDEX idx_change_requests_status ON public.change_requests(status);
CREATE INDEX idx_change_requests_created_at ON public.change_requests(created_at DESC);

-- RLS policies for change_requests
CREATE POLICY "Admins can manage all change requests"
ON public.change_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Prestadores can view their own change requests"
ON public.change_requests
FOR SELECT
USING (
  prestador_id IN (
    SELECT id FROM prestadores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can create change requests"
ON public.change_requests
FOR INSERT
WITH CHECK (true);