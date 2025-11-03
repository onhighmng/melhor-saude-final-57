-- ============================================
-- SETUP TEST HR USER AND COMPANY
-- Run this to create a complete test environment
-- ============================================

-- Step 1: Create a test company with 50 employee seats
INSERT INTO companies (
  name,
  email,
  phone,
  employee_seats,
  sessions_allocated,
  sessions_used,
  is_active,
  created_at
) VALUES (
  'Test Company Ltd',
  'hr@testcompany.com',
  '+258 84 123 4567',
  50,    -- 50 employee seats (Business package)
  200,   -- 200 therapy sessions
  0,     -- No sessions used yet
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE 
SET employee_seats = 50
RETURNING id, name, employee_seats;

-- Note: Copy the company ID from the result above
-- Then use it in the next steps

-- ============================================
-- Step 2: Create HR user in auth.users
-- ============================================
-- You need to do this through Supabase Auth UI or sign up form
-- OR manually if you have the extension:

-- Example (requires auth admin extension):
/*
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'hr@testcompany.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"HR Manager"}'
)
RETURNING id, email;
*/

-- ============================================
-- Step 3: Create profile for HR user
-- (Replace 'USER_ID_HERE' with actual user ID)
-- ============================================

-- First, get the company ID
DO $$
DECLARE
  v_company_id UUID;
  v_user_id UUID := 'USER_ID_HERE'; -- Replace with actual user ID from auth
BEGIN
  -- Get the test company ID
  SELECT id INTO v_company_id
  FROM companies 
  WHERE email = 'hr@testcompany.com' 
  LIMIT 1;

  -- Create profile for HR user
  INSERT INTO profiles (
    id,
    email,
    name,
    role,
    company_id,
    is_active,
    created_at
  ) VALUES (
    v_user_id,
    'hr@testcompany.com',
    'HR Manager',
    'hr',
    v_company_id,
    true,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    role = 'hr',
    company_id = v_company_id,
    is_active = true;

  -- Add HR role to user_roles table
  INSERT INTO user_roles (
    user_id,
    role,
    created_at
  ) VALUES (
    v_user_id,
    'hr',
    NOW()
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE 'HR user setup complete for company: %', v_company_id;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check company was created
SELECT 
  id,
  name,
  email,
  employee_seats,
  sessions_allocated,
  is_active
FROM companies 
WHERE email = 'hr@testcompany.com';

-- Check profiles (after you create the user)
SELECT 
  p.id,
  p.email,
  p.name,
  p.role,
  p.company_id,
  c.name as company_name
FROM profiles p
LEFT JOIN companies c ON c.id = p.company_id
WHERE p.role = 'hr';

-- Check seat stats for the company
SELECT * FROM get_company_seat_stats(
  (SELECT id FROM companies WHERE email = 'hr@testcompany.com' LIMIT 1)
);

-- ============================================
-- ALTERNATIVE: Update existing user to be HR
-- ============================================

-- If you already have a user account, use this to convert them to HR:
-- (Replace 'your@email.com' with your actual email)

DO $$
DECLARE
  v_company_id UUID;
  v_user_id UUID;
BEGIN
  -- Get the company ID
  SELECT id INTO v_company_id
  FROM companies 
  WHERE email = 'hr@testcompany.com' 
  LIMIT 1;

  -- Get your user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'your@email.com'  -- REPLACE THIS
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found. Please sign up first at /signup';
  END IF;

  -- Update profile to HR role and link to company
  UPDATE profiles 
  SET 
    role = 'hr',
    company_id = v_company_id,
    is_active = true
  WHERE id = v_user_id;

  -- Add HR role
  INSERT INTO user_roles (user_id, role, created_at)
  VALUES (v_user_id, 'hr', NOW())
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE 'User % converted to HR for company %', v_user_id, v_company_id;
END $$;

-- ============================================
-- QUICK TEST: Generate a code manually
-- ============================================

-- After setup, test by generating a code:
INSERT INTO invites (
  invite_code,
  company_id,
  invited_by,
  email,
  role,
  user_type,
  status,
  expires_at
)
SELECT 
  'MS-TEST01',
  c.id,
  p.id,
  '',
  'user',
  'user',
  'pending',
  NOW() + INTERVAL '30 days'
FROM companies c
CROSS JOIN profiles p
WHERE c.email = 'hr@testcompany.com'
  AND p.role = 'hr'
LIMIT 1
RETURNING invite_code, company_id, status;

-- Check the invite was created
SELECT 
  i.invite_code,
  i.status,
  c.name as company_name,
  i.expires_at
FROM invites i
JOIN companies c ON c.id = i.company_id
WHERE i.invite_code = 'MS-TEST01';


