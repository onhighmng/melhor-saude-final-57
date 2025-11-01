# ⚠️ CRITICAL RLS ISSUES FOUND - SECURITY & FUNCTIONALITY CONCERNS

## Issue 1: PROFILES Table - Still Checking profiles.role (OLD CODE)
**Severity:** 🔴 CRITICAL  
**Location:** Multiple RLS policies still check `profiles.role = 'admin'`

### Affected Policies (in 20250102000002_create_rls_policies.sql):
```sql
-- LINE 31-34: BROKEN
CREATE POLICY "admins_view_all_profiles" ON profiles FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- LINE 36-41: BROKEN
CREATE POLICY "hr_view_company_employees" ON profiles FOR SELECT 
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'hr'
    )
  );
```

**Impact:** HR and admin users cannot view profiles
**Status:** ❌ NOT FIXED IN LATEST MIGRATION

---

## Issue 2: COMPANY_EMPLOYEES Table - Still Checking profiles.role
**Severity:** 🔴 CRITICAL  
**Location:** 20250102000002_create_rls_policies.sql (Lines 128-145)

```sql
-- LINE 128-133: BROKEN
CREATE POLICY "hr_view_company_employees" ON company_employees FOR SELECT 
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- LINE 140-145: BROKEN
CREATE POLICY "hr_update_company_employees" ON company_employees FOR UPDATE 
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- LINE 135-138: BROKEN
CREATE POLICY "admins_view_all_employees" ON company_employees FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

**Impact:** HR cannot manage company employees, admins cannot view employees
**Affected Pages:** AdminEmployeesTab.tsx, CompanyCollaborators.tsx
**Status:** ❌ NOT FIXED

---

## Issue 3: PRESTADORES Table - Still Checking profiles.role
**Severity:** 🔴 CRITICAL  
**Location:** 20250102000002_create_rls_policies.sql (Lines 114-122)

```sql
-- LINE 114-117: BROKEN
CREATE POLICY "admins_view_all_prestadores" ON prestadores FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- LINE 119-122: BROKEN
CREATE POLICY "admins_update_all_prestadores" ON prestadores FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

**Impact:** Admins cannot view/manage prestadores
**Affected Pages:** AdminProviders.tsx, AdminProviderDetail.tsx
**Status:** ❌ NOT FIXED

---

## Issue 4: RESOURCES Table - Still Checking profiles.role
**Severity:** 🔴 CRITICAL  
**Location:** 20250102000002_create_rls_policies.sql (Lines 160-163)

```sql
-- LINE 160-163: BROKEN
CREATE POLICY "admins_manage_resources" ON resources FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

**Impact:** Admins cannot manage resources
**Affected Pages:** AdminResources.tsx, CompanyResources.tsx
**Status:** ❌ NOT FIXED

---

## Issue 5: BOOKINGS Table - Mixed Old/New RLS Policies
**Severity:** 🔴 CRITICAL  
**Location:** Two conflicting migration files

### In 20250102000002_create_rls_policies.sql (BROKEN):
```sql
-- LINE 94-97: Uses profiles.role (BROKEN)
CREATE POLICY "admins_view_all_bookings" ON bookings FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- LINE 99-102: Uses profiles.role (BROKEN)
CREATE POLICY "admins_update_all_bookings" ON bookings FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### In 20251028151532_0d7d5396-1cf6-4d42-a405-2db0031c8214.sql (PARTIALLY FIXED):
```sql
-- Uses has_role() function which should use user_roles
CREATE POLICY "admins_view_all_bookings" ON bookings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));
```

**Impact:** Conflicting policies - unclear which one is active
**Status:** ⚠️ PARTIALLY FIXED but inconsistent

---

## Issue 6: ADMIN_LOGS Table - Still Checking profiles.role
**Severity:** 🔴 CRITICAL  
**New finding:** Many migrations create admin_logs policies that check `profiles.role`

**Status:** ❌ NOT FIXED

---

## Issue 7: SESSION_NOTES Table - Still Checking profiles.role
**Severity:** 🔴 CRITICAL  
**Location:** 20250102000002_create_rls_policies.sql (Lines 166-178)

