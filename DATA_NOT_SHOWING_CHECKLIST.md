# 🔍 Data Not Showing - Troubleshooting Checklist

## ✅ What We've Confirmed

- ✅ All tables exist with correct columns
- ✅ All RPC functions are present
- ✅ RLS is **disabled** on key tables (not blocking data)
- ✅ Policies exist (1-6 policies per table)

---

## 🎯 Most Likely Causes (in order)

### 1. **Browser Cache Issues** (80% of cases)

**Symptoms:**
- Old errors still appearing
- Data doesn't update
- Components show loading forever

**Fix:**
```bash
# Hard refresh
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R

# Or clear all cache
Windows: Ctrl + Shift + Delete
Mac: Cmd + Shift + Delete
```

**Also clear:**
- LocalStorage: Open DevTools → Application → Local Storage → Clear
- Session Storage: Application → Session Storage → Clear

---

### 2. **Auth/Session Issues** (15% of cases)

**Symptoms:**
- User logged in but data is empty
- Console shows "user is null"
- Queries return empty arrays

**Check in Browser Console:**
```javascript
// Check if user is authenticated
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
console.log('User ID:', user?.id);

// Check if session is valid
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('Expires:', new Date(session?.expires_at * 1000));
```

**Fix:**
1. Log out completely
2. Clear browser cache/localStorage
3. Log back in
4. Check console for user ID

---

### 3. **Empty Tables** (3% of cases)

**Check data exists:**

Run in Supabase SQL Editor:
```sql
-- Quick count of all data
SELECT 'profiles' as table_name, COUNT(*) as rows FROM profiles
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'company_employees', COUNT(*) FROM company_employees
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'user_milestones', COUNT(*) FROM user_milestones
UNION ALL
SELECT 'invites', COUNT(*) FROM invites
UNION ALL
SELECT 'prestadores', COUNT(*) FROM prestadores
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles;
```

**If tables are empty:**
- You need to create test data
- Or register/onboard users properly

---

### 4. **User Missing in Correct Table** (2% of cases)

**Example:** User logged in but not in `company_employees` table

**Check:**
```sql
-- Replace with your actual user_id
SELECT 
  'profile' as location,
  id,
  email,
  role
FROM profiles 
WHERE email = 'your@email.com'
UNION ALL
SELECT 
  'user_roles' as location,
  user_id as id,
  role as email,
  NULL
FROM user_roles 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'your@email.com')
UNION ALL
SELECT 
  'company_employees' as location,
  user_id as id,
  company_id::text as email,
  NULL
FROM company_employees 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'your@email.com');
```

---

### 5. **Frontend Query Issues** (< 1% of cases)

**Check browser console for errors:**

Common errors:
```
❌ "relation does not exist" → Table/column mismatch (we fixed this)
❌ "column does not exist" → Column name wrong (we fixed this)
❌ "null is not an object" → Frontend trying to access null data
❌ "Cannot read property of undefined" → Data structure mismatch
```

**Debug a specific query:**
```javascript
// In browser console
const { data, error } = await supabase
  .from('user_milestones')
  .select('*');

console.log('Data:', data);
console.log('Error:', error);
```

---

## 🔧 Quick Diagnostic Steps

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Screenshot and share any errors you see

### Step 2: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for failed requests (red, 404, 400, 500)
5. Click on failed request → Preview tab → See error message

### Step 3: Test Direct Query
```javascript
// Run in browser console
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(5);

console.log('Profiles:', data);
console.log('Error:', error);
```

---

## 🎯 Component-Specific Issues

### UserDashboard Not Showing Data

**Check:**
1. Is user authenticated? (console: `await supabase.auth.getUser()`)
2. Does user have milestones? (SQL: `SELECT * FROM user_milestones WHERE user_id = 'USER_ID'`)
3. Does user have a profile? (SQL: `SELECT * FROM profiles WHERE id = 'USER_ID'`)

**Common issue:**
- User logged in but `user_milestones` table is empty
- **Fix:** Run `initialize_user_milestones` function

```sql
-- Initialize milestones for a specific user
SELECT initialize_user_milestones('USER_ID_HERE');
```

---

### CompanyDashboard Not Showing Data

**Check:**
1. Does company exist? (`SELECT * FROM companies WHERE id = 'COMPANY_ID'`)
2. Is user linked to company? (`SELECT * FROM company_employees WHERE user_id = 'USER_ID'`)
3. Does user have HR role? (`SELECT * FROM user_roles WHERE user_id = 'USER_ID'`)

---

### Bookings Not Showing

**Check:**
1. Do bookings exist? (`SELECT * FROM bookings LIMIT 10`)
2. Are prestadores (providers) active? (`SELECT * FROM prestadores WHERE is_active = true`)
3. Are bookings linked to correct user? (`SELECT * FROM bookings WHERE user_id = 'USER_ID'`)

---

## 🚨 Critical Checks

### Check 1: User ID Mismatch
```javascript
// In browser console
const { data: { user } } = await supabase.auth.getUser();
console.log('Auth User ID:', user?.id);

// Then in SQL
SELECT id, email FROM profiles WHERE id = 'PASTE_USER_ID_HERE';
```

If no profile found → **User is not in profiles table!**

**Fix:**
```sql
-- Trigger should create profile automatically, but if missing:
INSERT INTO profiles (id, email, role)
VALUES ('USER_ID', 'user@email.com', 'user');
```

---

### Check 2: auth.users vs profiles Mismatch
```sql
-- Check if auth users exist in profiles
SELECT 
  au.id,
  au.email as auth_email,
  p.email as profile_email,
  CASE 
    WHEN p.id IS NULL THEN '❌ MISSING IN PROFILES'
    ELSE '✅ OK'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;
```

---

## 📋 Run This Diagnostic Now

**Option 1: Run the diagnostic SQL**
```bash
File: DIAGNOSE_DATA_VISIBILITY.sql
```

**Option 2: Quick manual check**

1. **Browser Console:**
```javascript
// Check user
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

// Check profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user?.id)
  .single();
console.log('Profile:', profile);

// Check milestones
const { data: milestones } = await supabase
  .from('user_milestones')
  .select('*')
  .eq('user_id', user?.id);
console.log('Milestones:', milestones);
```

2. **Check for errors:**
- Red text in console?
- Failed network requests?
- Null/undefined errors?

---

## 🎯 Most Likely Solution

**90% of "data not showing" issues after schema fixes are:**

1. **Browser cache** (clear cache + hard refresh)
2. **User not logged in properly** (log out, clear storage, log in)
3. **Data doesn't exist yet** (need to create/seed data)

**Try this NOW:**
1. Clear browser cache (Ctrl+Shift+Delete / Cmd+Shift+Delete)
2. Open DevTools → Application → Clear all storage
3. Log out
4. Close all tabs
5. Open fresh tab, log in
6. Check if data shows

---

## 📞 Report Back

After trying the above, tell me:
1. What errors you see in browser console (screenshot)
2. What the data count query shows (from DIAGNOSE_DATA_VISIBILITY.sql)
3. What specific page/component is not showing data

This will help me pinpoint the exact issue! 🎯


