-- ============================================================================
-- FIX HR COMPANY LINK - Link HR users to their companies
-- ============================================================================
-- Problem: HR users showing "Modo HR sem empresa" because they don't have
--          company_id set in their profiles table
-- Solution: Link HR users to their companies based on email matching
-- ============================================================================

-- Step 1: Find HR users without company_id
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM profiles
  WHERE role = 'hr' 
    AND (company_id IS NULL OR company_id = '');
  
  RAISE NOTICE 'Found % HR users without company_id', v_count;
END $$;

-- Step 2: Update HR users to link them to their companies
-- Match by email: profiles.email = companies.email
UPDATE profiles p
SET 
  company_id = c.id,
  updated_at = NOW()
FROM companies c
WHERE 
  p.role = 'hr'
  AND (p.company_id IS NULL OR p.company_id = '')
  AND p.email = c.email;

-- Step 3: Verify the fix
DO $$
DECLARE
  v_fixed_count INTEGER;
  v_remaining INTEGER;
BEGIN
  -- Count how many were fixed
  SELECT COUNT(*) INTO v_fixed_count
  FROM profiles p
  JOIN companies c ON c.email = p.email
  WHERE p.role = 'hr' 
    AND p.company_id = c.id;
  
  -- Count remaining HR users without company
  SELECT COUNT(*) INTO v_remaining
  FROM profiles
  WHERE role = 'hr' 
    AND (company_id IS NULL OR company_id = '');
  
  RAISE NOTICE '✅ Fixed % HR users', v_fixed_count;
  RAISE NOTICE '⚠️ Remaining HR users without company: %', v_remaining;
  
  IF v_remaining > 0 THEN
    RAISE NOTICE 'These HR users need manual review:';
    FOR rec IN 
      SELECT email, name FROM profiles 
      WHERE role = 'hr' AND (company_id IS NULL OR company_id = '')
    LOOP
      RAISE NOTICE '  - % (%)' rec.name, rec.email;
    END LOOP;
  END IF;
END $$;

-- Step 4: Alternative approach - link by user_roles table
-- For HR users created via invite codes
UPDATE profiles p
SET 
  company_id = i.company_id,
  updated_at = NOW()
FROM invites i
WHERE 
  p.role = 'hr'
  AND (p.company_id IS NULL OR p.company_id = '')
  AND p.email = i.email
  AND i.role = 'hr'
  AND i.company_id IS NOT NULL
  AND i.status = 'accepted';

-- Step 5: Create a function to ensure HR always has company_id
CREATE OR REPLACE FUNCTION ensure_hr_has_company()
RETURNS TRIGGER AS $$
BEGIN
  -- If HR user being created/updated without company_id
  IF NEW.role = 'hr' AND (NEW.company_id IS NULL OR NEW.company_id = '') THEN
    -- Try to find company by email match
    SELECT id INTO NEW.company_id
    FROM companies
    WHERE email = NEW.email
    LIMIT 1;
    
    -- If found, log it
    IF NEW.company_id IS NOT NULL THEN
      RAISE NOTICE 'Auto-linked HR user % to company %', NEW.email, NEW.company_id;
    ELSE
      RAISE WARNING 'HR user % has no matching company!', NEW.email;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to auto-link HR to company
DROP TRIGGER IF EXISTS trigger_ensure_hr_company ON profiles;
CREATE TRIGGER trigger_ensure_hr_company
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.role = 'hr')
  EXECUTE FUNCTION ensure_hr_has_company();

-- Step 7: Final verification query
SELECT 
  p.id,
  p.email,
  p.name,
  p.role,
  p.company_id,
  c.name AS company_name,
  CASE 
    WHEN p.company_id IS NOT NULL THEN '✅ Linked'
    ELSE '❌ No Company'
  END AS status
FROM profiles p
LEFT JOIN companies c ON c.id = p.company_id
WHERE p.role = 'hr'
ORDER BY p.created_at DESC;

-- ============================================================================
-- SUCCESS CRITERIA:
-- ✅ All HR users should have company_id set
-- ✅ HR users can see their collaborators
-- ✅ Trigger prevents future HR users from missing company_id
-- ============================================================================

