# 🚀 START HERE: Fix Specialist Calendar Buttons

Follow these steps **IN ORDER**. Don't skip any!

---

## Step 1: Run the SQL Migration ⭐ MOST IMPORTANT!

1. Open **Supabase Dashboard**
2. Click **"SQL Editor"** in left sidebar
3. Click **"New Query"**
4. Open the file: `SIMPLE_TEST_BUTTONS.sql`
5. Copy the ENTIRE contents
6. Paste into SQL Editor
7. Click **"Run"**
8. **Check the results:**

### ✅ What You Should See:

**TEST 1 - Functions (Should show 3 rows):**
```
✅ FUNCTIONS | cancel_booking_as_specialist
✅ FUNCTIONS | reschedule_booking_as_specialist
✅ FUNCTIONS | update_meeting_link_as_specialist
```

**TEST 2 - Prestador Status (Should show 1 row with YOUR info):**
```
✅ PRESTADOR STATUS | your-id | Your Name | your@email.com | especialista_geral
```

**TEST 3 - RLS Policies (Should show 4 rows):**
```
✅ RLS POLICIES | admin_delete_bookings | DELETE
✅ RLS POLICIES | authenticated_create_bookings | INSERT
✅ RLS POLICIES | users_view_own_bookings | SELECT
✅ RLS POLICIES | authorized_update_bookings | UPDATE
```

**TEST 4 - Test Bookings (Should show at least 1 row):**
```
✅ TEST BOOKINGS | booking-id | 2025-12-01 | scheduled | ✅ ASSIGNED TO YOU
```

---

## ❌ If Any Test FAILED:

### If TEST 1 Failed (No functions found):
Run the complete SQL from `RUN_THESE_SQL_COMMANDS.md`

### If TEST 2 Failed (You're not a prestador):
```sql
-- Run this in SQL Editor:
INSERT INTO prestadores (user_id, name, specialty)
SELECT 
  auth.uid(),
  COALESCE(p.name, p.email, 'Unnamed'),
  'General'
FROM profiles p
WHERE p.id = auth.uid()
ON CONFLICT DO NOTHING;
```

### If TEST 3 Failed (Wrong policies):
Run the complete SQL from `RUN_THESE_SQL_COMMANDS.md`

### If TEST 4 Failed (No bookings):
You need test data - create a booking through the app first

---

## Step 2: Test with Browser Console

1. Open your app: `http://localhost:8080/especialista/sessions`
2. Press **F12** to open Developer Tools
3. Click **"Console"** tab
4. Click any button (Cancel, Reschedule, or Edit Link)
5. **Look for colored emojis in console:**

### ✅ What You Should See:

```
🔴 [CANCEL] Button clicked! Session ID: abc-123
🔴 [CANCEL] Calling Supabase RPC function...
🔴 [CANCEL] Response: {data: {success: true}, error: null}
🔴 [CANCEL] Success! Showing toast...
🔴 [CANCEL] Reloading sessions...
🔴 [CANCEL] Sessions reloaded: 5
```

OR for meeting link:
```
🔵 [LINK] Button clicked! Session ID: abc-123 Link: https://zoom.us/...
🔵 [LINK] Calling Supabase RPC function...
🔵 [LINK] Response: {data: {success: true}, error: null}
🔵 [LINK] Success!
```

OR for reschedule:
```
🟢 [RESCHEDULE] Button clicked! Session ID: abc-123 Date: 2025-12-15 Time: 14:00
🟢 [RESCHEDULE] Calling Supabase RPC function...
🟢 [RESCHEDULE] Response: {data: {success: true}, error: null}
🟢 [RESCHEDULE] Success!
```

---

## ❌ Common Console Errors & Fixes:

### Error: "function cancel_booking_as_specialist does not exist"
**Problem:** SQL not run  
**Fix:** Go back to Step 1, run `RUN_THESE_SQL_COMMANDS.md`

### Error: "permission denied for function"
**Problem:** Grants not applied  
**Fix:** Run this:
```sql
GRANT EXECUTE ON FUNCTION cancel_booking_as_specialist(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_meeting_link_as_specialist(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reschedule_booking_as_specialist(UUID, DATE, TIME, TIME) TO authenticated;
```

### Error: "Unauthorized to cancel this booking"
**Problem:** You're not assigned to this booking  
**Fix:** Check TEST 2 and TEST 4 from Step 1

### Error: "handleCancelSession is not a function" or similar
**Problem:** Code not loaded properly  
**Fix:** 
1. Stop dev server (Ctrl+C)
2. Clear browser cache (Ctrl+Shift+R)
3. Restart: `npm run dev`
4. Hard refresh: Ctrl+F5

### No console output at all when clicking buttons
**Problem:** Buttons not connected OR clicking wrong element  
**Fix:**
1. Inspect the button (Right click → Inspect)
2. Check if it has `onClick` handler
3. Try clicking directly in the middle of the button
4. Check if page finished loading

---

## Step 3: Verify Everything Works

### Test Cancel:
1. Find a session card
2. Click **"Cancelar"** button
3. Should see toast: "Sessão Cancelada"
4. Session should disappear from list

### Test Reschedule:
1. Find a session card
2. Click **"Reagendar"** button
3. Dialog should open with date/time pickers
4. Select new date and time
5. Click "Confirmar"
6. Should see toast: "Sessão Reagendada"

### Test Meeting Link:
1. Find a session card
2. Find "Link da Reunião" field
3. Click **"Editar"** button
4. Input field should become editable
5. Paste a link: `https://zoom.us/j/123456789`
6. Click **"Guardar"**
7. Should see toast: "Link Atualizado"

---

## 🆘 Still Not Working?

### Create a Debug Report:

1. Run `SIMPLE_TEST_BUTTONS.sql` - copy ALL output
2. Open browser console (F12) - copy ALL console output after clicking button
3. Take screenshot of the page showing the buttons
4. Share all 3 things

This will help diagnose the exact problem!

---

## ✅ Success Checklist

- [ ] All 4 tests in `SIMPLE_TEST_BUTTONS.sql` passed
- [ ] Can see session cards on `/especialista/sessions` page
- [ ] Buttons are visible: "Notas", "Reagendar", "Cancelar"
- [ ] Console shows colored emoji logs when clicking buttons
- [ ] Toast notifications appear after each action
- [ ] Sessions reload/update after each action

When ALL checkboxes are checked, your calendar is fully working! 🎉

---

## 📁 File Reference

- **SQL Migration**: `RUN_THESE_SQL_COMMANDS.md` (run this first!)
- **Quick Test**: `SIMPLE_TEST_BUTTONS.sql` (check if everything is ready)
- **Debug Guide**: `DEBUG_SPECIALIST_CALENDAR.md` (detailed troubleshooting)
- **Complete Docs**: `SPECIALIST_CALENDAR_FIXES_SUMMARY.md` (full explanation)
- **This File**: `START_HERE.md` (you are here!)




