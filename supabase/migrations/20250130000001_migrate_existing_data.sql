-- =====================================================
-- DATA MIGRATION SCRIPT
-- This script migrates existing production data to the unified schema
-- =====================================================

-- 1. MIGRATE PROFILES.ROLE DATA TO USER_ROLES TABLE
-- This ensures we preserve all existing role assignments

INSERT INTO user_roles (user_id, role, created_at)
SELECT 
  id as user_id,
  CASE 
    WHEN role = 'especialista_geral' THEN 'specialist'::app_role
    ELSE role::app_role
  END as role,
  created_at
FROM profiles 
WHERE id NOT IN (
  SELECT user_id FROM user_roles
)
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. MIGRATE ONBOARDING DATA TO USER_GOALS TABLE
-- Convert onboarding_data to structured goals

INSERT INTO user_goals (user_id, goal_type, target_value, pillar, status, created_at)
SELECT 
  user_id,
  'wellbeing_score' as goal_type,
  jsonb_build_object('target_score', wellbeing_score, 'current_score', wellbeing_score) as target_value,
  NULL as pillar,
  'completed' as status,
  completed_at as created_at
FROM onboarding_data 
WHERE wellbeing_score IS NOT NULL
ON CONFLICT (user_id, goal_type, pillar) DO NOTHING;

-- Migrate difficulty areas as goals
INSERT INTO user_goals (user_id, goal_type, target_value, pillar, status, created_at)
SELECT 
  user_id,
  'difficulty_area' as goal_type,
  jsonb_build_object('area', unnest(difficulty_areas), 'target_status', 'improved') as target_value,
  CASE 
    WHEN unnest(difficulty_areas) IN ('stress', 'ansiedade', 'depressao', 'relacionamentos') THEN 'saude_mental'
    WHEN unnest(difficulty_areas) IN ('energia', 'sono', 'exercicio', 'alimentacao') THEN 'bem_estar_fisico'
    WHEN unnest(difficulty_areas) IN ('dinheiro', 'poupancas', 'dividas', 'investimentos') THEN 'assistencia_financeira'
    WHEN unnest(difficulty_areas) IN ('contratos', 'direitos', 'trabalho', 'familia') THEN 'assistencia_juridica'
    ELSE NULL
  END as pillar,
  'active' as status,
  completed_at as created_at
FROM onboarding_data 
WHERE difficulty_areas IS NOT NULL AND array_length(difficulty_areas, 1) > 0
ON CONFLICT (user_id, goal_type, pillar) DO NOTHING;

-- Migrate main goals
INSERT INTO user_goals (user_id, goal_type, target_value, pillar, status, created_at)
SELECT 
  user_id,
  'main_goal' as goal_type,
  jsonb_build_object('goal', unnest(main_goals), 'target_status', 'achieved') as target_value,
  CASE 
    WHEN unnest(main_goals) IN ('autoconfianca', 'relacionamentos', 'stress') THEN 'saude_mental'
    WHEN unnest(main_goals) IN ('energia', 'exercicio', 'saude') THEN 'bem_estar_fisico'
    WHEN unnest(main_goals) IN ('poupar', 'dinheiro', 'investir') THEN 'assistencia_financeira'
    WHEN unnest(main_goals) IN ('juridico', 'direitos', 'contratos') THEN 'assistencia_juridica'
    ELSE NULL
  END as pillar,
  'active' as status,
  completed_at as created_at
FROM onboarding_data 
WHERE main_goals IS NOT NULL AND array_length(main_goals, 1) > 0
ON CONFLICT (user_id, goal_type, pillar) DO NOTHING;

-- 3. CREATE PROVIDER AVAILABILITY FROM EXISTING SCHEDULES
-- Migrate prestador_schedule data to provider_availability

INSERT INTO provider_availability (prestador_id, day_of_week, start_time, end_time, is_available, created_at)
SELECT 
  prestador_id,
  day_of_week,
  start_time,
  end_time,
  is_available,
  created_at
