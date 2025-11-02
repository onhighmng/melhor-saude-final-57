-- ============================================================================
-- VIEW ALL USERS AND CODES
-- ============================================================================
-- Run these queries one by one to see all your data
-- ============================================================================

-- ==================================================
-- 1. ALL USERS WITH THEIR ROLES
-- ==================================================
SELECT 
  u.id,
  u.email,
  u.created_at as user_created_at,
  p.full_name,
  p.role as profile_role,
  STRING_AGG(DISTINCT ur.role, ', ') as user_roles,
  CASE 
    WHEN c.id IS NOT NULL THEN 'Company (' || c.name || ')'
    WHEN pr.user_id IS NOT NULL THEN 'Prestador (' || COALESCE(pr.name, 'No name') || ')'
    ELSE 'Regular User'
  END as user_type
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.companies c ON c.id = p.company_id
LEFT JOIN public.prestadores pr ON pr.user_id = u.id
GROUP BY u.id, u.email, u.created_at, p.full_name, p.role, c.id, c.name, pr.user_id, pr.name
ORDER BY u.created_at DESC;

-- ==================================================
-- 2. ALL INVITE CODES (HR / Company Codes)
-- ==================================================
SELECT 
  i.id,
  i.invite_code as code,
  i.role,
  i.status,
  i.created_at,
  i.expires_at,
  i.accepted_at,
  CASE 
    WHEN i.expires_at < NOW() THEN '🔴 Expired'
    WHEN i.status = 'accepted' THEN '🟢 Used'
    WHEN i.status = 'pending' AND i.expires_at > NOW() THEN '🟢 Available'
    ELSE '🟡 ' || i.status
  END as availability_status,
  i.invited_by,
  admin.email as created_by_admin_email,
  c.name as company_name
FROM public.invites i
LEFT JOIN auth.users admin ON admin.id = i.invited_by
LEFT JOIN public.companies c ON c.id = i.company_id
WHERE i.role = 'hr'
ORDER BY i.created_at DESC;

-- ==================================================
-- 3. ALL INVITE CODES (Prestador Codes)
-- ==================================================
SELECT 
  i.id,
  i.invite_code as code,
  i.role,
  i.status,
  i.created_at,
  i.expires_at,
  i.accepted_at,
  CASE 
    WHEN i.expires_at < NOW() THEN '🔴 Expired'
    WHEN i.status = 'accepted' THEN '🟢 Used'
    WHEN i.status = 'pending' AND i.expires_at > NOW() THEN '🟢 Available'
    ELSE '🟡 ' || i.status
  END as availability_status,
  i.invited_by,
  admin.email as created_by_admin_email
FROM public.invites i
LEFT JOIN auth.users admin ON admin.id = i.invited_by
WHERE i.role = 'prestador'
ORDER BY i.created_at DESC;

-- ==================================================
-- 4. ALL INVITE CODES (Specialist Codes)
-- ==================================================
SELECT 
  i.id,
  i.invite_code as code,
  i.role,
  i.status,
  i.created_at,
  i.expires_at,
  i.accepted_at,
  CASE 
    WHEN i.expires_at < NOW() THEN '🔴 Expired'
    WHEN i.status = 'accepted' THEN '🟢 Used'
    WHEN i.status = 'pending' AND i.expires_at > NOW() THEN '🟢 Available'
    ELSE '🟡 ' || i.status
  END as availability_status,
  i.invited_by,
  admin.email as created_by_admin_email,
  c.name as company_name
FROM public.invites i
LEFT JOIN auth.users admin ON admin.id = i.invited_by
LEFT JOIN public.companies c ON c.id = i.company_id
WHERE i.role = 'especialista_geral'
ORDER BY i.created_at DESC;

