# Fresh Start Guide - Clean Setup with Correct Roles

## Overview
This guide helps you:
1. ✅ Clean up invalid/test companies and affiliates
2. ✅ Delete old access codes (generated before the fix)
3. ✅ Generate new codes with correct role mapping
4. ✅ Test that prestadores route correctly

---

## Step 1: Clean Up Invalid Data

### Option A: Delete Specific Items (Recommended)

Open **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Delete a specific company by name
DO $$
DECLARE
  v_company_name TEXT := 'Company Name Here'; -- ⚠️ CHANGE THIS
  v_company_id UUID;
BEGIN
  SELECT id INTO v_company_id FROM companies WHERE name ILIKE v_company_name;
  IF v_company_id IS NULL THEN
    RAISE NOTICE 'Company not found: %', v_company_name;
    RETURN;
  END IF;
  
  DELETE FROM company_employees WHERE company_id = v_company_id;
  DELETE FROM invites WHERE company_id = v_company_id;
  DELETE FROM companies WHERE id = v_company_id;
  
  RAISE NOTICE '✅ Deleted company: %', v_company_name;
END $$;
```

```sql
-- Delete a specific prestador by email
DO $$
DECLARE
  v_email TEXT := 'prestador@email.com'; -- ⚠️ CHANGE THIS
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM profiles WHERE email = v_email;
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Prestador not found: %', v_email;
    RETURN;
  END IF;
  
  DELETE FROM bookings WHERE prestador_id = v_user_id;
  DELETE FROM sessions WHERE prestador_id = v_user_id;
  DELETE FROM prestador_availability WHERE prestador_id = v_user_id;
  DELETE FROM prestadores WHERE user_id = v_user_id;
  DELETE FROM user_roles WHERE user_id = v_user_id;
  DELETE FROM profiles WHERE id = v_user_id;
  DELETE FROM auth.users WHERE id = v_user_id;
  
  RAISE NOTICE '✅ Deleted prestador: %', v_email;
END $$;
```

### Option B: Delete All Test Data (Use with Caution)

```sql
-- Delete all companies with test/demo in name or missing NUIT
DO $$
DECLARE
  v_company RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_company IN
    SELECT id, name FROM companies
    WHERE name ILIKE '%test%' OR name ILIKE '%demo%' OR nuit IS NULL
  LOOP
    DELETE FROM company_employees WHERE company_id = v_company.id;
    DELETE FROM invites WHERE company_id = v_company.id;
    DELETE FROM companies WHERE id = v_company.id;
    v_count := v_count + 1;
    RAISE NOTICE '✅ Deleted: %', v_company.name;
  END LOOP;
  RAISE NOTICE 'Total deleted: %', v_count;
END $$;
```

---

## Step 2: Delete Old Access Codes

Old codes were generated before the fix and may have wrong role mapping.

```sql
-- Delete all expired codes
DELETE FROM invites WHERE status = 'pending' AND expires_at < NOW();

-- Optional: Delete ALL pending codes to start completely fresh
DELETE FROM invites WHERE status = 'pending';
```

---

## Step 3: Generate New Access Codes

Now that old data is cleaned up, generate fresh codes in the admin dashboard:

### For Prestadores:
1. Login as **Admin**
2. Go to **Admin Users Management** (`/admin/users-management`)
3. Click on **"Affiliates"** tab (left side card)
4. Scroll to **"Códigos de Acesso"** section
5. Click **"Gerar Código"**
6. Copy the new code

### For Companies (HR):
1. Same admin page
2. Click on **"Empresas"** tab (left side card)
3. Scroll to **"Códigos de Acesso"** section
4. Click **"Gerar Código"**
5. Copy the new code

### Verify Code Has Correct Role:

```sql
-- Check the code was generated correctly
SELECT 
  invite_code,
  role,
  user_type,
  status,
  expires_at
FROM invites
WHERE invite_code = 'YOUR_CODE_HERE' -- ⚠️ CHANGE THIS
  AND status = 'pending';
```

**Expected for Prestador:**
- `role`: `prestador`
- `user_type`: `prestador`

**Expected for HR:**
- `role`: `hr`
- `user_type`: `hr`

---

## Step 4: Test the Fix

### Test Prestador Registration:

1. **Logout** from admin account
2. Go to **`/register`**
3. Enter the **new prestador code** you just generated
4. Complete registration with a **NEW email** (not used before)
5. Submit and wait for success message
6. **Login** with the new prestador credentials
7. ✅ **VERIFY:** You are redirected to `/prestador/dashboard` (NOT `/user/dashboard`)

### Expected Flow:
```
Registration → Login → /prestador/dashboard ✅
```

### If it still goes to `/user/dashboard`:
Check browser console for:
```
[Login] Role fetched: prestador  ← Should say 'prestador'
[Login] Redirecting to: /prestador/dashboard  ← Should go here
```

If you see `Role fetched: user`, check the database:
```sql
SELECT 
  p.email,
  ARRAY_AGG(ur.role) as roles,
  get_user_primary_role(p.id) as primary_role
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE p.email = 'your-new-prestador@email.com'
GROUP BY p.id;
```

---

## Quick Reference

### What Changed:
- **Old codes** (before fix): Role not passed in metadata → trigger defaults to 'user'
- **New codes** (after fix): Role passed in metadata → trigger assigns correct role

### Files Modified:
- `src/utils/registrationHelpers.ts`
- `src/pages/RegisterEmployee.tsx`
- `src/pages/RegisterCompany.tsx`
- `src/pages/AdminProviderNew.tsx`

### Cleanup Scripts:
- `CLEANUP_INVALID_DATA.sql` - Comprehensive cleanup scripts
- `FIX_EXISTING_PRESTADOR_ACCOUNTS.sql` - Fix accounts created before the fix

---

## Troubleshooting

### Problem: Still redirecting to wrong dashboard

**Solution:**
1. Clear browser cache completely
2. Try incognito/private window
3. Verify in database that role is correct
4. Check console logs during login

### Problem: Can't delete company/prestador

**Error:** Foreign key constraint violation

**Solution:** Delete in this order:
1. Related bookings/sessions first
2. Then company_employees or prestadores
3. Then user_roles
4. Then profiles
5. Finally companies or auth.users

---

## Success Criteria

✅ No invalid companies showing in admin
✅ No invalid prestadores showing in admin
✅ All pending codes have correct `role` field
✅ New prestador registration routes to `/prestador/dashboard`
✅ New HR registration routes to `/company/dashboard`
✅ No console errors during login

---

## Need Help?

If you encounter issues:
1. Check `QUICK_FIX_EXISTING_ACCOUNT.md` for fixing specific accounts
2. Check `TEST_PRESTADOR_ROUTING.md` for detailed test steps
3. Check `PRESTADOR_ROUTING_FIX.md` for technical explanation