```sql
-- Uses profiles check, not user_roles
CREATE POLICY "prestadores_view_own_notes" ON session_notes FOR SELECT 
  USING (
    prestador_id IN (
      SELECT id FROM prestadores WHERE user_id = auth.uid()
    )
  );
```

**Status:** ⚠️ Mixed (some parts OK, some checking prestador relationship)

---

## Issue 8: SPECIALIST_ASSIGNMENTS Table - Uses has_role() Function
**Severity:** 🟡 MEDIUM  
**Location:** 20251026170708_28122d86-ee1b-456e-81aa-6a1c39ddcec5.sql (Lines 551-553)

```sql
CREATE POLICY "Admins can manage all assignments"
  ON public.specialist_assignments FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

**Issue:** Uses `has_role()` function - need to verify this function correctly checks `user_roles` table
**Status:** ⚠️ MIGHT BE OK if has_role() is correct

---

## Tables Still Using profiles.role (BROKEN):

| Table | Affected Policies | Status |
|-------|------------------|--------|
| profiles | admins_view_all_profiles, hr_view_company_employees | ❌ BROKEN |
| company_employees | hr_view_company_employees, hr_update_company_employees, admins_view_all_employees | ❌ BROKEN |
| prestadores | admins_view_all_prestadores, admins_update_all_prestadores | ❌ BROKEN |
| resources | admins_manage_resources | ❌ BROKEN |
| bookings | admins_view_all_bookings, admins_update_all_bookings (OLD version) | ❌ BROKEN |
| session_notes | (indirect) | ⚠️ MIXED |
| admin_logs | Multiple | ❌ BROKEN |
| platform_settings | (in newer migration) | ❌ BROKEN |
| onboarding_data | Admins view policy | ❌ BROKEN |

---

## Complete Fix Needed

All these tables need the same fix as companies/bookings/prestadores/invites - replace `profiles.role` checks with `user_roles` checks:

```sql
-- Example for each affected policy:

-- PROFILES
DROP POLICY "admins_view_all_profiles" ON profiles;
CREATE POLICY "admins_view_all_profiles" ON profiles FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- COMPANY_EMPLOYEES  
DROP POLICY "admins_view_all_employees" ON company_employees;
CREATE POLICY "admins_view_all_employees" ON company_employees FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- RESOURCES
DROP POLICY "admins_manage_resources" ON resources;
CREATE POLICY "admins_manage_resources" ON resources FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ADMIN_LOGS
DROP POLICY "Admins can view all logs" ON admin_logs;
CREATE POLICY "Admins can view all logs" ON admin_logs FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- And similar fixes for all other broken policies...
```

---

## Other Issues Found

### Issue 9: HR Role Checks - Still Using profiles.role
**Severity:** 🔴 CRITICAL  
Many policies check `role = 'hr'` against `profiles.role` instead of `user_roles.role`

Affected tables:
- profiles (hr_view_company_employees)
- company_employees (hr_view_company_employees, hr_update_company_employees)
- companies (hr_view_own_company, hr_update_own_company)
- bookings (hr_view_company_bookings)
- specialist_assignments (HR can view their company assignments)

---

### Issue 10: FUNCTION has_role() - Unclear Implementation
**Location:** Multiple migrations reference a `has_role()` function

Need to verify:
1. Does it exist?
2. Does it check `user_roles.role` or `profiles.role`?
3. Is it correct?

---

## Summary

✅ Fixed (in latest migration):
- companies
- bookings  
- prestadores
- invites
- admin_logs (partially)

❌ Still Broken (from 20250102000002 - ORIGINAL MIGRATION):
- profiles
- company_employees
- resources
- session_notes
- specialist_assignments
- platform_settings
- onboarding_data

⚠️ HR Role Support:
- All HR policies need to use user_roles instead of profiles.role

**Estimated Impact:** 70%+ of admin/HR/specialist functionality is broken

---

## Recommended Action

Apply comprehensive RLS fix covering ALL affected tables and ALL affected roles (admin, hr, specialist, prestador, user).

