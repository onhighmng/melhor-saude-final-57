# 🧪 Access Code Generation - Testing & Deployment Guide

**Date:** November 1, 2025
**Status:** ✅ FIXES IMPLEMENTED - READY FOR TESTING

---

## 📋 What Was Fixed

This deployment fixes all 8 critical issues with access code generation:

1. ✅ Removed duplicate function definitions
2. ✅ Created single canonical function with JSONB return type
3. ✅ Fixed frontend response parsing in CodeGenerationCard.tsx
4. ✅ Fixed frontend response parsing in AdminUsersManagement.tsx
5. ✅ Added support for all user types (prestador, specialist, hr, personal, user)
6. ✅ Ensured database columns exist (user_type, metadata, role)
7. ✅ Added proper GRANT permissions (authenticated, anon, service_role)
8. ✅ Eliminated routing ambiguity with single function signature

---

## 🚀 Deployment Steps

### Step 1: Apply the Migration

1. **Go to Supabase Dashboard:**
   - URL: https://app.supabase.com/project/YOUR_PROJECT_ID/sql/new

2. **Copy and run the migration:**
   ```bash
   # The migration file is in:
   supabase/migrations/20251101000000_fix_generate_access_code_canonical.sql
   ```

3. **OR use Supabase CLI:**
   ```bash
   supabase db push
   ```

4. **Verify migration succeeded:**
   ```sql
   -- Should return exactly 1 function
   SELECT
     proname,
     pg_get_function_arguments(oid) as args,
     pg_get_function_result(oid) as returns
   FROM pg_proc
   WHERE proname = 'generate_access_code'
     AND pronamespace = 'public'::regnamespace;
   ```

   **Expected Result:**
   ```
   proname              | args                                        | returns
   ---------------------|---------------------------------------------|--------
   generate_access_code | p_user_type text, p_company_id uuid DEFAULT | jsonb
                        | NULL::uuid, p_metadata jsonb DEFAULT '{}':: |
                        | jsonb, p_expires_days integer DEFAULT 30    |
   ```

---

### Step 2: Restart PostgREST (CRITICAL!)

**⚠️ This step is MANDATORY - without it, the function won't be accessible via RPC**

1. Go to: https://app.supabase.com/project/YOUR_PROJECT_ID/settings/database
2. Click **"Restart Database"** button
3. Wait 3-5 minutes for full restart
4. Monitor status until it shows "Healthy"

**Why this is needed:**
- PostgREST maintains an RPC routing cache
- New functions aren't routable until PostgREST restarts
- This refreshes the cache and makes the function accessible

---

### Step 3: Deploy Frontend Changes

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Deploy to production:**
   ```bash
   # Deploy using your deployment method
   # Examples:
   vercel deploy
   # OR
   netlify deploy --prod
   # OR
   git push origin main
   ```

3. **Hard refresh browser cache:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

---

## 🧪 Testing Procedures

### Test 1: Verify Function Exists

**Run in Supabase SQL Editor:**
```sql
-- Test direct SQL call
SELECT generate_access_code('prestador');
```

**Expected Response:**
```json
{
  "success": true,
  "invite_code": "MS-A1B2C3D4",
  "invite_id": "550e8400-e29b-41d4-a716-446655440000",
  "expires_at": "2025-12-01T12:00:00Z",
  "role": "prestador",
  "user_type": "prestador"
}
```

**✅ PASS if:** Returns JSONB object with all fields
**❌ FAIL if:** Returns error or NULL

---

### Test 2: Verify PostgREST Routing

**Run in browser console (on your app page):**
```javascript
const { data, error } = await supabase.rpc('generate_access_code', {
  p_user_type: 'hr'
});

console.log('Data:', data);
console.log('Error:', error);
```

**Expected Response:**
```javascript
Data: {
  success: true,
  invite_code: "MS-X1Y2Z3W4",
  invite_id: "...",
  expires_at: "...",
  role: "hr",
  user_type: "hr"
}
Error: null
```

**✅ PASS if:** data contains invite_code, error is null
**❌ FAIL if:** Error is 404 or "function not found"

**If Test 2 fails:** PostgREST hasn't restarted yet. Wait 2 more minutes and retry.

