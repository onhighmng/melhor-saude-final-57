-- =================================================
-- DIAGNOSE DUPLICATE COMPANIES
-- Run this in Supabase Dashboard > SQL Editor
-- =================================================

-- 1. List all companies with creation details
SELECT 
  id,
  name,
  contact_email,
  email, -- Some companies use 'email' column
  plan_type,
  employee_seats,
  sessions_allocated,
  is_active,
  created_at,
  updated_at
FROM companies
ORDER BY created_at DESC;

-- 2. Find companies with similar names (potential duplicates)
SELECT 
  name,
  COUNT(*) as count,
  STRING_AGG(contact_email || ' (created: ' || created_at::text || ')', ', ') as details
FROM companies
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1;

-- 3. Find companies with the same email (definite duplicates)
SELECT 
  contact_email,
  email,
  COUNT(*) as count,
  STRING_AGG(name || ' (ID: ' || id::text || ')', ', ') as companies
FROM companies
GROUP BY contact_email, email
HAVING COUNT(*) > 1;

-- 4. Find HR users and their associated companies
SELECT 
  p.name as hr_name,
  p.email as hr_email,
  c.id as company_id,
  c.name as company_name,
  c.contact_email,
  c.created_at as company_created,
  p.created_at as profile_created
FROM profiles p
LEFT JOIN companies c ON p.company_id = c.id
WHERE p.role = 'hr'
ORDER BY p.created_at DESC;

-- 5. Find HR access codes and their usage
SELECT 
  i.invite_code,
  i.role,
  i.status,
  i.company_id,
  c.name as company_name,
  i.email as invite_email,
  i.created_at as code_created,
  i.accepted_at as code_used
FROM invites i
LEFT JOIN companies c ON i.company_id = c.id
WHERE i.role = 'hr'
ORDER BY i.created_at DESC;

-- 6. Find companies with no associated HR users (orphaned)
SELECT 
  c.id,
  c.name,
  c.contact_email,
  c.created_at,
  COUNT(p.id) as hr_count
FROM companies c
LEFT JOIN profiles p ON c.id = p.company_id AND p.role = 'hr'
GROUP BY c.id, c.name, c.contact_email, c.created_at
HAVING COUNT(p.id) = 0
ORDER BY c.created_at DESC;

-- 7. Timeline of company creations with context
SELECT 
  'Company Created' as event_type,
  c.name as entity_name,
  c.contact_email as email,
  c.created_at as event_time,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.company_id = c.id 
      AND p.role = 'hr' 
      AND p.created_at <= c.created_at + INTERVAL '1 minute'
    ) THEN 'Via HR Registration'
    WHEN EXISTS (
      SELECT 1 FROM invites i 
      WHERE i.company_id = c.id 
      AND i.role = 'hr'
    ) THEN 'Has HR Invite (unused or used later)'
    ELSE 'Direct Registration (Self-Service)'
  END as creation_method
FROM companies c
UNION ALL
SELECT 
  'HR Registered' as event_type,
  p.name as entity_name,
  p.email,
  p.created_at as event_time,
  'Company ID: ' || COALESCE(p.company_id::text, 'NULL') as creation_method
FROM profiles p
WHERE p.role = 'hr'
ORDER BY event_time DESC;

-- =================================================
-- CLEANUP SUGGESTIONS
-- =================================================

-- To delete a specific duplicate company (REPLACE 'xxx' with actual ID):
-- WARNING: This will also delete all associated data!
-- DELETE FROM companies WHERE id = 'xxx';

-- To deactivate a duplicate company instead (safer):
-- UPDATE companies SET is_active = false WHERE id = 'xxx';

-- To merge two companies (advanced - requires manual data migration):
-- 1. Update all profiles to point to the correct company
-- UPDATE profiles SET company_id = 'correct-company-id' WHERE company_id = 'duplicate-company-id';
-- 2. Update all employees to point to the correct company
-- UPDATE company_employees SET company_id = 'correct-company-id' WHERE company_id = 'duplicate-company-id';
-- 3. Update all invites to point to the correct company
-- UPDATE invites SET company_id = 'correct-company-id' WHERE company_id = 'duplicate-company-id';
-- 4. Delete the duplicate
-- DELETE FROM companies WHERE id = 'duplicate-company-id';

