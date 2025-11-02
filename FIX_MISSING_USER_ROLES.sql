-- ============================================================================
-- FIX MISSING USER ROLES - VERIFIED AGAINST ACTUAL SCHEMA
-- ============================================================================
-- This script manually promotes users who registered but didn't get proper roles
-- All table structures and constraints have been verified
-- ============================================================================

-- First, let's check what invites these users should have used
SELECT 
  u.id,
  u.email,
  u.created_at,
  i.invite_code,
  i.role,
  i.status,
  i.company_id
FROM auth.users u
LEFT JOIN invites i ON i.email = u.email
WHERE u.email IN ('onhighmanagement@gmail.com', 'lorinofrodriguesjunior@gmail.com')
ORDER BY u.email;

-- ============================================================================
-- FIX USER 1: onhighmanagement@gmail.com → Prestador
-- ============================================================================

DO $$
DECLARE
  v_user_id UUID := '3bd2f389-d69d-4337-b27c-a9dc66123121'::UUID;
  v_user_email TEXT := 'onhighmanagement@gmail.com';
  v_profile_exists BOOLEAN;
  v_prestador_exists BOOLEAN;
BEGIN
  -- 1. Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = v_user_id) INTO v_profile_exists;
  
  -- 2. Create or update profile
  IF v_profile_exists THEN
    UPDATE profiles 
    SET role = 'prestador',
        email = v_user_email,
        full_name = COALESCE(full_name, 'OnHigh Management')
    WHERE id = v_user_id;
    RAISE NOTICE 'Updated existing profile for onhighmanagement@gmail.com';
  ELSE
    INSERT INTO profiles (id, email, role, full_name, created_at)
    VALUES (v_user_id, v_user_email, 'prestador', 'OnHigh Management', NOW());
    RAISE NOTICE 'Created profile for onhighmanagement@gmail.com';
  END IF;
  
  -- 3. Insert user role (now that profile exists)
  INSERT INTO user_roles (user_id, role, created_at)
  VALUES (v_user_id, 'prestador', NOW())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Added prestador role to user_roles';
  
  -- 4. Check if prestadores record exists
  SELECT EXISTS(SELECT 1 FROM prestadores WHERE user_id = v_user_id) INTO v_prestador_exists;
  
  -- 5. Create prestadores record if it doesn't exist
  IF NOT v_prestador_exists THEN
    INSERT INTO prestadores (
      user_id,
      name,
      email,
      specialty,
      available,
      is_active,
      rating,
      total_sessions,
      created_at
    ) VALUES (
      v_user_id,
      'OnHigh Management',
      'onhighmanagement@gmail.com',
      NULL,
      true,
      true,
      0,
      0,
      NOW()
    );
    RAISE NOTICE 'Created prestadores record for onhighmanagement@gmail.com';
  ELSE
    UPDATE prestadores
    SET is_active = true,
        email = v_user_email,
        name = COALESCE(name, 'OnHigh Management')
    WHERE user_id = v_user_id;
    RAISE NOTICE 'Updated existing prestadores record for onhighmanagement@gmail.com';
  END IF;
  
END $$;

-- ============================================================================
-- FIX USER 2: lorinofrodriguesjunior@gmail.com → HR/Company
-- ============================================================================

DO $$
DECLARE
  v_user_id UUID := 'd94c8947-3782-47f9-9285-35f035c1e1f2'::UUID;
  v_user_email TEXT := 'lorinofrodriguesjunior@gmail.com';
  v_company_id UUID;
  v_profile_exists BOOLEAN;
  v_employee_exists BOOLEAN;
