# Company Dashboard 400 Error - FIXED ✅

## Issue Summary

The Company Dashboard and Colaboradores pages were showing **400 errors** when trying to load employee data with the following query:

```
/rest/v1/company_employees?select=*,profiles(name,email,avatar_url)&company_id=eq.xxx
```

### Root Cause

The `company_employees` table was **missing a foreign key constraint** linking `user_id` to the `profiles` table. Without this constraint, PostgREST (Supabase's REST API) couldn't automatically join the two tables, resulting in 400 Bad Request errors.

## What Was Fixed

### 1. **Mock Data Removed** ✅
- Removed hardcoded `42%` for "Pilar Mais Utilizado" 
- Now calculates actual percentage from real booking data

### 2. **Foreign Key Constraint Added** ✅
```sql
ALTER TABLE company_employees 
ADD CONSTRAINT company_employees_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;
```

### 3. **Missing Columns Added** ✅
- `is_active` - Track active/inactive employees
- `created_at` - Track when employee joined
- `updated_at` - Track last modification
- `department` - Employee department
- `position` - Employee position

### 4. **Performance Indexes Created** ✅
- Index on `user_id` for faster joins
- Index on `company_id` for company filtering
- Index on `is_active` for active employee queries

### 5. **RLS Policies Updated** ✅
- Users can view their company's employees
- HR can view and manage their company's employees
- Admins can view and manage all employees

## How to Apply the Fix

### Option 1: Automatic (Already Done via MCP)
The fix has already been applied via the Supabase MCP tool! Just refresh your browser.

### Option 2: Manual (If Needed)
1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Run the SQL file: `FIX_COMPANY_EMPLOYEES_RELATIONSHIPS.sql`
4. Wait for success message
5. Refresh your application

## Verification

After applying the fix, you should see:

✅ **No more 400 errors** in browser console  
✅ **Real employee data** loading in Company Dashboard  
✅ **Real percentages** for pillar usage  
✅ **Employee list** showing in Colaboradores page  
✅ **Profile information** (names, emails, avatars) displaying correctly  

## Test These Pages

1. **Company Dashboard** (`/company/dashboard`)
   - Should show real satisfaction ratings
   - Should show actual session usage
   - Should show correct pillar percentages
   - Should show real employee counts

2. **Colaboradores Page** (`/company/colaboradores`)
   - Should load employee list without errors
   - Should show employee names, emails, and avatars
   - Should show active/inactive status

3. **Company Reports** (`/company/relatorios`)
   - Should load with employee data

## Technical Details

### Before (Broken)
```typescript
// This query was failing with 400
const { data } = await supabase
  .from('company_employees')
  .select('*, profiles(name, email, avatar_url)')
  .eq('company_id', companyId);
// ❌ Error: Could not find foreign key relationship
```

### After (Working)
```typescript
// Same query now works perfectly
const { data } = await supabase
  .from('company_employees')
  .select('*, profiles(name, email, avatar_url)')
  .eq('company_id', companyId);
// ✅ Returns employee data with profile information
```

## Files Modified

1. **src/pages/CompanyDashboard.tsx**
   - Removed hardcoded 42% for pillar usage
   - Added dynamic calculation from real data
   - All metrics now load from database

2. **Database Schema**
   - Added foreign key: `company_employees.user_id → profiles.id`
   - Added missing columns
   - Added performance indexes
   - Updated RLS policies

## What This Means

- 🎉 **All data is now real** - No more mock/fake data
- 🚀 **Queries work correctly** - PostgREST can join tables properly
- 🔒 **Security maintained** - RLS policies control access
- ⚡ **Better performance** - Indexes speed up queries

## Next Steps

1. ✅ Refresh your browser
2. ✅ Log in as HR user
3. ✅ Navigate to Company Dashboard
4. ✅ Check Colaboradores page
5. ✅ Verify all data loads without errors

---

**Status**: ✅ COMPLETE - Ready to test!  
**Date**: November 2, 2025  
**Impact**: Critical fix - Enables all company features




