-- =====================================================
-- AFTER RUNNING ALL FIXES, TEST LIKE THIS:
-- =====================================================

-- Step 1: Generate a specialist code manually
INSERT INTO invites (
  invite_code,
  role,
  company_id,
  status,
  expires_at,
  created_at
) VALUES (
  upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8)),
  'especialista_geral',
  NULL,
  'pending',
  now() + interval '30 days',
  now()
)
RETURNING invite_code;

-- Copy the invite_code above and use it to register!

-- Step 2: Check what code you got
SELECT 
  invite_code,
  role,
  status,
  company_id IS NULL as no_company
FROM invites
ORDER BY created_at DESC
LIMIT 1;

-- Step 3: Test prestador code too
INSERT INTO invites (
  invite_code,
  role,
  company_id,
  status,
  expires_at,
  created_at
) VALUES (
  upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8)),
  'prestador',
  NULL,
  'pending',
  now() + interval '30 days',
  now()
)
RETURNING invite_code;

