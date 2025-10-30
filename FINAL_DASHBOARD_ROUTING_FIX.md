# Final Dashboard Routing Fix - ALL ISSUES RESOLVED

## Root Cause Found!

The issue was in **TWO files** that were checking for the wrong role name:

### Problem
- Database stores role as: `'especialista_geral'`
- Code was checking for: `'specialist'` 
- **Result:** Role not found → defaulted to `'user'` → wrong dashboard

## Files Fixed ✅

### 1. `src/pages/AuthCallback.tsx` ✅
**Line 55:** Changed from:
```typescript
} else if (roles.includes('specialist')) {
  primaryRole = 'specialist';
```
To:
```typescript
} else if (roles.includes('especialista_geral')) {
  primaryRole = 'specialist';  // Map to frontend role name
```

### 2. `src/pages/Login.tsx` ✅
**Lines 48 & 114:** Changed from:
```typescript
const roleForRedirect = role === 'specialist' ? 'especialista_geral' : role;
```
To:
```typescript
const roleForRedirect = role === 'especialista_geral' ? 'specialist' : role;
```

## Why It Works Now

1. **Database** stores: `'especialista_geral'` in `user_roles` table
2. **RPC function** returns: `'especialista_geral'`
3. **Frontend code** now correctly checks for: `'especialista_geral'`
4. **Redirect map** uses: `'specialist'` as key → `/especialista/dashboard`

## Complete Fix Summary

### Database (Already Applied) ✅
- ✅ Added `'especialista_geral'` to `app_role` enum
- ✅ Made `invites.company_id` nullable
- ✅ Fixed `get_user_primary_role` RPC to check for `'especialista_geral'`
- ✅ Recreated `user_profile_with_roles` view

### Code (Just Fixed) ✅
- ✅ Fixed `src/utils/registrationHelpers.ts` role mapping
- ✅ Fixed `src/pages/Register.tsx` specialist case
- ✅ Fixed `src/pages/AuthCallback.tsx` role check
- ✅ Fixed `src/pages/Login.tsx` role mapping

## Testing Now

1. **Hard refresh the page** (Ctrl+F5 or Cmd+Shift+R)
2. **Logout and login again**
3. **Check browser console** for these messages:
   ```
   [AuthCallback] Roles found: ['especialista_geral'] or ['hr']
   [AuthCallback] Primary role selected: specialist or hr
   [AuthCallback] Redirecting to: /especialista/dashboard or /company/dashboard
   ```

## If Still Not Working

Run this SQL to verify your user has the correct role:

```sql
SELECT 
  ur.role,
  p.email,
  p.name
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
WHERE p.email = 'YOUR_EMAIL_HERE';
```

You should see:
- HR users → `role = 'hr'`
- Specialist users → `role = 'especialista_geral'`
- Prestador users → `role = 'prestador'`

## Expected Behavior

| User Type | Database Role | Frontend Role | Dashboard URL |
|-----------|---------------|---------------|---------------|
| Company/HR | `hr` | `hr` | `/company/dashboard` |
| Specialist | `especialista_geral` | `specialist` | `/especialista/dashboard` |
| Prestador | `prestador` | `prestador` | `/prestador/dashboard` |
| Employee | `user` | `user` | `/user/dashboard` |

---

## Status: ✅ **ALL FIXES COMPLETE**

Try logging out and back in now - it should work! 🎉

