# 🚨 Fix: "Limite atingido - O seu plano permite 0 colaboradores"

## Problem

You're seeing this error because:
1. ❌ No company exists in the database, OR
2. ❌ Your company has `employee_seats = 0`

## ✅ Quick Fix (3 Steps)

### Step 1: Sign Up / Login

First, you need a user account:

1. Go to: `http://localhost:8080/signup`
2. Sign up with email and password
3. Verify email (check console in local dev)
4. Login at: `http://localhost:8080/login`

### Step 2: Run This SQL

I already created a company for you! Now link your account to it.

**Go to Supabase Dashboard → SQL Editor → New Query → Paste this:**

```sql
-- Replace 'your@email.com' with YOUR actual email
DO $$
DECLARE
  v_company_id UUID;
  v_user_id UUID;
BEGIN
  -- Get the test company
  SELECT id INTO v_company_id
  FROM companies 
  WHERE name = 'Test Company'
  LIMIT 1;

  -- Get YOUR user
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'your@email.com'  -- ⚠️ CHANGE THIS TO YOUR EMAIL
  LIMIT 1;

  -- Check if user exists
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found! Sign up first at /signup';
  END IF;

  -- Update/Create profile as HR
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
    company_id = v_company_id;

  -- Add HR role
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'hr')
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE 'Success! User % is now HR for company %', v_user_id, v_company_id;
END $$;
```

### Step 3: Refresh the Page

1. Logout and login again
2. Go to: `http://localhost:8080/company/colaboradores`
3. You should now see: **"50 Lugares para Colaboradores"** ✅

---

## Verify It Worked

Run this to check:

```sql
-- Check your setup
SELECT 
  p.email as "Your Email",
  p.role as "Your Role",
  c.name as "Company Name",
  c.employee_seats as "Seats Allowed",
  p.company_id IS NOT NULL as "Linked to Company"
FROM profiles p
LEFT JOIN companies c ON c.id = p.company_id
WHERE p.email = 'your@email.com';  -- Change to your email
```

Expected result:
```
Your Email         | Your Role | Company Name   | Seats Allowed | Linked to Company
your@email.com     | hr        | Test Company   | 50            | true
```

---

## Alternative: Manual Database Check

If the SQL doesn't work, check each step:

### 1. Check if company exists:
```sql
SELECT id, name, employee_seats 
FROM companies;
```

### 2. Check if your user exists:
```sql
SELECT id, email 
FROM auth.users 
WHERE email = 'your@email.com';
```

### 3. Check your profile:
```sql
SELECT id, email, role, company_id 
FROM profiles 
WHERE email = 'your@email.com';
```

### 4. Manually link them:
```sql
-- Get IDs first
SELECT 
  (SELECT id FROM companies LIMIT 1) as company_id,
  (SELECT id FROM auth.users WHERE email = 'your@email.com') as user_id;

-- Then update (use the IDs from above)
UPDATE profiles 
SET 
  role = 'hr',
  company_id = 'COMPANY-ID-HERE'
WHERE id = 'USER-ID-HERE';
```

---

## Still Not Working?

### Option A: Create New Company for Your User

```sql
-- 1. Create company
INSERT INTO companies (
  name,
  email,
  employee_seats,
  sessions_allocated,
  is_active
) VALUES (
  'My Company',
  'yourcompany@email.com',
  50,
  200,
  true
)
RETURNING id;

-- 2. Link to your profile (use ID from above)
UPDATE profiles 
SET 
  role = 'hr',
  company_id = 'COMPANY-ID-FROM-ABOVE'
WHERE email = 'your@email.com';
```

### Option B: Reset Everything

If you want to start fresh:

```sql
-- ⚠️ WARNING: This deletes everything!
TRUNCATE companies CASCADE;
TRUNCATE profiles CASCADE;
TRUNCATE user_roles CASCADE;
TRUNCATE invites CASCADE;

-- Then run the setup again
```

---

## Summary

**The error happens because:**
- Your profile is not linked to any company, OR
- The company has 0 employee_seats

**The fix:**
1. ✅ I created a test company (50 seats)
2. ✅ You need to link your user account to it
3. ✅ Set your role to 'hr'
4. ✅ Refresh the page

**After fixing, you'll see:**
```
Plano de Subscrição
50 Lugares para Colaboradores

Ativos: 0
Pendentes: 0
Disponíveis: 50 ✅
```

---

Need more help? Check:
- `SETUP_TEST_HR_COMPANY.sql` - Full setup guide
- `COMPANY_SUBSCRIPTION_PACKAGES_GUIDE.md` - How the system works

