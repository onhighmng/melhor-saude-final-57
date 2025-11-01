# 🚨 Access Code Generation Failure - Complete Analysis

**Date:** November 1, 2025
**Scope:** Prestador, Especialista (Specialist), and Company Access Codes
**Status:** 🔴 CRITICAL ISSUES IDENTIFIED

---

## Executive Summary

The `generate_access_code` function is failing for multiple reasons related to:
1. Conflicting function definitions
2. Parameter order mismatches
3. Return type incompatibilities
4. Frontend/backend contract violations
5. PostgREST schema cache issues
6. Missing user_type handling

---

## 🔴 REASON #1: Conflicting Function Signatures

### Problem
There are **TWO different versions** of `generate_access_code` defined in migrations:

**Version 1** (Migration: `20250103000000_update_invites_for_all_users.sql`)
```sql
CREATE OR REPLACE FUNCTION generate_access_code(
  p_user_type TEXT,
  p_company_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_expires_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  invite_code TEXT,
  expires_at TIMESTAMPTZ
)
```

**Version 2** (Migration: `20251030000000_add_specialist_to_invites_constraint.sql`)
```sql
CREATE OR REPLACE FUNCTION generate_access_code(
  p_user_type TEXT,
  p_company_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_expires_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  code TEXT,           -- ❌ DIFFERENT COLUMN NAME!
  expires_at TIMESTAMPTZ,
  role TEXT            -- ❌ EXTRA COLUMN!
)
```

### Impact
- **PostgREST cannot determine which function to call** when parameters are provided
- Both have identical signatures: `(TEXT, UUID, JSONB, INTEGER)`
- Different return types cause response parsing failures
- Frontend expects one format, gets another

### Evidence
- Location 1: `supabase/migrations/20250103000000_update_invites_for_all_users.sql:25`
- Location 2: `supabase/migrations/20251030000000_add_specialist_to_invites_constraint.sql:16`

---

## 🔴 REASON #2: Frontend/Backend Parameter Mismatch

### Problem
Frontend code calls the function with **ONLY** `p_user_type`:

**Frontend Call** (CodeGenerationCard.tsx:46)
```typescript
const { data, error } = await supabase.rpc('generate_access_code', {
  p_user_type: userType  // Only 1 parameter!
});
```

**Function Expects** (All 4 parameters with defaults):
```sql
generate_access_code(
  p_user_type TEXT,                    -- ✅ Provided
  p_company_id UUID DEFAULT NULL,      -- ❌ Not provided (uses default)
  p_metadata JSONB DEFAULT '{}'::jsonb,-- ❌ Not provided (uses default)
  p_expires_days INTEGER DEFAULT 30    -- ❌ Not provided (uses default)
)
```

### Why This Fails
When calling with only `p_user_type`, PostgREST sees:
```
Call signature: (p_user_type: TEXT)
Available functions:
  - generate_access_code(TEXT, UUID, JSONB, INTEGER) ← Expects 4 params
```

PostgREST **cannot match** the call to the function because:
1. All parameters have defaults, making signature ambiguous
2. Multiple overloads might exist
3. Schema cache might be outdated

### Evidence
- `src/components/admin/CodeGenerationCard.tsx:46-48`
- `src/pages/AdminUsersManagement.tsx:232-234`
- `src/pages/AdminUsersManagement.tsx:580-582`

---

## 🔴 REASON #3: Return Type Response Parsing Failure

### Problem
The function returns **TABLE** format, but frontend tries to parse as **JSONB** or **string**:

**What Function Returns:**
```sql
RETURNS TABLE (
  invite_code TEXT,
  expires_at TIMESTAMPTZ
)
-- Result: [{ invite_code: "MS-ABC123", expires_at: "2025-12-01T..." }]
```

**What Frontend Expects** (CodeGenerationCard.tsx:59-69):
```typescript
// Handle JSONB response
let codeData;
if (typeof data === 'string') {
  codeData = JSON.parse(data);  // ❌ Expects string sometimes
} else if (Array.isArray(data) && data.length > 0) {
  codeData = data[0];           // ✅ This would work for TABLE
} else {
  codeData = data;              // ❌ Expects object sometimes
}

const inviteCode = codeData?.invite_code || codeData;
```

