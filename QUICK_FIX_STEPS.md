# ⚡ Quick Fix: Company Registration 403/409 Errors

## Problem
```
❌ 403: permission denied for table companies
❌ 409: Failed to load resource
```

## Root Cause
Missing RLS INSERT policy for HR users creating companies during registration.

---

## 🚀 FIX IN 2 MINUTES

### Step 1: Apply Migration
1. Open: **Supabase Dashboard → SQL Editor**
2. Copy file: `supabase/migrations/20251101_fix_company_registration_rls.sql`
3. Paste into SQL Editor
4. Click **Run**

### Step 2: Test
1. Clear browser cache: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Go to: **http://localhost:8080/register/company**
3. Fill form and submit
4. ✅ Should work now!

---

## ✅ What Gets Fixed

| Before | After |
|--------|-------|
| ❌ HR users blocked from creating companies | ✅ HR users can create companies |
| ❌ Only admins can insert | ✅ HR or admin can insert |
| ❌ No email verification | ✅ Email must match auth.users.email |
| ❌ Conflicting policies | ✅ Unified, clean policies |
| ❌ company_employees blocked | ✅ Users can insert own employee record |

---

## 🔍 Verify It Works

```sql
-- In Supabase SQL Editor, run:
SELECT policyname FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY policyname;

-- Should show:
-- admins_create_companies
-- admins_manage_all_companies
-- hr_create_company_registration  ← This was missing!
-- hr_update_own_company
-- hr_view_own_company
-- view_active_companies
```

---

## 📝 What Changed

- ✅ Dropped 9 conflicting policies
- ✅ Created 7 unified policies  
- ✅ Added email verification logic
- ✅ Fixed company_employees policies
- ✅ 0 data changes (RLS only)
- ✅ 100% backward compatible

---

## 📞 Still Getting Errors?

See full guide: `COMPANY_REGISTRATION_FIX.md`

**Quick checks:**
1. Hard refresh browser (Cmd+Shift+R)
2. Logout and login again
3. Check migration ran: `supabase migration list`
4. Verify policies: Run SQL query above

---

**Status:** ✅ Ready to Deploy  
**Time to Deploy:** 2 minutes  
**Risk Level:** 🟢 Low (RLS only, no data changes)