-- ==================================================
-- 5. ALL INVITE CODES (All Types)
-- ==================================================
SELECT 
  i.id,
  i.invite_code as code,
  i.role,
  i.status,
  i.email as used_by_email,
  i.created_at,
  i.expires_at,
  i.accepted_at,
  CASE 
    WHEN i.expires_at < NOW() THEN '🔴 Expired'
    WHEN i.status = 'accepted' THEN '🟢 Used'
    WHEN i.status = 'pending' AND i.expires_at > NOW() THEN '🟢 Available'
    ELSE '🟡 ' || i.status
  END as availability_status,
  i.invited_by,
  admin.email as created_by_admin_email,
  c.name as company_name
FROM public.invites i
LEFT JOIN auth.users admin ON admin.id = i.invited_by
LEFT JOIN public.companies c ON c.id = i.company_id
ORDER BY i.created_at DESC;

-- ==================================================
-- 6. ALL COMPANIES (HR/Company Accounts)
-- ==================================================
SELECT 
  c.id,
  c.name as company_name,
  c.nuit,
  c.email as contact_email,
  c.phone as contact_phone,
  c.industry,
  c.address,
  c.sessions_allocated,
  c.sessions_used,
  c.is_active,
  c.created_at,
  c.updated_at,
  (SELECT COUNT(*) FROM company_employees WHERE company_id = c.id) as employee_count,
  p.full_name as primary_contact_name,
  p.role as primary_contact_role
FROM public.companies c
LEFT JOIN public.profiles p ON p.company_id = c.id AND p.role = 'hr'
ORDER BY c.created_at DESC;

-- ==================================================
-- 7. ALL PRESTADORES (Provider/Affiliate Accounts)
-- ==================================================
SELECT 
  pr.id,
  pr.user_id,
  pr.name as prestador_name,
  pr.specialty,
  pr.email as prestador_email,
  pr.photo_url,
  pr.pillars,
  pr.available,
  pr.is_active,
  pr.rating,
  pr.total_sessions,
  pr.created_at,
  u.email as user_auth_email,
  p.full_name as profile_full_name,
  p.role as profile_role
FROM public.prestadores pr
LEFT JOIN auth.users u ON u.id = pr.user_id
LEFT JOIN public.profiles p ON p.id = pr.user_id
ORDER BY pr.created_at DESC;

-- ==================================================
-- 8. COMPANY EMPLOYEES (Users linked to companies)
-- ==================================================
SELECT 
  ce.id,
  ce.user_id,
  ce.company_id,
  u.email as employee_email,
  p.full_name as employee_name,
  p.role as employee_role,
  c.name as company_name,
  ce.sessions_allocated,
  ce.sessions_used,
  ce.is_active,
  ce.joined_at,
  STRING_AGG(ur.role, ', ') as user_roles
FROM public.company_employees ce
LEFT JOIN auth.users u ON u.id = ce.user_id
LEFT JOIN public.profiles p ON p.id = ce.user_id
LEFT JOIN public.companies c ON c.id = ce.company_id
LEFT JOIN public.user_roles ur ON ur.user_id = ce.user_id
GROUP BY ce.id, ce.user_id, ce.company_id, u.email, p.full_name, p.role, c.name, 
         ce.sessions_allocated, ce.sessions_used, ce.is_active, ce.joined_at
ORDER BY ce.joined_at DESC;

-- ==================================================
-- 9. SUMMARY COUNTS
-- ==================================================
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM public.companies) as total_companies,
  (SELECT COUNT(*) FROM public.prestadores) as total_prestadores,
  (SELECT COUNT(*) FROM public.company_employees) as total_employees,
  (SELECT COUNT(*) FROM public.invites WHERE role = 'hr') as total_hr_codes,
  (SELECT COUNT(*) FROM public.invites WHERE role = 'hr' AND status = 'accepted') as used_hr_codes,
  (SELECT COUNT(*) FROM public.invites WHERE role = 'prestador') as total_prestador_codes,
  (SELECT COUNT(*) FROM public.invites WHERE role = 'prestador' AND status = 'accepted') as used_prestador_codes,
  (SELECT COUNT(*) FROM public.invites WHERE role = 'especialista_geral') as total_specialist_codes,
  (SELECT COUNT(*) FROM public.invites WHERE role = 'especialista_geral' AND status = 'accepted') as used_specialist_codes,
  (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM public.user_roles WHERE role = 'hr') as total_hr_users,
  (SELECT COUNT(*) FROM public.user_roles WHERE role = 'prestador') as total_prestador_users,
  (SELECT COUNT(*) FROM public.user_roles WHERE role = 'especialista_geral') as total_specialist_users;

