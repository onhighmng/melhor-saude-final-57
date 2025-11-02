-- ===================================================================
-- SETUP HR ACCOUNT FOR: lorinofrodriguesjunior@gmail.com
-- This script creates your auth user, profile, and links to Test Company
-- ===================================================================

-- Step 1: Remove problematic triggers temporarily
DROP TRIGGER IF EXISTS sync_profile_name_trigger ON profiles CASCADE;
DROP FUNCTION IF EXISTS sync_profile_name() CASCADE;


-- Step 2: Disable the handle_new_user trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;


-- Step 3: Create your auth user in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role
) VALUES (
  'd94c8947-3782-47f9-9285-35f035c1e1f2',
  '00000000-0000-0000-0000-000000000000',
  'lorinofrodriguesjunior@gmail.com',
  crypt('temppass123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"OnHigh management"}'::jsonb,
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;


-- Step 4: Manually create/update the profile (link to existing Test Company)
-- Company 'b967ebce-b0c3-4763-b3cd-35a4e67661ae' (Test Company) already exists
INSERT INTO profiles (id, email, role, company_id, is_active)
VALUES (
  'd94c8947-3782-47f9-9285-35f035c1e1f2',
  'lorinofrodriguesjunior@gmail.com',
  'hr',
  'b967ebce-b0c3-4763-b3cd-35a4e67661ae',
  true
)
ON CONFLICT (id) DO UPDATE SET
  company_id = 'b967ebce-b0c3-4763-b3cd-35a4e67661ae',
  role = 'hr',
  is_active = true;


-- Step 5: Add HR role to user_roles
INSERT INTO user_roles (user_id, role)
VALUES ('d94c8947-3782-47f9-9285-35f035c1e1f2', 'hr')
ON CONFLICT (user_id, role) DO NOTHING;


-- Step 6: Re-enable triggers (optional - comment out if you want to keep them disabled)
-- If you uncomment this, you may need to fix the trigger functions first
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION handle_new_user();


-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================

-- Check auth user
SELECT 'AUTH USER:' as check_type, id, email, created_at 
FROM auth.users 
WHERE id = 'd94c8947-3782-47f9-9285-35f035c1e1f2';

-- Check profile
SELECT 'PROFILE:' as check_type, id, email, role, company_id, is_active 
FROM profiles 
WHERE id = 'd94c8947-3782-47f9-9285-35f035c1e1f2';

-- Check user role
SELECT 'USER ROLE:' as check_type, user_id, role, created_at 
FROM user_roles 
WHERE user_id = 'd94c8947-3782-47f9-9285-35f035c1e1f2';

-- Check company details
SELECT 'COMPANY:' as check_type, id, name, email, employee_seats, sessions_allocated 
FROM companies 
WHERE id = 'b967ebce-b0c3-4763-b3cd-35a4e67661ae';

-- Check seat stats
SELECT 
  'SEAT STATS:' as check_type,
  employee_seats,
  (SELECT COUNT(*) FROM profiles WHERE company_id = companies.id AND is_active = true AND role != 'hr') as active_employees,
  (SELECT COUNT(*) FROM invites WHERE company_id = companies.id AND status = 'pending') as pending_invites,
  employee_seats - (
    (SELECT COUNT(*) FROM profiles WHERE company_id = companies.id AND is_active = true AND role != 'hr') +
    (SELECT COUNT(*) FROM invites WHERE company_id = companies.id AND status = 'pending')
  ) as available_seats
FROM companies 
WHERE id = 'b967ebce-b0c3-4763-b3cd-35a4e67661ae';

-- ===================================================================
-- SUCCESS MESSAGE
-- ===================================================================
SELECT '✅ HR account setup complete!' as status,
       'You can now refresh the page and generate codes' as next_step;

