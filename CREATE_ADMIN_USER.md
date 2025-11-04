# Create First Admin User - Quick Guide

## Problem

The admin dashboard shows 404 errors because:
1. No users exist in the system yet, OR
2. The logged-in user doesn't have admin privileges

## Solution

### Step 1: Create Your Account

1. Go to your app's signup page
2. Register with your email address
3. Verify your email if required

### Step 2: Promote Yourself to Admin

Once you have an account, you need to promote it to admin. You have two options:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this query (replace with your email):

```sql
-- Replace 'your-email@example.com' with your actual email
SELECT promote_to_admin('your-email@example.com');
```

4. You should see a success message like:
```json
{
  "success": true,
  "message": "User promoted to admin successfully",
  "user_id": "...",
  "email": "your-email@example.com"
}
```

#### Option B: Manual Database Update

If the function doesn't work, you can manually update the database:

```sql
-- Replace 'your-email@example.com' with your actual email
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'your-email@example.com';

  -- Update profile
  UPDATE profiles
  SET role = 'admin'
  WHERE id = target_user_id;

  -- Add to user_roles
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE 'User promoted to admin successfully!';
END $$;
```

### Step 3: Apply the Migration

Before doing the above, make sure you've applied the latest migration:

```bash
# Apply the RLS fix migration
supabase db push

# Or if using the Supabase CLI
supabase migration up
```

### Step 4: Verify It Works

1. Log out of your account
2. Log back in
3. Go to the admin dashboard
4. You should now see data instead of 404 errors

## Troubleshooting

### Still seeing 404 errors?

1. **Clear your browser cache** and refresh
2. **Check you're logged in** - Open browser console and run:
   ```javascript
   supabase.auth.getUser().then(console.log)
   ```
3. **Verify your role** - In Supabase SQL Editor:
   ```sql
   SELECT 
     p.email, 
     p.role as profile_role,
     ur.role as user_roles_role
   FROM profiles p
   LEFT JOIN user_roles ur ON ur.user_id = p.id
   WHERE p.email = 'your-email@example.com';
   ```

### Migration Issues?

If the migration fails, you can apply it manually:

1. Open `supabase/migrations/20251102_fix_admin_dashboard_rls.sql`
2. Copy the entire content
3. Go to Supabase Dashboard → SQL Editor
4. Paste and run it

### No Users Exist Yet?

If you're starting fresh and don't have any users:

1. First, create a user account through your app's signup flow
2. Then follow Step 2 above to promote that user to admin
3. The admin user can then create other users through the admin panel

## What the Migration Does

The migration fixes several issues:

1. ✅ Ensures `prestadores` table is accessible
2. ✅ Adds proper RLS policies for admin access to `bookings`
3. ✅ Fixes RLS policies for `resources` table
4. ✅ Creates `is_admin()` helper function
5. ✅ Creates `promote_to_admin()` function for easy admin creation
6. ✅ Creates `admin_analytics` view for better performance

## Need More Help?

If you're still having issues, check the browser console for specific error messages and verify:
- You're logged in as an admin user
- The migration was applied successfully
- RLS policies are working correctly

Run this query to check RLS status:

```sql
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('prestadores', 'bookings', 'resources', 'profiles')
ORDER BY tablename;
```





