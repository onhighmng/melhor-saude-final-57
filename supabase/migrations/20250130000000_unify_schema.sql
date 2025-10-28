-- =====================================================
-- UNIFIED SCHEMA MIGRATION
-- This migration standardizes pillar naming and role systems
-- =====================================================

-- 1. STANDARDIZE PILLAR NAMING
-- Update all pillar references to use consistent Portuguese naming

-- Update chat_sessions pillar values
UPDATE chat_sessions 
SET pillar = CASE 
  WHEN pillar = 'psychological' THEN 'saude_mental'
  WHEN pillar = 'physical' THEN 'bem_estar_fisico'
  WHEN pillar = 'financial' THEN 'assistencia_financeira'
  WHEN pillar = 'legal' THEN 'assistencia_juridica'
  ELSE pillar
END
WHERE pillar IN ('psychological', 'physical', 'financial', 'legal');

-- Update user_progress pillar values
UPDATE user_progress 
SET pillar = CASE 
  WHEN pillar = 'psychological' THEN 'saude_mental'
  WHEN pillar = 'physical' THEN 'bem_estar_fisico'
  WHEN pillar = 'financial' THEN 'assistencia_financeira'
  WHEN pillar = 'legal' THEN 'assistencia_juridica'
  ELSE pillar
END
WHERE pillar IN ('psychological', 'physical', 'financial', 'legal');

-- Update resources pillar values
UPDATE resources 
SET pillar = CASE 
  WHEN pillar = 'mental_health' THEN 'saude_mental'
  WHEN pillar = 'physical_wellness' THEN 'bem_estar_fisico'
  WHEN pillar = 'financial_assistance' THEN 'assistencia_financeira'
  WHEN pillar = 'legal_assistance' THEN 'assistencia_juridica'
  ELSE pillar
END
WHERE pillar IN ('mental_health', 'physical_wellness', 'financial_assistance', 'legal_assistance');

-- Update companies pillars array
UPDATE companies 
SET pillars = ARRAY[
  CASE WHEN 'mental' = ANY(pillars) THEN 'saude_mental' ELSE NULL END,
  CASE WHEN 'physical' = ANY(pillars) THEN 'bem_estar_fisico' ELSE NULL END,
  CASE WHEN 'financial' = ANY(pillars) THEN 'assistencia_financeira' ELSE NULL END,
  CASE WHEN 'legal' = ANY(pillars) THEN 'assistencia_juridica' ELSE NULL END
]::TEXT[]
WHERE pillars IS NOT NULL;

-- 2. CREATE PILLAR MAPPING VIEWS FOR BACKWARD COMPATIBILITY
CREATE OR REPLACE VIEW pillar_mapping AS
SELECT 
  'saude_mental' as portuguese,
  'psychological' as english_old,
  'mental_health' as english_new,
  'Saúde Mental' as display_name
UNION ALL
SELECT 
  'bem_estar_fisico' as portuguese,
  'physical' as english_old,
  'physical_wellness' as english_new,
  'Bem-estar Físico' as display_name
UNION ALL
SELECT 
  'assistencia_financeira' as portuguese,
  'financial' as english_old,
  'financial_assistance' as english_new,
  'Assistência Financeira' as display_name
UNION ALL
SELECT 
  'assistencia_juridica' as portuguese,
  'legal' as english_old,
  'legal_assistance' as english_new,
  'Assistência Jurídica' as display_name;

-- 3. UPDATE CHECK CONSTRAINTS TO USE STANDARDIZED PILLAR NAMES

