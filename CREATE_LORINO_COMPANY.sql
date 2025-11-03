-- ========================================
-- CREATE: Company for Lorino (HR User)
-- ========================================

-- Step 1: Create the company
INSERT INTO companies (
  name, 
  email, 
  contact_email,
  contact_phone,
  sessions_allocated, 
  sessions_used, 
  is_active,
  plan_type
) 
VALUES (
  'OnHigh Management',
  'contact@onhighmanagement.com',
  'lorinofrodriguesjunior@gmail.com',
  NULL,
  100, 
  0, 
  true,
  'premium'
) 
RETURNING id, name;

-- You'll see output like: { id: "abc-123-...", name: "OnHigh Management" }
-- Copy the ID and use it in Step 2 below

-- Step 2: Update Lorino's profile with company_id
-- UPDATE profiles 
-- SET company_id = '<PASTE-THE-ID-FROM-STEP-1-HERE>' 
-- WHERE email = 'lorinofrodriguesjunior@gmail.com';

-- Step 3: Create company_employee record
-- INSERT INTO company_employees (
--   company_id,
--   user_id,
--   sessions_allocated,
--   sessions_used,
--   status,
--   is_active
-- )
-- SELECT 
--   '<PASTE-THE-ID-FROM-STEP-1-HERE>',
--   id,
--   100,
--   0,
--   'active',
--   true
-- FROM profiles
-- WHERE email = 'lorinofrodriguesjunior@gmail.com';

-- Step 4: Verify everything worked
-- SELECT 
--   p.id,
--   p.email,
--   p.name,
--   p.role,
--   p.company_id,
--   c.name as company_name,
--   c.sessions_allocated
-- FROM profiles p
-- LEFT JOIN companies c ON c.id = p.company_id
-- WHERE p.email = 'lorinofrodriguesjunior@gmail.com';

-- Should show:
-- | email                            | name              | role | company_id         | company_name      |
-- | lorinofrodriguesjunior@gmail.com | Lorino...         | hr   | abc-123-...        | OnHigh Management |



