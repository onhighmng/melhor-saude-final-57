# Fix: Users Going to Wrong Dashboard

## The Problem
Company users are being routed to `/user/dashboard` instead of `/company/dashboard`.

## Root Cause
The `get_user_primary_role` RPC function checks for `'specialist'` role, but the database stores `'especialista_geral'`. This causes the function to not find the correct role and default to `'user'`.

## Files Fixed

### 1. `src/utils/registrationHelpers.ts` ✅
- Changed `'specialist': 'specialist'` → `'specialist': 'especialista_geral'`
- Now correctly maps to database role

### 2. `FIX_GET_USER_PRIMARY_ROLE.sql` ✅  
- Updates the RPC function to check for `'especialista_geral'` instead of `'specialist'`
- Run this in Supabase SQL Editor

## How to Fix

### Step 1: Run SQL Fix
Run this in Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION get_user_primary_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  primary_role TEXT;
BEGIN
  -- Priority: admin > hr > prestador > especialista_geral > user
  SELECT 
    CASE 
      WHEN bool_or(role = 'admin') THEN 'admin'
      WHEN bool_or(role = 'hr') THEN 'hr'
      WHEN bool_or(role = 'prestador') THEN 'prestador'
      WHEN bool_or(role = 'especialista_geral') THEN 'especialista_geral'  -- FIXED
      ELSE 'user'
    END INTO primary_role
  FROM user_roles
  WHERE user_roles.user_id = get_user_primary_role.user_id;
  
  RETURN COALESCE(primary_role, 'user');
END;
$$;
```

### Step 2: Test
1. Logout and login again
2. You should now be routed to the correct dashboard:
   - Company users → `/company/dashboard`
   - Specialist users → `/especialista/dashboard`
   - Prestador users → `/prestador/dashboard`
   - Employees → `/user/dashboard`
   - Admins → `/admin/dashboard`

## Why This Happened

The system has two different naming conventions:
- **Frontend/Code**: Uses `'specialist'` (shorter, cleaner)
- **Database**: Uses `'especialista_geral'` (Portuguese, matches app language)

The mismatch wasn't caught because most code was using the frontend convention, but the RPC function was checking the database enum values.

## Summary of All Fixes Today

1. ✅ Fixed `assignUserRole` to use `'especialista_geral'` instead of `'specialist'`
2. ✅ Fixed `get_user_primary_role` to check for `'especialista_geral'`
3. ✅ Made `invites.company_id` nullable for specialist/prestador codes
4. ✅ Added `'especialista_geral'` to `app_role` enum
5. ✅ Added `specialist` case to `Register.tsx` switch statement

After running the SQL fix above, all dashboard routing should work correctly! 🎉

