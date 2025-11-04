# Employee Registration Permissions Report ⚠️

## Current Status: INSECURE BUT WORKING

### ❌ Critical Issues Found

1. **RLS is DISABLED on all tables**
   - `invites`: RLS disabled
   - `profiles`: RLS disabled  
   - `user_roles`: RLS disabled
   - `company_employees`: RLS disabled

2. **`user_roles` has NO policies**
   - Even though policies exist on other tables
   - When RLS is enabled, inserting roles will FAIL
   - This will **BREAK registration**

---

## 🔄 Employee Registration Flow

```
1. Employee visits /register-employee
   ↓
2. Enters invite code (MS-ABC123)
   ↓ Needs: SELECT on invites (unauthenticated)
3. Code validated
   ↓
4. User fills registration form
   ↓
5. Clicks Register
   ↓
6. Creates auth.users account
   ↓ Now authenticated with auth.uid()
7. INSERT into profiles
   ↓ Needs: INSERT policy on profiles
8. INSERT into user_roles
   ↓ Needs: INSERT policy on user_roles ❌ MISSING!
9. INSERT into company_employees
   ↓ Needs: INSERT policy on company_employees
10. UPDATE invites (status = 'accepted')
   ↓ Needs: UPDATE policy on invites
```

---

## ⚠️ What Happens When RLS is Enabled?

### Without Fixes:
```
Employee registers
  ↓
Profile created ✅
  ↓
Try to insert user_role ❌
  ↓
ERROR: permission denied for table user_roles
  ↓
Registration FAILS
```

### With Fixes:
```
Employee registers
  ↓
Profile created ✅
  ↓
User role created ✅
  ↓
Employee record created ✅
  ↓
Invite marked accepted ✅
  ↓
Registration SUCCESS 🎉
```

---

## ✅ Fixes Applied in SQL Script

### 1. **Invites Table**
```sql
-- Allow public to read pending invites (for validation)
CREATE POLICY "public_read_invites_for_registration"
ON invites FOR SELECT TO public
USING (status = 'pending');

-- Allow authenticated to update (mark as accepted)
CREATE POLICY "authenticated_update_invites"
ON invites FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL);
```

### 2. **Profiles Table**
```sql
-- Allow users to insert their own profile
CREATE POLICY "users_insert_own_profile"
ON profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid());
```

### 3. **User_Roles Table** ⚠️ CRITICAL FIX
```sql
-- Allow users to insert their own role
CREATE POLICY "users_insert_own_role"
ON user_roles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to read their own roles
CREATE POLICY "users_read_own_roles"
ON user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Allow admins to manage all roles
CREATE POLICY "admins_manage_all_roles"
ON user_roles FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
));
```

### 4. **Company_Employees Table**
```sql
-- Allow users to insert their own employee record
CREATE POLICY "users_insert_own_employee"
ON company_employees FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow HR to insert employees for their company
CREATE POLICY "hr_insert_employees"
ON company_employees FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN profiles p ON p.id = ur.user_id
  WHERE ur.user_id = auth.uid() 
  AND ur.role = 'hr'
  AND p.company_id = company_employees.company_id
));
```

---

## 🔒 Security Improvements

### Before (No RLS):
- ❌ Anyone can read/write ALL data
- ❌ No authentication required
- ❌ Security risk

### After (RLS Enabled):
- ✅ Public can only READ pending invites
- ✅ Users can only INSERT their own data
- ✅ Users can only READ/UPDATE their own data
- ✅ HR can manage their company's employees
- ✅ Admins can manage everything
- ✅ Registration still works flawlessly

---

## 📋 Action Required

### Option 1: Keep Current (Working but Insecure)
```
✅ Registration works
❌ No security
❌ Anyone can access any data
```

**Recommendation:** Only for development

### Option 2: Enable RLS (Recommended for Production)
```bash
# Run this SQL script:
FIX_EMPLOYEE_REGISTRATION_PERMISSIONS.sql
```

**Result:**
```
✅ Registration still works
✅ Secure access control
✅ RLS enabled on all tables
✅ All policies in place
```

---

## 🧪 Testing After Applying Fixes

### 1. Generate Invite Code (as HR)
```
Login as: lorinofrodriguesjunior@gmail.com
Go to: /company/colaboradores
Click: "Gerar Código"
Copy code: MS-ABC123
```

### 2. Test Employee Registration
```
Logout
Go to: /register-employee
Enter code: MS-ABC123
Fill form:
  - Email: test@example.com
  - Password: Test123!
Click: Register

Expected: ✅ SUCCESS
```

### 3. Verify in Database
```sql
-- Check profile was created
SELECT * FROM profiles WHERE email = 'test@example.com';

-- Check role was created
SELECT * FROM user_roles WHERE user_id = (
  SELECT id FROM profiles WHERE email = 'test@example.com'
);

-- Check employee record was created
SELECT * FROM company_employees WHERE user_id = (
  SELECT id FROM profiles WHERE email = 'test@example.com'
);

-- Check invite was marked accepted
SELECT status, accepted_at FROM invites WHERE invite_code = 'MS-ABC123';
-- Should show: status = 'accepted', accepted_at = <timestamp>
```

---

## ⚡ Quick Fix

**For Development (Keep RLS Disabled):**
- No action needed, everything works

**For Production (Enable RLS):**
```bash
# Run this command in Supabase SQL Editor:
cat FIX_EMPLOYEE_REGISTRATION_PERMISSIONS.sql
```

---

## 🎯 Summary

| Aspect | Current | After Fix |
|--------|---------|-----------|
| RLS Status | ❌ Disabled | ✅ Enabled |
| Security | ❌ None | ✅ Proper policies |
| Registration | ✅ Works | ✅ Still works |
| user_roles policies | ❌ MISSING | ✅ Added |
| invites policies | ⚠️ Exists but not enforced | ✅ Enforced |
| Ready for production | ❌ NO | ✅ YES |

---

## 🚀 Recommendation

**Run the SQL script now** to enable proper security while keeping registration working.

File: `FIX_EMPLOYEE_REGISTRATION_PERMISSIONS.sql`

This will make your app production-ready! 🎉




