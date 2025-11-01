# Fix for Supabase API 403 and 404 Errors

## Problem Identified

Your application is experiencing API errors because of a **critical mismatch between RLS policies and the role system**:

### The Issue
1. **Old RLS policies** check: `profiles.role = 'admin'`
2. **But a later migration deprecated** the `profiles.role` column
3. **The system now uses `user_roles` table** exclusively
4. **Result:** All admin role checks FAIL, causing:
   - `403 Forbidden` on `companies` table
   - `404 Not Found` on `bookings` and `prestadores` tables

### Why 404 Instead of Empty Results?
When using HEAD requests with `{ count: 'exact', head: true }`, PostgREST returns:
- `404` when NO rows match due to RLS policies
- This is what's happening with `bookings` and `prestadores`

## The Solution

I've created a comprehensive SQL migration file that:
1. Creates helper functions (`is_admin()`, `is_hr()`, `is_prestador()`, `is_specialist()`)
2. Updates ALL RLS policies to use the `user_roles` table
3. Properly grants permissions for all user types

## How to Apply the Fix

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `ygxamuymjjpqhjoegweb`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New query**
5. Copy and paste the contents of:
   ```
   /home/user/melhor-saude-final-57/supabase/migrations/20250201000000_fix_rls_policies_user_roles.sql
   ```
6. Click **Run** to execute the migration
7. You should see a success message with role counts

### Option 2: Via Supabase CLI (if installed)

```bash
# Navigate to your project
cd /home/user/melhor-saude-final-57

# Push the migration to Supabase
supabase db push
```

## Verification

After running the migration, test by:

1. **Refresh your application** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. **Log out and log back in** to refresh the session
3. **Check the browser console** - the 403 and 404 errors should be gone
4. **Navigate to `/admin/users-management`** - it should load without errors

### Verification Query (Optional)

Run this in Supabase SQL Editor to verify your user's roles:

```sql
SELECT
  u.email,
  ARRAY_AGG(DISTINCT ur.role) as roles,
  p.id as profile_id,
  p.company_id
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
GROUP BY u.email, p.id, p.company_id
ORDER BY u.email;
```

## What Changed

### New Helper Functions
- `is_admin()` - Checks if current user has admin role
- `is_hr()` - Checks if current user has HR role
- `is_prestador()` - Checks if current user has prestador role
- `is_specialist()` - Checks if current user has specialist role

### Updated RLS Policies
All policies on these tables have been updated:
- `profiles`
- `companies`
- `bookings`
- `prestadores`
- `company_employees`
- `user_roles`

### Before (Broken)
```sql
CREATE POLICY "admins_view_all_companies" ON companies FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### After (Fixed)
```sql
CREATE POLICY "admins_view_all_companies" ON companies FOR SELECT
  USING (public.is_admin());
```

## Troubleshooting

### If errors persist after migration:

1. **Clear browser cache and local storage**
   - Open Developer Tools (F12)
   - Go to Application > Local Storage
   - Clear all items
   - Refresh the page

2. **Check authentication**
   - Ensure you're logged in as an admin user
   - Run this query to verify your role:
     ```sql
     SELECT * FROM user_roles WHERE user_id = auth.uid();
     ```

3. **Verify the migration ran successfully**
   - Check that the helper functions exist:
     ```sql
     SELECT routine_name FROM information_schema.routines
     WHERE routine_name IN ('is_admin', 'is_hr', 'is_prestador', 'is_specialist');
     ```

4. **Check RLS is enabled**
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('profiles', 'companies', 'bookings', 'prestadores');
   ```

## Need Help?

If you continue to experience issues:
1. Check the browser console for any new error messages
2. Verify your user has the correct role in the `user_roles` table
3. Ensure you're using the correct Supabase project URL and anon key

## Related Files

- Migration: `/supabase/migrations/20250201000000_fix_rls_policies_user_roles.sql`
- This README: `/FIX_SUPABASE_API_ERRORS_README.md`
