# Migration Guide: Drop Deprecated profiles.role Column

## Overview
This migration safely removes the deprecated `profiles.role` column from your database, completing the security refactor to use the `user_roles` table exclusively.

## What This Migration Does

### ✅ **Safety Checks**
1. **Migrates any remaining data** from `profiles.role` to `user_roles` table
2. **Ensures every user has at least one role** (defaults to 'user')
3. **Verifies data integrity** before and after the migration

### 🔧 **Changes**
1. **Updates `handle_new_user()` trigger** to stop writing to `profiles.role`
2. **Drops dependent views** (temporarily)
3. **Removes `profiles.role` column** from the database
4. **Recreates views** without the deprecated column
5. **Adds helpful comments** for future developers

### 📊 **Verification**
- Displays migration statistics in the logs
- Warns if any users are missing roles
- Confirms successful completion

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20250129000000_drop_deprecated_profiles_role.sql`
4. Paste into the SQL Editor
5. Click **Run**
6. Check the output for verification messages

### Option 2: Supabase CLI
```bash
supabase db push
```

## Expected Output

You should see messages like:
```
NOTICE:  === Migration Verification ===
NOTICE:  Total profiles: 2
NOTICE:  Profiles with roles in user_roles: 2
NOTICE:  Profiles without any role: 0
NOTICE:  ✅ All profiles have at least one role assigned
NOTICE:  ✅ Migration completed successfully
NOTICE:  profiles.role column has been dropped
```

## After Migration

### ✅ **Benefits**
- **Cleaner schema** - No confusing deprecated columns
- **Better security** - Single source of truth for roles
- **Multi-role support** - Users can have multiple roles (admin + hr, etc.)
- **Consistent codebase** - All code uses `user_roles` table

### 📝 **What Changed**
- **Database**: `profiles.role` column is completely removed
- **Frontend**: No changes needed (already uses `UserProfile.role` from AuthContext)
- **Backend**: All queries use `user_roles` table or `get_user_primary_role()` function

### 🧪 **Testing**
After migration, verify:
1. ✅ Admin login redirects to `/admin/dashboard`
2. ✅ Regular user login redirects to `/user/dashboard`
3. ✅ Role-based access control works (ProtectedRoute)
4. ✅ No console errors related to roles

## Rollback (If Needed)

If you need to rollback (not recommended), you would:
1. Add the column back: `ALTER TABLE profiles ADD COLUMN role TEXT;`
2. Populate from user_roles: `UPDATE profiles SET role = get_user_primary_role(id);`
3. Make it NOT NULL again

However, this is **not recommended** as it reintroduces the security vulnerability.

## Questions?

- **"Will this break my app?"** - No, the frontend already uses `UserProfile.role` which comes from `get_user_primary_role()`
- **"Can users have multiple roles?"** - Yes! That's the benefit of `user_roles` table
- **"What if a user has no role?"** - The migration ensures everyone has at least 'user' role
- **"Is this safe?"** - Yes, the migration includes multiple safety checks and backfills

## Summary

**Before:**
- ❌ `profiles.role` (deprecated, confusing)
- ✅ `user_roles` table (secure)
- 😕 Two sources of truth

**After:**
- ✅ `user_roles` table (single source of truth)
- 🎉 Clean, secure, consistent schema

