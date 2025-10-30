# Final Fix Checklist - Follow Exactly

## ✅ Step 1: Fix Database (MUST DO FIRST)

Open **Supabase Dashboard** → **SQL Editor**

Copy and paste this entire script, then click **Run**:

```sql
-- Clean up old broken codes
DELETE FROM invites WHERE role IS NULL;

-- Add missing columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invites' AND column_name = 'role') THEN
    ALTER TABLE invites ADD COLUMN role TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invites' AND column_name = 'metadata') THEN
    ALTER TABLE invites ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
  ALTER TABLE invites ALTER COLUMN company_id DROP NOT NULL;
  ALTER TABLE invites ALTER COLUMN email DROP NOT NULL;
END $$;

-- Update constraints
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_role_check;
ALTER TABLE invites ADD CONSTRAINT invites_role_check 
  CHECK (role IN ('user', 'hr', 'prestador', 'especialista_geral'));

-- Drop old functions
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB, INTEGER);
DROP FUNCTION IF EXISTS validate_access_code(TEXT);

-- Create generate function
CREATE FUNCTION generate_access_code(
  p_user_type TEXT,
  p_company_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_expires_days INTEGER DEFAULT 30
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_role TEXT;
BEGIN
  v_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
  
  CASE p_user_type
    WHEN 'hr' THEN v_role := 'hr';
    WHEN 'employee' THEN v_role := 'user';
    WHEN 'prestador' THEN v_role := 'prestador';
    WHEN 'specialist' THEN v_role := 'especialista_geral';
    ELSE RAISE EXCEPTION 'Invalid: %', p_user_type;
  END CASE;
  
  INSERT INTO invites (invite_code, role, company_id, metadata, expires_at, status, created_at)
  VALUES (v_code, v_role, p_company_id, p_metadata, now() + (p_expires_days || ' days')::interval, 'pending', now());
  
  RETURN v_code;
END;
$$;

-- Create validate function (returns user_type for frontend!)
CREATE FUNCTION validate_access_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  user_type TEXT,
  role TEXT,
  company_id UUID,
  company_name TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    CASE i.role
      WHEN 'hr' THEN 'hr'::TEXT
      WHEN 'user' THEN 'user'::TEXT
      WHEN 'prestador' THEN 'prestador'::TEXT
      WHEN 'especialista_geral' THEN 'specialist'::TEXT
      ELSE 'user'::TEXT
    END as user_type,
    i.role,
    i.company_id,
    c.company_name,
    i.expires_at,
    i.metadata,
    (i.status = 'pending' AND i.expires_at > now())::BOOLEAN as is_valid
  FROM invites i
  LEFT JOIN companies c ON i.company_id = c.id
  WHERE i.invite_code = p_code;
END;
$$;
```

**STOP** - Don't continue until you've run this SQL and it completes without errors.

---

## ✅ Step 2: Clear Browser Cache

1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Select "All time"
4. Click "Clear data"
5. **Close ALL browser windows**
6. Wait 5 seconds

---

## ✅ Step 3: Test Fresh

1. Open **NEW** browser window
2. Go to: `http://localhost:8080/`
3. Login as admin
4. Go to **Admin** → **User Management** → **Affiliates**

### Generate Prestador Code:
1. Click "Gerar Prestador"
2. Copy the code shown
3. Open new incognito window
4. Go to: `http://localhost:8080/register`
5. Enter the code
6. Should show **Prestador** registration form (NOT company!)
7. Fill it in and create account
8. Should redirect to `/prestador/dashboard`

### Generate Specialist Code:
1. Back in admin panel
2. Click "Gerar Profesional de Permanencia"  
3. Copy the code
4. Repeat registration test
5. Should show **Specialist** registration form
6. Should redirect to `/especialista/dashboard`

---

## ❌ If Step 1 SQL Fails

Send me the EXACT error message and I'll fix it immediately.

## ❌ If Registration Still Shows Company Form

Run this in SQL Editor and send me the result:
```sql
SELECT * FROM validate_access_code('YOUR_CODE_HERE');
```
Replace `YOUR_CODE_HERE` with the actual code you generated.

---

## 📊 Verification Query

After Step 1, run this to confirm:
```sql
SELECT 
  invite_code,
  role as db_role,
  CASE role
    WHEN 'prestador' THEN 'CORRECT: prestador'
    WHEN 'especialista_geral' THEN 'CORRECT: specialist'
    WHEN 'hr' THEN 'CORRECT: hr'
    ELSE 'WRONG: ' || COALESCE(role, 'NULL')
  END as status
FROM invites
WHERE role IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

All should say "CORRECT".

