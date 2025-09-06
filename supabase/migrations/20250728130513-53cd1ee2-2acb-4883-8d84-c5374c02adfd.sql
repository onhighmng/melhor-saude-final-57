-- Create calendly integrations table
CREATE TABLE public.calendly_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prestador_id UUID NOT NULL,
  calendly_user_uri TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  webhook_url TEXT,
  webhook_signing_key TEXT,
  organization_uri TEXT,
  user_email TEXT,
  user_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calendly events table for tracking synced events
CREATE TABLE public.calendly_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prestador_id UUID NOT NULL,
  calendly_event_uri TEXT NOT NULL UNIQUE,
  calendly_event_id TEXT NOT NULL,
  event_type_uri TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  meeting_link TEXT,
  attendee_email TEXT,
  attendee_name TEXT,
  booking_id UUID,
  sync_status TEXT NOT NULL DEFAULT 'synced',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendly_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendly_events ENABLE ROW LEVEL SECURITY;

-- Create policies for calendly_integrations
CREATE POLICY "Prestadores can manage their own Calendly integration"
ON public.calendly_integrations
FOR ALL
USING (prestador_id IN (
  SELECT prestadores.id FROM prestadores WHERE prestadores.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all Calendly integrations"
ON public.calendly_integrations
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create policies for calendly_events  
CREATE POLICY "Prestadores can view their own Calendly events"
ON public.calendly_events
FOR SELECT
USING (prestador_id IN (
  SELECT prestadores.id FROM prestadores WHERE prestadores.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all Calendly events"
ON public.calendly_events
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "System can manage Calendly events"
ON public.calendly_events
FOR ALL
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_calendly_integrations_updated_at
BEFORE UPDATE ON public.calendly_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendly_events_updated_at
BEFORE UPDATE ON public.calendly_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();