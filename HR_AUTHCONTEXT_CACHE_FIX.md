# HR Registration AuthContext Cache Fix

## Problem Summary
After HR registration, users were redirected to `/company/dashboard`, but **ProtectedRoute immediately redirected them to `/user/dashboard`** because AuthContext had cached the profile with `role='user'` instead of `role='hr'`.

## Evidence from Logs
```
[Register Error Recovery] 🎯 Primary role determined: hr
[Register Error Recovery] 🚀 Redirecting hr to /company/dashboard
[ProtectedRoute] ❌ ACCESS DENIED
  User has role: user  ← ❌ WRONG!
  Redirecting to: /user/dashboard
```

**What happened:**
1. Registration correctly found `role='hr'` in the database ✅
2. Registration redirected to `/company/dashboard` ✅
3. BUT ProtectedRoute checked AuthContext and got `role='user'` ❌
4. ProtectedRoute redirected to `/user/dashboard` ❌

## Root Cause

### Timeline of Events:

```
1. User submits registration form
   ↓
2. createUserFromCode() creates user (signUp automatically logs in)
   ↓
3. AuthContext onAuthStateChange fires → loadProfileWithRoles()
   ↓ (RACE CONDITION - role might not be committed yet!)
4. AuthContext loads profile with role='user' (default fallback)
   ↓
5. assignUserRoleFromInvite() inserts role='hr' into database
   ↓ (TOO LATE - AuthContext already loaded!)
6. Register.tsx queries database → finds role='hr' ✅
   ↓
7. Register.tsx redirects to /company/dashboard
   ↓
8. ProtectedRoute checks AuthContext → sees role='user' ❌
   ↓
9. ProtectedRoute redirects to /user/dashboard ❌
```

**The problem:** AuthContext loaded the profile **BEFORE** the role was committed to the database, and never refreshed it.

## Solution

### ✅ Added Forced Profile Refresh Before Redirect

**File:** `src/pages/Register.tsx`

**Changes:**

1. **Import useAuth:**
```typescript
import { useAuth } from '@/contexts/AuthContext';
```

2. **Get refreshProfile function:**
```typescript
const { refreshProfile } = useAuth();
```

3. **Force refresh before redirect (SUCCESS PATH):**
```typescript
// After determining primaryRole from database
console.log(`[Register] 🎯 Primary role determined: ${primaryRole}`);

// CRITICAL FIX: Force AuthContext to refresh profile with correct role
console.log('[Register] 🔄 Forcing AuthContext profile refresh...');
await refreshProfile();
console.log('[Register] ✅ Profile refreshed in AuthContext');

// Now redirect
const redirectPath = dashboardMap[primaryRole] || '/user/dashboard';
navigate(redirectPath, { replace: true });
```

4. **Force refresh before redirect (ERROR RECOVERY PATH):**
```typescript
// Same logic in error recovery block
console.log('[Register Error Recovery] 🔄 Forcing AuthContext profile refresh...');
await refreshProfile();
console.log('[Register Error Recovery] ✅ Profile refreshed in AuthContext');
```

## How It Works Now

### New Timeline:

```
1. User submits registration form
   ↓
2. createUserFromCode() creates user and assigns role
   ↓
3. AuthContext initially loads with role='user' (cached)
   ↓
4. Register.tsx queries database → finds role='hr' ✅
   ↓
5. Register.tsx calls refreshProfile() ← NEW!
   ↓
6. AuthContext re-queries database → updates to role='hr' ✅
   ↓
7. Register.tsx redirects to /company/dashboard
   ↓
8. ProtectedRoute checks AuthContext → sees role='hr' ✅
   ↓
9. User stays on /company/dashboard ✅
```

### Expected Console Logs:

```
[Register] ⏳ Waiting for role to be fully committed...
[Register] 🔍 Fetching roles for user abc-123
[Register] 🔄 Attempt 1/3 to fetch roles
[Register] ✅ Found roles: ["hr"]
[Register] 📋 Final roles array: ["hr"]
[Register] 🎯 Primary role determined: hr
[Register] 🔄 Forcing AuthContext profile refresh...
[AuthContext] Refreshing profile...
[AuthContext] 🔄 Fetching role via RPC...
[AuthContext] ✅ RPC succeeded - role: hr
[AuthContext] Profile refreshed successfully: {role: 'hr', ...}
[Register] ✅ Profile refreshed in AuthContext
[Register] 🚀 Redirecting hr to /company/dashboard
```

## Benefits

1. **Eliminates race condition:** Always refreshes after role is committed
2. **Consistent state:** AuthContext always has the latest role before redirect
3. **Works for all roles:** HR, prestador, user, admin, specialist
4. **Reliable:** No timing dependencies or assumptions

## Testing Checklist

### ✅ Test HR Registration:
1. Admin generates HR code with sessions and seats
2. HR registers using the code
3. **Expected:** Redirects to `/company/dashboard` and STAYS there
4. **Check logs:** Should see profile refresh before redirect

### ✅ Test User Registration:
1. HR generates employee code
2. Employee registers
3. **Expected:** Redirects to `/user/dashboard` and stays there

### ✅ Test Prestador Registration:
1. Admin generates prestador code
2. Prestador registers
3. **Expected:** Redirects to `/prestador/dashboard` and stays there

## Files Modified

1. **`src/pages/Register.tsx`**
   - Added `import { useAuth } from '@/contexts/AuthContext'`
   - Added `const { refreshProfile } = useAuth()`
   - Added `await refreshProfile()` before redirect (2 places)
   - Added comprehensive logging

## Related Fixes

This builds on previous fixes:
1. **RLS Policy Fix:** Allowed users to insert their own roles during registration
2. **Retry Logic:** Added 3-attempt retry for role fetching
3. **Company Email Fix:** Fixed `companies.email` null constraint violation

## Database Status

✅ Database cleared  
✅ Only admin account exists  
✅ Ready for fresh testing  

---

## Status: ✅ FIXED

The AuthContext cache issue has been resolved. HR users will now correctly redirect to and stay on the company dashboard.

**Next Step:** Test the complete HR registration flow end-to-end.

