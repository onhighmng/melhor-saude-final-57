# RLS Permissions Fix Summary

## Critical Issues Found

After reviewing all RLS policies, I found **6 critical gaps** that were blocking registration flows:

### ❌ **Missing Policies That Blocked Registration**

1. **Profiles Table - No INSERT Policy**
   - **Problem**: Users couldn't create their own profile during registration
   - **Impact**: All registration flows failed with "permission denied"
   - **Fix**: Added `users_insert_own_profile` policy

2. **User_Roles Table - No Self-Insert Policy**
   - **Problem**: Only admins could insert roles, but users need to create their own role during registration
   - **Impact**: Registration completed but role assignment failed silently
   - **Fix**: Added `users_insert_own_role` policy

3. **Companies Table - No INSERT for HR**
   - **Problem**: HR users couldn't create companies during registration
   - **Impact**: HR registration flow completely blocked when creating new company
   - **Fix**: Added `hr_create_company` policy with smart checks

4. **Company_Employees Table - No INSERT Policy**
   - **Problem**: Users couldn't create their employee record during registration
   - **Impact**: Employee/User registration with company code failed
   - **Fix**: Added `users_insert_own_employee_record` policy

5. **Prestadores Table - No INSERT Policy**
   - **Problem**: Prestadores couldn't create their own record during registration
   - **Impact**: Prestador registration completely blocked
   - **Fix**: Added `prestadores_insert_own` policy

6. **Invites Table - No UPDATE Policy for Users**
   - **Problem**: Users couldn't update invite status to 'accepted' during registration
   - **Impact**: Codes couldn't be marked as used, causing duplicate code errors
   - **Fix**: Added `users_update_invite_status` policy

## What Was Already Working ✅

### Existing Policies That Were Fine:
- ✅ Profile SELECT/UPDATE (users viewing/updating their own)
- ✅ Companies SELECT (users viewing their company)
- ✅ Bookings policies (all flows working)
- ✅ Admin policies (all comprehensive)
- ✅ Invites SELECT (code validation working)

## New Migration Created

**File**: `supabase/migrations/20250104000000_fix_registration_permissions.sql`

### What It Fixes:

1. **Registration Flow Permissions**
   - ✅ Users can INSERT their own profile
   - ✅ Users can INSERT their own role
   - ✅ HR users can INSERT companies during registration
   - ✅ Users can INSERT their own employee records
   - ✅ Prestadores can INSERT their own records
   - ✅ Users can UPDATE invite status during registration

2. **RPC Function Permissions**
   - ✅ `validate_access_code` accessible to anon (for code validation)
   - ✅ `generate_access_code` accessible to authenticated users

3. **Security Considerations**
   - ✅ All policies use `auth.uid() = id` or `auth.uid() = user_id` to ensure users can only create records for themselves
   - ✅ HR company creation checks that contact_email matches user's email (during registration)
   - ✅ Invite updates only allow changing status from 'pending' to 'accepted'

## Testing Checklist

After applying this migration, test:

- [ ] **Personal User Registration**: Should be able to create profile and role
- [ ] **HR User Registration**: Should be able to create profile, role, and company
- [ ] **Employee User Registration**: Should be able to create profile, role, and employee record
- [ ] **Prestador Registration**: Should be able to create profile, role, and prestador record
- [ ] **Code Validation**: Should work for anonymous users
- [ ] **Code Marking**: Should successfully mark codes as 'accepted'
- [ ] **Admin Code Generation**: Should still work for admins
- [ ] **Profile Loading**: Should work immediately after registration

## Migration Order

Apply migrations in this order:

1. ✅ `FIX_CODE_GENERATION.sql` (if not already applied)
2. ✅ `20250104000000_fix_registration_permissions.sql` (NEW - **APPLY THIS**)

## Security Notes

- **Principle of Least Privilege**: All new policies follow this - users can only create records for themselves
- **No Privilege Escalation**: Users cannot create records for other users
- **Registration-Specific**: Policies are designed specifically for the registration flow
- **Post-Registration**: Existing policies handle all post-registration operations

## Common Error Patterns Fixed

| Error Pattern | Root Cause | Fix |
|--------------|------------|-----|
| "permission denied" on profile insert | No INSERT policy | ✅ Added `users_insert_own_profile` |
| "permission denied" on company insert | No INSERT policy for HR | ✅ Added `hr_create_company` |
| Code can't be marked as used | No UPDATE policy for users | ✅ Added `users_update_invite_status` |
| Role creation fails silently | Only admins could insert | ✅ Added `users_insert_own_role` |
| Employee record creation fails | No INSERT policy | ✅ Added `users_insert_own_employee_record` |
| Prestador registration fails | No INSERT policy | ✅ Added `prestadores_insert_own` |

## Next Steps

1. **Apply the migration** to your Supabase database
2. **Test registration flows** for all user types
3. **Monitor logs** for any remaining permission errors
4. **Update any custom RLS policies** you may have added manually

## Important Notes

- ⚠️ **Backup before applying**: Always backup your database before applying migrations
- ⚠️ **Test in staging first**: Apply to staging/test environment before production
- ✅ **Non-breaking**: This migration only adds policies, doesn't remove anything
- ✅ **Idempotent**: Uses `DROP POLICY IF EXISTS` to allow safe re-runs

