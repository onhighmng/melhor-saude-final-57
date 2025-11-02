-- ============================================================================
-- FIX ANY USER ROLE - TEMPLATE SCRIPT
-- ============================================================================
-- Use this script to manually assign roles to users who didn't get them automatically
-- ============================================================================

-- ============================================================================
-- STEP 1: IDENTIFY THE USER AND THEIR EXPECTED ROLE
-- ============================================================================

-- Find users without roles
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.role as profile_role,
  STRING_AGG(ur.role, ', ') as user_roles,
  i.invite_code,
  i.role as expected_role_from_code
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN invites i ON i.email = u.email AND i.status = 'accepted'
GROUP BY u.id, u.email, u.created_at, p.role, i.invite_code, i.role
HAVING COUNT(ur.role) = 0 OR p.role IS NULL
ORDER BY u.created_at DESC;

-- ============================================================================
-- STEP 2: USE THE APPROPRIATE FUNCTION BELOW
-- ============================================================================

-- ============================================================================
-- OPTION A: PROMOTE TO HR ROLE (Company Admin)
-- ============================================================================
-- Replace with actual user_id and company_name

DO $$
DECLARE
  v_user_id UUID := '<USER_ID>'::UUID;  -- REPLACE WITH ACTUAL USER ID
  v_user_email TEXT := '<USER_EMAIL>';  -- REPLACE WITH ACTUAL EMAIL
  v_company_name TEXT := '<COMPANY_NAME>';  -- REPLACE WITH ACTUAL COMPANY NAME
  v_company_id UUID;
BEGIN
  -- Update profile role
  UPDATE profiles SET role = 'hr' WHERE id = v_user_id;
  
  -- Insert user role
  INSERT INTO user_roles (user_id, role, created_at)
  VALUES (v_user_id, 'hr', NOW())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Get or create company
  SELECT company_id INTO v_company_id FROM profiles WHERE id = v_user_id;
  
  IF v_company_id IS NULL THEN
    INSERT INTO companies (name, email, sessions_allocated, sessions_used, is_active, created_at)
    VALUES (v_company_name, v_user_email, 100, 0, true, NOW())
    RETURNING id INTO v_company_id;
    
    UPDATE profiles SET company_id = v_company_id WHERE id = v_user_id;
  END IF;
  
  -- Create company employee link
  INSERT INTO company_employees (company_id, user_id, sessions_allocated, sessions_used, is_active, joined_at)
  VALUES (v_company_id, v_user_id, 100, 0, true, NOW())
  ON CONFLICT (company_id, user_id) DO UPDATE SET is_active = true;
  
  RAISE NOTICE '✅ User % promoted to HR role', v_user_email;
END $$;

-- ============================================================================
-- OPTION B: PROMOTE TO PRESTADOR ROLE (Affiliate)
-- ============================================================================
-- Replace with actual user_id

DO $$
DECLARE
  v_user_id UUID := '<USER_ID>'::UUID;  -- REPLACE WITH ACTUAL USER ID
  v_user_email TEXT := '<USER_EMAIL>';  -- REPLACE WITH ACTUAL EMAIL
  v_user_name TEXT := '<USER_NAME>';  -- REPLACE WITH ACTUAL NAME
BEGIN
  -- Update profile role
  UPDATE profiles SET role = 'prestador' WHERE id = v_user_id;
  
  -- Insert user role
  INSERT INTO user_roles (user_id, role, created_at)
  VALUES (v_user_id, 'prestador', NOW())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create prestadores record
  INSERT INTO prestadores (user_id, name, email, specialty, available, is_active, rating, total_sessions, created_at)
  VALUES (v_user_id, v_user_name, v_user_email, NULL, true, true, 0, 0, NOW())
  ON CONFLICT (user_id) DO UPDATE SET is_active = true;
  
  RAISE NOTICE '✅ User % promoted to Prestador role', v_user_email;
END $$;

