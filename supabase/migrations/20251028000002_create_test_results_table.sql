-- Create test_results table for psychological test submissions
CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL, -- 'depression', 'anxiety', 'stress', etc.
  score INTEGER NOT NULL,
  interpretation TEXT, -- 'low', 'moderate', 'high', 'severe'
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_test_results_user ON test_results(user_id);
CREATE INDEX idx_test_results_type ON test_results(test_type);
CREATE INDEX idx_test_results_submitted ON test_results(submitted_at DESC);

-- RLS Policies
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own test results"
  ON test_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test results"
  ON test_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test results"
  ON test_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can view all test results for analytics"
  ON test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'company_hr')
    )
  );



