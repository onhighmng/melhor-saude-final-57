# Root Cause Analysis - Registration Failures

## 🔍 Root Causes Identified

### ROOT CAUSE #1: invites.company_id is NOT NULL
**File:** `supabase/migrations/20251026165114_82623fdb-4b32-4552-9109-f53e8d426b40.sql`  
**Line:** 56

```sql
company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
```

**Problem:**
- The `invites` table requires `company_id` to be NOT NULL
- But specialist and prestador codes DON'T have companies
- When admin tries to generate specialist/prestador codes, the database rejects them

**Impact:**
- ❌ Cannot generate specialist codes
- ❌ Cannot generate prestador codes
- ✅ Company employee codes work (they have company_id)
- ✅ HR codes work (they create a company)

**Solution:** Make `company_id` nullable for non-company user types

```sql
-- FIX: Make company_id nullable
ALTER TABLE invites ALTER COLUMN company_id DROP NOT NULL;
```

### ROOT CAUSE #2: Role Assignment May Fail Silently

**Files:**
- `src/pages/RegisterCompany.tsx` (lines 155-170)
- `src/pages/RegisterEmployee.tsx` (lines 176-191)

**Problem:**
Both files wrap role creation in try-catch and DON'T throw errors:
```typescript
try {
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({...});
  if (roleError && roleError.code !== '23505') {
    console.error('Role creation error:', roleError);
    // Don't throw - continue with registration  ← SILENT FAILURE
  }
} catch (error: any) {
  console.error('Error creating role:', error);
  // Don't throw - continue with registration  ← SILENT FAILURE
}
```

**Impact:**
- User account is created
- Profile is created
- But NO ROLE is assigned
- User can't login or gets redirected to wrong dashboard
- Error is only visible in console

**Solution:** At minimum, log to admin_logs table when role creation fails

### ROOT CAUSE #3: Missing Error Visibility

**Problem:**
All registration flows catch errors but don't provide detailed feedback:
- Console errors are hidden from users
- Database errors are generic
- No way to diagnose issues

**Solution:** Add detailed error logging and user feedback

### ROOT CAUSE #4: app_role ENUM doesn't include 'especialista_geral'

**File:** `supabase/migrations/20251026165114_82623fdb-4b32-4552-9109-f53e8d426b40.sql`  
**Line:** 2

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'hr', 'prestador', 'specialist');
```

**Problem:**
- ENUM has 'specialist'
- But database role is 'especialista_geral'
- This mismatch causes insertion failures

**Impact:**
- When trying to insert 'especialista_geral' into user_roles, it fails
- Error: "invalid input value for enum app_role"

**Solution:** Update enum OR change all code to use 'specialist' instead of 'especialista_geral'

## 🔧 Complete Fix SQL

Run this in Supabase SQL Editor:

```sql
-- =====================================================
-- FIX ALL REGISTRATION ISSUES
-- =====================================================

-- FIX 1: Make company_id nullable for specialist/prestador codes
ALTER TABLE invites ALTER COLUMN company_id DROP NOT NULL;

-- FIX 2: Add 'especialista_geral' to app_role enum
-- NOTE: Can't directly alter enum, need to recreate it
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'especialista_geral';

-- FIX 3: Clean up any broken invites with NULL roles
DELETE FROM invites WHERE role IS NULL;

-- FIX 4: Verify table structures
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'invites'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- FIX 5: Check enum values
SELECT unnest(enum_range(NULL::app_role)) as allowed_roles;

-- FIX 6: Test code generation
SELECT generate_access_code('specialist', NULL, '{}'::jsonb, 30) as specialist_code;
SELECT generate_access_code('prestador', NULL, '{}'::jsonb, 30) as prestador_code;

-- FIX 7: Verify the codes were created correctly
SELECT 
  invite_code,
  role,
  company_id,
  status,
  expires_at
FROM invites
ORDER BY created_at DESC
LIMIT 5;

