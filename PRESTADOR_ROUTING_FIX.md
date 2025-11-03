# Prestador Routing Fix - Summary

## Problem
Prestadores (providers) were being routed to user pages after registration instead of the prestador dashboard.

## Root Cause
The issue was in the auth metadata during user signup. The registration flows were passing `user_type` in the auth metadata, but the database trigger `handle_new_user` was looking for `role` in the metadata.

When the trigger couldn't find `role`, it defaulted to assigning 'user' role instead of the correct role (prestador, hr, etc.).

### Code Flow:
1. User registers with prestador access code
2. `signUp()` called with metadata containing `user_type: 'prestador'` but NO `role`
3. Database trigger `handle_new_user` looks for `role` in metadata → finds nothing → defaults to 'user'
4. Later code tries to assign 'prestador' role, but user already has 'user' role
5. On login, `get_user_primary_role` should prioritize 'prestador' over 'user', but the issue was inconsistent

## Solution
Updated all registration flows to pass the correct `role` in the auth metadata during `signUp()`:

### Files Changed:

1. **src/utils/registrationHelpers.ts**
   - Moved role extraction from invite BEFORE creating auth user
   - Added `role: roleFromInvite` to auth metadata
   - This ensures the trigger assigns the correct role from the start

2. **src/pages/RegisterEmployee.tsx**
   - Added `role: invite.role || 'user'` to auth metadata
   - Ensures employee users get correct role

3. **src/pages/RegisterCompany.tsx**
   - Added `role: 'hr'` to auth metadata
   - Ensures HR users get correct role

4. **src/pages/AdminProviderNew.tsx**
   - Added `role: 'prestador'` to auth metadata
   - Ensures admin-created prestadores get correct role

## How It Works Now

### Prestador Registration Flow:
1. Admin generates access code with `user_type: 'prestador'`
2. `generate_access_code` function maps it to `role: 'prestador'` in invites table
3. Prestador uses code to register
4. `createUserFromCode` reads invite and extracts `role: 'prestador'`
5. **NEW:** Passes `role: 'prestador'` in auth metadata during `signUp()`
6. Database trigger `handle_new_user` reads `role` → assigns 'prestador' to `user_roles` table
7. After registration, user logs in
8. `get_user_primary_role` RPC returns 'prestador'
9. Login page redirects to `/prestador/dashboard` ✅

### Role Priority (from `get_user_primary_role`):
```
admin > hr > prestador > especialista_geral > user
```

## Testing Checklist

- [ ] Generate prestador access code in admin dashboard
- [ ] Register new prestador using the code
- [ ] Verify prestador is created successfully
- [ ] Log in as prestador
- [ ] Verify redirect goes to `/prestador/dashboard` (not `/user/dashboard`)
- [ ] Verify prestador dashboard loads correctly
- [ ] Test same flow for HR registration
- [ ] Test same flow for employee registration
- [ ] Test admin-created provider flow

## Database Reference

### Tables Involved:
- `invites` - stores access codes with `role` field
- `user_roles` - stores user role assignments
- `profiles` - stores user profile data (may have deprecated `role` column)

### Functions Involved:
- `generate_access_code(user_type)` - creates invite with correct role
- `validate_access_code(code)` - validates and returns invite with role
- `handle_new_user()` - trigger that assigns role on signup
- `get_user_primary_role(user_id)` - returns highest priority role for user

## Related Files
- `src/utils/authRedirects.ts` - Contains `ROLE_REDIRECT_MAP`
- `src/pages/Login.tsx` - Fetches role and redirects after login
- `src/pages/AuthCallback.tsx` - Alternative redirect handler
- `src/components/ProtectedRoute.tsx` - Role-based route protection

## Notes
- The `handle_new_user` trigger now correctly reads the `role` from auth metadata
- All registration flows now consistently pass `role` in metadata
- This prevents race conditions and ensures correct role assignment from the start
- Users can still have multiple roles; `get_user_primary_role` returns the highest priority one

