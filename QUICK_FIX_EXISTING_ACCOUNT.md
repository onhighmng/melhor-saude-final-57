# Quick Fix for Your Existing Prestador Account

## The Problem
Your account was created **before** the code fix, so it has 'user' role instead of 'prestador' role in the database.

## Quick Solution (Choose One)

### Option 1: Use Supabase Dashboard (Easiest)

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Click "SQL Editor" in the left menu

2. **Run this SQL** (replace the email):
```sql
-- Replace 'your-prestador@email.com' with your actual email
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'your-prestador@email.com'; -- ⚠️ CHANGE THIS
BEGIN
  SELECT id INTO v_user_id FROM profiles WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', v_email;
  END IF;
  
  -- Remove wrong 'user' role
  DELETE FROM user_roles WHERE user_id = v_user_id AND role = 'user';
  
  -- Add correct 'prestador' role
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'prestador')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Update profile
  UPDATE profiles SET role = 'prestador' WHERE id = v_user_id;
  
  RAISE NOTICE '✅ Fixed! User % now has prestador role', v_email;
END $$;
```

3. **Click "Run"**
4. **Look for** `✅ Fixed!` message
5. **Logout and login again** to test

### Option 2: Fix ALL Prestador Accounts at Once

If you have multiple prestador accounts with wrong roles:

```sql
-- This fixes ALL prestadores automatically
DO $$
DECLARE
  v_user RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_user IN
    SELECT DISTINCT p.id, p.email
    FROM profiles p
    INNER JOIN prestadores pr ON pr.user_id = p.id
    WHERE NOT EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = p.id AND ur.role = 'prestador'
    )
  LOOP
    DELETE FROM user_roles WHERE user_id = v_user.id AND role = 'user';
    INSERT INTO user_roles (user_id, role) VALUES (v_user.id, 'prestador') ON CONFLICT DO NOTHING;
    UPDATE profiles SET role = 'prestador' WHERE id = v_user.id;
    v_count := v_count + 1;
    RAISE NOTICE '✅ Fixed: %', v_user.email;
  END LOOP;
  RAISE NOTICE 'Total fixed: %', v_count;
END $$;
```

## Verify It Worked

Run this to check:
```sql
-- Replace with your email
SELECT 
  p.email,
  p.name,
  ARRAY_AGG(ur.role) as roles,
  get_user_primary_role(p.id) as primary_role
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE p.email = 'your-prestador@email.com' -- ⚠️ CHANGE THIS
GROUP BY p.id, p.email, p.name;
```

**Expected result:**
- `roles`: `{prestador}` (NOT `{user}`)
- `primary_role`: `prestador`

## Test the Fix

1. **Logout** completely from the application
2. **Clear browser cache** (or open incognito/private window)
3. **Login** with your prestador credentials
4. **✅ You should go to** `/prestador/dashboard`

## If It Still Doesn't Work

Check browser console for these logs:
```
[Login] Role fetched: prestador
[Login] Redirecting to: /prestador/dashboard
```

If it says `user` instead of `prestador`, the SQL didn't run correctly or you need to logout/login again.

## Prevention

All **NEW** prestador accounts created from now on will automatically have the correct role thanks to the code fix. Only existing accounts need this SQL fix.

