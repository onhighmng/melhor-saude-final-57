# Apply Migrations NOW - Quick Guide

## Step-by-Step Instructions

### 1. Access Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Sign in
3. Select your project: **ygxamuymjjpqhjoegweb** (or create new if needed)

### 2. Open SQL Editor

1. Click **SQL Editor** in left sidebar
2. Click **New query**

### 3. Apply Migration 1: Core Tables

Copy and paste this entire file into the SQL Editor:

**File**: `supabase/migrations/20250102000000_create_core_tables.sql`

The file contains:
- 20+ table definitions
- All relationships and constraints
- All indexes

Click **RUN** button

**Expected Result**: "Success. No rows returned"

### 4. Apply Migration 2: Functions & Triggers

Copy and paste this file into a NEW query:

**File**: `supabase/migrations/20250102000001_create_rpc_functions.sql`

This creates:
- get_platform_analytics() function
- updated_at triggers for all tables

Click **RUN**

**Expected Result**: "Success. No rows returned"

### 5. Apply Migration 3: RLS Policies

Copy and paste this file into a NEW query:

**File**: `supabase/migrations/20250102000002_create_rls_policies.sql`

This enables:
- Row Level Security on all tables
- Access policies for all user roles

Click **RUN**

**Expected Result**: "Success. No rows returned"

### 6. Verify Tables Were Created

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see ~20 tables including:
- profiles
- companies
- company_employees
- prestadores
- bookings
- And many more...

### 7. Test Backend Operations

After migrations:

1. **Create a company**:
   - Visit `/register/company` in app
   - Fill form and submit
   - Check Supabase > Table Editor > companies
   - Should see new company record

2. **Create an employee**:
   - Visit `/register/employee`
   - Use any invite code format
   - Check profiles and company_employees tables
   - Should see new records

3. **Check bookings**:
   - Create a booking via `/user/book`
   - Should appear in bookings table

## What Happens After Migrations

✅ All 29 migrated components will work immediately
✅ Database operations will succeed  
✅ Data will persist across refreshes
✅ Real-time subscriptions will work
✅ RLS policies will enforce security

## Troubleshooting

**If you get errors**:
- Check Supabase Dashboard for error messages
- Verify you're in the correct project
- Make sure you run migrations in order (1, 2, 3)
- Check if tables already exist (DROP and recreate)

**If migrations fail**:
- You can safely re-run them (they use IF NOT EXISTS)
- Check SQL syntax in error message
- Verify foreign key dependencies

## After Migrations

Your backend will be **fully functional** for:
- User registration
- Company registration
- Employee registration
- Booking management
- Invite code system
- Provider management
- Session tracking
- All 29 migrated components

**Then** continue migrating remaining 46 components using the same pattern.