-- ==================================================
-- 10. USER ROLES BREAKDOWN
-- ==================================================
SELECT 
  ur.role,
  COUNT(*) as count,
  ARRAY_AGG(u.email ORDER BY u.created_at DESC) as users
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
GROUP BY ur.role
ORDER BY COUNT(*) DESC;

-- ==================================================
-- 11. RECENT REGISTRATIONS (Last 7 Days)
-- ==================================================
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.full_name,
  p.role as profile_role,
  STRING_AGG(DISTINCT ur.role, ', ') as user_roles,
  i.invite_code as used_code,
  i.role as code_role,
  CASE 
    WHEN pr.id IS NOT NULL THEN '✅ Prestador Record Created'
    WHEN ce.id IS NOT NULL THEN '✅ Employee Record Created'
    ELSE '⚠️ No Additional Records'
  END as setup_status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.invites i ON i.email = u.email AND i.status = 'accepted'
LEFT JOIN public.prestadores pr ON pr.user_id = u.id
LEFT JOIN public.company_employees ce ON ce.user_id = u.id
WHERE u.created_at > NOW() - INTERVAL '7 days'
GROUP BY u.id, u.email, u.created_at, p.full_name, p.role, i.invite_code, i.role, pr.id, ce.id
ORDER BY u.created_at DESC;

-- ==================================================
-- 12. PENDING INVITES (Not Yet Used)
-- ==================================================
SELECT 
  i.id,
  i.invite_code,
  i.role,
  i.created_at,
  i.expires_at,
  EXTRACT(DAY FROM (i.expires_at - NOW())) as days_until_expiry,
  admin.email as created_by,
  c.name as company_name
FROM public.invites i
LEFT JOIN auth.users admin ON admin.id = i.invited_by
LEFT JOIN public.companies c ON c.id = i.company_id
WHERE i.status = 'pending'
  AND i.expires_at > NOW()
ORDER BY i.expires_at ASC;

-- ==================================================
-- 13. USERS WITHOUT PROPER ROLES (Need Fixing)
-- ==================================================
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.role as profile_role,
  STRING_AGG(ur.role, ', ') as user_roles,
  i.invite_code as registration_code,
  i.role as expected_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.invites i ON i.email = u.email AND i.status = 'accepted'
GROUP BY u.id, u.email, u.created_at, p.role, i.invite_code, i.role
HAVING COUNT(ur.role) = 0 OR p.role IS NULL
ORDER BY u.created_at DESC;

-- ==================================================
-- 14. COMPANIES WITH EMPLOYEES COUNT
-- ==================================================
SELECT 
  c.id,
  c.name as company_name,
  c.is_active,
  c.sessions_allocated,
  c.sessions_used,
  COUNT(DISTINCT ce.user_id) as employee_count,
  COUNT(DISTINCT CASE WHEN ur.role = 'hr' THEN ce.user_id END) as hr_count,
  COUNT(DISTINCT CASE WHEN ur.role = 'user' THEN ce.user_id END) as regular_employee_count,
  c.created_at
FROM public.companies c
LEFT JOIN public.company_employees ce ON ce.company_id = c.id
LEFT JOIN public.user_roles ur ON ur.user_id = ce.user_id
GROUP BY c.id, c.name, c.is_active, c.sessions_allocated, c.sessions_used, c.created_at
ORDER BY employee_count DESC, c.created_at DESC;
