-- Fix chat_sessions RLS policy to allow demo users (NULL user_id when no auth)
DROP POLICY IF EXISTS "Users can create chat sessions (auth or demo)" ON chat_sessions;

CREATE POLICY "Users can create chat sessions (auth or demo)"
ON chat_sessions
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) OR 
  (auth.uid() IS NULL)  -- Allow demo sessions with NULL user_id
);

-- Also update SELECT policy
DROP POLICY IF EXISTS "Users can view chat sessions (auth or demo)" ON chat_sessions;

CREATE POLICY "Users can view chat sessions (auth or demo)"
ON chat_sessions
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (auth.uid() IS NULL)  -- Allow demo users to view their sessions
);

-- Update UPDATE policy
DROP POLICY IF EXISTS "Users can update chat sessions (auth or demo)" ON chat_sessions;

CREATE POLICY "Users can update chat sessions (auth or demo)"
ON chat_sessions
FOR UPDATE
USING (
  (auth.uid() = user_id) OR 
  (auth.uid() IS NULL)  -- Allow demo users to update sessions
);