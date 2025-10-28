-- Secure specialist_analytics by protecting the underlying chat_sessions table

-- The specialist_analytics view aggregates data from chat_sessions table
-- Since views inherit RLS from underlying tables, we need to ensure chat_sessions has proper admin-only access for analytics queries

-- Drop overly permissive chat_sessions policies that allow demo/unauthenticated access
-- These policies allow USING (true) which means anyone can view all chat sessions
DROP POLICY IF EXISTS "Users can view chat sessions (auth or demo)" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update chat sessions (auth or demo)" ON chat_sessions;
DROP POLICY IF EXISTS "Users can create chat sessions (auth or demo)" ON chat_sessions;

-- Create secure policies for chat_sessions
-- Users can only view their own chat sessions
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own chat sessions
CREATE POLICY "Users can create own chat sessions" ON chat_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own chat sessions
CREATE POLICY "Users can update own chat sessions" ON chat_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all chat sessions (for analytics via specialist_analytics view)
CREATE POLICY "Admins can view all chat sessions" ON chat_sessions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));