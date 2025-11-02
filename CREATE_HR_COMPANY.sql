-- ========================================
-- CREATE: Company for HR User
-- ========================================

-- Step 1: Create the company
INSERT INTO companies (
  name,
  email,
  contact_email,
  phone,
  sessions_allocated,
  sessions_used,
  is_active,
  plan_type
) VALUES (
  'OnHigh Management',
  'onhighmanagement@gmail.com',
  'lorinofrodriguesjunior@gmail.com',
  NULL,
  100,
  0,
  true,
  'premium'
) RETURNING id, name;

-- Step 2: Get the company ID and update HR user's profile
-- (Copy the ID from step 1 result and paste below)

-- UPDATE profiles
-- SET company_id = '<paste-company-id-here>'
-- WHERE email = 'lorinofrodriguesjunior@gmail.com';

-- Step 3: Create company_employee link
-- INSERT INTO company_employees (
--   company_id,
--   user_id,
--   sessions_allocated,
--   sessions_used,
--   status,
--   is_active
-- )
-- SELECT 
--   '<paste-company-id-here>',
--   id,
--   100,
--   0,
--   'active',
--   true
-- FROM profiles
-- WHERE email = 'lorinofrodriguesjunior@gmail.com';

-- Step 4: Verify
-- SELECT 
--   p.email,
--   p.name,
--   p.company_id,
--   c.name as company_name,
--   c.sessions_allocated
-- FROM profiles p
-- LEFT JOIN companies c ON c.id = p.company_id
-- WHERE p.email = 'lorinofrodriguesjunior@gmail.com';