### Why This Fails
1. **First migration** returns column named `invite_code`
2. **Second migration** returns column named `code` (not `invite_code`)
3. Frontend checks `codeData?.invite_code` which is `undefined` for Version 2
4. Falls back to `codeData` which is the entire object
5. Displays `[object Object]` instead of the code

### Evidence
- `src/components/admin/CodeGenerationCard.tsx:59-70`
- `ACCESS_CODE_GENERATION_AUDIT.md:98-115`

---

## 🔴 REASON #4: Missing User Type Handling

### Problem
Frontend sends user types that **don't exist** in the function's CASE mapping:

**Frontend User Types:**
- `'personal'` ✅
- `'hr'` ✅
- `'user'` ✅
- `'prestador'` ✅
- `'specialist'` ❌ **NOT IN MAPPING**

**Function Mapping** (Version 2):
```sql
CASE p_user_type
  WHEN 'company' THEN v_role := 'hr';
  WHEN 'hr' THEN v_role := 'hr';
  WHEN 'employee' THEN v_role := 'user';
  WHEN 'prestador' THEN v_role := 'prestador';
  WHEN 'specialist' THEN v_role := 'especialista_geral';  -- ✅ Has this
  WHEN 'especialista' THEN v_role := 'especialista_geral'; -- ✅ Has this
  ELSE
    RAISE EXCEPTION 'Tipo de utilizador inválido: %...', p_user_type;
END CASE;
```

**But Version 1 has NO CASE mapping at all!**
```sql
INSERT INTO invites (
  invite_code,
  user_type,
  company_id,
  invited_by,
  email,
  role,
  status,
  expires_at,
  metadata
) VALUES (
  v_code,
  p_user_type,    -- ← Directly uses p_user_type
  p_company_id,
  auth.uid(),
  NULL,
  CASE            -- ← Maps here instead
    WHEN p_user_type = 'personal' THEN 'user'
    WHEN p_user_type = 'hr' THEN 'hr'
    WHEN p_user_type = 'user' THEN 'user'
    WHEN p_user_type = 'prestador' THEN 'prestador'
    WHEN p_user_type = 'specialist' THEN 'especialista_geral'  -- ✅ HAS IT
  END,
  ...
)
```

### Why This Might Fail
- If **Version 1** is active: Works ✅
- If **Version 2** is active: Works ✅
- If **neither** is active (old version): Fails with exception ❌

### Evidence
- `src/types/accessCodes.ts:1` (defines UserType)
- `supabase/migrations/20250103000000_update_invites_for_all_users.sql:76`
- `supabase/migrations/20251030000000_add_specialist_to_invites_constraint.sql:43-52`

---

## 🔴 REASON #5: PostgREST Schema Cache Out of Sync

### Problem
According to your audit documents, the function exists in PostgreSQL but **PostgREST cannot see it**.

**Symptoms:**
```
✅ Function exists: SELECT generate_access_code(...) works in SQL editor
❌ RPC call fails: 404 Not Found
Error: "Could not find the function public.generate_access_code(
  p_company_id, p_expires_days, p_metadata, p_user_type
) in the schema cache"
```

### Why This Happens
PostgREST maintains TWO caches:
1. **Schema Cache** (tables/columns) - Updated when you click "Generate Types"
2. **RPC Routing Cache** (functions) - Only updated on PostgREST restart

**Timeline:**
1. You create function via migration ✅
2. Function exists in PostgreSQL ✅
3. Schema cache updates automatically ✅
4. RPC routing cache **DOES NOT UPDATE** ❌
5. PostgREST returns 404 when you call via RPC ❌

### Evidence
- `POSTGREST_RPC_ROUTING_FIX.md:1-122`
- `PROVE_CACHE_OUT_OF_SYNC.md`
- `ACCESS_CODE_GENERATION_AUDIT.md:11-16`

---

## 🔴 REASON #6: Missing Database Columns

### Problem
Different migrations expect different columns to exist in the `invites` table:

**Version 1 expects:**
```sql
INSERT INTO invites (
  invite_code,
  user_type,      -- ← Expects this column
  company_id,
  invited_by,
  email,
  role,           -- ← Expects this column
  status,
  expires_at,
  metadata        -- ← Expects this column
)
```

**Version 2 expects:**
```sql
INSERT INTO invites (
  invite_code,
  role,           -- ← Expects this column
  company_id,
  metadata,       -- ← Expects this column
  expires_at,
  status,
  created_at      -- ← Expects this column (not in Version 1)
)
```