BEGIN
  -- 1. Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = v_user_id) INTO v_profile_exists;
  
  -- 2. Create or update profile (without company_id yet)
  IF v_profile_exists THEN
    UPDATE profiles 
    SET role = 'hr',
        email = v_user_email,
        full_name = COALESCE(full_name, 'Lorino Rodrigues Junior')
    WHERE id = v_user_id;
    RAISE NOTICE 'Updated existing profile for lorinofrodriguesjunior@gmail.com';
  ELSE
    INSERT INTO profiles (id, email, role, full_name, created_at)
    VALUES (v_user_id, v_user_email, 'hr', 'Lorino Rodrigues Junior', NOW());
    RAISE NOTICE 'Created profile for lorinofrodriguesjunior@gmail.com';
  END IF;
  
  -- 3. Insert user role (now that profile exists)
  INSERT INTO user_roles (user_id, role, created_at)
  VALUES (v_user_id, 'hr', NOW())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Added hr role to user_roles';
  
  -- 4. Check if user already has a company
  SELECT company_id INTO v_company_id
  FROM profiles
  WHERE id = v_user_id;
  
  -- 5. If no company, create one
  IF v_company_id IS NULL THEN
    INSERT INTO companies (
      name,
      email,
      phone,
      sessions_allocated,
      sessions_used,
      is_active,
      created_at
    ) VALUES (
      'Lorino Company',
      'lorinofrodriguesjunior@gmail.com',
      NULL,
      100,
      0,
      true,
      NOW()
    )
    RETURNING id INTO v_company_id;
    
    RAISE NOTICE 'Created company with ID: %', v_company_id;
    
    -- Update profile with company_id
    UPDATE profiles
    SET company_id = v_company_id
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Linked user to company';
  END IF;
  
  -- 6. Check if company_employees link exists
  SELECT EXISTS(
    SELECT 1 FROM company_employees 
    WHERE company_id = v_company_id AND user_id = v_user_id
  ) INTO v_employee_exists;
  
  -- 7. Create company_employees link if it doesn't exist
  IF NOT v_employee_exists THEN
    INSERT INTO company_employees (
      company_id,
      user_id,
      sessions_allocated,
      sessions_used,
      is_active,
      joined_at
    ) VALUES (
      v_company_id,
      v_user_id,
      100,
      0,
      true,
      NOW()
    );
    RAISE NOTICE 'Created company_employees link for lorinofrodriguesjunior@gmail.com';
  ELSE
    UPDATE company_employees
    SET is_active = true,
        sessions_allocated = 100
    WHERE company_id = v_company_id AND user_id = v_user_id;
    RAISE NOTICE 'Updated existing company_employees link for lorinofrodriguesjunior@gmail.com';
  END IF;
  
END $$;

-- ============================================================================
-- VERIFY THE FIXES
-- ============================================================================

-- Check that roles were assigned correctly
SELECT 
  u.id,
  u.email,
  p.role as profile_role,
  p.full_name,
  STRING_AGG(ur.role, ', ') as user_roles,
  p.company_id,
  CASE 
    WHEN pr.id IS NOT NULL THEN '✅ Prestador Record Exists'
    WHEN ce.id IS NOT NULL THEN '✅ Company Employee Record Exists'
    ELSE '⚠️ No Additional Records'
  END as setup_status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN prestadores pr ON pr.user_id = u.id
LEFT JOIN company_employees ce ON ce.user_id = u.id
WHERE u.email IN ('onhighmanagement@gmail.com', 'lorinofrodriguesjunior@gmail.com')
GROUP BY u.id, u.email, p.role, p.full_name, p.company_id, pr.id, ce.id
ORDER BY u.email;

-- Check prestador record for onhighmanagement@gmail.com
SELECT 
  pr.id,
  pr.user_id,
  pr.name,
  pr.email,
  pr.specialty,
  pr.is_active,
  pr.available,
  u.email as auth_email
FROM prestadores pr
JOIN auth.users u ON u.id = pr.user_id
WHERE u.email = 'onhighmanagement@gmail.com';

-- Check company and employee record for lorinofrodriguesjunior@gmail.com
SELECT 
  u.email,
  p.full_name,
  c.id as company_id,
  c.name as company_name,
  c.is_active as company_active,
  ce.sessions_allocated,
  ce.is_active as employee_active
FROM auth.users u
JOIN profiles p ON p.id = u.id
LEFT JOIN companies c ON c.id = p.company_id
LEFT JOIN company_employees ce ON ce.user_id = u.id AND ce.company_id = c.id
WHERE u.email = 'lorinofrodriguesjunior@gmail.com';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT '✅ User roles have been fixed!' as status,
       'onhighmanagement@gmail.com → prestador' as fix_1,
       'lorinofrodriguesjunior@gmail.com → hr/company' as fix_2;
