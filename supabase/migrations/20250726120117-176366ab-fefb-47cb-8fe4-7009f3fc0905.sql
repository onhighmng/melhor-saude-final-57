-- Create Booking & Appointment System tables

-- Create pillar_specialties table for categorizing services
CREATE TABLE public.pillar_specialties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pillar_name TEXT NOT NULL, -- e.g., "Mental Health", "Wellness", "Nutrition"
  specialty_name TEXT NOT NULL, -- e.g., "Anxiety", "Depression", "Stress Management"
  description TEXT,
  color_code TEXT, -- for UI theming
  icon_name TEXT, -- for UI icons
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pillar_name, specialty_name)
);

-- Enable RLS on pillar_specialties
ALTER TABLE public.pillar_specialties ENABLE ROW LEVEL SECURITY;

-- Create prestadores table for service providers
CREATE TABLE public.prestadores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  specialties UUID[] DEFAULT '{}', -- array of pillar_specialties ids
  bio TEXT,
  profile_photo_url TEXT,
  video_url TEXT,
  calendly_link TEXT,
  zoom_meeting_id TEXT,
  google_calendar_id TEXT,
  hourly_rate DECIMAL(10,2),
  session_duration INTEGER DEFAULT 60, -- in minutes
  languages TEXT[] DEFAULT '{"Portuguese"}',
  certifications TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on prestadores
ALTER TABLE public.prestadores ENABLE ROW LEVEL SECURITY;

-- Create availability table for prestador availability
CREATE TABLE public.availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prestador_id UUID NOT NULL REFERENCES public.prestadores(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  timezone TEXT NOT NULL DEFAULT 'Europe/Lisbon',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(prestador_id, day_of_week, start_time)
);

