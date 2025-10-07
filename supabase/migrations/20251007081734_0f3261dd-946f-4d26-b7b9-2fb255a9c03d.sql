-- Create chat sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  pillar TEXT CHECK (pillar IN ('psychological', 'physical', 'financial', 'legal')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'phone_escalated', 'abandoned')),
  satisfaction_rating TEXT CHECK (satisfaction_rating IN ('satisfied', 'unsatisfied', NULL)),
  ai_resolution BOOLEAN DEFAULT false,
  phone_escalation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  pillar TEXT CHECK (pillar IN ('psychological', 'physical', 'financial', 'legal')),
  action_type TEXT NOT NULL CHECK (action_type IN ('session_completed', 'chat_interaction', 'resource_viewed', 'milestone_achieved')),
  action_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create specialist call logs table
CREATE TABLE specialist_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id UUID REFERENCES chat_sessions(id),
  user_id UUID REFERENCES profiles(id),
  specialist_id UUID REFERENCES profiles(id),
  call_status TEXT DEFAULT 'pending' CHECK (call_status IN ('pending', 'completed', 'missed', 'scheduled')),
  call_notes TEXT,
  session_booked BOOLEAN DEFAULT false,
  booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_call_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages from their sessions"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress entries"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for specialist_call_logs
CREATE POLICY "Users can view their own call logs"
  ON specialist_call_logs FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = specialist_id);

CREATE POLICY "Specialists can create call logs"
  ON specialist_call_logs FOR INSERT
  WITH CHECK (auth.uid() = specialist_id);

CREATE POLICY "Specialists can update their call logs"
  ON specialist_call_logs FOR UPDATE
  USING (auth.uid() = specialist_id);

-- Create indexes for performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_specialist_call_logs_specialist_id ON specialist_call_logs(specialist_id);