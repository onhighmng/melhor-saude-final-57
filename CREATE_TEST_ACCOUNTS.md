# Create Test Accounts for All Roles

## Problem

The RPC now looks for roles in the `user_roles` table (which the code expects). To test all user types, you need accounts with different roles.

## Solution

Run these SQL queries in your Supabase SQL Editor to create test accounts:

### 1. Create Test Users and Profiles

```sql
-- Create 5 test auth users (in Supabase auth system)
-- You'll need to do this through the Supabase dashboard or API
-- For now, just manually create accounts through the app with:
-- - admin@test.com / password123
-- - hr@test.com / password123
-- - prestador@test.com / password123
-- - specialist@test.com / password123
-- - user@test.com / password123
```

### 2. After Creating Auth Accounts, Run This SQL

Get the user IDs from your auth.users table, then run:

```sql
-- Replace these UUIDs with your actual user IDs from auth.users table
-- You can find them by running: SELECT id, email FROM auth.users;

-- For this example, assuming you have users with these emails:
-- Get the IDs first:
SELECT id, email FROM auth.users;

-- Then insert profiles (replace UUID values):
INSERT INTO profiles (id, email, name, is_active) VALUES
('UUID-for-admin@test.com', 'admin@test.com', 'Admin User', true),
('UUID-for-hr@test.com', 'hr@test.com', 'HR User', true),
('UUID-for-prestador@test.com', 'prestador@test.com', 'Prestador User', true),
('UUID-for-specialist@test.com', 'specialist@test.com', 'Specialist User', true),
('UUID-for-user@test.com', 'user@test.com', 'Regular User', true);

-- Assign roles to users (using actual UUIDs):
INSERT INTO user_roles (user_id, role) VALUES
('UUID-for-admin@test.com', 'admin'),
('UUID-for-hr@test.com', 'hr'),
('UUID-for-prestador@test.com', 'prestador'),
('UUID-for-specialist@test.com', 'especialista_geral'),  -- Database uses Portuguese name
('UUID-for-user@test.com', 'user');
```

### 3. Verify

After creating accounts, verify they work:

```sql
SELECT u.email, ur.role FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
JOIN auth.users u ON p.id = u.id;
```

Should show all 5 users with their respective roles.

## Then Test

1. Hard refresh browser
2. Log in with each account
3. Each should redirect to their correct dashboard:
   - admin → /admin/dashboard
   - hr → /company/dashboard
   - prestador → /prestador/dashboard
   - specialist → /especialista/dashboard
   - user → /user/dashboard

## Why This Was The Issue

The code uses a `user_roles` table to store roles (this is common architecture for flexible RBAC). But test accounts didn't exist with roles assigned, so the RPC would return null → default to 'user' role for all users.

Now specialist is probably working because that's the account that actually existed with `role='especialista_geral'` in the profiles table.