FROM prestador_schedule
WHERE NOT EXISTS (
  SELECT 1 FROM provider_availability pa 
  WHERE pa.prestador_id = prestador_schedule.prestador_id 
  AND pa.day_of_week = prestador_schedule.day_of_week
  AND pa.start_time = prestador_schedule.start_time
);

-- 4. UPDATE COMPANY PILLARS TO USE STANDARDIZED NAMES
-- Ensure all companies have the correct pillar names

UPDATE companies 
SET pillars = ARRAY[
  CASE WHEN 'mental' = ANY(pillars) THEN 'saude_mental' ELSE NULL END,
  CASE WHEN 'physical' = ANY(pillars) THEN 'bem_estar_fisico' ELSE NULL END,
  CASE WHEN 'financial' = ANY(pillars) THEN 'assistencia_financeira' ELSE NULL END,
  CASE WHEN 'legal' = ANY(pillars) THEN 'assistencia_juridica' ELSE NULL END
]::TEXT[]
WHERE pillars IS NOT NULL 
AND ('mental' = ANY(pillars) OR 'physical' = ANY(pillars) OR 'financial' = ANY(pillars) OR 'legal' = ANY(pillars));

-- Remove NULL values from arrays
UPDATE companies 
SET pillars = array_remove(pillars, NULL)
WHERE pillars IS NOT NULL;

-- 5. CREATE MISSING COMPANY-EMPLOYEE RELATIONSHIPS
-- Ensure all users with company_id have corresponding company_employees records

INSERT INTO company_employees (company_id, user_id, sessions_allocated, sessions_used, is_active, joined_at)
SELECT 
  company_id,
  id as user_id,
  COALESCE((metadata->>'sessions_allocated')::INTEGER, 6) as sessions_allocated,
  COALESCE((metadata->>'sessions_used')::INTEGER, 0) as sessions_used,
  is_active,
  created_at as joined_at
FROM profiles 
WHERE company_id IS NOT NULL 
AND id NOT IN (SELECT user_id FROM company_employees)
ON CONFLICT (company_id, user_id) DO NOTHING;

-- 6. MIGRATE CHAT SESSION PILLAR DATA
-- Update any remaining non-standard pillar values

UPDATE chat_sessions 
SET pillar = CASE 
  WHEN pillar = 'psychological' THEN 'saude_mental'
  WHEN pillar = 'physical' THEN 'bem_estar_fisico'
  WHEN pillar = 'financial' THEN 'assistencia_financeira'
  WHEN pillar = 'legal' THEN 'assistencia_juridica'
  WHEN pillar = 'mental_health' THEN 'saude_mental'
  WHEN pillar = 'physical_wellness' THEN 'bem_estar_fisico'
  WHEN pillar = 'financial_assistance' THEN 'assistencia_financeira'
  WHEN pillar = 'legal_assistance' THEN 'assistencia_juridica'
  ELSE pillar
END
WHERE pillar NOT IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica');

-- 7. MIGRATE USER PROGRESS PILLAR DATA
UPDATE user_progress 
SET pillar = CASE 
  WHEN pillar = 'psychological' THEN 'saude_mental'
  WHEN pillar = 'physical' THEN 'bem_estar_fisico'
  WHEN pillar = 'financial' THEN 'assistencia_financeira'
  WHEN pillar = 'legal' THEN 'assistencia_juridica'
  WHEN pillar = 'mental_health' THEN 'saude_mental'
  WHEN pillar = 'physical_wellness' THEN 'bem_estar_fisico'
  WHEN pillar = 'financial_assistance' THEN 'assistencia_financeira'
  WHEN pillar = 'legal_assistance' THEN 'assistencia_juridica'
  ELSE pillar
END
WHERE pillar NOT IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica');

-- 8. MIGRATE RESOURCES PILLAR DATA
UPDATE resources 
SET pillar = CASE 
  WHEN pillar = 'psychological' THEN 'saude_mental'
  WHEN pillar = 'physical' THEN 'bem_estar_fisico'
  WHEN pillar = 'financial' THEN 'assistencia_financeira'
  WHEN pillar = 'legal' THEN 'assistencia_juridica'
  WHEN pillar = 'mental_health' THEN 'saude_mental'
  WHEN pillar = 'physical_wellness' THEN 'bem_estar_fisico'
  WHEN pillar = 'financial_assistance' THEN 'assistencia_financeira'
  WHEN pillar = 'legal_assistance' THEN 'assistencia_juridica'
  ELSE pillar