-- FIX 8: Test validation
-- Use one of the codes from above
SELECT * FROM validate_access_code('CODE_HERE');
```

## 📋 Testing Checklist

After running the fix SQL, test each registration type:

### ✅ Test 1: Company Registration
1. Go to `/register/company`
2. Fill in all fields:
   - Company Name: "Test Company Ltd"
   - Sector: "Tecnologia"
   - Contact Name: "John Doe"
   - Email: "test@example.com"
   - Phone: "+258 84 123 4567"
   - Sessions: 100
   - Accept terms
3. Submit
4. **Expected:** Success message with credentials
5. **Check database:**
   ```sql
   SELECT * FROM companies WHERE company_name = 'Test Company Ltd';
   SELECT * FROM profiles WHERE email = 'test@example.com';
   SELECT * FROM user_roles WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@example.com');
   ```

### ✅ Test 2: Specialist Registration
1. Admin: Generate specialist code
2. Go to `/register`
3. Enter specialist code
4. Fill in personal details
5. Submit
6. **Expected:** Success, redirects to `/especialista/dashboard`
7. **Check database:**
   ```sql
   SELECT ur.role, p.name, p.email 
   FROM user_roles ur
   JOIN profiles p ON ur.user_id = p.id
   WHERE ur.role = 'especialista_geral'
   ORDER BY p.created_at DESC
   LIMIT 1;
   ```

### ✅ Test 3: Prestador Registration
1. Admin: Generate prestador code
2. Go to `/register`
3. Enter prestador code
4. Fill in professional details
5. Submit
6. **Expected:** Success, redirects to `/prestador/dashboard`
7. **Check database:**
   ```sql
   SELECT ur.role, p.name, pre.specialty
   FROM user_roles ur
   JOIN profiles p ON ur.user_id = p.id
   LEFT JOIN prestadores pre ON pre.user_id = p.id
   WHERE ur.role = 'prestador'
   ORDER BY p.created_at DESC
   LIMIT 1;
   ```

### ✅ Test 4: Employee Registration
1. Company HR: Generate employee code
2. Go to `/register/employee`
3. Enter code
4. Fill in details
5. Submit
6. **Expected:** Success
7. **Check database:**
   ```sql
   SELECT ce.*, p.name, p.email
   FROM company_employees ce
   JOIN profiles p ON ce.user_id = p.id
   ORDER BY ce.created_at DESC
   LIMIT 1;
   ```

## 🐛 Common Errors and Solutions

### Error: "relation 'invites' does not exist"
**Solution:** Run migrations first
```bash
# In Supabase SQL Editor, run all migration files in order
```

### Error: "company_id violates not-null constraint"
**Solution:** Run FIX 1 above to make company_id nullable

### Error: "invalid input value for enum app_role: 'especialista_geral'"
**Solution:** Run FIX 2 above to add value to enum

### Error: "function generate_access_code does not exist"
**Solution:** Run `FIX_GENERATE_ACCESS_CODE_COMPLETE.sql`

### Error: "Tipo de utilizador inválido" in Register.tsx
**Solution:** Already fixed! We added the specialist case to the switch statement

## 📊 Quick Diagnostic Query

Run this to see the current state:

```sql
-- Show table existence
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'user_roles', 'companies', 'company_employees', 'invites', 'prestadores')
ORDER BY table_name;

-- Show recent codes
SELECT 
  invite_code,
  role,
  company_id IS NULL as no_company,
  status,
  created_at
FROM invites
ORDER BY created_at DESC
LIMIT 10;

-- Show enum values
SELECT enumlabel as allowed_role
FROM pg_enum
WHERE enumtypid = 'app_role'::regtype
ORDER BY enumsortorder;

-- Show recent user registrations
SELECT 
  p.name,
  p.email,
  p.created_at,
  STRING_AGG(ur.role::text, ', ') as roles
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
GROUP BY p.id, p.name, p.email, p.created_at
ORDER BY p.created_at DESC
LIMIT 10;
```

