# How to Apply the Auto-Promotion Migration

## Quick Start

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

2. **Copy and Paste the Migration**
   - Open the file: `supabase/migrations/20251102_auto_promote_users_by_invite_code.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

3. **Run the Migration**
   - Click "Run" or press `Cmd/Ctrl + Enter`
   - Wait for "Success" message

4. **Verify Installation**
   
   Run this query to verify the trigger was created:
   
   ```sql
   SELECT 
     trigger_name,
     event_manipulation,
     event_object_table
   FROM information_schema.triggers
   WHERE trigger_name = 'trigger_auto_promote_user_from_invite';
   ```
   
   **Expected Result:** One row showing the trigger exists.

5. **Test the Function**
   
   Run this query to verify the function works:
   
   ```sql
   SELECT validate_access_code('TEST-CODE');
   ```
   
   **Expected Result:** Returns columns including `role` field.

### Option 2: Using Supabase CLI

```bash
# 1. Navigate to project directory
cd /Users/anapaula/Documents/GitHub/melhor-saude-final-57

# 2. Make sure you're logged in to Supabase
supabase login

# 3. Link your project (if not already linked)
supabase link --project-ref <your-project-ref>

# 4. Push the migration
supabase db push

# 5. Verify it worked
supabase db diff
```

## Verification Steps

After applying the migration, verify everything works:

### 1. Check Functions Exist

```sql
-- List all custom functions related to promotion
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (
    routine_name LIKE '%promote%' OR
    routine_name LIKE '%validate_access_code%'
  )
ORDER BY routine_name;
```

**Expected Results:**
- `auto_promote_user_from_invite` (function)
- `promote_user_from_code` (function)
- `validate_access_code` (function)

### 2. Check Trigger Exists

```sql
-- Verify the trigger is installed
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'invites'
ORDER BY trigger_name;
```

**Expected Result:** 
- `trigger_auto_promote_user_from_invite` on `invites` table (AFTER UPDATE)

### 3. Test with a Sample Code

```sql
-- Generate a test code
SELECT * FROM generate_access_code(
  'hr',           -- user_type
  NULL,           -- company_id (optional)
  '{}'::jsonb,    -- metadata
  30              -- expires in 30 days
);

-- Note the generated code, e.g., 'MS-A1B2'

