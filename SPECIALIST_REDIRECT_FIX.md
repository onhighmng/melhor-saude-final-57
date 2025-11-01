# Specialist Role Redirect Fix - Complete

## Summary
Fixed the incorrect role mapping that was causing specialists to be misdirected after login. The issue was a mismatch between the database role (`specialist`) and the `ROLE_REDIRECT_MAP` key (`especialista_geral`).

## Root Cause Analysis

### Database vs Frontend Mismatch
- **Database stores:** `specialist` (English key from enum)
- **Previously mapped in frontend:** `especialista_geral` (Portuguese key)
- **Result:** No matching key in `ROLE_REDIRECT_MAP`, causing fallback to `/user/dashboard`

### Where the Bug Existed
Three files had role mapping logic:

1. **`src/utils/authRedirects.ts`** - The redirect map
   - Had: `especialista_geral: '/especialista/dashboard'`
   - Issue: Database returns `specialist`, not `especialista_geral`

2. **`src/pages/Login.tsx`** - Two locations with role mapping
   - In `useEffect` (line 48): Converted `specialist` → `especialista_geral` 
   - In `handleLogin` (line 114): Same incorrect conversion
   - Issue: Looked up non-existent key in map

3. **`src/pages/AuthCallback.tsx`** - Already correct
   - Used `specialist` directly from database
   - But failed because map didn't have `specialist` key

## Changes Applied

### 1. Updated `src/utils/authRedirects.ts`
```typescript
// BEFORE
export const ROLE_REDIRECT_MAP = {
  admin: '/admin/dashboard',
  hr: '/company/dashboard',
  prestador: '/prestador/dashboard',
  especialista_geral: '/especialista/dashboard',  // ❌ Wrong key
  user: '/user/dashboard'
} as const;

// AFTER
export const ROLE_REDIRECT_MAP = {
  admin: '/admin/dashboard',
  hr: '/company/dashboard',
  prestador: '/prestador/dashboard',
  specialist: '/especialista/dashboard',  // ✅ Correct key (matches DB)
  user: '/user/dashboard'
} as const;
```

### 2. Updated `src/pages/Login.tsx` (useEffect - line 48)
```typescript
// BEFORE
const roleForRedirect = role === 'especialista_geral' ? 'specialist' : role;
const redirectPath = from || ROLE_REDIRECT_MAP[roleForRedirect as keyof typeof ROLE_REDIRECT_MAP] || '/user/dashboard';

// AFTER
const redirectPath = from || ROLE_REDIRECT_MAP[role as keyof typeof ROLE_REDIRECT_MAP] || '/user/dashboard';
```

### 3. Updated `src/pages/Login.tsx` (handleLogin - line 113)
```typescript
// BEFORE
const roleForRedirect = role === 'especialista_geral' ? 'specialist' : role;
const redirectPath = from || ROLE_REDIRECT_MAP[roleForRedirect as keyof typeof ROLE_REDIRECT_MAP] || '/user/dashboard';

// AFTER
const redirectPath = from || ROLE_REDIRECT_MAP[role as keyof typeof ROLE_REDIRECT_MAP] || '/user/dashboard';
```

## Flow After Fix

### Regular Login (Login.tsx)
1. User enters credentials
2. `login()` authenticates via Supabase
3. Fetch primary role via `get_user_primary_role` RPC → returns `"specialist"`
4. Direct lookup: `ROLE_REDIRECT_MAP["specialist"]` → `/especialista/dashboard` ✅

### OAuth/Magic Link (AuthCallback.tsx)
1. Supabase redirects back with session
2. Fetch roles from `user_roles` table
3. Determine primary role → `specialist`
4. Direct lookup: `ROLE_REDIRECT_MAP["specialist"]` → `/especialista/dashboard` ✅

### Already Authenticated (Login.tsx useEffect)
1. User already has session
2. Fetch primary role → `specialist`
3. Direct lookup: `ROLE_REDIRECT_MAP["specialist"]` → `/especialista/dashboard` ✅

## Verification Checklist

- ✅ `ROLE_REDIRECT_MAP` now uses `specialist` key
- ✅ `Login.tsx` useEffect removes unnecessary mapping
- ✅ `Login.tsx` handleLogin removes unnecessary mapping
- ✅ `AuthCallback.tsx` already uses `specialist` correctly
- ✅ No TypeScript errors
- ✅ All role values covered: `admin`, `hr`, `prestador`, `specialist`, `user`

## Testing Recommendations

1. **Test specialist login flow:**
   - Log in with specialist account
   - Should redirect to `/especialista/dashboard`

2. **Test OAuth callback:**
   - Initiate OAuth login as specialist
   - Should redirect to `/especialista/dashboard`

3. **Test other roles:**
   - Admin → `/admin/dashboard`
   - HR → `/company/dashboard`
   - Prestador → `/prestador/dashboard`
   - User → `/user/dashboard`

4. **Test protected routes:**
   - Verify `from` state is set correctly by route guards
   - Users returning to protected routes should go to intended destination, not dashboard

## Impact

- **Severity:** Critical - Was breaking specialist login flow
- **Scope:** Login, OAuth callback, and already-authenticated flows
- **Backward Compatibility:** Fully compatible (fixes existing issue)
- **Performance:** No change
- **Security:** No change (no auth logic modified)
