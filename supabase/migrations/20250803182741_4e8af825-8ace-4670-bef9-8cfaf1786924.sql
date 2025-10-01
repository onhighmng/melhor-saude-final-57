-- Fix legacy companies missing IDs by creating proper company_organizations entries
-- for profile-based companies that don't have entries in the company_organizations table

-- First, let's identify all unique company names from profiles that don't exist in company_organizations
WITH profile_companies AS (
  SELECT DISTINCT company
  FROM profiles 
  WHERE company IS NOT NULL 
    AND company != ''
),
missing_companies AS (
  SELECT pc.company
  FROM profile_companies pc
  LEFT JOIN company_organizations co ON pc.company = co.company_name
  WHERE co.company_name IS NULL
)
-- Insert missing companies into company_organizations with proper structure
INSERT INTO company_organizations (
  id,
  company_name,
  contact_email,
  contact_phone,
  plan_type,
  total_employees,
  active_users,
  sessions_allocated,
  sessions_used,
  is_active,
  final_notes,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid() as id,
  mc.company as company_name,
  (
    SELECT email 
    FROM profiles 
    WHERE company = mc.company 
      AND role IN ('hr', 'admin') 
    LIMIT 1
  ) as contact_email,
  NULL as contact_phone,
  'basic' as plan_type,
  (
    SELECT COUNT(*) 
    FROM profiles 
    WHERE company = mc.company
  ) as total_employees,
  (
    SELECT COUNT(*) 
    FROM profiles 
    WHERE company = mc.company 
      AND is_active = true
  ) as active_users,
  0 as sessions_allocated,
  0 as sessions_used,
  true as is_active,
  'Automatically created from legacy profile-based company data' as final_notes,
  now() as created_at,
  now() as updated_at
FROM missing_companies mc;

-- Log the migration for audit purposes
INSERT INTO admin_actions (
  admin_user_id,
  action_type,
  target_type,
  details,
  metadata,
  created_at
) VALUES (
  (SELECT user_id FROM profiles WHERE role = 'admin' LIMIT 1),
  'migrate_legacy_companies',
  'company',
  jsonb_build_object(
    'description', 'Migrated profile-based companies to proper company_organizations entries',
    'companies_migrated', (
      SELECT COUNT(*)
      FROM profiles p
      WHERE p.company IS NOT NULL 
        AND p.company != ''
        AND NOT EXISTS (
          SELECT 1 FROM company_organizations co 
          WHERE co.company_name = p.company
        )
    )
  ),
  jsonb_build_object('migration_type', 'legacy_company_fix'),
  now()
);