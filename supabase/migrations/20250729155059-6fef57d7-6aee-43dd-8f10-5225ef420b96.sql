-- Create health check-ins table
CREATE TABLE public.health_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mood_rating INTEGER NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 5),
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 5),
  stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 5),
  sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_title TEXT NOT NULL,
  achievement_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  icon_name TEXT,
  is_milestone BOOLEAN NOT NULL DEFAULT false
);

-- Create user activity log table
CREATE TABLE public.user_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  related_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.health_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for health_checkins
CREATE POLICY "Users can manage their own check-ins" 
ON public.health_checkins 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all check-ins" 
ON public.health_checkins 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage all achievements" 
ON public.user_achievements 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create RLS policies for user_activity_log
CREATE POLICY "Users can view their own activity" 
ON public.user_activity_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create activity logs" 
ON public.user_activity_log 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all activity" 
ON public.user_activity_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create triggers for updated_at
CREATE TRIGGER update_health_checkins_updated_at
BEFORE UPDATE ON public.health_checkins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_activity_description TEXT,
  p_related_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO user_activity_log (
    user_id,
    activity_type,
    activity_description,
    related_id,
    metadata
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_activity_description,
    p_related_id,
    p_metadata
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

-- Create function to award achievements
CREATE OR REPLACE FUNCTION public.award_achievement(
  p_user_id UUID,
  p_achievement_type TEXT,
  p_achievement_title TEXT,
  p_achievement_description TEXT DEFAULT NULL,
  p_icon_name TEXT DEFAULT NULL,
  p_is_milestone BOOLEAN DEFAULT false
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_achievement_id UUID;
BEGIN
  -- Check if user already has this achievement type
  IF EXISTS (
    SELECT 1 FROM user_achievements 
    WHERE user_id = p_user_id AND achievement_type = p_achievement_type
  ) THEN
    RETURN NULL;
  END IF;
  
  INSERT INTO user_achievements (
    user_id,
    achievement_type,
    achievement_title,
    achievement_description,
    icon_name,
    is_milestone
  ) VALUES (
    p_user_id,
    p_achievement_type,
    p_achievement_title,
    p_achievement_description,
    p_icon_name,
    p_is_milestone
  ) RETURNING id INTO v_achievement_id;
  
  -- Log the achievement activity
  PERFORM log_user_activity(
    p_user_id,
    'achievement_earned',
    'Earned achievement: ' || p_achievement_title,
    v_achievement_id,
    jsonb_build_object('achievement_type', p_achievement_type)
  );
  
  RETURN v_achievement_id;
END;
$$;