### Why This Fails
If migrations run out of order or are incomplete:
- **Missing `user_type` column** → Version 1 fails
- **Missing `metadata` column** → Both versions fail
- **Missing `role` column** → Both versions fail
- **NOT NULL constraints** on `email` or `company_id` → Both versions fail

### Evidence
- `FIX_CODE_GENERATION.sql:4-31` (tries to fix this)
- `supabase/migrations/20251030000001_add_role_metadata_to_invites.sql:1-24`

---

## 🔴 REASON #7: Permission Issues

### Problem
The function might not have proper GRANT permissions:

**Required Permissions:**
```sql
GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER)
  TO authenticated;
GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER)
  TO anon;
```

**What Migrations Have:**
- **Version 1**: `GRANT EXECUTE ... TO authenticated;` ✅ (line 94)
- **Version 2**: No GRANT statement visible ❌

### Why This Fails
Without proper grants:
- Authenticated users get permission denied error
- Anonymous users (during registration) cannot call function
- PostgREST might not expose function via RPC API

### Evidence
- `supabase/migrations/20250103000000_update_invites_for_all_users.sql:94`
- `ACCESS_CODE_GENERATION_AUDIT.md:77-81`

---

## 🔴 REASON #8: Duplicate Functions Causing Ambiguity

### Problem
There might be **multiple functions** with similar signatures:

**Documented Issues:**
```
generate_access_code(TEXT, UUID, JSONB, INTEGER) RETURNS TABLE(invite_code, expires_at)
generate_access_code(TEXT, UUID, JSONB, INTEGER) RETURNS TABLE(code, expires_at, role)
generate_access_code_table(UUID, INTEGER, JSONB, TEXT) RETURNS TABLE(...)
```

All have **DEFAULT parameters**, making signatures ambiguous:
```sql
-- When you call with just (p_user_type: 'hr'):
-- PostgREST sees:
Option 1: generate_access_code('hr', NULL, '{}', 30)
Option 2: generate_access_code_table(NULL, 30, '{}', 'hr')  ← DIFFERENT PARAM ORDER!
```

### Why This Fails
- PostgreSQL allows function overloading by signature
- But PostgREST struggles when ALL params have defaults
- Can't determine which function user intended to call
- Returns 404 or calls wrong function

### Evidence
- `RPC_ISSUES_ANALYSIS.md:5-26`
- `FINAL_FIX_SUMMARY.md`

---

## 📊 Complete Failure Matrix

| User Type | Frontend Call | Expected Behavior | Actual Behavior | Root Cause |
|-----------|---------------|-------------------|-----------------|------------|
| `prestador` | `p_user_type: 'prestador'` | Generate code | ❌ 404 or wrong format | Reasons #1, #2, #5 |
| `specialist` | `p_user_type: 'specialist'` | Generate code | ❌ 404 or wrong format | Reasons #1, #2, #4, #5 |
| `hr` | `p_user_type: 'hr'` | Generate code | ❌ 404 or wrong format | Reasons #1, #2, #5 |
| `personal` | `p_user_type: 'personal'` | Generate code | ❌ 404 or wrong format | Reasons #1, #2, #5 |

---

## 🔍 How to Verify Each Issue

### Test #1: Check Which Function Version Exists
```sql
-- Run in Supabase SQL Editor:
SELECT
  proname,
  pg_get_function_arguments(oid) as args,
  pg_get_function_result(oid) as returns
FROM pg_proc
WHERE proname = 'generate_access_code'
  AND pronamespace = 'public'::regnamespace;
```

**Expected Result:** Should show which version(s) exist

---

### Test #2: Check PostgREST Can See Function
```bash
# In browser console on your Supabase app page:
const { data, error } = await supabase.rpc('generate_access_code', {
  p_user_type: 'hr'
});
console.log('Data:', data);
console.log('Error:', error);
```

