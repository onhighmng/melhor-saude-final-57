# ✅ Specialist Login Redirect Fix

## Problem

Specialists were being redirected to `/user/dashboard` instead of `/especialista/dashboard` after logging in.

## Root Cause

The redirect logic in `src/pages/Login.tsx` had an **inverted role mapping**:

```typescript
// ❌ WRONG (old code)
const roleForRedirect = role === 'specialist' ? 'especialista_geral' : role;
```

This was backwards! The database returns `'specialist'` from the `get_user_primary_role` RPC function, but the code was converting it to `'especialista_geral'`. However, `ROLE_REDIRECT_MAP` only has a key for `'specialist'` (not `'especialista_geral'`), so the lookup returned `undefined` and fell back to `/user/dashboard`.

## Solution

Fixed the mapping to convert `'especialista_geral'` TO `'specialist'` (the correct direction):

```typescript
// ✅ CORRECT (new code)
const roleForRedirect = role === 'especialista_geral' ? 'specialist' : role;
```

This ensures that:
1. If the RPC returns `'specialist'`, it maps to `'specialist'` in the redirect map → `/especialista/dashboard` ✅
2. If the RPC returns `'especialista_geral'` (for backwards compatibility), it maps to `'specialist'` in the redirect map → `/especialista/dashboard` ✅

## Files Modified

### `src/pages/Login.tsx`
- **Line 48**: Fixed role mapping in `redirectIfAuthenticated` effect
- **Line 114**: Fixed role mapping in `handleLogin` function

Both locations now correctly map `'especialista_geral'` → `'specialist'` for the redirect lookup.

## Verification

- ✅ Linter: No errors
- ✅ Logic: Maps correctly to `/especialista/dashboard`
- ✅ Backwards compatible: Handles both `'specialist'` and `'especialista_geral'` roles

## Testing

To test this fix:

1. **Log in as a specialist user**
2. **Verify redirect**: Should go to `/especialista/dashboard` (not `/user/dashboard`)
3. **Check console logs**: Should show `"Redirecting to: /especialista/dashboard"`

## Related Files

- `src/utils/authRedirects.ts` - Defines `ROLE_REDIRECT_MAP` with `specialist → /especialista/dashboard`
- `src/components/ProtectedRoute.tsx` - Uses the same correct mapping (was already fixed)
- `src/contexts/AuthContext.tsx` - Returns `'specialist'` role from RPC function




