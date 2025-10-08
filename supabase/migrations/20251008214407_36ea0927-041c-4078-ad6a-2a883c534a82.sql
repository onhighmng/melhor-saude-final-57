-- SYSTEMATIC FIX: Allow demo chat sessions

-- 1. Make user_id foreign key optional (allow NULL for demo sessions)
ALTER TABLE chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_user_id_fkey;

ALTER TABLE chat_sessions 
ADD CONSTRAINT chat_sessions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) 
ON DELETE CASCADE
NOT VALID;  -- Allow existing NULL values

-- 2. Fix RLS policies to properly handle demo sessions
DROP POLICY IF EXISTS "Users can create chat sessions (auth or demo)" ON chat_sessions;

CREATE POLICY "Users can create chat sessions (auth or demo)"
ON chat_sessions
FOR INSERT
WITH CHECK (
  -- Authenticated users must match user_id
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  -- Demo users (no auth) can create sessions with any user_id or NULL
  (auth.uid() IS NULL)
);

DROP POLICY IF EXISTS "Users can view chat sessions (auth or demo)" ON chat_sessions;

CREATE POLICY "Users can view chat sessions (auth or demo)"
ON chat_sessions
FOR SELECT
USING (
  -- Authenticated users see their own sessions
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  -- Demo users see all sessions (for demo purposes)
  (auth.uid() IS NULL)
);

DROP POLICY IF EXISTS "Users can update chat sessions (auth or demo)" ON chat_sessions;

CREATE POLICY "Users can update chat sessions (auth or demo)"
ON chat_sessions
FOR UPDATE
USING (
  -- Authenticated users update their own
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  -- Demo users can update any
  (auth.uid() IS NULL)
);