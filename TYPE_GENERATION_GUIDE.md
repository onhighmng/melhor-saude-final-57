# TypeScript Type Generation Guide

## ⚠️ Current Status

You will see TypeScript linter errors in the following files:
- `src/hooks/useMilestones.ts`
- `src/hooks/useUserGoals.ts`
- `src/components/onboarding/SimplifiedOnboarding.tsx`

This is **EXPECTED** and **NOT A BUG**.

## Why Are There Type Errors?

The code references new database tables and functions that don't exist in your Supabase TypeScript types yet:

### New Tables (Not in Types):
- `user_milestones`
- `user_goals`
- `notifications`
- `profiles.has_completed_onboarding` column

### New RPC Functions (Not in Types):
- `initialize_user_milestones()`
- `generate_goals_from_onboarding()`
- `create_notification()`

## 🔧 How to Fix

### Step 1: Apply Database Migrations

Go to your Supabase Dashboard → SQL Editor and run these migrations in order:

1. **First Migration:**
```sql
-- Copy and paste contents of:
supabase/migrations/20251030000001_add_user_backend_integration_tables.sql
```

2. **Second Migration:**
```sql
-- Copy and paste contents of:
supabase/migrations/20251030000002_create_avatars_storage_bucket.sql
```

### Step 2: Regenerate TypeScript Types

After applying the migrations, regenerate your Supabase types:

```bash
# Make sure you're in the project root directory
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID (found in Project Settings).

**Alternative method if you have Supabase CLI linked:**
```bash
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

### Step 3: Verify Types

After regenerating, check `src/integrations/supabase/types.ts` to confirm:
- `user_milestones` table is present
- `user_goals` table is present
- `notifications` table is present
- `has_completed_onboarding` is in the `profiles` table
- RPC functions are listed in the `Functions` section

### Step 4: Restart Dev Server

```bash
# Stop the dev server (Ctrl+C) and restart
npm run dev
```

All TypeScript errors should now be resolved!

## 📝 Notes

- The code is functionally correct and will work once types are regenerated
- You can temporarily ignore these TypeScript errors during development
- The runtime behavior will be correct even with type errors
- If types don't update, try clearing your IDE cache and restarting

## 🆘 Troubleshooting

**Types still showing errors after regeneration?**
- Confirm migrations were successfully applied in Supabase Dashboard
- Check if the new tables appear in your Supabase Table Editor
- Try clearing TypeScript server cache in your editor (VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server")
- Ensure you're using the latest Supabase CLI: `npm update -g supabase`

**Can't find project ID?**
- Go to Supabase Dashboard → Settings → General
- Copy "Reference ID" or "Project ID"

**CLI not working?**
- Install/update Supabase CLI: `npm install -g supabase`
- Login: `npx supabase login`
- Link project: `npx supabase link --project-ref YOUR_PROJECT_ID`

