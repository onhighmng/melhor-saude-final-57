# Quick Fix Instructions - Run SQL Step by Step

## The Error You Got
The error is because Supabase SQL Editor doesn't like complex dollar-quoted blocks (`DO $$`).

## The Solution
I created a simpler version. Run these **ONE AT A TIME** in Supabase SQL Editor.

---

## STEP 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Open your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

---

## STEP 2: Run Each Section Separately

Copy and paste each section below **one at a time**. Click **Run** after each section.

### Section 1: Make company_id nullable
```sql
ALTER TABLE invites ALTER COLUMN company_id DROP NOT NULL;
```
**Click Run** → Wait for success ✅

### Section 2: Add especialista_geral to enum
```sql
ALTER TYPE app_role ADD VALUE 'especialista_geral';
```
**Click Run** → Wait for success ✅ (May take 5-10 seconds)

### Section 3: Fix status constraint  
```sql
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_status_check;
ALTER TABLE invites ADD CONSTRAINT invites_status_check 
  CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled', 'revoked', 'used'));
```
**Click Run** → Wait for success ✅

### Section 4: Clean up broken codes
```sql
DELETE FROM invites WHERE role IS NULL;
```
**Click Run** → Wait for success ✅

### Section 5: Verify fixes
```sql
-- Check 1: company_id is nullable
SELECT 
  column_name,
  is_nullable,
  'Should be YES' as expected
FROM information_schema.columns
WHERE table_name = 'invites' AND column_name = 'company_id';

-- Check 2: enum has all roles
SELECT 
  enumlabel as role
FROM pg_enum
WHERE enumtypid = 'app_role'::regtype
ORDER BY enumsortorder;

-- Check 3: No NULL roles
SELECT 
  COUNT(*) as codes_with_null_role,
  'Should be 0' as expected
FROM invites 
WHERE role IS NULL;
```
**Click Run** → Check results:
- ✅ `is_nullable` should be **YES**
- ✅ `role` list should include **especialista_geral**
- ✅ `codes_with_null_role` should be **0**

### Section 6: See recent codes
```sql
SELECT 
  invite_code,
  role,
  CASE 
    WHEN company_id IS NULL THEN 'No company (specialist/prestador)'
    ELSE 'Has company (employee/HR)'
  END as company_status,
  status,
  expires_at > now() as is_valid,
  created_at
FROM invites
ORDER BY created_at DESC
LIMIT 10;
```
**Click Run** → See current codes

---

## STEP 3: Test Specialist Registration

1. Go to http://localhost:8081/admin/users
2. Click **Affiliates** tab  
3. Click **"Gerar Profesional de Permanencia"**
4. Copy the code
5. **Logout** (if logged in)
6. Go to http://localhost:8081/register
7. Paste the code
8. Fill in details and submit
9. **Expected:** ✅ Success!

---

## STEP 4: Test Company Registration

1. Go to http://localhost:8081/register/company
2. Fill in all fields
3. Submit
4. **Expected:** ✅ Success with credentials shown

---

## 🐛 If You Still Get Errors

### Error: "relation does not exist"
→ Tables haven't been created. Run migrations first.

### Error: "unterminated dollar-quoted string"  
→ You're still using the old file. Use the **SIMPLE** version above.

### Error: "role "especialista_geral" already exists"
→ That's OK! Just skip Section 2.

---

## ✅ Success!

Once all sections run successfully:
- ✅ You can generate specialist codes
- ✅ You can generate prestador codes
- ✅ Specialist registration works
- ✅ Company registration works
- ✅ All user types can register!

🎉 **Done!** Try registering now!

