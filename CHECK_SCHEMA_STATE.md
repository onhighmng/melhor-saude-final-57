# Schema State Analysis

## THE PROBLEM

You're getting: `relation "public.company_employees" does not exist`

This means the migration I created assumes `company_employees` exists, but it doesn't in your actual database.

## WHY THIS HAPPENED

There are **CONFLICTING MIGRATION FILES** creating different versions of the schema:

### Version 1 (Old): 20250102000000_create_core_tables.sql
- Uses: `profiles.company_id`, `profiles.role`
- Companies: `company_name`, `contact_email`, `contact_phone`
- company_employees: References `profiles(id)` for user_id

### Version 2 (New): 20251026165114_82623fdb-4b32-4552-9109-f53e8d426b40.sql
- Uses: `user_roles` table (separate)
- Companies: `company_name`, `contact_email`, `contact_phone` (SAME!)
- company_employees: References `auth.users(id)` for user_id (DIFFERENT!)

## WHAT TO DO

**Before applying ANY migration, you MUST know:**

1. Which migrations have ACTUALLY been run in your Supabase?
2. What does `company_employees` table currently look like?
3. Does `profiles.company_id` exist?
4. Does `user_roles` table exist?

## TO CHECK YOUR ACTUAL SCHEMA

Run this in Supabase SQL Editor:

```sql
-- Check if company_employees exists
SELECT 1 FROM information_schema.tables 
WHERE table_name = 'company_employees';

-- If it exists, check its structure
\d company_employees

-- Check if user_roles exists
SELECT 1 FROM information_schema.tables 
WHERE table_name = 'user_roles';

-- Check profiles structure
\d profiles

-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

## THE FIX

I need to:

1. **Get your actual schema state** - Run the checks above
2. **Fix the migration** to work with YOUR schema, not an assumed one
3. **Test thoroughly** before applying

## MIGRATION FILES TO IGNORE

These are OLD and may be conflicting:
- ❌ ALL_MIGRATIONS_COMBINED.sql
- ❌ SUPABASE_MIGRATION.sql  
- ❌ FIX_* files
- ❌ FINAL_RLS_FIX.sql
- ❌ DISABLE_RLS_TEMPORARILY.sql

Only apply migrations in: `supabase/migrations/` with dates like `20251026...` or `20251101...`

---

**ACTION REQUIRED:** Run the schema checks above and tell me what tables/columns exist.
