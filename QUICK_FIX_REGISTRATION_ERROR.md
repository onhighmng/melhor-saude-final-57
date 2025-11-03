# Quick Fix: Registration Errors

## The Problem
You're getting errors when creating users with access codes, even though accounts are being created. The role is not being attached correctly.

## Most Likely Cause
The database `app_role` enum doesn't include all the roles we're trying to assign (`prestador`, `especialista_geral`, etc.)

---

## 🚀 Quick Fix (Do This First)

### Step 1: Add Missing Roles to Enum

Open **Supabase Dashboard** → **SQL Editor** → Paste and run:

```sql
-- Add missing roles to app_role enum
DO $$
BEGIN
  -- Add especialista_geral
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'especialista_geral'
    AND enumtypid = 'app_role'::regtype
  ) THEN
    ALTER TYPE app_role ADD VALUE 'especialista_geral';
    RAISE NOTICE '✅ Added especialista_geral';
  END IF;
  
  -- Verify prestador exists (should already be there)
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'prestador'
    AND enumtypid = 'app_role'::regtype
  ) THEN
    ALTER TYPE app_role ADD VALUE 'prestador';
    RAISE NOTICE '✅ Added prestador';
  END IF;
END $$;

-- Show all allowed roles
SELECT enumlabel as allowed_roles
FROM pg_enum
WHERE enumtypid = 'app_role'::regtype
ORDER BY enumsortorder;
```

**Expected output:**
```
admin
user
hr
prestador
specialist
especialista_geral  ← Should appear now
```

---

### Step 2: Test Role Assignment

```sql
-- Test that roles can be assigned without errors
DO $$
DECLARE
  test_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO user_roles (user_id, role) VALUES (test_id, 'prestador'::app_role);
  RAISE NOTICE '✅ prestador works';
  DELETE FROM user_roles WHERE user_id = test_id;
  
  INSERT INTO user_roles (user_id, role) VALUES (test_id, 'hr'::app_role);
  RAISE NOTICE '✅ hr works';
  DELETE FROM user_roles WHERE user_id = test_id;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ All roles are working!';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error: %', SQLERRM;
    DELETE FROM user_roles WHERE user_id = test_id;
END $$;
```

---

### Step 3: Try Registration Again

1. **Generate NEW access code** in admin dashboard
2. **Logout** from admin
3. **Register** with the new code
4. **Check browser console** for any red errors

---

## 🔍 Get the Exact Error Message

If it still fails, do this:

### Open Browser Console:
1. **Right-click** on page → **Inspect**
2. Click **Console** tab
3. Keep it open

### Try Registration:
1. Generate new code
2. Try to register
3. **Screenshot the red error message** or **copy the text**

### Common Error Messages:

#### Error 1: Enum Constraint
```
invalid input value for enum app_role: "prestador"
```
**Fix:** Run `FIX_APP_ROLE_ENUM.sql`

#### Error 2: Missing Function
```
function validate_access_code does not exist
```
**Fix:** Need to run migration to create the function

#### Error 3: Role Constraint
```
violates check constraint "invites_role_check"
```
**Fix:** The invites table doesn't allow certain roles

#### Error 4: Column Missing
```
column "role" of relation "invites" does not exist
```
**Fix:** Need to add role column to invites table

---

## 📋 Diagnostic Checklist

Run these in **SQL Editor** to understand the issue:

### Check 1: What roles are allowed?
```sql
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'app_role'::regtype;
```

### Check 2: Does validate_access_code function exist?
```sql
SELECT proname, pg_get_function_arguments(oid)
FROM pg_proc
WHERE proname = 'validate_access_code';
```

### Check 3: What columns does invites table have?
```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'invites'
ORDER BY ordinal_position;
```

### Check 4: What are the constraints on invites.role?
```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'invites'::regclass
  AND conname LIKE '%role%';
```

---

## 📤 What to Send Me

If it still doesn't work, send me:

1. **The exact error message** from browser console (screenshot or text)
2. **Results** of the 4 diagnostic queries above
3. **What happens** when you try to register (does account get created? can you login?)

This will help me identify the exact issue and create a targeted fix.

---

## 🎯 Success Criteria

After the fix:
- ✅ Generate prestador code - no errors
- ✅ Register with code - no errors (though you may need email confirmation)
- ✅ Login - redirects to `/prestador/dashboard`
- ✅ Check database: role is 'prestador' in user_roles table

---

## Additional Files

- `FIX_APP_ROLE_ENUM.sql` - Complete enum fix
- `DIAGNOSE_ROLE_ISSUE.sql` - Comprehensive diagnostics
- `DEBUG_REGISTRATION_ERRORS.md` - Debugging guide