---

### Test 3: Generate Prestador Code

1. **Login as admin**
2. **Navigate to:** Admin → Users Management
3. **Find:** "Affiliates" card with prestador option
4. **Click:** "Gerar Código" button
5. **Observe:**
   - Loading spinner appears ✓
   - Toast notification: "Código gerado! Código Prestador: MS-XXXXXXXX" ✓
   - Modal opens with code displayed ✓
   - Code can be copied ✓

**✅ PASS if:** Code is generated and displayed correctly
**❌ FAIL if:** Error toast or "[object Object]" appears

---

### Test 4: Generate Specialist Code

1. **Login as admin**
2. **Navigate to:** Admin → Users Management → Code Generation
3. **Select:** User type "Specialist" or "Especialista"
4. **Click:** "Gerar Código"
5. **Observe:**
   - Toast: "Código gerado!" with specialist code ✓
   - Code starts with "MS-" ✓

**✅ PASS if:** Specialist code generated successfully
**❌ FAIL if:** Error or wrong user_type mapping

---

### Test 5: Generate HR Code

1. **Login as admin**
2. **Navigate to:** Admin → Users Management
3. **Find:** HR code generation section
4. **Click:** "Gerar Código HR"
5. **Observe:**
   - Toast: "Código HR gerado! Código: MS-XXXXXXXX" ✓
   - Code appears in codes list ✓

**✅ PASS if:** HR code generated and listed
**❌ FAIL if:** 404 error or generation fails

---

### Test 6: Generate Personal Code

**Using CodeGenerationCard component:**
```typescript
// Test via component
<CodeGenerationCard
  userType="personal"
  title="Utilizadores Pessoais"
  description="Código para registo individual"
  onStatsUpdate={refreshStats}
/>
```

**Click generate → Should create personal user code**

**✅ PASS if:** Code generated with user_type='personal', role='user'
**❌ FAIL if:** Error or wrong mapping

---

### Test 7: Verify Code in Database

**Run in Supabase SQL Editor:**
```sql
-- Check last 5 generated codes
SELECT
  invite_code,
  user_type,
  role,
  status,
  expires_at,
  created_at
FROM invites
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Result:**
```
invite_code   | user_type  | role              | status  | expires_at
--------------|------------|-------------------|---------|------------
MS-A1B2C3D4   | prestador  | prestador         | pending | 2025-12-01
MS-X1Y2Z3W4   | hr         | hr                | pending | 2025-12-01
MS-E5F6G7H8   | specialist | especialista_geral| pending | 2025-12-01
MS-I9J0K1L2   | personal   | user              | pending | 2025-12-01
```

**✅ PASS if:** All columns populated correctly
**❌ FAIL if:** NULL values or missing columns

---

### Test 8: Validate Code During Registration

1. **Logout** (or use incognito window)
2. **Go to registration page**
3. **Enter one of the generated codes** (e.g., prestador code)
4. **Observe:**
   - Code validates successfully ✓
   - Shows: "Código válido para Prestador" ✓
   - Registration form adapts to user type ✓

**✅ PASS if:** Code validates and shows correct user type
**❌ FAIL if:** "Código inválido" error

---

### Test 9: Complete Registration Flow

1. **Use a specialist code** from Test 4
2. **Complete registration:**
   - Name, email, password
   - Specialist-specific fields
3. **Submit registration**
4. **Verify in database:**
   ```sql
   SELECT
     email,
     role,
     status
   FROM invites
   WHERE invite_code = 'MS-XXXXXXXX';  -- Your code
   ```

**Expected:**
```
email              | role              | status
-------------------|-------------------|--------
user@example.com   | especialista_geral| accepted
```

**✅ PASS if:** Code marked as 'accepted', user created with correct role
**❌ FAIL if:** Status still 'pending' or user has wrong role

---

### Test 10: Verify Permissions

**Run as authenticated user (non-admin):**
```sql
SELECT generate_access_code('personal');
```

**Expected Result:**
- ✅ Admin: Should work (generates code)
- ✅ HR: Should work (for their company)
- ❌ Regular user: Should fail (permission denied) - THIS IS CORRECT

**If regular users CAN generate codes:** This is a security issue! RLS policies need review.

---

## 🚨 Troubleshooting

### Issue 1: "Function not found" (404)

**Symptom:** Error: `Could not find function generate_access_code`

**Cause:** PostgREST cache not refreshed

**Fix:**
1. Wait 5 minutes after database restart
2. Go to: Settings → API → Schema → Click page (wait 30 seconds)
3. Hard refresh browser: `Ctrl + Shift + R`
4. Try again

---

### Issue 2: "[object Object]" displayed instead of code

**Symptom:** UI shows `[object Object]` where code should be

**Cause:** Frontend parsing old response format

**Fix:**
1. Ensure you deployed the frontend changes
2. Clear browser cache completely
3. Hard refresh: `Ctrl + Shift + R`
4. Check browser console for errors

---

### Issue 3: "Invalid response format" error

**Symptom:** Toast shows "Failed to generate code - invalid response format"

**Cause:** Function returning old TABLE format instead of JSONB

**Fix:**
1. Verify migration ran successfully:
   ```sql
   SELECT pg_get_function_result(oid)
   FROM pg_proc
   WHERE proname = 'generate_access_code';
   ```
   Should return: `jsonb` (not `TABLE`)

2. If returns TABLE, re-run migration:
   ```sql
   -- Re-run the migration script
   -- supabase/migrations/20251101000000_fix_generate_access_code_canonical.sql
   ```

---

### Issue 4: "Permission denied" for admin

**Symptom:** Admin cannot generate codes

**Cause:** Missing GRANT permissions

**Fix:**
```sql
GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER)
  TO authenticated, anon, service_role;