-- Enable RLS on availability
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Create bookings table for appointments
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prestador_id UUID NOT NULL REFERENCES public.prestadores(id) ON DELETE CASCADE,
  session_usage_id UUID REFERENCES public.session_usage(id),
  pillar_specialty_id UUID REFERENCES public.pillar_specialties(id),
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60, -- in minutes
  session_type TEXT NOT NULL DEFAULT 'individual', -- individual, group, emergency
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled, no_show, rescheduled
  meeting_link TEXT, -- Zoom, Teams, or other meeting link
  meeting_id TEXT, -- Meeting ID for the session
  notes TEXT, -- User notes or special requests
  prestador_notes TEXT, -- Prestador notes about the session
  cancellation_reason TEXT,
  rescheduled_from UUID REFERENCES public.bookings(id), -- if this is a rescheduled booking
  calendar_event_id TEXT, -- Google Calendar or other calendar event ID
  calendly_event_id TEXT, -- Calendly event ID if booked through Calendly
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create booking_notifications table for tracking notifications
CREATE TABLE public.booking_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- reminder, confirmation, cancellation, reschedule
  recipient_type TEXT NOT NULL, -- user, prestador
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on booking_notifications
ALTER TABLE public.booking_notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_prestador_id ON public.bookings(prestador_id);
CREATE INDEX idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_availability_prestador_id ON public.availability(prestador_id);
CREATE INDEX idx_availability_day_time ON public.availability(day_of_week, start_time);
CREATE INDEX idx_prestadores_specialties ON public.prestadores USING GIN(specialties);
CREATE INDEX idx_booking_notifications_booking_id ON public.booking_notifications(booking_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_pillar_specialties_updated_at
  BEFORE UPDATE ON public.pillar_specialties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prestadores_updated_at
  BEFORE UPDATE ON public.prestadores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_updated_at
  BEFORE UPDATE ON public.availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check availability conflicts
CREATE OR REPLACE FUNCTION public.check_booking_availability(
  p_prestador_id UUID,
  p_booking_date TIMESTAMP WITH TIME ZONE,
  p_duration INTEGER,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_end_time TIMESTAMP WITH TIME ZONE;
  v_day_of_week INTEGER;
  v_start_time TIME;
  v_end_time_only TIME;
  v_conflict_count INTEGER;
BEGIN
  -- Calculate end time
  v_end_time := p_booking_date + (p_duration || ' minutes')::INTERVAL;
  
  -- Get day of week (0=Sunday)
  v_day_of_week := EXTRACT(DOW FROM p_booking_date);
  v_start_time := p_booking_date::TIME;
  v_end_time_only := v_end_time::TIME;
  
  -- Check if prestador is available during this time slot
  IF NOT EXISTS (
    SELECT 1 FROM availability 
    WHERE prestador_id = p_prestador_id 
      AND day_of_week = v_day_of_week
      AND start_time <= v_start_time
      AND end_time >= v_end_time_only
      AND is_available = true
  ) THEN
    RETURN false;
  END IF;
  
  -- Check for booking conflicts
  SELECT COUNT(*) INTO v_conflict_count
  FROM bookings
  WHERE prestador_id = p_prestador_id
    AND status IN ('scheduled', 'confirmed')
    AND (
      (booking_date <= p_booking_date AND booking_date + (duration || ' minutes')::INTERVAL > p_booking_date)
      OR
      (booking_date < v_end_time AND booking_date + (duration || ' minutes')::INTERVAL >= v_end_time)
      OR
      (booking_date >= p_booking_date AND booking_date + (duration || ' minutes')::INTERVAL <= v_end_time)
    )
    AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id);
  
  RETURN v_conflict_count = 0;
END;
$$;

-- Create function to get available time slots
CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_prestador_id UUID,
  p_date DATE,
  p_duration INTEGER DEFAULT 60
)
RETURNS TABLE (
  slot_time TIMESTAMP WITH TIME ZONE,
  is_available BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_day_of_week INTEGER;
  v_availability RECORD;
  v_current_time TIME;
  v_slot_datetime TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get day of week for the requested date
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  -- Loop through availability windows for this day
  FOR v_availability IN 
    SELECT start_time, end_time, timezone
    FROM availability 
    WHERE prestador_id = p_prestador_id 
      AND day_of_week = v_day_of_week 
      AND is_available = true
    ORDER BY start_time
  LOOP
    -- Generate time slots within this availability window
    v_current_time := v_availability.start_time;
    
    WHILE v_current_time + (p_duration || ' minutes')::INTERVAL <= v_availability.end_time LOOP
      v_slot_datetime := (p_date || ' ' || v_current_time)::TIMESTAMP WITH TIME ZONE;
      
      -- Only return future slots
      IF v_slot_datetime > now() THEN
        slot_time := v_slot_datetime;
        is_available := check_booking_availability(p_prestador_id, v_slot_datetime, p_duration);
        RETURN NEXT;
      END IF;
      
      -- Move to next slot (assuming 30-minute intervals)
      v_current_time := v_current_time + '30 minutes'::INTERVAL;
    END LOOP;
  END LOOP;
  
  RETURN;
END;
$$;

-- RLS Policies for pillar_specialties (public read)
CREATE POLICY "Anyone can view active pillar specialties" 
ON public.pillar_specialties FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage pillar specialties" 
ON public.pillar_specialties FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for prestadores
CREATE POLICY "Anyone can view approved prestadores" 
ON public.prestadores FOR SELECT 
USING (is_active = true AND is_approved = true);

CREATE POLICY "Prestadores can view and update their own profile" 
ON public.prestadores FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all prestadores" 
ON public.prestadores FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for availability
CREATE POLICY "Anyone can view availability for approved prestadores" 
ON public.availability FOR SELECT 
USING (
  prestador_id IN (
    SELECT id FROM prestadores WHERE is_active = true AND is_approved = true
  )
);

CREATE POLICY "Prestadores can manage their own availability" 
ON public.availability FOR ALL 
USING (
  prestador_id IN (
    SELECT id FROM prestadores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all availability" 
ON public.availability FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Prestadores can view their bookings" 
ON public.bookings FOR SELECT 
USING (
  prestador_id IN (
    SELECT id FROM prestadores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own bookings" 
ON public.bookings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.bookings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Prestadores can update their bookings" 
ON public.bookings FOR UPDATE 
USING (
  prestador_id IN (
    SELECT id FROM prestadores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all bookings" 
ON public.bookings FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for booking_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.booking_notifications FOR SELECT 
USING (auth.uid() = recipient_id);

CREATE POLICY "System can create notifications" 
ON public.booking_notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications" 
ON public.booking_notifications FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));