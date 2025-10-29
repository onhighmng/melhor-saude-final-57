-- Fix the generate_access_code function to properly insert codes
-- Run this in your Supabase SQL Editor

-- Ensure user_type and metadata columns exist
ALTER TABLE invites ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'user';
ALTER TABLE invites ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Make company_id nullable to support prestador codes (which don't need a company)
-- Make email nullable since codes are generated before email is known
DO $$
BEGIN
  -- Try to alter company_id to allow NULL if it doesn't already
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' 
    AND column_name = 'company_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE invites ALTER COLUMN company_id DROP NOT NULL;
  END IF;
  
  -- Try to alter email to allow NULL if it doesn't already
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' 
    AND column_name = 'email' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE invites ALTER COLUMN email DROP NOT NULL;
  END IF;
END $$;

-- Drop the old function first to change return type
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB, INTEGER);

-- Create the new function with correct return type
CREATE OR REPLACE FUNCTION generate_access_code(
  p_user_type TEXT,
  p_company_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_expires_days INTEGER DEFAULT 30
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMPTZ;
  v_code_exists BOOLEAN;
  v_invited_by UUID;
BEGIN
  -- Get the current user ID
  v_invited_by := auth.uid();

  -- Generate unique code
  LOOP
    v_code := 'MS-' || upper(substring(md5(random()::text) || clock_timestamp()::text from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM invites WHERE invite_code = v_code) INTO v_code_exists;
    
    EXIT WHEN NOT v_code_exists;
  END LOOP;
  
  -- Calculate expiry date
  v_expires_at := NOW() + (p_expires_days || ' days')::INTERVAL;
  
  -- Insert the new invite (role column doesn't exist in this schema)
  INSERT INTO invites (
    invite_code,
    user_type,
    company_id,
    invited_by,
    email,
    status,
    expires_at,
    metadata
  ) VALUES (
    v_code,
    p_user_type,
    p_company_id,
    v_invited_by,
    NULL,
    'pending',
    v_expires_at,
    p_metadata
  );
  
  -- Return the generated code
  RETURN v_code;
END;
$$;

-- Re-grant permissions
GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER) TO anon;