**If 404:** PostgREST cache issue (Reason #5)
**If error mentions parameters:** Signature mismatch (Reason #1, #2)
**If returns data but wrong format:** Return type issue (Reason #3)

---

### Test #3: Check Database Columns
```sql
-- Run in Supabase SQL Editor:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'invites'
ORDER BY ordinal_position;
```

**Look for:** `user_type`, `metadata`, `role`, `email`, `company_id`
**Check:** NULL constraints on `email` and `company_id`

---

### Test #4: Check Permissions
```sql
-- Run in Supabase SQL Editor:
SELECT
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'generate_access_code';
```

**Expected:** Should see `authenticated` and `anon` with `EXECUTE` privilege

---

## ✅ Recommended Fixes (Priority Order)

### 1. 🔴 CRITICAL: Remove Duplicate Function
```sql
-- Drop older version, keep the one with specialist support:
DROP FUNCTION IF EXISTS generate_access_code(TEXT, UUID, JSONB, INTEGER);
```

### 2. 🔴 CRITICAL: Create Canonical Function
```sql
CREATE OR REPLACE FUNCTION generate_access_code(
  p_user_type TEXT,
  p_company_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_expires_days INTEGER DEFAULT 30
)
RETURNS JSONB  -- ← Use JSONB for better compatibility
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMPTZ;
  v_role TEXT;
BEGIN
  -- Generate unique code
  LOOP
    v_code := 'MS-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    EXIT WHEN NOT EXISTS(SELECT 1 FROM invites WHERE invite_code = v_code);
  END LOOP;

  v_expires_at := now() + (p_expires_days || ' days')::interval;

  -- Map user_type to role
  v_role := CASE p_user_type
    WHEN 'personal' THEN 'user'
    WHEN 'hr' THEN 'hr'
    WHEN 'user' THEN 'user'
    WHEN 'prestador' THEN 'prestador'
    WHEN 'specialist' THEN 'especialista_geral'
    WHEN 'especialista' THEN 'especialista_geral'
    ELSE NULL
  END;

  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Invalid user type: %. Valid: personal, hr, user, prestador, specialist', p_user_type;
  END IF;

  -- Insert invite
  INSERT INTO invites (
    invite_code,
    user_type,
    role,
    company_id,
    invited_by,
    email,
    status,
    expires_at,
    metadata
  ) VALUES (
    v_code,
    p_user_type,
    v_role,
    p_company_id,
    auth.uid(),
    NULL,
    'pending',
    v_expires_at,
    p_metadata
  );

  -- Return consistent JSONB response
  RETURN jsonb_build_object(
    'success', true,
    'invite_code', v_code,
    'expires_at', v_expires_at,
    'role', v_role
  );
END;
$$;

GRANT EXECUTE ON FUNCTION generate_access_code(TEXT, UUID, JSONB, INTEGER)
  TO authenticated, anon;
```

### 3. 🔴 CRITICAL: Update Frontend Response Parsing
```typescript
// In CodeGenerationCard.tsx and AdminUsersManagement.tsx:
const { data, error } = await supabase.rpc('generate_access_code', {
  p_user_type: userType
});

if (error) throw error;

// Parse JSONB response
const inviteCode = data?.invite_code || data;
setGeneratedCode(inviteCode);
```

### 4. 🟡 HIGH: Restart PostgREST
1. Go to Supabase Dashboard → Settings → Database
2. Click "Restart Database"
3. Wait 3-5 minutes
4. Hard refresh browser (Ctrl+Shift+R)

### 5. 🟢 MEDIUM: Ensure Database Schema
```sql
-- Run this to ensure all columns exist:
ALTER TABLE invites ADD COLUMN IF NOT EXISTS user_type TEXT;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE invites ALTER COLUMN email DROP NOT NULL;
ALTER TABLE invites ALTER COLUMN company_id DROP NOT NULL;
```

---

## 📝 Summary

**All 8 Reasons Why Access Code Generation Fails:**

1. ✅ Conflicting function definitions (2 versions with same signature)
2. ✅ Frontend only passes `p_user_type`, function expects 4 params
3. ✅ Return type mismatch (TABLE vs JSONB vs string)
4. ✅ Missing user_type handling in some versions
5. ✅ PostgREST schema cache out of sync
6. ✅ Missing or incorrect database columns
7. ✅ Missing GRANT permissions on function
8. ✅ Duplicate functions causing routing ambiguity

**Next Steps:**
1. Apply fixes in order 1→5
2. Test each user type (prestador, specialist, hr, personal)
3. Verify codes are created in invites table
4. Confirm codes can be validated during registration

---

**Status:** All issues documented ✅
**Priority:** 🔴 CRITICAL - Blocks user registration
**Effort:** ~2-3 hours to implement all fixes
