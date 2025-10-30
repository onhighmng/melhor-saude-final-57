# Specialist & Prestador Registration - Complete Fix

## Problem Summary

When trying to register using specialist or prestador codes:
1. ❌ Error: "Tipo de utilizador inválido"
2. ❌ Codes showed `role: null` in database
3. ❌ Specialist code was being treated as company registration

## Root Causes Found

### 1. Missing `role` and `metadata` columns in `invites` table
- **Fixed by**: Running `FIX_SPECIALIST_FINAL.sql`
- Added columns to invites table
- Updated constraints

### 2. `validate_access_code` function not returning `user_type`
- **Fixed by**: Running `FIX_VALIDATE_ACCESS_CODE.sql`
- Function now maps `role` → `user_type` for frontend
- Specialist: `'especialista_geral'` → `'specialist'`
- Prestador: `'prestador'` → `'prestador'`

### 3. `UserType` missing 'specialist'
- **Fixed by**: Updated `src/types/accessCodes.ts`
- Added `'specialist'` to the UserType union

### 4. Switch statement missing 'specialist' case
- **Fixed by**: Updated `src/utils/registrationHelpers.ts`
- Added case for `'specialist'`
- Created `createSpecialistUser()` function
- Updated `assignUserRole()` roleMap

### 5. Old broken codes with NULL role
- **To fix**: Run `DELETE FROM invites WHERE role IS NULL;` in SQL Editor
- Then generate fresh codes

## Files Modified

1. `src/utils/registrationHelpers.ts` - Added specialist case and function
2. `src/types/accessCodes.ts` - Added 'specialist' to UserType
3. `src/pages/AdminUsersManagement.tsx` - Changed `user_type` references to `role`

## SQL Scripts to Run (in order)

### 1. Run `FIX_GENERATE_ACCESS_CODE_COMPLETE.sql`
Creates the generate_access_code function with correct schema

### 2. Run `FIX_VALIDATE_ACCESS_CODE.sql`  
Creates the validate_access_code function that maps roles to user_types

### 3. Run this to clean up old codes:
```sql
DELETE FROM invites WHERE role IS NULL;
```

## Testing Steps

1. **Delete old broken codes** (run SQL above)
2. **Generate new codes** from Admin Panel:
   - Click "Gerar Prestador" → Get a code
   - Click "Gerar Profissional de Permanência" → Get a code
3. **Check codes have roles**:
   ```sql
   SELECT invite_code, role, status FROM invites ORDER BY created_at DESC LIMIT 5;
   ```
   All should have non-null roles
4. **Test registration**:
   - Go to `/register` page
   - Enter a prestador code
   - Should route to prestador registration form
   - Complete and create account
   - Should redirect to `/prestador/dashboard`

## Expected Behavior After Fix

| Code Type | Generated Role | Frontend user_type | Routes To |
|-----------|---------------|-------------------|-----------|
| HR | `hr` | `hr` | `/company/dashboard` |
| Employee | `user` | `employee` | `/user/dashboard` |
| Prestador | `prestador` | `prestador` | `/prestador/dashboard` |
| Specialist | `especialista_geral` | `specialist` | `/especialista/dashboard` |

## Verification

Run this query to see all codes are correctly mapped:

```sql
SELECT 
  invite_code,
  role as db_role,
  CASE role
    WHEN 'hr' THEN 'hr'
    WHEN 'user' THEN 'employee'
    WHEN 'prestador' THEN 'prestador'
    WHEN 'especialista_geral' THEN 'specialist'
    ELSE 'unknown'
  END as frontend_user_type,
  status,
  expires_at > now() as is_valid
FROM invites
WHERE role IS NOT NULL
ORDER BY created_at DESC;
```

All codes should show a proper `frontend_user_type` value.

## Success Criteria

✅ No more "Tipo de utilizador inválido" errors
✅ All generated codes have non-null roles
✅ Specialist codes route to specialist registration
✅ Prestador codes route to prestador registration
✅ All registration flows complete successfully




