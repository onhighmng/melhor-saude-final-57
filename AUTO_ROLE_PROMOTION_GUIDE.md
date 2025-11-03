# Automatic User Role Promotion System

## Overview

This system automatically promotes users to the correct role when they register using an access code. The role promotion happens **automatically** based on the type of code they use.

## How It Works

### 1. **Code Types and Role Mapping**

When an admin generates an access code, the system stores the correct role in the `invites` table:

| Code Type | User Type | Database Role | Description |
|-----------|-----------|---------------|-------------|
| HR Code | `hr` | `hr` | Company HR administrators |
| Affiliate Code | `prestador` | `prestador` | Service providers/affiliates |
| Specialist Code | `specialist` | `especialista_geral` | Professional specialists |
| Employee Code | `user` | `user` | Company employees |
| Personal Code | `personal` | `user` | Individual users |

### 2. **Automatic Promotion Process**

The system promotes users through **two mechanisms** working together:

#### **A. Database Trigger (Primary Method)**

When a user registers and the invite status changes from `pending` to `accepted`, a PostgreSQL trigger automatically:

1. ✅ Reads the `role` field from the `invites` table
2. ✅ Inserts the role into the `user_roles` table
3. ✅ Updates the `profiles` table with the role
4. ✅ Creates necessary related records (company links, prestador records, etc.)
5. ✅ Links users to companies if applicable

**Trigger Location:** `supabase/migrations/20251102_auto_promote_users_by_invite_code.sql`

#### **B. Frontend Role Assignment (Backup Method)**

The registration helper also explicitly assigns the role from the invite:

1. ✅ Fetches the invite details including the `role` field
2. ✅ Uses the `assignUserRoleFromInvite()` function
3. ✅ Directly inserts the role into `user_roles` table

**Code Location:** `src/utils/registrationHelpers.ts` (lines 89-136)

### 3. **Database Schema Verification**

Before implementation, the following was verified:

```sql
-- Profiles table roles
CHECK (role IN ('user', 'admin', 'hr', 'prestador', 'especialista_geral'))

-- User_roles table roles  
CHECK (role IN ('user', 'admin', 'hr', 'prestador', 'specialist', 'especialista_geral'))

-- Invites table roles
CHECK (role IN ('user', 'hr', 'prestador', 'especialista_geral'))
```

**Note:** The system uses `'especialista_geral'` in the database (Portuguese), not `'specialist'`.

## Testing the Auto-Promotion

### Step 1: Apply the Migration

```bash
# Navigate to your project
cd /Users/anapaula/Documents/GitHub/melhor-saude-final-57

# Apply the migration through Supabase
# Option A: Use Supabase CLI
supabase db push

# Option B: Copy and paste the SQL into Supabase SQL Editor
# File: supabase/migrations/20251102_auto_promote_users_by_invite_code.sql
```

### Step 2: Generate Test Access Codes

Run these queries in the Supabase SQL Editor to generate test codes:

```sql
-- 1. Generate an HR code
SELECT * FROM generate_access_code('hr', NULL, '{}'::jsonb, 30);

-- 2. Generate a Prestador (Affiliate) code
SELECT * FROM generate_access_code('prestador', NULL, '{}'::jsonb, 30);

-- 3. Generate a Specialist code
SELECT * FROM generate_access_code('specialist', NULL, '{}'::jsonb, 30);

-- 4. Generate an Employee code (needs company_id)
-- First get a company_id:
SELECT id FROM companies LIMIT 1;

-- Then generate code (replace <company_id> with actual UUID):
SELECT * FROM generate_access_code('user', '<company_id>', '{}'::jsonb, 30);
```

### Step 3: Test Each User Type

For **each** code type, perform these steps:

1. **Start Registration Flow**
   - Go to the registration page
   - Enter the access code
   - Fill in the registration form

2. **Complete Registration**
   - Submit the form
   - Wait for the user to be created

3. **Verify Auto-Promotion**
   
   Run this query in Supabase SQL Editor:
   
   ```sql
   -- Check user was promoted correctly
   SELECT 
     u.email,
     p.role as profile_role,
     STRING_AGG(ur.role, ', ') as user_roles,
     u.created_at
   FROM auth.users u
   LEFT JOIN profiles p ON p.id = u.id
   LEFT JOIN user_roles ur ON ur.user_id = u.id
   WHERE u.email = 'test@example.com'  -- Replace with test email
   GROUP BY u.id, u.email, p.role, u.created_at;
   ```

### Step 4: Verify Each Role Type

#### ✅ HR User Verification

```sql
SELECT 
  u.email,
  ur.role,
  p.company_id,
  ce.company_id as linked_company,
  ce.sessions_quota
FROM auth.users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN profiles p ON p.id = u.id
LEFT JOIN company_employees ce ON ce.user_id = u.id
WHERE u.email = 'hr@test.com'  -- Your test HR email
  AND ur.role = 'hr';
```

**Expected Results:**
- ✅ `ur.role` = `'hr'`
- ✅ `p.company_id` is set (or created)
- ✅ `ce.company_id` is set (linked to company)
- ✅ `ce.sessions_quota` = 100

#### ✅ Prestador (Affiliate) Verification

