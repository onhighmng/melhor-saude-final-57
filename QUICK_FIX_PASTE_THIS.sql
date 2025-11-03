-- ============================================
-- QUICK FIX: Paste this in Supabase SQL Editor
-- ============================================
-- ⚠️ IMPORTANT: Replace 'your@email.com' with YOUR actual email below!

DO $$
DECLARE
  v_company_id UUID;
  v_user_id UUID;
  v_user_email TEXT := 'your@email.com'; -- ⚠️ CHANGE THIS TO YOUR EMAIL!
BEGIN
  -- Step 1: Ensure test company exists
  INSERT INTO companies (
    name,
    email,
    phone,
    employee_seats,
    sessions_allocated,
    sessions_used,
    is_active
  ) VALUES (
    'Test Company',
    'hr@testcompany.com',
    '+258 84 000 0000',
    50,   -- 50 employee seats
    200,  -- 200 sessions
    0,
    true
  )
  ON CONFLICT (email) DO UPDATE 
  SET employee_seats = 50
  RETURNING id INTO v_company_id;

  -- If company already existed, get its ID
  IF v_company_id IS NULL THEN
    SELECT id INTO v_company_id
    FROM companies 
    WHERE email = 'hr@testcompany.com'
    LIMIT 1;
  END IF;

  -- Step 2: Get your user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_user_email
  LIMIT 1;

  -- Check if user exists
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'ERROR: User with email % not found! Please sign up first at /signup', v_user_email;
  END IF;

  -- Step 3: Create/Update profile as HR
  INSERT INTO profiles (
    id,
    email,
    name,
    role,
    company_id,
    is_active
  )
  SELECT 
    v_user_id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', 'HR Manager'),
    'hr',
    v_company_id,
    true
  FROM auth.users u
  WHERE u.id = v_user_id
  ON CONFLICT (id) DO UPDATE 
  SET 
    role = 'hr',
    company_id = EXCLUDED.company_id,
    is_active = true;

  -- Step 4: Add HR role
  INSERT INTO user_roles (user_id, role, created_at)
  VALUES (v_user_id, 'hr', NOW())
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Success message
  RAISE NOTICE '✅ SUCCESS!';
  RAISE NOTICE 'User: % (ID: %)', v_user_email, v_user_id;
  RAISE NOTICE 'Company: Test Company (ID: %)', v_company_id;
  RAISE NOTICE 'Role: HR with 50 employee seats';
  RAISE NOTICE '';
  RAISE NOTICE '👉 Now logout and login again, then go to /company/colaboradores';
END $$;

-- Verify the setup worked
SELECT 
  p.email as "Your Email",
  p.role as "Role",
  c.name as "Company",
  c.employee_seats as "Seats",
  (SELECT COUNT(*) FROM invites WHERE company_id = c.id AND status = 'pending') as "Pending Codes"
FROM profiles p
JOIN companies c ON c.id = p.company_id
WHERE p.role = 'hr'
ORDER BY p.created_at DESC
LIMIT 1;


