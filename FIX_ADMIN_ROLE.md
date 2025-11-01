# Fix Admin Account Role Assignment

## The Problem

When you log in with an admin account, the RPC `get_user_primary_role()` is returning 'user' instead of 'admin'. This happens because:

1. The RPC looks for roles in the `user_roles` table
2. If no role is found, it defaults to 'user'
3. So admin gets routed to `/user/dashboard` instead of `/admin/dashboard`

## The Solution

Assign the 'admin' role to your admin user account in the `user_roles` table.

### Step 1: Get Your Admin User ID

In Supabase SQL Editor, run:

```sql
-- Find your admin user
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;
```

This will show you all users with their IDs. Find the one with the admin email.

### Step 2: Create Profile (if it doesn't exist)

```sql
-- Replace 'USER_ID_HERE' with the actual UUID from Step 1
-- Replace 'admin@example.com' with the actual admin email

INSERT INTO profiles (id, email, full_name, is_active)
VALUES (
  'USER_ID_HERE',
  'admin@example.com',
  'Admin User',
  true
)
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;
```

### Step 3: Assign Admin Role

```sql
-- Replace 'USER_ID_HERE' with the actual UUID

INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 4: Verify

```sql
-- Check that the role is assigned
SELECT 
  u.email,
  ur.role,
  p.full_name
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN profiles p ON u.id = p.id
WHERE ur.role = 'admin';
```

Should show your admin user with 'admin' role.

### Step 5: Test Login

1. Hard refresh browser: Ctrl+Shift+R
2. Log in with admin account
3. Should redirect to `/admin/dashboard` ✅

---

## Quick SQL Script (All in One)

Replace `'YOUR_ADMIN_EMAIL@example.com'` with your actual admin email:

```sql
-- Get user ID and assign admin role
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Find admin user
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'YOUR_ADMIN_EMAIL@example.com'
  LIMIT 1;
  
  -- Create profile if needed
  INSERT INTO profiles (id, email, full_name, is_active)
  VALUES (admin_user_id, 'YOUR_ADMIN_EMAIL@example.com', 'Admin User', true)
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;
  
  -- Assign admin role
  INSERT INTO user_roles (user_id, role)
  VALUES (admin_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Admin role assigned to user: %', admin_user_id;
END $$;
```

---

## For Other Roles Too

Repeat for HR, Prestador, etc.:

```sql
-- HR user
INSERT INTO user_roles (user_id, role)
SELECT id, 'hr' FROM auth.users WHERE email = 'hr@example.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Prestador user  
INSERT INTO user_roles (user_id, role)
SELECT id, 'prestador' FROM auth.users WHERE email = 'prestador@example.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Regular user (already defaults to 'user' if no role found)
```

---

## Why This Happens

The code architecture uses `user_roles` table for role management (allows multiple roles per user in the future). When you create a user account:

1. Auth user is created ✅
2. Profile might be created ✅
3. **But role is NOT automatically assigned** ❌

You need to manually assign roles in the `user_roles` table.

