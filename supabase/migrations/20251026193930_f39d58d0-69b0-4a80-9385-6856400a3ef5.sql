CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_id TEXT NOT NULL,
  milestone_label TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, milestone_id)
);

ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_milestones" ON user_milestones
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_user_milestones_user_id ON user_milestones(user_id);
CREATE INDEX idx_user_milestones_completed ON user_milestones(completed);