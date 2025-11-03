# 🧪 Test Prestador Registration - Step by Step

**Status:** All fixes applied - Ready to test!  
**Issue:** Previous registration failed due to column error  
**Solution:** Column fixed + Auto-promotion trigger applied  

---

## ✅ All Fixes Are Now In Place

1. ✅ Column name fixed (`name` not `full_name`)
2. ✅ Schema cache refreshed
3. ✅ Auto-promotion trigger active
4. ✅ Prestador routing configured

**Now let's test with a FRESH registration!**

---

## 📝 Step-by-Step Testing Guide

### Step 1: Generate Prestador Access Code

1. **Login as Admin**
   - Go to: `/login`
   - Use your admin credentials

2. **Navigate to User Management**
   - Go to: `/admin/users-management`

3. **Generate Prestador Code**
   - You should see THREE colored buttons:
     - 🔵 HR
     - 🟣 **Prestador** ← Click this one
     - 🟢 Especialista
   - Click the **purple "Prestador"** button
   - A code will be generated (e.g., `ABC12345`)
   - Copy this code

---

### Step 2: Register as Prestador

1. **Logout from admin**
   - Click logout

2. **Open Registration Page**
   - **Option A:** Direct registration
     - Go to: `/register?code=ABC12345` (paste your code)
   
   - **Option B:** Or use the admin provider form
     - Login as admin again
     - Go to: `/admin/providers`
     - Click "Novo Prestador"
     - Fill in the form

3. **Fill in Registration Form**
   ```
   Name: João Prestador
   Email: joao.prestador@test.com
   Password: Test123!
   (Other fields as needed)
   ```

4. **Submit the Form**

---

### Step 3: Expected Result

**✅ What Should Happen:**

```
1. Registration submits
2. No "name column" error ✅
3. Success message appears
4. User created in auth.users
5. Profile created in profiles table with name='João Prestador'
6. Invite status updated to 'accepted'
7. 🔥 TRIGGER FIRES AUTOMATICALLY:
   - Inserts into user_roles (role='prestador')
   - Updates profiles.role = 'prestador'
   - Creates entry in prestadores table
8. You may be asked to verify email
9. After verification → redirected to login or auth/callback
10. ✅ REDIRECTS TO: /prestador/dashboard (NOT /user/dashboard!)
```

---

### Step 4: Login Test

1. **Login with Prestador credentials**
   ```
   Email: joao.prestador@test.com
   Password: Test123!
   ```

2. **Expected Result:**
   ```
   ✅ Login successful
   ✅ RPC returns role: 'prestador' (check console)
   ✅ Redirects to: /prestador/dashboard
   ✅ Can see Prestador sidebar
   ✅ Can access Prestador features
   ```

---

## 🔍 What to Watch in Console

Open browser console (F12) and watch for these logs:

**During Login:**
```javascript
[Login] Fetching user role directly via RPC...
[Login] Role fetched: prestador  ← Should say "prestador" NOT "user"!
[Login] Redirecting to: /prestador/dashboard  ← Should go here!
```

**If you still see:**
```javascript
[Login] Role fetched: user  ← WRONG!
```

**Then the trigger didn't fire - tell me and I'll fix manually.**

---

## 🐛 If It Still Goes to User Dashboard

**Don't worry!** Run this SQL to fix it:

```sql
-- Get user ID from email
-- Replace with your actual email
WITH user_info AS (
  SELECT id, email FROM auth.users WHERE email = 'joao.prestador@test.com'
)
-- Add prestador role to user_roles
INSERT INTO user_roles (user_id, role)
SELECT id, 'prestador' FROM user_info
ON CONFLICT (user_id, role) DO NOTHING;

-- Update profiles role
UPDATE profiles
SET role = 'prestador'
WHERE id IN (SELECT id FROM user_info);

-- Create prestadores record
INSERT INTO prestadores (user_id, name, email, available, is_active)
SELECT 
  p.id,
  p.name,
  p.email,
  true,
  true
FROM profiles p
WHERE p.email = 'joao.prestador@test.com'
ON CONFLICT (user_id) DO NOTHING;
```

Then:
1. Logout
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again
4. Should redirect to `/prestador/dashboard` ✅

---

## ✅ Checklist

### During Registration:
- [ ] No "name column" error appears
- [ ] Success message shown
- [ ] May ask for email verification

### After Login:
- [ ] Console shows: `[Login] Role fetched: prestador`
- [ ] Redirects to `/prestador/dashboard`
- [ ] Can see Prestador sidebar with:
  - Dashboard
  - Calendário
  - Sessões
  - Desempenho
  - Configurações

### On Prestador Dashboard:
- [ ] Header shows: "Bem-vindo, João" (or your name)
- [ ] If no sessions: Shows empty state "Nenhuma sessão atribuída ainda"
- [ ] No payment/earnings info displayed
- [ ] No console errors

---

## 💡 Why Previous Registration Failed

**The old user (ID: 0cbe5d79-...) had issues because:**

1. Registration used `full_name` column (which didn't work)
2. Auto-promotion trigger wasn't in database
3. Profile wasn't created properly
4. Role defaulted to 'user'

**Now with all fixes:**
- ✅ Column names correct
- ✅ Trigger active
- ✅ Should work perfectly!

---

## 🚀 Ready to Test!

**Follow the steps above and test registration now.**

The Prestador should:
1. Register without errors
2. Be auto-promoted to 'prestador' role
3. Redirect to `/prestador/dashboard`
4. See Prestador features

**Let me know what you see in the console logs!** 📊


