# ✅ Safe Migration Guide - Fixed Version

## What Was Fixed

The original `FIX_COMPANIES_SCHEMA_MISMATCH.sql` had several issues that caused errors when run. I've updated it to be **idempotent** (safe to run multiple times).

### Errors Fixed:

1. **✅ Constraint already exists error**
   ```
   ERROR: constraint "check_sessions_allocated_positive" already exists
   ```
   **Fix:** Now drops existing constraints before re-adding them

2. **✅ UNIQUE constraint on nuit**
   - Now checks for duplicates before adding UNIQUE constraint
   - Only adds if safe to do so

3. **✅ NOT NULL constraints**
   - Now checks if NULL values exist before setting NOT NULL
   - Provides warnings if NULL values found

4. **✅ Trigger already exists**
   - Now uses `DROP TRIGGER IF EXISTS` before creating

---

## How to Run (Updated Steps)

### Step 1: Run the Fixed Migration

The file `FIX_COMPANIES_SCHEMA_MISMATCH.sql` is now safe to run:

```sql
-- In Supabase SQL Editor, run the entire file
```

**It's now safe to run multiple times!** It will:
- ✅ Skip operations that are already done
- ✅ Show NOTICE messages for skipped operations
- ✅ Only make changes that are needed

---

### Step 2: Run the Booking Status Fix

```sql
-- In Supabase SQL Editor, run:
-- FIX_BOOKING_STATUS_CONSTRAINT.sql
```

This one was already safe (uses `DROP CONSTRAINT IF EXISTS`).

---

## What the Migration Does

### 1. Adds Missing Columns
Adds columns from both schema versions:
- `name`, `email`, `phone` (standard names)
- `company_name`, `contact_email`, `contact_phone` (legacy names)
- All business fields: `industry`, `size`, `number_of_employees`, etc.

### 2. Migrates Data
```sql
-- Copies data from old column names to new ones
name ← company_name (if NULL)
email ← contact_email (if NULL)
phone ← contact_phone (if NULL)
```

### 3. Sets Constraints (Safely)
- NOT NULL on `name` and `email` (only if no NULLs exist)
- UNIQUE on `nuit` (only if no duplicates)
- CHECK constraints on sessions (drops and re-adds)

### 4. Creates Indexes
- On `name`, `email`, `nuit`, `is_active`
- All use `IF NOT EXISTS`

### 5. Adds Update Trigger
- Auto-updates `updated_at` column
- Drops old trigger first

---

## Expected Output

When you run the migration, you'll see messages like:

```
NOTICE:  Skipping name NOT NULL constraint - NULL values exist
NOTICE:  Added UNIQUE constraint on nuit
NOTICE:  relation "idx_companies_name" already exists, skipping
```

These are **normal** and indicate the migration is working correctly.

---

## Verification

After running, verify with these queries:

### Check All Columns Exist
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'companies'
ORDER BY ordinal_position;
```

**You should see:**
- ✅ Both `name` AND `company_name`
- ✅ Both `email` AND `contact_email`
- ✅ All business fields: `industry`, `size`, `number_of_employees`, etc.

### Check Data Migration Worked
```sql
SELECT 
  id,
  name,
  company_name,
  email,
  contact_email,
  industry,
  plan_type
FROM companies
LIMIT 5;
```

**Expected:**
- If `company_name` had data, `name` should now have it too
- Both columns exist and accessible

### Check Constraints
```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'companies'::regclass
ORDER BY conname;
```

**Should include:**
- `check_sessions_allocated_positive`
- `check_sessions_used_positive`
- `companies_nuit_key` (UNIQUE, if no duplicates)

---

## Troubleshooting

### If You Still Get Errors:

**Error: "column already exists"**
- This is **OKAY** - it means the column was already there
- Migration uses `ADD COLUMN IF NOT EXISTS`

**Error: "constraint already exists"**
- Should not happen anymore with fixed version
- If it does, manually drop constraint first:
  ```sql
  ALTER TABLE companies DROP CONSTRAINT constraint_name_here;
  ```

**Error: "duplicate key value violates unique constraint"**
- You have duplicate `nuit` values
- Migration will skip UNIQUE constraint
- Find duplicates:
  ```sql
  SELECT nuit, COUNT(*) 
  FROM companies 
  WHERE nuit IS NOT NULL
  GROUP BY nuit 
  HAVING COUNT(*) > 1;
  ```

**Error: "null value in column violates not-null constraint"**
- You have NULL values in `name` or `email`
- Migration will skip NOT NULL constraint
- Check for NULLs:
  ```sql
  SELECT id, name, email FROM companies 
  WHERE name IS NULL OR email IS NULL;
  ```

---

## What's Safe About This Version

✅ **Idempotent** - Can run multiple times safely  
✅ **Non-destructive** - Never drops columns or deletes data  
✅ **Conditional** - Only makes changes when safe  
✅ **Informative** - Shows NOTICE messages for skipped operations  
✅ **Backward compatible** - Keeps both old and new column names  

---

## After Migration Complete

1. ✅ Test employee registration with invite code
2. ✅ Test company dashboard loading
3. ✅ Test admin company management
4. ✅ Verify all company data visible
5. 🔄 (Optional) Update frontend to use standard column names (`name` instead of `company_name`)

---

## Questions?

If the migration completes with NOTICES but no ERRORS, **you're good!**

The NOTICES just mean it skipped operations that were already done or couldn't be done safely.

---

**Status: Ready to Run** 🚀

The updated `FIX_COMPANIES_SCHEMA_MISMATCH.sql` is now safe and will handle all edge cases gracefully.




