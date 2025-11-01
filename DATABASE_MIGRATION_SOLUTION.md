# Database Migration Solution - 404 Errors After Login

## 🔍 Root Cause Identified

The database schema is **incomplete** because migrations have never been applied to the Supabase project.

- **Migrations in project:** 75+ migration files
- **Migrations applied to DB:** 0 (empty list)
- **Result:** Code queries tables that don't exist → 404 errors

---

## The Solution

### Step 1: Check if Migrations Directory is Configured
Supabase projects need a properly configured `supabase` directory with migration tracking. The project has:
```
✅ supabase/migrations/ - 75+ migration files exist
✅ 20250102000000_create_core_tables.sql - Creates all base tables
✅ Migration sequence is properly timestamped
```

### Step 2: Apply Missing Migrations

The migrations that need to be applied (in order) include:

**Core Schema (REQUIRED):**
1. `20250102000000_create_core_tables.sql` - Creates:
   - profiles
   - companies
   - company_employees (with sessions_quota)
   - prestadores
   - bookings
   - chat_sessions
   - chat_messages
   - feedback
   - notifications
   - AND MORE...

2. `20250102000001_create_rpc_functions.sql` - Creates RPC functions
3. `20250102000002_create_rls_policies.sql` - Enables RLS and creates policies
4. `20250126000005_fix_company_employees_column.sql` - Renames:
   - `company_employees.sessions_quota` → `company_employees.sessions_allocated`

**Additional Tables (for feature completeness):**
- `20250126000003_create_user_milestones_table.sql` - Milestone tracking
- `20250126000000_create_resources_table.sql` - Learning resources
- `20250127000001_create_storage_buckets.sql` - Cloud storage
- Plus 50+ more advanced features...

---

## Two Options to Fix

### Option A: Apply All Migrations (Complete)
**Effort:** 10-15 minutes  
**Result:** Full database schema restored, all features work

**Steps:**
1. Ensure `supabase` CLI is installed locally
2. Link your local project to your Supabase project
3. Run: `supabase migration up`
4. Verify in Supabase dashboard

**Command:**
```bash
cd /Users/anapaula/Documents/GitHub/melhor-saude-final-57
supabase link --project-ref [your-project-id]
supabase db push
```

**Verification:**
- Tables appear in Supabase dashboard
- 404 errors disappear
- All features work

---

### Option B: Apply Critical Migrations Only (Quick Fix)
**Effort:** 5-10 minutes  
**Result:** App works, some features unavailable

**Apply only:**
```sql
-- 1. Run 20250102000000_create_core_tables.sql
-- 2. Run 20250102000001_create_rpc_functions.sql
-- 3. Run 20250102000002_create_rls_policies.sql
-- 4. Run 20250126000005_fix_company_employees_column.sql (rename sessions_quota)
```

---

## Manual Migration Alternative

If CLI is not available, you can manually run migrations via Supabase Dashboard SQL Editor:

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project
2. Navigate to "SQL Editor"
3. Create a new query

### Step 2: Run Core Tables Migration
```sql
-- Copy contents of 20250102000000_create_core_tables.sql
-- Paste into SQL Editor
-- Execute
```

### Step 3: Run Supporting Migrations
```sql
-- 20250102000001_create_rpc_functions.sql
-- 20250102000002_create_rls_policies.sql
-- 20250126000005_fix_company_employees_column.sql
```

### Step 4: Verify
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should show:
```
bookings
chat_messages
chat_sessions
companies
company_employees
feedback
notifications
prestadores
profiles
resources
user_milestones
... and more
```

---

## Current Database vs Expected Schema

### What Currently Exists (8 tables)
```
bookings
chat_messages
chat_sessions
company_organizations
feedback
notifications
prestadores
profiles
```

### What Should Exist After Migrations (25+ tables)
```
bookings                    ✅ exists
chat_messages              ✅ exists
chat_sessions              ✅ exists
companies                  ❌ missing
company_employees          ❌ missing
company_organizations      ✅ exists
feedback                   ✅ exists
notifications              ✅ exists (but missing is_read column)
prestador_availability     ❌ missing
prestador_specializations  ❌ missing
prestadores                ✅ exists
profiles                   ✅ exists
resources                  ❌ missing
resource_access_log        ❌ missing
user_milestones            ❌ missing
user_progress              ❌ missing
specialist_assignments     ❌ missing
user_roles                 ❌ missing
invites                    ❌ missing
... and more accounting/admin tables
```

---

## Recommended Action: Option A (Complete Migration)

### Why?
1. **One-time setup** - do it once, all features work
2. **No ongoing issues** - code expects these tables
3. **Future-proof** - admin, payment, and analytics features ready
4. **Type safety** - TypeScript definitions already exist

### How:

**If using Supabase CLI locally:**
```bash
supabase link --project-ref ygxamuymjjpqhjoegweb
supabase db push
```

**If no CLI - use Supabase Dashboard:**
1. Go to SQL Editor
2. Run the 4 core migrations manually (see above)
3. Restart the app
4. All 404 errors should be gone

---

## What Changes After Migration

### Before Migration ❌
```
Login successful
→ Redirect to /user/dashboard
→ 404 errors for:
  - user_milestones
  - company_employees
  - user_progress
  - notifications (column mismatch)
  - bookings (relation errors)
→ Dashboard shows loading forever or blank
```

### After Migration ✅
```
Login successful
→ Redirect to /user/dashboard
→ All tables found
→ Milestones display
→ Session balance shown
→ Bookings list loads
→ Notifications appear
→ All dashboards work
```

---

## Post-Migration Checklist

After applying migrations:

- [ ] Refresh Supabase dashboard - verify 25+ tables exist
- [ ] Run `npm run dev` locally
- [ ] Log in with test account
- [ ] Verify no 404 errors in browser console
- [ ] Test each dashboard:
  - [ ] User Dashboard (milestones, bookings, session balance)
  - [ ] Company Dashboard (employees, metrics)
  - [ ] Specialist Dashboard (assignments, metrics)
  - [ ] Admin Dashboard (if exists)
- [ ] Check RLS policies are active
- [ ] Verify RPC functions work

---

## Timeline

- **Apply Migrations:** 10-15 minutes (using CLI)
- **Verify Setup:** 5 minutes
- **Test Features:** 10 minutes
- **Total:** ~30 minutes to fully operational

---

## Summary

The 404 errors occurring after successful login are caused by **unapplied database migrations**. The solution is to run the migration files that already exist in the project. This is a one-time setup step that will restore full database functionality.

**Next Step:** Choose between:
1. **Use Supabase CLI** (easiest if installed)
2. **Use Supabase Dashboard SQL Editor** (if CLI not available)
3. **Contact support** if migrations fail

All migration files are ready to go - they just need to be applied!
