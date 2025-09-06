-- Tighten RLS on calendly_events to prevent exposure of attendee PII
-- 1) Remove overly permissive system policy
DROP POLICY IF EXISTS "System can manage Calendly events" ON public.calendly_events;

-- 2) Allow only service role to manage records programmatically (edge functions)
CREATE POLICY "Service role can manage Calendly events"
ON public.calendly_events
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Existing policies kept in place (no change):
-- "Admins can manage all Calendly events" (ALL USING has_role(auth.uid(),'admin'))
-- "Prestadores can view their own Calendly events" (SELECT USING owner check)

-- Optional: ensure no other broad policies exist (noop if already absent)
-- Note: We intentionally do NOT grant SELECT to generic authenticated users.
