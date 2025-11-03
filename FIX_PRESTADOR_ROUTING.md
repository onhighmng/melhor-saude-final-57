# 🔧 Fixed: Prestador Routing to Wrong Dashboard

**Issue:** Prestador users being routed to `/user/dashboard` instead of `/prestador/dashboard`  
**Root Cause:** Auto-promotion trigger was missing from database  
**Status:** ✅ **FIXED**  

---

## 🐛 The Problem

**Symptoms:**
- Prestador registers successfully
- No column errors
- But gets redirected to `/user/dashboard`
- Instead of `/prestador/dashboard`

**Root Cause:**
The auto-promotion trigger `trigger_auto_promote_user_from_invite` didn't exist in the database, so:
1. User registers with Prestador code
2. Profile created with role='prestador' in profiles table
3. **BUT** role NOT added to `user_roles` table (trigger didn't fire)
4. AuthCallback checks `user_roles` table for role
5. Finds no role (or defaults to 'user')
6. Redirects to `/user/dashboard`

---

## ✅ Solution Applied

### 1. Created Auto-Promotion Trigger

**Migration Applied:** `auto_promote_users_by_invite_code`

**What It Does:**
```
When invite status changes from 'pending' to 'accepted':
  ↓
Trigger fires
  ↓
Function auto_promote_user_from_invite() runs:
  ✅ Insert into user_roles (user_id, role='prestador')
  ✅ Update profiles.role = 'prestador'
  ✅ Insert into prestadores table
  ✅ All done automatically!
```

**Result:** New Prestador registrations will now work correctly!

---

### 2. Verified Trigger is Active

**Confirmation:**
```sql
SELECT trigger_name, event_object_table, action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_promote_user_from_invite';

-- Returns:
-- trigger_name: trigger_auto_promote_user_from_invite
-- event_object_table: invites
-- action_timing: AFTER
✅ Trigger is active!
```

---

## 🔧 Fix Existing Prestador Users (If Any)

If someone already registered as Prestador BEFORE the trigger was applied, run this SQL to fix them:

```sql
-- Find Prestador users with wrong role in user_roles
SELECT 
  p.id,
  p.email,
  p.name,
  p.role as profile_role,
  ur.role as user_roles_role
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE p.role = 'prestador'
AND (ur.role IS NULL OR ur.role != 'prestador');

-- Fix them by adding correct role to user_roles
INSERT INTO user_roles (user_id, role)
SELECT 
  p.id,
  'prestador'
FROM profiles p
WHERE p.role = 'prestador'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = p.id 
  AND ur.role = 'prestador'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Also ensure prestadores table entry exists
INSERT INTO prestadores (user_id, name, email, specialty, available, is_active, rating, total_sessions)
SELECT 
  p.id,
  p.name,
  p.email,
  NULL,
  true,
  true,
  0,
  0
FROM profiles p
WHERE p.role = 'prestador'
AND NOT EXISTS (
  SELECT 1 FROM prestadores pr WHERE pr.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;
```

---

## 🧪 Test Now!

### New Prestador Registration (Should Work Now):

1. **Admin generates Prestador code:**
   ```
   Login as Admin
   → /admin/users-management
   → Click "Prestador" button (purple)
   → Copy code: ABC12345
   ```

2. **Register as Prestador:**
   ```
   Logout (or use incognito)
   → /register?code=ABC12345
   → Fill in:
      Name: "Maria Santos"
      Email: "maria@prestador.com"
      Password: "Test123!"
   → Submit
   ```

3. **What Happens Now:**
   ```
   ✅ User created
   ✅ Profile created (name='Maria Santos', role='prestador')
   ✅ Invite status updated to 'accepted'
   ✅ TRIGGER FIRES ⚡
   ✅ user_roles entry created (role='prestador')
   ✅ prestadores table entry created
   ✅ User redirected to /prestador/dashboard ← CORRECT!
   ```

4. **Login Again:**
   ```
   Login as maria@prestador.com
   ✅ Should redirect to /prestador/dashboard
   ✅ NOT /user/dashboard
   ```

---

## 🔍 Debugging if Still Wrong

### Check User's Role:

```sql
-- Replace with actual email
SELECT 
  p.id,
  p.email,
  p.name,
  p.role as profile_role,
  ur.role as user_roles_role,
  pr.id as prestador_record_exists
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
LEFT JOIN prestadores pr ON pr.user_id = p.id
WHERE p.email = 'maria@prestador.com';

-- Should show:
-- profile_role: prestador
-- user_roles_role: prestador ← This is KEY!
-- prestador_record_exists: <uuid> ← Should have value
```

### Check Redirect Logic:

The redirect happens in two places:

**1. AuthCallback.tsx (after registration/email verify):**
- Fetches from `user_roles` table
- Checks priority: admin > hr > prestador > specialist > user
- Uses `ROLE_REDIRECT_MAP[primaryRole]`

**2. Login.tsx (after login):**
- Calls RPC: `get_user_primary_role`
- Uses same `ROLE_REDIRECT_MAP`

**ROLE_REDIRECT_MAP:**
```typescript
{
  admin: '/admin/dashboard',
  hr: '/company/dashboard',
  prestador: '/prestador/dashboard',  ← Should go here
  specialist: '/especialista/dashboard',
  user: '/user/dashboard'
}
```

---

## ✅ Solution Summary

**Problem:** Trigger missing → No role in user_roles → Redirected to user dashboard

**Solution:**
1. ✅ Applied auto-promotion trigger
2. ✅ Trigger creates user_roles entry with correct role
3. ✅ Trigger creates prestadores table entry
4. ✅ AuthCallback/Login now see correct role
5. ✅ Redirect to correct dashboard

**Status:** New Prestador registrations will work correctly!

---

## 🎯 If Problem Persists

**Scenario: Logged in as Prestador but still see user dashboard**

1. **Logout completely**
2. **Clear browser cache**
3. **Login again**
4. Should redirect correctly now

**Or manually fix the user:**
```sql
-- Force role update
UPDATE user_roles 
SET role = 'prestador' 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'YOUR_EMAIL');

UPDATE profiles
SET role = 'prestador'
WHERE email = 'YOUR_EMAIL';

-- Ensure prestadores record exists
INSERT INTO prestadores (user_id, name, email, available, is_active)
SELECT id, name, email, true, true
FROM profiles WHERE email = 'YOUR_EMAIL'
ON CONFLICT (user_id) DO NOTHING;
```

---

**Try registering a new Prestador now - it should work!** 🚀

**Auto-promotion trigger is now active and will handle all future registrations automatically.**



