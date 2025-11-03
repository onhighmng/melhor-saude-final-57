-- ========================================================================
-- ADD TEST SPECIALISTS - Fix "Não há especialistas disponíveis" Error
-- ========================================================================
-- This script adds 4 test specialists (one per pillar) to your database
-- Run this in your Supabase SQL Editor
-- ========================================================================

-- Create test specialist accounts for all four pillars
INSERT INTO prestadores (
  id,
  name,
  email,
  specialty,
  specialties,
  pillar_specialties,
  is_active,
  biography,
  languages,
  session_duration,
  photo_url
) VALUES
  -- 1. MENTAL HEALTH SPECIALIST (Saúde Mental)
  (
    gen_random_uuid(),
    'Dr. Maria Silva',
    'maria.silva@especialista.com',
    'Psicologia Clínica',
    ARRAY['Psicologia Clínica', 'Terapia Cognitivo-Comportamental', 'Ansiedade', 'Depressão'],
    ARRAY['saude_mental'],
    true,
    'Psicóloga clínica com 10 anos de experiência em terapia cognitivo-comportamental e tratamento de ansiedade e depressão.',
    ARRAY['Português', 'Inglês'],
    60,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
  ),
  
  -- 2. PHYSICAL WELLNESS SPECIALIST (Bem-estar Físico)
  (
    gen_random_uuid(),
    'Dr. João Santos',
    'joao.santos@especialista.com',
    'Educação Física',
    ARRAY['Educação Física', 'Nutrição Desportiva', 'Reabilitação', 'Treino Personalizado'],
    ARRAY['bem_estar_fisico'],
    true,
    'Especialista em educação física e bem-estar com foco em treino personalizado e reabilitação física.',
    ARRAY['Português', 'Espanhol'],
    60,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao'
  ),
  
  -- 3. LEGAL SPECIALIST (Assistência Jurídica)
  (
    gen_random_uuid(),
    'Dra. Ana Costa',
    'ana.costa@especialista.com',
    'Direito Laboral',
    ARRAY['Direito Laboral', 'Direito Civil', 'Direito da Família', 'Contratos'],
    ARRAY['assistencia_juridica'],
    true,
    'Advogada especializada em direito laboral e civil com mais de 15 anos de experiência.',
    ARRAY['Português', 'Inglês', 'Francês'],
    60,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
  ),
  
  -- 4. FINANCIAL SPECIALIST (Assistência Financeira)
  (
    gen_random_uuid(),
    'Dr. Pedro Oliveira',
    'pedro.oliveira@especialista.com',
    'Consultoria Financeira',
    ARRAY['Consultoria Financeira', 'Planeamento Financeiro', 'Gestão de Dívidas', 'Investimentos'],
    ARRAY['assistencia_financeira'],
    true,
    'Consultor financeiro certificado com experiência em planeamento financeiro pessoal e gestão de dívidas.',
    ARRAY['Português', 'Inglês'],
    60,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro'
  )
ON CONFLICT (id) DO NOTHING;

-- ========================================================================
-- VERIFICATION QUERIES
-- ========================================================================
-- Run these after the INSERT to verify everything worked

-- Check all specialists were created
SELECT 
  name,
  specialty,
  pillar_specialties,
  is_active
FROM prestadores
ORDER BY name;

-- Test Mental Health query
SELECT 
  name, 
  specialties, 
  pillar_specialties
FROM prestadores
WHERE pillar_specialties @> ARRAY['saude_mental']
  AND is_active = true;

-- Test Physical Wellness query
SELECT 
  name, 
  specialties, 
  pillar_specialties
FROM prestadores
WHERE pillar_specialties @> ARRAY['bem_estar_fisico']
  AND is_active = true;

-- Test Legal Assistance query
SELECT 
  name, 
  specialties, 
  pillar_specialties
FROM prestadores
WHERE pillar_specialties @> ARRAY['assistencia_juridica']
  AND is_active = true;

-- Test Financial Assistance query
SELECT 
  name, 
  specialties, 
  pillar_specialties
FROM prestadores
WHERE pillar_specialties @> ARRAY['assistencia_financeira']
  AND is_active = true;

-- ========================================================================
-- EXPECTED RESULTS
-- ========================================================================
-- After running this script, you should see:
-- ✓ Dr. Maria Silva - Mental Health (Saúde Mental)
-- ✓ Dr. João Santos - Physical Wellness (Bem-estar Físico)
-- ✓ Dra. Ana Costa - Legal Assistance (Assistência Jurídica)
-- ✓ Dr. Pedro Oliveira - Financial Assistance (Assistência Financeira)
-- 
-- The error "Não há especialistas disponíveis no momento" should now be fixed!
-- ========================================================================


