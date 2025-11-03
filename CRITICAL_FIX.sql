-- ============================================
-- CRITICAL FIXES FOR USER: 72ec7142-9478-4b82-8c3a-66f4cdff461e
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Fix the initialize_user_milestones function to include booking_confirmed
CREATE OR REPLACE FUNCTION initialize_user_milestones(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_milestones (user_id, milestone_type, label, points)
  VALUES
    (p_user_id, 'onboarding', 'Concluiu o onboarding', 10),
    (p_user_id, 'booking_confirmed', 'Agendou primeira sessão', 20),
    (p_user_id, 'specialist', 'Falou com um especialista', 20),
    (p_user_id, 'first_session', 'Fez a primeira sessão', 25),
    (p_user_id, 'resources', 'Usou recursos da plataforma', 15),
    (p_user_id, 'ratings', 'Avaliou 3 sessões efetuadas', 20),
    (p_user_id, 'goal', 'Atingiu 1 objetivo pessoal', 10)
  ON CONFLICT (user_id, milestone_type) DO NOTHING;
END;
$$;

-- 2. Add missing booking_confirmed milestone for your user
INSERT INTO user_milestones (user_id, milestone_type, label, points)
VALUES ('72ec7142-9478-4b82-8c3a-66f4cdff461e', 'booking_confirmed', 'Agendou primeira sessão', 20)
ON CONFLICT (user_id, milestone_type) DO NOTHING;

-- 3. Mark completed milestones (you've done these actions)
UPDATE user_milestones
SET 
  completed = TRUE,
  completed_at = NOW()
WHERE user_id = '72ec7142-9478-4b82-8c3a-66f4cdff461e' 
  AND milestone_type IN ('onboarding', 'booking_confirmed')
  AND completed = false;

-- 4. Fix bookings with NULL dates
UPDATE bookings
SET date = CURRENT_DATE
WHERE user_id = '72ec7142-9478-4b82-8c3a-66f4cdff461e'
  AND date IS NULL;

-- 5. Verify everything
SELECT 'Milestones:' AS info;
SELECT milestone_type, label, points, completed, completed_at
FROM user_milestones 
WHERE user_id = '72ec7142-9478-4b82-8c3a-66f4cdff461e'
ORDER BY points DESC;

SELECT 'Progress:' AS info;
SELECT 
  COUNT(*) AS total_milestones,
  SUM(points) AS total_points,
  SUM(CASE WHEN completed THEN points ELSE 0 END) AS earned_points,
  ROUND(100.0 * SUM(CASE WHEN completed THEN points ELSE 0 END) / SUM(points), 2) AS progress_percentage
FROM user_milestones
WHERE user_id = '72ec7142-9478-4b82-8c3a-66f4cdff461e';

SELECT 'Bookings:' AS info;
SELECT id, date, start_time, status, pillar
FROM bookings
WHERE user_id = '72ec7142-9478-4b82-8c3a-66f4cdff461e'
ORDER BY date DESC, start_time;


