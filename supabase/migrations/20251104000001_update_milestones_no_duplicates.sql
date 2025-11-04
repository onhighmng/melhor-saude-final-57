-- Update user milestones to remove duplicates and use only 5 meaningful milestones
-- that add up to 100 points

-- Drop and recreate the initialize_user_milestones function with new milestones
CREATE OR REPLACE FUNCTION initialize_user_milestones(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete any existing milestones for this user to ensure clean state
  DELETE FROM user_milestones WHERE user_id = p_user_id;
  
  -- Insert only 5 non-duplicate milestones that add up to 100 points
  INSERT INTO user_milestones (user_id, milestone_type, label, points)
  VALUES
    (p_user_id, 'onboarding', 'Concluiu o onboarding', 20),
    (p_user_id, 'booking_confirmed', 'Agendou a primeira sessão', 20),
    (p_user_id, 'first_session', 'Completou a primeira sessão', 20),
    (p_user_id, 'complete_profile', 'Completou o perfil', 20),
    (p_user_id, 'fifth_session', 'Completou 5 sessões', 20)
  ON CONFLICT (user_id, milestone_type) DO NOTHING;
END;
$$;

-- Update the milestone_type check constraint to include new types
ALTER TABLE user_milestones DROP CONSTRAINT IF EXISTS user_milestones_milestone_type_check;

ALTER TABLE user_milestones ADD CONSTRAINT user_milestones_milestone_type_check
CHECK (milestone_type IN (
  'onboarding', 
  'booking_confirmed', 
  'first_session', 
  'complete_profile', 
  'fifth_session'
));

-- Update existing users' milestones to the new structure
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT DISTINCT user_id FROM user_milestones
  LOOP
    -- Re-initialize milestones for each existing user
    PERFORM initialize_user_milestones(user_record.user_id);
  END LOOP;
END $$;

COMMENT ON FUNCTION initialize_user_milestones(UUID) IS 
'Initializes 5 non-duplicate user milestones totaling 100 points:
1. Onboarding completed (20pts)
2. First booking scheduled (20pts)
3. First session completed (20pts)
4. Profile completed (20pts)
5. Five sessions completed (20pts)';