-- Update chat_sessions constraint
ALTER TABLE chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_pillar_check;
ALTER TABLE chat_sessions ADD CONSTRAINT chat_sessions_pillar_check 
  CHECK (pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica'));

-- Update user_progress constraint
ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_pillar_check;
ALTER TABLE user_progress ADD CONSTRAINT user_progress_pillar_check 
  CHECK (pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica'));

-- Update resources constraint
ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_pillar_check;
ALTER TABLE resources ADD CONSTRAINT resources_pillar_check 
  CHECK (pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica'));

-- Update companies pillars constraint
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_pillars_check;
ALTER TABLE companies ADD CONSTRAINT companies_pillars_check 
  CHECK (pillars <@ ARRAY['saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica']::TEXT[]);

-- 4. CREATE USER_GOALS TABLE FOR ONBOARDING DATA PERSISTENCE
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  target_value JSONB,
  current_value JSONB DEFAULT '{}'::jsonb,
  pillar TEXT CHECK (pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, goal_type, pillar)
);

-- Create indexes for user_goals
CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX idx_user_goals_pillar ON user_goals(pillar);
CREATE INDEX idx_user_goals_status ON user_goals(status);

-- 5. CREATE PROVIDER_AVAILABILITY TABLE FOR BOOKING SYSTEM
CREATE TABLE IF NOT EXISTS provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID REFERENCES prestadores(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prestador_id, day_of_week, start_time),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create indexes for provider_availability
CREATE INDEX idx_provider_availability_prestador ON provider_availability(prestador_id);
CREATE INDEX idx_provider_availability_day ON provider_availability(day_of_week);
CREATE INDEX idx_provider_availability_available ON provider_availability(is_available);

-- 6. ADD MISSING FOREIGN KEY CONSTRAINTS
-- Add foreign key constraints that were missing

-- Ensure bookings.chat_session_id references chat_sessions
ALTER TABLE bookings ADD CONSTRAINT bookings_chat_session_id_fkey 
  FOREIGN KEY (chat_session_id) REFERENCES chat_sessions(id) ON DELETE SET NULL;

-- Ensure specialist_call_logs references are correct
ALTER TABLE specialist_call_logs ADD CONSTRAINT specialist_call_logs_booking_id_fkey 
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

-- 7. CREATE HELPER FUNCTIONS FOR PILLAR MANAGEMENT

-- Function to get pillar display name
CREATE OR REPLACE FUNCTION get_pillar_display_name(pillar_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE pillar_name
    WHEN 'saude_mental' THEN 'Saúde Mental'
    WHEN 'bem_estar_fisico' THEN 'Bem-estar Físico'
    WHEN 'assistencia_financeira' THEN 'Assistência Financeira'
    WHEN 'assistencia_juridica' THEN 'Assistência Jurídica'
    ELSE pillar_name
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate pillar name
CREATE OR REPLACE FUNCTION is_valid_pillar(pillar_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN pillar_name IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. CREATE TRIGGERS FOR UPDATED_AT COLUMNS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for tables that need updated_at
CREATE TRIGGER update_user_goals_updated_at 
  BEFORE UPDATE ON user_goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_availability_updated_at 
  BEFORE UPDATE ON provider_availability 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. ENABLE ROW LEVEL SECURITY ON NEW TABLES
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_goals
CREATE POLICY "Users can view their own goals"
  ON user_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
  ON user_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON user_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON user_goals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for provider_availability
CREATE POLICY "Providers can manage their own availability"
  ON provider_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM prestadores 
      WHERE prestadores.id = provider_availability.prestador_id 
      AND prestadores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view provider availability"
  ON provider_availability FOR SELECT
  USING (is_available = true);

-- 10. CREATE PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_chat_sessions_pillar ON chat_sessions(pillar);
CREATE INDEX IF NOT EXISTS idx_user_progress_pillar ON user_progress(pillar);
CREATE INDEX IF NOT EXISTS idx_resources_pillar_updated ON resources(pillar, updated_at);
CREATE INDEX IF NOT EXISTS idx_bookings_pillar_status ON bookings(pillar, status);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_pillar ON user_goals(user_id, pillar);

-- 11. CREATE AUDIT LOGGING FOR SCHEMA CHANGES
INSERT INTO admin_logs (admin_id, action, entity_type, details, created_at)
VALUES (
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  'schema_unification',
  'database',
  '{"pillars_standardized": true, "user_goals_created": true, "provider_availability_created": true}'::jsonb,
  now()
);

-- 12. VERIFY DATA INTEGRITY
DO $$
DECLARE
  invalid_pillars INTEGER;
BEGIN
  -- Check for any remaining invalid pillar values
  SELECT COUNT(*) INTO invalid_pillars
  FROM (
    SELECT pillar FROM chat_sessions WHERE pillar NOT IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')
    UNION ALL
    SELECT pillar FROM user_progress WHERE pillar NOT IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')
    UNION ALL
    SELECT pillar FROM resources WHERE pillar NOT IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')
  ) AS invalid;
  
  IF invalid_pillars > 0 THEN
    RAISE EXCEPTION 'Found % invalid pillar values after migration', invalid_pillars;
  END IF;
  
  RAISE NOTICE 'Schema unification completed successfully. All pillar values standardized.';
END $$;
