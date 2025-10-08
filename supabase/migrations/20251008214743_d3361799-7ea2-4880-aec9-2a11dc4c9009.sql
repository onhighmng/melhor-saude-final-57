-- COMPLETE FIX: Remove the foreign key constraint entirely for demo mode
-- Chat sessions don't need to validate user_id against profiles for demos

ALTER TABLE chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_user_id_fkey;

-- Don't add it back - chat sessions should work independently of profiles table
-- This allows demo users with any user_id (or NULL) to create sessions