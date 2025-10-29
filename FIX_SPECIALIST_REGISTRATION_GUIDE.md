# Fix for Specialist Account Registration Error

## Problem

When trying to generate a specialist (Profissional de Permanência) access code in the Admin Users Management page, you get an error:

```
new row for relation "invites" violates check constraint "invites_user_type_check"
```

## Root Cause

The `invites` table has a CHECK constraint that only allows these user types:
- `personal`
- `hr`
- `user`
- `prestador`

But NOT `specialist` (which maps to `especialista_geral`).

Additionally, the `generate_access_code()` RPC function doesn't handle the `specialist` user type.

## Solution

The fix involves:

1. **Dropping the old CHECK constraint** that doesn't include `specialist`
2. **Adding a new CHECK constraint** that includes `specialist`
3. **Updating the `generate_access_code()` function** to:
   - Accept `specialist` as a valid user type
   - Convert `specialist` to `especialista_geral` when storing in the database

## How to Apply

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → Your Project → **SQL Editor**
2. Create a **New Query**
3. Copy the entire content of `FIX_SPECIALIST_REGISTRATION.sql`
4. Paste it into the SQL Editor
5. Click **Run**
6. Verify the output shows the constraint was updated

### Option 2: Via Migration File

The fix has been added to:
- `supabase/migrations/20251030000000_add_specialist_to_invites_constraint.sql`

It will be automatically applied on the next deployment.

## Verification

After applying the fix, you should be able to:

1. Go to **Admin Users Management** → **Affiliates** tab
2. Click **"Gerar Profissional de Permanência"** button
3. A specialist code will be generated successfully
4. The specialist can then use that code to register via the registration flow

## What Changed

### Migration File
```sql
-- Old constraint:
CHECK (user_type IN ('personal', 'hr', 'user', 'prestador'))

-- New constraint:
CHECK (user_type IN ('personal', 'hr', 'user', 'prestador', 'specialist'))
```

### generate_access_code() Function
- Now accepts `specialist` as a valid `p_user_type` parameter
- Maps `specialist` to `especialista_geral` role in the database
- Validates input to prevent invalid user types

## Testing

After the fix is applied, test by:

1. Logging in as Admin
2. Go to Admin Users Management → Affiliates
3. Click "Gerar Profissional de Permanência"
4. Confirm a code is generated (e.g., `MS-ABC1`)
5. Share the code with a specialist candidate
6. They can now register using that code

## Rollback

If you need to rollback this change, run:

```sql
-- This will revert the constraint to the old version
ALTER TABLE invites DROP CONSTRAINT invites_user_type_check;
ALTER TABLE invites ADD CONSTRAINT invites_user_type_check 
  CHECK (user_type IN ('personal', 'hr', 'user', 'prestador'));
```

However, this is not recommended as it will prevent specialist registrations again.
