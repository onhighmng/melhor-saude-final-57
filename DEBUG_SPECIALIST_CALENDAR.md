# 🐛 Debug Guide: Why Buttons Don't Work

## Quick Diagnosis Steps

### Step 1: Check if SQL Functions Exist (MOST COMMON ISSUE)

Run this in Supabase SQL Editor:

```sql
-- Check if functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'cancel_booking_as_specialist',
    'update_meeting_link_as_specialist',
    'reschedule_booking_as_specialist'
  );
```

**Expected Result:** Should show 3 functions

**If EMPTY:** ❌ The SQL hasn't been run yet! Go run `RUN_THESE_SQL_COMMANDS.md`

---

### Step 2: Check Browser Console for Errors

1. Open the specialist calendar page: `http://localhost:8080/especialista/sessions`
2. Press `F12` to open Developer Tools
3. Click on "Console" tab
4. Click a button (Cancel, Reschedule, etc.)
5. Look for RED error messages

#### Common Errors & Solutions:

**Error: "function cancel_booking_as_specialist does not exist"**
- ❌ SQL functions not created
- ✅ Solution: Run the SQL from `RUN_THESE_SQL_COMMANDS.md`

**Error: "permission denied for function"**
- ❌ Function not granted to authenticated users
- ✅ Solution: Run this SQL:
```sql
GRANT EXECUTE ON FUNCTION cancel_booking_as_specialist(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_meeting_link_as_specialist(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reschedule_booking_as_specialist(UUID, DATE, TIME, TIME) TO authenticated;
```

**Error: "Unauthorized to cancel this booking"**
- ❌ You're not assigned to this booking as a prestador
- ✅ Check your user setup:
```sql
-- Check if you're a prestador
SELECT p.id, p.name, pr.role 
FROM prestadores p
JOIN profiles pr ON p.user_id = pr.id
WHERE pr.id = auth.uid();

-- If empty, you need a prestador record:
INSERT INTO prestadores (user_id, name)
VALUES (auth.uid(), 'Your Name');
```

**Error: "handleCancelSession is not defined"**
- ❌ JavaScript error - component not loaded properly
- ✅ Solution: Restart your dev server

---

### Step 3: Check if Buttons Are Visible

Open the page and check:

- [ ] Do you see session cards?
- [ ] Do you see three buttons: "Notas", "Reagendar", "Cancelar"?
- [ ] Do you see "Link da Reunião" field with "Editar" button?

**If NO sessions showing:**
```sql
-- Check if there are bookings
SELECT 
  b.id,
  b.booking_date,
  b.status,
  b.prestador_id,
  pr.user_id as prestador_user_id
FROM bookings b
LEFT JOIN prestadores pr ON b.prestador_id = pr.id
WHERE b.status = 'scheduled'
ORDER BY b.booking_date;
```

**If no bookings exist:** You need test data. Create a booking first.

---

### Step 4: Test Each Function Manually

#### Test Cancel Function:
```sql
-- Replace with actual booking UUID
SELECT cancel_booking_as_specialist(
  'YOUR-BOOKING-UUID-HERE'::UUID,
  'Testing from SQL'
);
```

**Expected output:**
```json
{"success": true, "message": "Booking cancelled successfully"}
```

#### Test Update Link Function:
```sql
SELECT update_meeting_link_as_specialist(
  'YOUR-BOOKING-UUID-HERE'::UUID,
  'https://zoom.us/j/123456789'
);
```

#### Test Reschedule Function:
```sql
SELECT reschedule_booking_as_specialist(
  'YOUR-BOOKING-UUID-HERE'::UUID,
  '2025-12-15'::DATE,
  '15:00'::TIME
);
```

**If any return errors:** The problem is in the SQL functions or permissions.

**If all work in SQL but not in UI:** The problem is in the frontend connection.

---

### Step 5: Check RLS Policies

```sql
-- Verify RLS policies exist
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY cmd;
```

**Expected policies:**
- `admin_delete_bookings` (DELETE)
- `authenticated_create_bookings` (INSERT)
- `users_view_own_bookings` (SELECT)
- `authorized_update_bookings` (UPDATE)

