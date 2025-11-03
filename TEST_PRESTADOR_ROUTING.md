# Test Plan: Prestador Routing Fix

## Quick Test (Recommended)

### Test 1: Prestador Registration via Access Code
1. **Login as Admin**
   - Go to Admin Dashboard
   - Navigate to "Gestão de Códigos" or "Prestadores" section

2. **Generate Prestador Access Code**
   - Click "Gerar Código" for Prestador
   - Copy the generated code (e.g., "AB12CD34")
   - Verify code appears in pending codes list

3. **Register as Prestador**
   - Logout from admin account
   - Go to registration page: `/register`
   - Enter the prestador access code
   - Fill in prestador details:
     - Name
     - Email (use a NEW email not in system)
     - Password
     - Phone
     - Specialty
     - Pillar
     - Bio, qualifications, etc.
   - Submit registration

4. **Verify Registration Success**
   - Should see success message
   - Should be redirected to `/login`

5. **Login as Prestador**
   - Enter the email and password used during registration
   - Click "Entrar"

6. **✅ VERIFY CORRECT ROUTING**
   - **Expected:** Redirect to `/prestador/dashboard`
   - **NOT Expected:** Redirect to `/user/dashboard` ❌
   - Verify prestador dashboard loads correctly
   - Check navigation menu shows prestador options

## Additional Tests

### Test 2: HR Registration via Company Signup
1. Go to `/register-company`
2. Fill in company details with NEW email
3. Complete registration
4. Login with company credentials
5. ✅ **Verify redirect to `/company/dashboard`** (not `/user/dashboard`)

### Test 3: Employee Registration via Invite Code
1. Login as HR user
2. Generate employee invite code
3. Logout and register as employee
4. Login as employee
5. ✅ **Verify redirect to `/user/dashboard`** (this is correct for employees)

### Test 4: Admin-Created Provider
1. Login as Admin
2. Go to "Adicionar Prestador"
3. Fill in provider details
4. Submit (system generates random password and sends email)
5. Check database or logs for the generated credentials
6. Login with those credentials
7. ✅ **Verify redirect to `/prestador/dashboard`**

## Debugging Steps (If Test Fails)

### If prestador still goes to `/user/dashboard`:

1. **Check Browser Console**
   - Look for login flow logs with colors (cyan, green)
   - Find the line: `[Login] Role fetched: XXX`
   - If it says 'user' instead of 'prestador', proceed to step 2

2. **Check Database - User Roles**
   ```sql
   SELECT ur.user_id, ur.role, p.email, p.name
   FROM user_roles ur
   JOIN profiles p ON p.id = ur.user_id
   WHERE p.email = 'YOUR_PRESTADOR_EMAIL';
   ```
   - Should show `role = 'prestador'`
   - If it shows 'user', the trigger didn't work correctly

3. **Check Database - Invite Code**
   ```sql
   SELECT invite_code, role, user_type, status
   FROM invites
   WHERE invite_code = 'YOUR_CODE';
   ```
   - Should show `role = 'prestador'`
   - If not, the code generation is wrong

4. **Check Database - Auth Metadata**
   ```sql
   SELECT id, email, raw_user_meta_data
   FROM auth.users
   WHERE email = 'YOUR_PRESTADOR_EMAIL';
   ```
   - `raw_user_meta_data` should contain `{"role": "prestador", ...}`
   - If not, the signUp call didn't pass the role

5. **Check RPC Function**
   ```sql
   SELECT get_user_primary_role('USER_ID_HERE');
   ```
   - Should return 'prestador'
   - If not, the function has a bug

## Expected Results Summary

| User Type | Access Code Role | Login Redirect | Dashboard URL |
|-----------|------------------|----------------|---------------|
| Prestador | `prestador` | ✅ Prestador | `/prestador/dashboard` |
| Specialist | `especialista_geral` | ✅ Specialist | `/especialista/dashboard` |
| HR (Company) | `hr` | ✅ Company | `/company/dashboard` |
| Employee | `user` | ✅ User | `/user/dashboard` |
| Personal User | `user` | ✅ User | `/user/dashboard` |
| Admin | `admin` | ✅ Admin | `/admin/dashboard` |

## Success Criteria

✅ **Test PASSES if:**
- Prestador registration completes successfully
- Login succeeds without errors
- Browser redirects to `/prestador/dashboard`
- Prestador dashboard displays correctly
- Navigation shows prestador-specific menu items

❌ **Test FAILS if:**
- Redirected to `/user/dashboard` instead
- 403 Forbidden errors appear
- Dashboard shows wrong content
- Navigation shows user menu instead of prestador menu

## Rollback (If Needed)

If the fix causes issues, revert these files:
```bash
git checkout HEAD -- src/utils/registrationHelpers.ts
git checkout HEAD -- src/pages/RegisterEmployee.tsx
git checkout HEAD -- src/pages/RegisterCompany.tsx
git checkout HEAD -- src/pages/AdminProviderNew.tsx
```

## Notes

- The fix ensures the `role` field is passed in auth metadata during signup
- The database trigger `handle_new_user` reads this role and assigns it correctly
- Without this fix, the trigger defaulted to 'user' for all registrations
- This fix applies to all user types: prestador, hr, employee, specialist

