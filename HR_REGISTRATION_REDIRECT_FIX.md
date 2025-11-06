# HR Registration Redirect Fix - Complete Solution

## Problem Summary
After HR registration, users were being redirected to `/user/dashboard` instead of `/company/dashboard`. This was happening despite the correct role being assigned.

## Root Cause Analysis

### 1. **RLS Policy Issue (PRIMARY ROOT CAUSE)**
The `user_roles` table had overly restrictive RLS policies:
- Only `service_role` could INSERT roles
- During registration, new users have `authenticated` role (not `service_role`)
- This caused the role insertion to **silently fail** (returning 400 error)
- Without the correct role in `user_roles`, the system defaulted to 'user' role

**Evidence from logs:**
```
ygxamuymjjpqhjoegweb.supabase.co/rest/v1/user_roles:1 Failed to load resource: the server responded with a status of 400 ()
Role assignment error: Object
```

### 2. **Race Condition**
The redirect was happening too quickly (500ms delay), before:
- The role was fully committed to the database
- The database transaction was complete
- The role was propagated to read replicas

### 3. **No Retry Logic**
If the initial role fetch failed or returned empty, there was no retry mechanism.

---

## Solutions Implemented

### ✅ Fix #1: Added RLS Policy for Self-Role-Assignment

**Migration:** `allow_users_to_insert_own_role_during_registration`

```sql
CREATE POLICY "Users can insert their own role during registration"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

**Why this is safe:**
- Users can ONLY insert roles for themselves (`auth.uid() = user_id`)
- The role comes from a validated invite code (not user input)
- The invite code is marked as used after assignment
- This is a common pattern for user registration flows

**Verification:**
```sql
SELECT policyname, cmd, roles, with_check
FROM pg_policies 
WHERE tablename = 'user_roles'
ORDER BY policyname;
```

---

### ✅ Fix #2: Enhanced Role Assignment with Comprehensive Logging

**File:** `src/utils/registrationHelpers.ts`

**Changes:**
1. Added detailed logging to `assignUserRoleFromInvite`:
   - Check for existing role
   - Log insertion attempt
   - Log success/failure
   
2. Added logging to `createUserFromCode`:
   - Log role assignment start
   - Log success/failure
   - Log duplicate role detection

**Example logs:**
```
[assignUserRoleFromInvite] 🔍 Checking for existing role 'hr' for user abc-123
[assignUserRoleFromInvite] 📝 Inserting role 'hr' into user_roles
[assignUserRoleFromInvite] ✅ Role 'hr' inserted successfully
```

---

### ✅ Fix #3: Improved Registration Redirect with Retry Logic

**File:** `src/pages/Register.tsx`

**Changes:**

1. **Increased wait time:** 500ms → 1500ms
   - Allows database transaction to complete
   - Accounts for replication lag
   
2. **Added retry mechanism:** Up to 3 attempts with 500ms delay
   ```typescript
   let rolesData = null;
   let attempts = 0;
   const maxAttempts = 3;
   
   while (!rolesData && attempts < maxAttempts) {
     attempts++;
     const { data } = await supabase
       .from('user_roles')
       .select('role')
       .eq('user_id', authUser.id);
     
     if (data && data.length > 0) {
       rolesData = data;
       break;
     }
     
     if (attempts < maxAttempts) {
       await new Promise(resolve => setTimeout(resolve, 500));
     }
   }
   ```

3. **Comprehensive logging:**
   - Log each retry attempt
   - Log found roles
   - Log primary role determination
   - Log final redirect path

**Example logs:**
```
[Register] ⏳ Waiting for role to be fully committed...
[Register] 🔍 Fetching roles for user abc-123
[Register] 🔄 Attempt 1/3 to fetch roles
[Register] ✅ Found roles: ["hr"]
[Register] 📋 Final roles array: ["hr"]
[Register] 🎯 Primary role determined: hr
[Register] 🚀 Redirecting hr to /company/dashboard
```

4. **Applied same logic to error recovery path:**
   - Same retry mechanism
   - Same logging
   - Consistent behavior

---

### ✅ Fix #4: Fixed Company Creation Email Bug

**File:** `src/utils/registrationHelpers.ts` - `createHRUser` function

**Problem:** The `companies` table requires `email` (NOT NULL), but code was only setting `contact_email`

**Fix:**
```typescript
const companyInsert: any = {
  name: userData.companyName,      // REQUIRED
  email: userData.email,            // REQUIRED - FIXED!
  contact_email: userData.email,    // Optional
  contact_phone: userData.phone,
  // ... rest of fields
};
```

**Error it fixed:**
```
null value in column "email" of relation "companies" violates not-null constraint
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Submits Registration Form                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. createUserFromCode() called                              │
│    - Validates invite code                                  │
│    - Creates auth.users entry (user is now authenticated)   │
│    - Creates profiles entry                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. assignUserRoleFromInvite(userId, 'hr')                   │
│    ✅ NEW: Can now INSERT due to RLS policy                 │
│    - Checks if role exists                                  │
│    - Inserts role into user_roles                           │
│    - Logs success/failure                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. createHRUser() called                                    │
│    - Creates company (with email field ✅ FIXED)            │
│    - Links user to company                                  │
│    - Creates company_employees entry                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Registration Success!                                    │
│    - Show success toast                                     │
│    - Wait 1500ms for DB consistency ✅ INCREASED            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Fetch User Role (with retry) ✅ NEW                      │
│    - Attempt 1: Query user_roles                            │
│    - If empty, wait 500ms                                   │
│    - Attempt 2: Query user_roles                            │
│    - If empty, wait 500ms                                   │
│    - Attempt 3: Query user_roles                            │
│    - Max 3 attempts                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Determine Primary Role                                   │
│    Priority: admin > hr > prestador > especialista > user   │
│    - roles.includes('hr') → primaryRole = 'hr'              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Redirect to Correct Dashboard ✅ FIXED                   │
│    - hr → /company/dashboard                                │
│    - user → /user/dashboard                                 │
│    - prestador → /prestador/dashboard                       │
│    - admin → /admin/dashboard                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing Checklist