END
WHERE pillar NOT IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica');

-- 9. CREATE AUDIT RECORDS FOR MIGRATION
INSERT INTO admin_logs (admin_id, action, entity_type, details, created_at)
VALUES (
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  'data_migration',
  'database',
  jsonb_build_object(
    'roles_migrated', (SELECT COUNT(*) FROM user_roles),
    'goals_created', (SELECT COUNT(*) FROM user_goals),
    'availability_migrated', (SELECT COUNT(*) FROM provider_availability),
    'pillars_standardized', true
  ),
  now()
);

-- 10. VERIFY MIGRATION SUCCESS
DO $$
DECLARE
  role_count INTEGER;
  goal_count INTEGER;
  availability_count INTEGER;
  invalid_pillars INTEGER;
BEGIN
  -- Count migrated records
  SELECT COUNT(*) INTO role_count FROM user_roles;
  SELECT COUNT(*) INTO goal_count FROM user_goals;
  SELECT COUNT(*) INTO availability_count FROM provider_availability;
  
  -- Check for any remaining invalid pillar values
  SELECT COUNT(*) INTO invalid_pillars
  FROM (
    SELECT pillar FROM chat_sessions WHERE pillar NOT IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')
    UNION ALL
    SELECT pillar FROM user_progress WHERE pillar NOT IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')
    UNION ALL
    SELECT pillar FROM resources WHERE pillar NOT IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')
  ) AS invalid;
  
  -- Report migration results
  RAISE NOTICE 'Data migration completed successfully:';
  RAISE NOTICE '- User roles migrated: %', role_count;
  RAISE NOTICE '- User goals created: %', goal_count;
  RAISE NOTICE '- Provider availability records: %', availability_count;
  RAISE NOTICE '- Invalid pillar values remaining: %', invalid_pillars;
  
  IF invalid_pillars > 0 THEN
    RAISE WARNING 'Found % invalid pillar values that need manual review', invalid_pillars;
  END IF;
  
END $$;

-- 11. CREATE BACKUP VIEWS FOR ROLLBACK (if needed)
CREATE OR REPLACE VIEW migration_backup_profiles AS
SELECT 
  id,
  email,
  name,
  role,
  company_id,
  created_at,
  'MIGRATED_TO_USER_ROLES' as migration_note
FROM profiles 
WHERE id IN (SELECT user_id FROM user_roles);

CREATE OR REPLACE VIEW migration_backup_onboarding AS
SELECT 
  user_id,
  wellbeing_score,
  difficulty_areas,
  main_goals,
  improvement_signs,
  frequency,
  completed_at,
  'MIGRATED_TO_USER_GOALS' as migration_note
FROM onboarding_data 
WHERE user_id IN (SELECT user_id FROM user_goals);

-- 12. FINAL VERIFICATION QUERIES
-- These can be run to verify the migration was successful

-- Check role distribution
SELECT 
  role,
  COUNT(*) as count
FROM user_roles 
GROUP BY role 
ORDER BY count DESC;

-- Check goal distribution by pillar
SELECT 
  pillar,
  COUNT(*) as goal_count
FROM user_goals 
WHERE pillar IS NOT NULL
GROUP BY pillar 
ORDER BY goal_count DESC;

-- Check pillar standardization
SELECT 
  'chat_sessions' as table_name,
  pillar,
  COUNT(*) as count
FROM chat_sessions 
GROUP BY pillar
UNION ALL
SELECT 
  'user_progress' as table_name,
  pillar,
  COUNT(*) as count
FROM user_progress 
GROUP BY pillar
UNION ALL
SELECT 
  'resources' as table_name,
  pillar,
  COUNT(*) as count
FROM resources 
GROUP BY pillar
ORDER BY table_name, count DESC;