**If missing:** Run the SQL from `RUN_THESE_SQL_COMMANDS.md`

---

## 🔥 Most Common Issues (90% of problems)

### Issue #1: SQL Not Run ⭐⭐⭐⭐⭐ (Most Common!)
**Symptom:** Console error "function does not exist"

**Solution:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy ENTIRE script from `RUN_THESE_SQL_COMMANDS.md`
4. Click "Run"
5. Verify you see "Success" message

---

### Issue #2: User Not a Prestador
**Symptom:** "Unauthorized" error in console

**Check your user:**
```sql
SELECT 
  pr.id as profile_id,
  pr.email,
  pr.role,
  p.id as prestador_id,
  p.name as prestador_name
FROM profiles pr
LEFT JOIN prestadores p ON p.user_id = pr.id
WHERE pr.id = auth.uid();
```

**If `prestador_id` is NULL:**
```sql
INSERT INTO prestadores (user_id, name, specialty)
VALUES (
  auth.uid(),
  'Your Name',
  'General'
);
```

---

### Issue #3: No Bookings to Test With
**Symptom:** Empty calendar, no buttons visible

**Create test booking:**
```sql
-- First get your prestador ID
SELECT id FROM prestadores WHERE user_id = auth.uid();

-- Then create test booking (replace UUIDs)
INSERT INTO bookings (
  user_id,
  prestador_id,
  booking_date,
  start_time,
  end_time,
  status,
  pillar,
  company_id
) VALUES (
  'USER_UUID_HERE'::UUID,
  'PRESTADOR_UUID_HERE'::UUID,
  CURRENT_DATE + INTERVAL '3 days',
  '14:00',
  '15:00',
  'scheduled',
  'psychological',
  NULL
);
```

---

### Issue #4: Frontend Not Reloaded
**Symptom:** Old code still running

**Solution:**
1. Stop your dev server (Ctrl+C)
2. Clear browser cache (Ctrl+Shift+R)
3. Restart dev server: `npm run dev`
4. Hard refresh browser: `Ctrl+F5`

---

## 📋 Complete Checklist

Run through this checklist in order:

1. [ ] SQL functions created (run query in Step 1)
2. [ ] RLS policies exist (run query in Step 5)
3. [ ] You are a prestador (run query in Issue #2)
4. [ ] Test bookings exist (run query in Issue #3)
5. [ ] Browser console shows no errors
6. [ ] Buttons are visible on screen
7. [ ] Dev server is running
8. [ ] Page is fully loaded (not showing spinners)

---

## 🆘 Still Not Working?

### Get Detailed Error Info:

1. Open browser console (F12)
2. Click "Network" tab
3. Click a button
4. Look for request to Supabase
5. Click on it and check:
   - Status code (should be 200)
   - Response body (shows actual error)
   - Request payload (shows what was sent)

### Share This Info:
- Console error message (full text)
- Network response body
- Output of: `SELECT * FROM prestadores WHERE user_id = auth.uid()`
- Output of: `SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%specialist%'`

---

## ✅ Quick Fix Script

If you just want to fix everything at once, run this:

```sql
BEGIN;

-- 1. Ensure functions exist
DROP FUNCTION IF EXISTS cancel_booking_as_specialist(UUID, TEXT);
DROP FUNCTION IF EXISTS update_meeting_link_as_specialist(UUID, TEXT);
DROP FUNCTION IF EXISTS reschedule_booking_as_specialist(UUID, DATE, TIME, TIME);

-- 2. Run the complete SQL from RUN_THESE_SQL_COMMANDS.md
-- (Copy and paste the entire script here)

-- 3. Ensure you're a prestador
INSERT INTO prestadores (user_id, name, specialty)
SELECT 
  auth.uid(),
  COALESCE(p.name, p.email, 'Unnamed'),
  'General'
FROM profiles p
WHERE p.id = auth.uid()
ON CONFLICT (user_id) DO NOTHING;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION cancel_booking_as_specialist(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_meeting_link_as_specialist(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reschedule_booking_as_specialist(UUID, DATE, TIME, TIME) TO authenticated;

COMMIT;
```

Then:
1. Restart your browser
2. Hard refresh (Ctrl+F5)
3. Try clicking buttons again