-- Validate the code
SELECT * FROM validate_access_code('MS-A1B2');  -- Use your actual code
```

**Expected Result:** Should return:
- `user_type`: 'hr'
- `role`: 'hr'
- `status`: 'pending'
- `expires_at`: (future date)

## Testing Auto-Promotion End-to-End

### Test Scenario: HR Registration

1. **Generate HR Code**
   ```sql
   SELECT * FROM generate_access_code('hr', NULL, '{}'::jsonb, 30);
   ```
   Note the code (e.g., `MS-ABCD`)

2. **Register a New User**
   - Go to your app's registration page
   - Enter the code `MS-ABCD`
   - Fill in the form with:
     - Email: `hr.test@example.com`
     - Password: `TestPass123!`
     - Name: `HR Test User`
     - Company info
   - Submit

3. **Verify Auto-Promotion**
   ```sql
   -- Check if user was promoted
   SELECT 
     u.email,
     p.role as profile_role,
     STRING_AGG(ur.role, ', ') as user_roles,
     u.created_at,
     i.status as invite_status,
     i.accepted_at
   FROM auth.users u
   LEFT JOIN profiles p ON p.id = u.id
   LEFT JOIN user_roles ur ON ur.user_id = u.id
   LEFT JOIN invites i ON i.email = u.email
   WHERE u.email = 'hr.test@example.com'
   GROUP BY u.id, u.email, p.role, u.created_at, i.status, i.accepted_at;
   ```

   **Expected Results:**
   - ✅ `profile_role` = `'hr'`
   - ✅ `user_roles` = `'hr'`
   - ✅ `invite_status` = `'accepted'`
   - ✅ `accepted_at` is set

4. **Verify Company Link**
   ```sql
   SELECT 
     ce.user_id,
     ce.company_id,
     ce.sessions_quota,
     ce.status,
     c.company_name
   FROM company_employees ce
   JOIN companies c ON c.id = ce.company_id
   JOIN auth.users u ON u.id = ce.user_id
   WHERE u.email = 'hr.test@example.com';
   ```

   **Expected Results:**
   - ✅ Record exists
   - ✅ `sessions_quota` = 100
   - ✅ `status` = 'active'

### Test Scenario: Prestador (Affiliate) Registration

1. **Generate Prestador Code**
   ```sql
   SELECT * FROM generate_access_code('prestador', NULL, '{}'::jsonb, 30);
   ```
   Note the code

2. **Register a New Prestador**
   - Use the registration flow
   - Email: `prestador.test@example.com`

3. **Verify Prestador Setup**
   ```sql
   SELECT 
     u.email,
     ur.role,
     pr.id as prestador_id,
     pr.is_active,
     pr.is_approved,
     pr.specialty
   FROM auth.users u
   JOIN user_roles ur ON ur.user_id = u.id
   LEFT JOIN prestadores pr ON pr.user_id = u.id
   WHERE u.email = 'prestador.test@example.com';
   ```

   **Expected Results:**
   - ✅ `role` = `'prestador'`
   - ✅ `prestador_id` is set (record created)
   - ✅ `is_active` = `true`
   - ✅ `is_approved` = `true`

### Test Scenario: Specialist Registration

1. **Generate Specialist Code**
   ```sql
   SELECT * FROM generate_access_code('specialist', NULL, '{}'::jsonb, 30);
   ```
   Note the code

2. **Register a New Specialist**
   - Use the registration flow
   - Email: `specialist.test@example.com`

3. **Verify Specialist Setup**
   ```sql
   SELECT 
     u.email,
     ur.role,
     pr.id as prestador_id,
     pr.specialty,
     pr.is_active
   FROM auth.users u
   JOIN user_roles ur ON ur.user_id = u.id
   LEFT JOIN prestadores pr ON pr.user_id = u.id
   WHERE u.email = 'specialist.test@example.com';
   ```

   **Expected Results:**
   - ✅ `role` = `'especialista_geral'` (NOT 'specialist')
   - ✅ `prestador_id` is set
   - ✅ `specialty` = `'Especialista Geral'`
   - ✅ `is_active` = `true`

## Rollback (If Needed)

If you need to rollback the migration:

```sql
-- Drop the trigger
DROP TRIGGER IF EXISTS trigger_auto_promote_user_from_invite ON invites;

-- Drop the functions
DROP FUNCTION IF EXISTS auto_promote_user_from_invite();
DROP FUNCTION IF EXISTS promote_user_from_code(UUID, TEXT);

-- Revert validate_access_code to old version (without role)
-- (Copy the old version from previous migration if needed)
```

## Common Issues

### Issue: "Function already exists"

**Solution:** The function was already created. You can either:
1. Drop it first: `DROP FUNCTION IF EXISTS auto_promote_user_from_invite();`
2. Or use `CREATE OR REPLACE FUNCTION` (already in the migration)

### Issue: "Trigger already exists"

**Solution:** 
```sql
DROP TRIGGER IF EXISTS trigger_auto_promote_user_from_invite ON invites;
```
Then re-run the migration.

### Issue: "Column 'role' does not exist in invites table"

**Solution:** Apply the prerequisite migration first:
```sql
-- This should have been applied earlier
ALTER TABLE invites ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE invites ADD CONSTRAINT invites_role_check 
  CHECK (role IN ('user', 'hr', 'prestador', 'especialista_geral'));
```

## Next Steps After Migration

1. ✅ **Test each user type** (HR, Prestador, Specialist, Employee)
2. ✅ **Verify roles are assigned correctly**
3. ✅ **Check that related records are created** (company links, prestador records, etc.)
4. ✅ **Test the manual promotion function** as a backup
5. ✅ **Monitor the first few real registrations** to ensure everything works

## Summary

After applying this migration, your platform will:

- ✅ **Automatically promote users** based on their access code
- ✅ **Use the correct database roles** (no more mismatches!)
- ✅ **Create all necessary related records** (company links, prestador records)
- ✅ **Work seamlessly** with both database triggers and frontend logic
- ✅ **Provide manual promotion** as a fallback option

**No more role mismatches! No more manual fixes!** 🎉





