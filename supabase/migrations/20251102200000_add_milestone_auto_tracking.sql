-- ============================================
-- Migration: Add Automatic Milestone Tracking
-- Purpose: Automatically mark milestones as complete when users achieve them
-- Date: 2025-11-02
-- ============================================

-- Function to check and complete first_session milestone
CREATE OR REPLACE FUNCTION check_and_complete_first_session_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_completed_count INTEGER;
BEGIN
  -- Only process if booking is newly completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Check if user has any completed sessions before this one
    SELECT COUNT(*) INTO v_completed_count
    FROM bookings
    WHERE user_id = NEW.user_id 
      AND status = 'completed'
      AND id != NEW.id;
    
    -- If this is the first completed session, mark milestone as complete
    IF v_completed_count = 0 THEN
      UPDATE user_milestones
      SET 
        completed = true,
        completed_at = NOW(),
        metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{booking_id}',
          to_jsonb(NEW.id::text)
        )
      WHERE user_id = NEW.user_id 
        AND milestone_type = 'first_session'
        AND completed = false;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to check and complete ratings milestone (3+ ratings)
CREATE OR REPLACE FUNCTION check_and_complete_ratings_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rating_count INTEGER;
BEGIN
  -- Only process if rating was just added or changed
  IF NEW.rating IS NOT NULL AND (OLD.rating IS NULL OR OLD.rating != NEW.rating) THEN
    
    -- Count total ratings given by user
    SELECT COUNT(*) INTO v_rating_count
    FROM bookings
    WHERE user_id = NEW.user_id 
      AND rating IS NOT NULL;
    
    -- If user has given 3 or more ratings, mark milestone as complete
    IF v_rating_count >= 3 THEN
      UPDATE user_milestones
      SET 
        completed = true,
        completed_at = NOW(),
        metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{total_ratings}',
          to_jsonb(v_rating_count)
        )
      WHERE user_id = NEW.user_id 
        AND milestone_type = 'ratings'
        AND completed = false;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to check and complete specialist milestone
CREATE OR REPLACE FUNCTION check_and_complete_specialist_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_specialist_booking_count INTEGER;
BEGIN
  -- Only process if booking is newly confirmed
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    
    -- Check if user has any confirmed bookings before this one
    SELECT COUNT(*) INTO v_specialist_booking_count
    FROM bookings
    WHERE user_id = NEW.user_id 
      AND status IN ('confirmed', 'completed')
      AND id != NEW.id;
    
    -- If this is the first confirmed booking with a specialist, mark milestone
    IF v_specialist_booking_count = 0 THEN
      UPDATE user_milestones
      SET 
        completed = true,
        completed_at = NOW(),
        metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{booking_id}',
          to_jsonb(NEW.id::text)
        )
      WHERE user_id = NEW.user_id 
        AND milestone_type = 'specialist'
        AND completed = false;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to check and complete goal milestone
CREATE OR REPLACE FUNCTION check_and_complete_goal_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_completed_goals INTEGER;
BEGIN
  -- Only process if goal is newly completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Count total completed goals for user
    SELECT COUNT(*) INTO v_completed_goals
    FROM user_goals
    WHERE user_id = NEW.user_id 
      AND status = 'completed';
    
    -- If user has completed at least 1 goal, mark milestone
    IF v_completed_goals >= 1 THEN
      UPDATE user_milestones
      SET 
        completed = true,
        completed_at = NOW(),
        metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{total_completed_goals}',
          to_jsonb(v_completed_goals)
        )
      WHERE user_id = NEW.user_id 
        AND milestone_type = 'goal'
        AND completed = false;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for bookings table (first_session, ratings, specialist)
DROP TRIGGER IF EXISTS trigger_first_session_milestone ON bookings;
CREATE TRIGGER trigger_first_session_milestone
  AFTER INSERT OR UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_and_complete_first_session_milestone();

DROP TRIGGER IF EXISTS trigger_ratings_milestone ON bookings;
CREATE TRIGGER trigger_ratings_milestone
  AFTER INSERT OR UPDATE OF rating ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_and_complete_ratings_milestone();

DROP TRIGGER IF EXISTS trigger_specialist_milestone ON bookings;
CREATE TRIGGER trigger_specialist_milestone
  AFTER INSERT OR UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_and_complete_specialist_milestone();

-- Create trigger for user_goals table (goal milestone)
DROP TRIGGER IF EXISTS trigger_goal_milestone ON user_goals;
CREATE TRIGGER trigger_goal_milestone
  AFTER INSERT OR UPDATE OF status ON user_goals
  FOR EACH ROW
  EXECUTE FUNCTION check_and_complete_goal_milestone();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_and_complete_first_session_milestone() TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_complete_ratings_milestone() TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_complete_specialist_milestone() TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_complete_goal_milestone() TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION check_and_complete_first_session_milestone IS 'Automatically marks first_session milestone as complete when user completes their first booking';
COMMENT ON FUNCTION check_and_complete_ratings_milestone IS 'Automatically marks ratings milestone as complete when user has given 3+ ratings';
COMMENT ON FUNCTION check_and_complete_specialist_milestone IS 'Automatically marks specialist milestone as complete when user confirms first booking';
COMMENT ON FUNCTION check_and_complete_goal_milestone IS 'Automatically marks goal milestone as complete when user completes their first goal';



