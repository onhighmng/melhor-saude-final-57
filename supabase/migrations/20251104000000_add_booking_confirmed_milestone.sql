-- Add booking_confirmed milestone to initialize_user_milestones function
-- This milestone was in the CHECK constraint but missing from the initialization

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