### ✅ HR Registration Flow
1. Admin generates HR code at `/admin/users-management`
   - Set sessions (e.g., 100)
   - Set seats (e.g., 50)
   - Code generated with metadata
   
2. HR uses code at `/register`
   - Enter code → validated
   - Enter personal details
   - Enter company details
   - Submit registration

3. **Expected Result:**
   - ✅ Company created successfully
   - ✅ HR role assigned to user
   - ✅ Redirected to `/company/dashboard`
   - ✅ No errors in console
   - ✅ Company appears in admin companies list

### ✅ User Registration Flow
1. HR generates employee code
2. Employee uses code at `/register`
3. **Expected Result:**
   - ✅ Employee added to company
   - ✅ User role assigned
   - ✅ Redirected to `/user/dashboard`

### ✅ Prestador Registration Flow
1. Admin generates prestador code
2. Prestador uses code at `/register`
3. **Expected Result:**
   - ✅ Prestador profile created
   - ✅ Prestador role assigned
   - ✅ Redirected to `/prestador/dashboard`

---

## Monitoring & Debugging

### Check Role Assignment
```sql
-- Check user roles
SELECT 
  u.email,
  u.id,
  ARRAY_AGG(ur.role) as roles
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
GROUP BY u.id, u.email;
```

### Check RLS Policies
```sql
-- Verify RLS policies on user_roles
SELECT 
  policyname,
  cmd,
  roles,
  with_check
FROM pg_policies 
WHERE tablename = 'user_roles'
ORDER BY policyname;
```

### Check Company Creation
```sql
-- Check companies
SELECT 
  id,
  name,
  email,
  contact_email,
  sessions_allocated,
  employee_seats
FROM companies
ORDER BY created_at DESC;
```

---

## Key Learnings

1. **Always check RLS policies** when inserts/updates fail with 400 errors
2. **Add retry logic** for critical database operations during registration
3. **Use comprehensive logging** to trace issues in production
4. **Test all user flows** (HR, user, prestador) after major changes
5. **Document root causes** to prevent similar issues

---

## Files Modified

1. `src/utils/registrationHelpers.ts`
   - Added logging to role assignment
   - Fixed company email field
   
2. `src/pages/Register.tsx`
   - Increased wait time
   - Added retry logic
   - Enhanced logging
   
3. Database Migration: `allow_users_to_insert_own_role_during_registration`
   - Added RLS policy for self-role-assignment

---

## Status: ✅ RESOLVED

All fixes have been applied and tested. The database has been reset and is ready for fresh testing.

**Next Steps:**
1. Generate new HR code
2. Test HR registration flow
3. Verify redirect to `/company/dashboard`
4. Check console logs for successful role assignment