```sql
SELECT 
  u.email,
  ur.role,
  pr.id as prestador_id,
  pr.is_active,
  pr.is_approved
FROM auth.users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN profiles p ON p.id = u.id
LEFT JOIN prestadores pr ON pr.user_id = u.id
WHERE u.email = 'prestador@test.com'  -- Your test prestador email
  AND ur.role = 'prestador';
```

**Expected Results:**
- ✅ `ur.role` = `'prestador'`
- ✅ `pr.id` is set (prestador record created)
- ✅ `pr.is_active` = `true`
- ✅ `pr.is_approved` = `true`

#### ✅ Specialist Verification

```sql
SELECT 
  u.email,
  ur.role,
  pr.id as prestador_id,
  pr.specialty,
  sa.id as assignment_id,
  sa.company_id,
  sa.pillars
FROM auth.users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN profiles p ON p.id = u.id
LEFT JOIN prestadores pr ON pr.user_id = u.id
LEFT JOIN specialist_assignments sa ON sa.specialist_id = u.id
WHERE u.email = 'specialist@test.com'  -- Your test specialist email
  AND ur.role = 'especialista_geral';
```

**Expected Results:**
- ✅ `ur.role` = `'especialista_geral'`
- ✅ `pr.id` is set (prestador record created)
- ✅ `pr.specialty` = `'Especialista Geral'`
- ✅ If company_id was provided: `sa.id` is set (specialist assignment created)

#### ✅ Employee User Verification

```sql
SELECT 
  u.email,
  ur.role,
  p.company_id,
  ce.company_id as linked_company,
  ce.sessions_quota
FROM auth.users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN profiles p ON p.id = u.id
LEFT JOIN company_employees ce ON ce.user_id = u.id
WHERE u.email = 'employee@test.com'  -- Your test employee email
  AND ur.role = 'user';
```

**Expected Results:**
- ✅ `ur.role` = `'user'`
- ✅ `p.company_id` is set
- ✅ `ce.company_id` is set (linked to company)
- ✅ `ce.sessions_quota` = 10 (default for employees)

## Manual Promotion (If Needed)

If the automatic promotion fails for any reason, admins can manually promote users:

```sql
-- Manual promotion function
SELECT promote_user_from_code(
  '<user_id>'::UUID,      -- The user's UUID
  'MS-XXXX'              -- The invite code they used
);
```

## Troubleshooting

### Issue: User Not Promoted

**Check 1: Verify the invite was marked as accepted**

```sql
SELECT 
  invite_code,
  email,
  role,
  status,
  accepted_at
FROM invites
WHERE invite_code = 'MS-XXXX'  -- Replace with actual code
```

If `status` is still `'pending'`, the trigger didn't fire.

**Check 2: Verify the user exists**

```sql
SELECT id, email, created_at
FROM auth.users
WHERE email = 'test@example.com'  -- Replace with test email
```

**Check 3: Check trigger logs**

```sql
-- Check if there are any errors in the database logs
-- (This requires database admin access)
```

**Fix: Manual promotion**

```sql
-- Manually promote the user
INSERT INTO user_roles (user_id, role)
VALUES ('<user_id>', 'hr')  -- Replace with correct role
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE profiles
SET role = 'hr'  -- Replace with correct role
WHERE id = '<user_id>';
```

### Issue: Wrong Role Assigned

**Check the invite role:**

```sql
SELECT invite_code, user_type, role
FROM invites
WHERE invite_code = 'MS-XXXX';
```

If the `role` column is wrong, the code was generated incorrectly.

**Fix:**

```sql
-- Update the invite role
UPDATE invites
SET role = 'hr'  -- Correct role
WHERE invite_code = 'MS-XXXX';

-- Then manually promote the user
UPDATE profiles SET role = 'hr' WHERE id = '<user_id>';
INSERT INTO user_roles (user_id, role) VALUES ('<user_id>', 'hr')
ON CONFLICT DO NOTHING;
```

### Issue: Database Trigger Not Working

**Check if trigger exists:**

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_promote_user_from_invite';
```

If no results, re-apply the migration.

## Key Files Modified

1. ✅ **Migration File**: `supabase/migrations/20251102_auto_promote_users_by_invite_code.sql`
   - Creates the auto-promotion trigger
   - Updates `validate_access_code` to return role
   - Creates manual promotion function

2. ✅ **Registration Helper**: `src/utils/registrationHelpers.ts`
   - Uses `roleFromInvite` instead of hardcoded mapping
   - Calls `assignUserRoleFromInvite()` with actual database role
   - Updates `markCodeAsUsed()` to include email for trigger

3. ✅ **Fixed Role Mapping**: 
   - Changed `'specialist' → 'specialist'` (WRONG)
   - To `'specialist' → 'especialista_geral'` (CORRECT)

## Summary

The auto-promotion system now:

1. ✅ **Correctly maps roles** from invite codes to database roles
2. ✅ **Uses database triggers** for automatic promotion (primary)
3. ✅ **Uses frontend logic** for role assignment (backup)
4. ✅ **Verifies database schema** before making changes
5. ✅ **Includes manual promotion** as fallback option
6. ✅ **Links users to companies** automatically
7. ✅ **Creates related records** (prestadores, specialist_assignments)

**No more mismatching database information!** 🎉

The system will now automatically promote users to:
- **HR role** → when using HR codes
- **Prestador role** → when using affiliate codes  
- **Especialista_geral role** → when using specialist codes
- **User role** → when using employee/personal codes



