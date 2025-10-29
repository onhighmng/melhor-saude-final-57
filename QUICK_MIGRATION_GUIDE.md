# Apply Migrations - 3 Simple Steps

## Step 1: Go to Supabase Dashboard

1. Visit: https://supabase.com/dashboard
2. Login with your Supabase account
3. Select your project (or create new one)

## Step 2: Open SQL Editor

1. Click **SQL Editor** in left sidebar
2. Click **New query** button
3. You now have a text area to run SQL

## Step 3: Copy and Run Each Migration

### Migration 1 (Core Tables) - ~400 lines

1. Copy ALL contents of: `supabase/migrations/20250102000000_create_core_tables.sql`
2. Paste into SQL Editor
3. Click **RUN** button (bottom right)
4. Wait for "Success" message

### Migration 2 (Functions) - ~50 lines

1. Click **New query** again
2. Copy ALL contents of: `supabase/migrations/20250102000001_create_rpc_functions.sql`  
3. Paste into SQL Editor
4. Click **RUN** button

### Migration 3 (RLS Policies) - ~250 lines

1. Click **New query** again
2. Copy ALL contents of: `supabase/migrations/20250102000002_create_rls_policies.sql`
3. Paste into SQL Editor
4. Click **RUN** button

## That's It!

After running all 3 migrations, your database will have:
- ✅ All 20+ tables
- ✅ All relationships  
- ✅ All RLS policies
- ✅ All functions

## Verify It Worked

Run this query in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see ~20 tables like:
- profiles
- companies  
- company_employees
- prestadores
- bookings
- And many more...

## Time Required

**5-10 minutes total**

- Copy Migration 1: 2 minutes
- Run Migration 1: 30 seconds
- Copy Migration 2: 1 minute  
- Run Migration 2: 30 seconds
- Copy Migration 3: 2 minutes
- Run Migration 3: 30 seconds
- Verify: 1 minute

**Total: ~8 minutes**

## After Migrations Applied

Your platform will have:
- ✅ Working user registration
- ✅ Working company registration
- ✅ Working bookings
- ✅ 30+ migrated components functional
- ✅ Real-time updates
- ✅ Secure access (RLS)

**Ready to test everything!**

