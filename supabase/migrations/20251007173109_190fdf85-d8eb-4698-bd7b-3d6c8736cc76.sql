-- Fix RLS policies to support both authenticated users and demo mode
-- This allows demo users to test the chat functionality without authentication

-- Drop existing policies for chat_sessions
DROP POLICY IF EXISTS "Users can create their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON chat_sessions;

-- Create new policies that support demo mode
CREATE POLICY "Users can create chat sessions (auth or demo)"
ON chat_sessions FOR INSERT
WITH CHECK (
  -- Allow if authenticated user matches
  auth.uid() = user_id 
  OR 
  -- Allow if no auth (demo mode) but has valid UUID user_id
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

CREATE POLICY "Users can view chat sessions (auth or demo)"
ON chat_sessions FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

CREATE POLICY "Users can update chat sessions (auth or demo)"
ON chat_sessions FOR UPDATE
USING (
  auth.uid() = user_id 
  OR 
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

-- Drop existing policies for chat_messages
DROP POLICY IF EXISTS "Users can view messages from their sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their sessions" ON chat_messages;

-- Create new policies for chat_messages that support demo mode
CREATE POLICY "Users can view messages (auth or demo)"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND (
      chat_sessions.user_id = auth.uid()
      OR
      (auth.uid() IS NULL AND chat_sessions.user_id IS NOT NULL)
    )
  )
);

CREATE POLICY "Users can create messages (auth or demo)"
ON chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND (
      chat_sessions.user_id = auth.uid()
      OR
      (auth.uid() IS NULL AND chat_sessions.user_id IS NOT NULL)
    )
  )
);