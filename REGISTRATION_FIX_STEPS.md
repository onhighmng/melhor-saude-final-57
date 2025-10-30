# How to Fix All Registration Issues - Step by Step

## 🔍 What's Wrong

You have **2 root causes** breaking registration:

1. **Database schema issue**: `invites.company_id` is NOT NULL, but specialist/prestador codes don't have companies
2. **Missing enum value**: `app_role` enum doesn't include `'especialista_geral'`

## ✅ How to Fix (5 minutes)

### Step 1: Run the Fix SQL (2 minutes)

1. Open **Supabase Dashboard** → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy ALL contents from `FIX_ALL_REGISTRATION_ISSUES.sql`
5. Paste into the editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message

**Expected output:**
```
NOTICE: ✅ All test codes generated successfully!
NOTICE: ✅ Registrations should now work!
```

### Step 2: Test Specialist Registration (2 minutes)

1. Open http://localhost:8081/admin/users
2. Click **Affiliates** tab
3. Click **"Gerar Profesional de Permanência"**
4. Copy the generated code
5. **Logout** (if logged in)
6. Go to http://localhost:8081/register
7. Paste the code
8. Fill in your details:
   - Name: Test Specialist
   - Email: specialist@test.com
   - Password: Test123!
   - Phone: +258 84 123 4567
   - Select a pillar
9. Click through steps and submit
10. **Expected:** Success! Redirects to `/especialista/dashboard`

### Step 3: Test Company Registration (2 minutes)

1. Go to http://localhost:8081/register/company
2. Fill in all fields:
   - Company Name: Test Company Ltd
   - Sector: Tecnologia
   - Contact Name: Jane Doe
   - Email: company@test.com
   - Phone: +258 84 999 8888
   - Total Sessions: 100
   - Accept terms
3. Click through steps and submit
4. **Expected:** Success with credentials shown
5. **Logout** and login with the new credentials
6. **Expected:** Redirected to `/company/dashboard`

### Step 4: Test Prestador Registration (1 minute)

1. Admin: Generate prestador code
2. Use it at /register
3. Fill in professional details
4. **Expected:** Success!

## 🐛 If It Still Doesn't Work

### Check Browser Console

1. Open browser (F12)
2. Go to **Console** tab
3. Try registration again
4. Look for error messages
5. Copy the EXACT error and send it to me

### Check Database

Run this in Supabase SQL Editor:

```sql
-- Check if fix was applied
SELECT 
  'company_id nullable?' as check_name,
  is_nullable as result
FROM information_schema.columns
WHERE table_name = 'invites' AND column_name = 'company_id'

UNION ALL

SELECT 
  'especialista_geral in enum?' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'especialista_geral' 
    AND enumtypid = 'app_role'::regtype
  ) THEN 'YES' ELSE 'NO' END as result;
```

**Expected:**
- company_id nullable? → YES
- especialista_geral in enum? → YES

### Still Broken?

Send me:
1. The error message from browser console
2. The result of the database check above
3. Which registration type is failing (specialist/company/prestador/employee)

## 📚 What We Fixed

### In the Code (Already Done ✅)
- ✅ Added `specialist` case to `Register.tsx` switch statement
- ✅ Specialist can now select pillar
- ✅ Specialist registration data properly formatted

### In the Database (You Need to Run SQL ⚠️)
- ⚠️ Made `invites.company_id` nullable
- ⚠️ Added `'especialista_geral'` to `app_role` enum
- ⚠️ Cleaned up broken codes with NULL roles

## 🎯 Quick Test Command

After running the fix, test everything with this:

```bash
# 1. Check server is running
# Visit http://localhost:8081

# 2. Test specialist registration
#    - Admin → Generate specialist code
#    - /register → Use code
#    - Should work!

# 3. Test company registration  
#    - /register/company
#    - Fill form
#    - Should work!
```

## ✅ Success Criteria

After the fix:
- ✅ Can generate specialist codes
- ✅ Can generate prestador codes
- ✅ Can register with specialist code
- ✅ Can register with prestador code
- ✅ Can register new company
- ✅ Can register employee with company code

All registration flows should now work! 🎉

