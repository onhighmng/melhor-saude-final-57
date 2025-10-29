# How to Run Supabase Migrations

Since Supabase CLI is not installed, you can apply migrations **directly in Supabase Dashboard**:

## Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Sign in with your account
3. Select your project (or create new one)

## Step 2: Access SQL Editor

1. In your project dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**

## Step 3: Apply Migrations

### Migration 1: Core Tables
Copy and paste the entire contents of:
`supabase/migrations/20250102000000_create_core_tables.sql`

Then click **RUN** in the SQL Editor

### Migration 2: RPC Functions
Copy and paste the entire contents of:
`supabase/migrations/20250102000001_create_rpc_functions.sql`

Then click **RUN**

### Migration 3: RLS Policies
Copy and paste the entire contents of:
`supabase/migrations/20250102000002_create_rls_policies.sql`

Then click **RUN**

## Step 4: Verify

Run this query to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- profiles
- companies
- company_employees
- prestadores
- bookings
- And 15+ more tables

## Step 5: Test

Try creating a company in the app:
1. Go to `/register/company`
2. Fill out the form
3. Submit
4. Check Supabase Dashboard > Table Editor > companies table
5. You should see the new company record

## Alternative: Use Supabase Dashboard Automation

1. Go to your Supabase project
2. Click **Database** in left sidebar
3. Click **Migrations** tab
4. Click **Create a new migration**
5. Name it: `20250102000000_create_core_tables`
6. Copy-paste SQL from migration file
7. Click **Save and run migration**

Repeat for all 3 migration files in chronological order.

## Your Project Already Configured

Your `src/integrations/supabase/client.ts` is pointing to:
- URL: `https://ygxamuymjjpqhjoegweb.supabase.co`
- Key: Already configured

Once migrations run, **all backend operations will work immediately**!

