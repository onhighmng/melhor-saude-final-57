-- Let's also ensure the file_uploads table has proper policies
-- Since the upload function might be inserting into this table too

-- Check if we need to add a policy for system/edge function inserts
-- Edge functions might need to bypass user_id requirements

-- Allow edge functions to insert file records
CREATE POLICY "Edge functions can insert files" 
ON file_uploads 
FOR INSERT 
WITH CHECK (true);

-- Allow system to create file records without user restrictions
-- This is needed when the upload function creates the file record
DROP POLICY IF EXISTS "Users can create their own files" ON file_uploads;

CREATE POLICY "Users can create their own files" 
ON file_uploads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');