```

---

### Issue 5: Code generated but not visible in UI

**Symptom:** Code created in DB but not showing in admin panel

**Cause:** Frontend loadCodes() function issue

**Fix:**
1. Check browser console for errors
2. Verify RLS policies allow reading invites:
   ```sql
   SELECT * FROM invites WHERE status = 'pending' LIMIT 1;
   ```
3. If returns no rows despite data existing, check RLS policies

---

## 📊 Success Criteria

**All fixes are working if:**

- ✅ Test 1-10 all PASS
- ✅ No 404 errors in browser console
- ✅ No "[object Object]" displayed in UI
- ✅ All user types generate codes correctly:
  - prestador → role: prestador ✓
  - specialist → role: especialista_geral ✓
  - hr → role: hr ✓
  - personal → role: user ✓
- ✅ Codes validate during registration
- ✅ Registration completes successfully
- ✅ Users created with correct roles

---

## 🎯 Rollback Plan

**If tests fail and you need to rollback:**

1. **Revert migration:**
   ```sql
   -- Drop the new function
   DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB, INTEGER);

   -- Restore old version (if you have backup)
   -- Run previous migration file
   ```

2. **Revert frontend code:**
   ```bash
   git revert HEAD~1  # Revert last commit
   git push origin main
   ```

3. **Restart database again**

---

## 📝 Post-Deployment Checklist

- [ ] Migration applied successfully
- [ ] Database restarted and healthy
- [ ] Frontend deployed to production
- [ ] Test 1: Direct SQL call works
- [ ] Test 2: RPC call via Supabase works
- [ ] Test 3: Prestador code generates
- [ ] Test 4: Specialist code generates
- [ ] Test 5: HR code generates
- [ ] Test 6: Personal code generates
- [ ] Test 7: Codes visible in database
- [ ] Test 8: Code validates during registration
- [ ] Test 9: Registration completes with code
- [ ] Test 10: Permissions work correctly
- [ ] No errors in browser console
- [ ] No errors in Supabase logs

---

## 🔗 Related Documentation

- **Issue Analysis:** `ACCESS_CODE_GENERATION_FAILURE_REASONS.md`
- **Migration File:** `supabase/migrations/20251101000000_fix_generate_access_code_canonical.sql`
- **Original Audit:** `ACCESS_CODE_GENERATION_AUDIT.md`
- **RPC Issues:** `RPC_ISSUES_ANALYSIS.md`

---

**Status:** Ready for deployment ✅
**Estimated Testing Time:** 30-45 minutes
**Risk Level:** 🟡 Medium (requires database restart)