-- ============================================================================
-- OPTION C: PROMOTE TO SPECIALIST ROLE (Especialista Geral)
-- ============================================================================
-- Replace with actual user_id

DO $$
DECLARE
  v_user_id UUID := '<USER_ID>'::UUID;  -- REPLACE WITH ACTUAL USER ID
  v_user_email TEXT := '<USER_EMAIL>';  -- REPLACE WITH ACTUAL EMAIL
  v_user_name TEXT := '<USER_NAME>';  -- REPLACE WITH ACTUAL NAME
  v_company_id UUID := NULL;  -- OPTIONAL: Set if specialist is linked to a company
BEGIN
  -- Update profile role
  UPDATE profiles SET role = 'especialista_geral' WHERE id = v_user_id;
  
  -- Insert user role
  INSERT INTO user_roles (user_id, role, created_at)
  VALUES (v_user_id, 'especialista_geral', NOW())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create prestadores record (specialists also use this table)
  INSERT INTO prestadores (user_id, name, email, specialty, available, is_active, rating, total_sessions, created_at)
  VALUES (v_user_id, v_user_name, v_user_email, 'Especialista Geral', true, true, 0, 0, NOW())
  ON CONFLICT (user_id) DO UPDATE SET is_active = true;
  
  -- If company_id provided, create specialist assignment
  IF v_company_id IS NOT NULL THEN
    INSERT INTO specialist_assignments (specialist_id, company_id, pillars, is_active, created_at)
    VALUES (v_user_id, v_company_id, ARRAY['saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica'], true, NOW())
    ON CONFLICT DO NOTHING;
  END IF;
  
  RAISE NOTICE '✅ User % promoted to Specialist role', v_user_email;
END $$;

-- ============================================================================
-- OPTION D: PROMOTE TO USER ROLE (Employee)
-- ============================================================================
-- Replace with actual user_id and company_id

DO $$
DECLARE
  v_user_id UUID := '<USER_ID>'::UUID;  -- REPLACE WITH ACTUAL USER ID
  v_user_email TEXT := '<USER_EMAIL>';  -- REPLACE WITH ACTUAL EMAIL
  v_company_id UUID := '<COMPANY_ID>'::UUID;  -- REPLACE WITH ACTUAL COMPANY ID
BEGIN
  -- Update profile role
  UPDATE profiles SET role = 'user', company_id = v_company_id WHERE id = v_user_id;
  
  -- Insert user role
  INSERT INTO user_roles (user_id, role, created_at)
  VALUES (v_user_id, 'user', NOW())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create company employee link
  INSERT INTO company_employees (company_id, user_id, sessions_allocated, sessions_used, is_active, joined_at)
  VALUES (v_company_id, v_user_id, 10, 0, true, NOW())
  ON CONFLICT (company_id, user_id) DO UPDATE SET is_active = true;
  
  RAISE NOTICE '✅ User % promoted to User role', v_user_email;
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this after promoting to verify it worked

SELECT 
  u.id,
  u.email,
  p.role as profile_role,
  STRING_AGG(DISTINCT ur.role, ', ') as user_roles,
  p.company_id,
  CASE 
    WHEN pr.id IS NOT NULL AND p.role = 'prestador' THEN '✅ Prestador Setup Complete'
    WHEN pr.id IS NOT NULL AND p.role = 'especialista_geral' THEN '✅ Specialist Setup Complete'
    WHEN ce.id IS NOT NULL AND p.role = 'hr' THEN '✅ HR Setup Complete'
    WHEN ce.id IS NOT NULL AND p.role = 'user' THEN '✅ Employee Setup Complete'
    ELSE '⚠️ Additional setup needed'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN prestadores pr ON pr.user_id = u.id
LEFT JOIN company_employees ce ON ce.user_id = u.id
WHERE u.id = '<USER_ID>'::UUID  -- REPLACE WITH ACTUAL USER ID
GROUP BY u.id, u.email, p.role, p.company_id, pr.id, ce.id;

