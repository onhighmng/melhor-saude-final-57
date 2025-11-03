# Complete Data Synchronization Fix Plan
**Date:** November 3, 2025  
**Status:** Ready to Execute

---

## ✅ ACTUAL DATABASE SCHEMA (Verified)

### bookings table:
- `booking_date` (date) ✅ EXISTS
- `start_time` (time) ✅ EXISTS  
- `end_time` (time) ✅ EXISTS
- `pillar_specialties` (ARRAY) ✅ EXISTS
- NO `date` column ❌

### prestadores table:
- `pillar_specialties` (ARRAY) ✅ EXISTS
- NO `pillars` column ❌

---

## 🔴 CRITICAL FIXES NEEDED

### FIX #1: Revert useBookings Hook (WRONG FIX APPLIED)
**File:** `src/hooks/useBookings.ts`
**Problem:** We recently "fixed" it to use `booking_date`, which is CORRECT
**Action:** Keep `booking_date` ✅

### FIX #2: Schema Cache Refresh (ROOT CAUSE)
**Problem:** PostgREST schema cache is outdated  
**Action:** Already triggered `NOTIFY pgrst, 'reload schema'`
**Additional:** May need to restart Supabase or wait for cache TTL

### FIX #3: useSessionCompletion Using Wrong Column
**File:** `src/hooks/useSessionCompletion.ts`
**Lines:** 26, 33
**Change:**
```typescript
// OLD (WRONG):
.lte('date', now.toISOString().split('T')[0]);
const sessionDate = new Date(booking.date);

// NEW (CORRECT):
.lte('booking_date', now.toISOString().split('T')[0]);
const sessionDate = new Date(booking.booking_date);
```

### FIX #4: useProviderAvailability Using Wrong Column
**File:** `src/hooks/useProviderAvailability.ts`
**Line:** 47
**Change:**
```typescript
// OLD (WRONG):
.eq('date', dateStr)

// NEW (CORRECT):
.eq('booking_date', dateStr)
```

### FIX #5: AdminAlertsTab Using Wrong Column  
**File:** `src/components/admin/AdminAlertsTab.tsx`
**Line:** 67
**Change:**
```typescript
// OLD (WRONG):
.eq('date', today)

// NEW (CORRECT):
.eq('booking_date', today)
```

### FIX #6: BookingFlow Using Wrong Column for Conflict Check
**File:** `src/components/booking/BookingFlow.tsx`
**Line:** 340
**Change:**
```typescript
// OLD (WRONG):
.eq('date', selectedDate.toISOString().split('T')[0])

// NEW (CORRECT):
.eq('booking_date', selectedDate.toISOString().split('T')[0])
```

---

## ⚠️ ITEMS THAT ARE ALREADY CORRECT (Do Not Change)

### ✅ KEEP AS-IS - BookingFlow.tsx
```typescript
// CORRECT - Already using booking_date
booking_date: selectedDate.toISOString().split('T')[0],
```

### ✅ KEEP AS-IS - All pillar_specialties queries
```typescript
// CORRECT - pillar_specialties exists in database
.contains('pillar_specialties', [pillar])
```

### ✅ KEEP AS-IS - DirectBookingFlow, RescheduleDialog, BookingModal
All these files were correctly updated to use `booking_date`

---

## 🔧 EXECUTION PLAN

### Phase 1: Fix Remaining date → booking_date Issues (3 files)
1. ✅ Fix `useSessionCompletion.ts` (2 locations)
2. ✅ Fix `useProviderAvailability.ts` (1 location)
3. ✅ Fix `AdminAlertsTab.tsx` (1 location)
4. ✅ Fix `BookingFlow.tsx` conflict check (1 location)

### Phase 2: Verify All Status Values Match Database
Based on actual schema, valid statuses are:
- bookings.status: Check constraint needed
- chat_sessions.status: Check constraint needed

### Phase 3: Test Critical Flows
1. Create a booking → Should save successfully
2. Check provider availability → Should show correct slots
3. Session auto-completion → Should complete past sessions
4. Admin alerts → Should show today's bookings

---

## 📋 FILES TO MODIFY

1. `src/hooks/useSessionCompletion.ts` - Lines 26, 33
2. `src/hooks/useProviderAvailability.ts` - Line 47
3. `src/components/admin/AdminAlertsTab.tsx` - Line 67
4. `src/components/booking/BookingFlow.tsx` - Line 340

**Total:** 4 files, 5 specific line changes

---

## ✅ FILES THAT ARE ALREADY CORRECT

- `src/components/booking/BookingFlow.tsx` (insert operation)
- `src/components/booking/DirectBookingFlow.tsx`
- `src/components/admin/providers/BookingModal.tsx`
- `src/components/sessions/RescheduleDialog.tsx`
- `src/hooks/useBookings.ts`
- All files using `pillar_specialties` (correct column name)

---

## 🚫 DO NOT CREATE

- ❌ NO new migrations
- ❌ NO new tables
- ❌ NO new columns
- ❌ NO schema changes

**USE ONLY:** Existing columns as verified in actual database schema

---

## Expected Outcome

After these fixes:
1. ✅ Bookings will save successfully (no schema cache errors)
2. ✅ Provider searches will work (using correct pillar_specialties)
3. ✅ Session completion will work (using correct booking_date)
4. ✅ Admin views will display correctly (using correct booking_date)
5. ✅ All queries will align with actual database schema

---

## Estimated Time

- **Code changes:** 15 minutes
- **Testing:** 30 minutes
- **Total:** 45 minutes

---

**READY TO EXECUTE: YES ✅**


