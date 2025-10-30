# Registration Issues - Root Cause Analysis

## User Types in System

Based on code analysis, here are all user types and their registration paths:

| User Type | Registration Path | Status | Issues Found |
|-----------|------------------|--------|--------------|
| **Personal** | `/register` with personal code | ❓ Unknown | Need to test |
| **HR (Company)** | `/register/company` | ❌ **BROKEN** | TBD |
| **Employee** | `/register/employee` with company code | ❓ Unknown | Need to test |
| **Prestador** | `/register` with prestador code | ❓ Unknown | Need to test |
| **Specialist** | `/register` with specialist code | ✅ **FIXED** | Was missing case in switch |

## Diagnostic Steps

### 1. Check Database Schema

Run this in Supabase SQL Editor to verify tables exist:

```sql
-- Check if critical tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'user_roles', 'companies', 'company_employees', 'invites', 'prestadores');

-- Check invites table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'invites'
ORDER BY ordinal_position;

-- Check user_roles table structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;
```

### 2. Check for Existing Codes

```sql
-- See what codes exist and their roles
SELECT 
  invite_code,
  role,
  status,
  company_id,
  created_at,
  expires_at > now() as is_not_expired
FROM invites
ORDER BY created_at DESC
LIMIT 20;
```

### 3. Test Each Registration Type

#### Test 1: Company Registration
1. Go to `http://localhost:8081/register/company`
2. Fill in all fields
3. Submit
4. **Expected errors to check:**
   - ❌ Missing column in companies table?
   - ❌ RLS policy blocking insert?
   - ❌ user_roles table doesn't exist?
   - ❌ Auth signup failing?

#### Test 2: Employee Registration
1. Generate a code in admin for role='user'
2. Go to `/register/employee`
3. Use the code
4. **Check for same errors as above**

#### Test 3: Prestador Registration  
1. Generate prestador code in admin
2. Go to `/register` 
3. Use the code
4. **Check for same errors as above**

## Common Root Causes

### Root Cause #1: Database Tables Don't Exist
**Symptoms:**
- Error: "relation does not exist"
- Error: "table ... does not exist"

**Solution:**
```bash
# Run migrations in Supabase SQL Editor:
# 1. FIX_GENERATE_ACCESS_CODE_COMPLETE.sql
# 2. FIX_VALIDATE_ACCESS_CODE.sql
# 3. Any other migration files in supabase/migrations/
```

### Root Cause #2: RLS Policies Blocking Inserts
**Symptoms:**
- Error: "new row violates row-level security policy"
- Silent failure (no error, but no data created)

**Solution:**
```sql
-- Temporarily disable RLS to test (DO NOT USE IN PRODUCTION)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Or create proper policies
CREATE POLICY "Allow registration" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow registration" ON user_roles
  FOR INSERT WITH CHECK (true);
```

### Root Cause #3: Missing Columns in Tables
**Symptoms:**
- Error: "column ... does not exist"
- Error: "null value in column ... violates not-null constraint"

**Solution:**
Run schema fix SQL (see below)

### Root Cause #4: Missing Functions
**Symptoms:**
- Error: "function generate_access_code does not exist"
- Error: "function validate_access_code does not exist"

**Solution:**
```bash
# Run these SQL files:
1. FIX_GENERATE_ACCESS_CODE_COMPLETE.sql
2. FIX_VALIDATE_ACCESS_CODE.sql
```

## Immediate Action Items

1. **Open browser console** and try to register company
2. **Copy the exact error message** from console
3. **Run diagnostic queries** above in Supabase SQL Editor
4. **Report back findings** so we can create targeted fixes

## Quick Schema Check Query

Run this to see what's actually in your database:

```sql
-- Show all tables
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show all functions
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%access_code%';
```

