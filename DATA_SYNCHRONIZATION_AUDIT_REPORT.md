# Platform-Wide Data Synchronization Audit Report
**Date:** November 3, 2025  
**Audit Type:** Comprehensive Deep Dive  
**Scope:** All database operations, status filters, and UI-DB synchronization

---

## Executive Summary

This audit uncovered **8 critical data mismatch issues** across the platform, categorized into:
1. **Column Name Mismatches** (3 issues)
2. **Status Value Mismatches** (2 issues)  
3. **Pillar/Column Reference Mismatches** (1 issue)
4. **Missing Data Persistence** (1 issue)
5. **Query-Schema Mismatches** (1 issue)

All issues follow a similar pattern to the previously fixed `booking_date` vs `date` and `phone_escalated` status problems, where different parts of the codebase reference data using inconsistent naming or values.

---

## Critical Issues Found

### 🔴 **ISSUE #1: Booking Date Column Inconsistency in useSessionCompletion**
**Severity:** HIGH  
**Status:** NEEDS FIX  

**Problem:**
- The `useSessionCompletion.ts` hook queries bookings using `.eq('date', ...)` and `.lte('date', ...)`
- After recent fixes, booking inserts now use `booking_date`  
- The `bookings` table schema shows a `date` column in core migrations, but `booking_date` indexes were added
- **Result:** Auto-completion of sessions may fail or query the wrong column

**Affected Files:**
- `src/hooks/useSessionCompletion.ts` (lines 26, 33)

**Evidence:**
```typescript
// Line 26: useSessionCompletion.ts
.lte('date', now.toISOString().split('T')[0]);

// Line 33: Reading from booking.date
const sessionDate = new Date(booking.date);
```

**Fix Required:**
Change all references from `date` to `booking_date` in `useSessionCompletion.ts` to match the standardized column name.

---

### 🔴 **ISSUE #2: Pillar Column Mismatch (pillars vs pillar_specialties)**
**Severity:** HIGH  
**Status:** NEEDS FIX

**Problem:**
- The `prestadores` table has a column named `pillars` (TEXT[] array) according to migrations
- Frontend code queries using `.contains('pillar_specialties', [pillar])`
- **Result:** Provider queries may return no results or incorrect providers

**Affected Files:**
- `src/components/booking/BookingFlow.tsx` (line 171)
- `src/components/booking/DirectBookingFlow.tsx` (line 128)
- `src/components/specialist/ReferralBookingFlow.tsx` (line 116)
- `src/components/booking/SpecialistDirectory.tsx` (line 60)
- `src/components/booking/ChatExitFeedbackButtons.tsx` (line 35)
- `src/components/admin/AdminMatchingTab.tsx` (line 99)

**Evidence:**
```typescript
// BookingFlow.tsx line 171
.contains('pillar_specialties', [mappedPillar])

// But prestadores schema (20250102000000_create_core_tables.sql line 73)
pillars TEXT[] NOT NULL,
```

**Database Schema:**
```sql
-- In prestadores table
pillars TEXT[] NOT NULL,
```

**Fix Required:**
1. **Option A (Recommended):** Change all `.contains('pillar_specialties', ...)` to `.contains('pillars', ...)`
2. **Option B:** Add a migration to rename `pillars` column to `pillar_specialties`

---

### 🟡 **ISSUE #3: Chat Session Status - Missing 'escalated' in Database Constraint**
**Severity:** MEDIUM  
**Status:** NEEDS FIX

**Problem:**
- Database migration `20251007081734` defines allowed statuses: `'active', 'resolved', 'phone_escalated', 'abandoned'`
- TypeScript type includes `'escalated'` as a status
- Frontend code checks for `status === 'escalated'` in `AdminMatchingTab`
- **Result:** Status 'escalated' cannot be saved to database due to CHECK constraint

**Affected Files:**
- `src/types/specialist.ts` (line 20) - includes 'escalated'
- `src/components/admin/AdminMatchingTab.tsx` - filters for 'escalated'
- `supabase/migrations/20251007081734_0f3261dd-946f-4d26-b7b9-2fb255a9c03d.sql` (line 6) - missing 'escalated'

**Database Schema:**
```sql
-- chat_sessions table
status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'phone_escalated', 'abandoned')),
```

**TypeScript Type:**
```typescript
status: 'active' | 'resolved' | 'escalated' | 'phone_escalated' | 'pending';
```

**Fix Required:**
Add 'escalated' and 'pending' to the database CHECK constraint in a new migration.

---

### 🟡 **ISSUE #4: Session Status Mismatch - 'scheduled' vs 'confirmed'**
**Severity:** MEDIUM  
**STATUS:** NEEDS FIX

**Problem:**
- TypeScript `SessionStatus` type includes 'scheduled'
- Database bookings table CHECK constraint does NOT include 'scheduled'
- Frontend sets status to 'scheduled' but database rejects it
- **Result:** Bookings may fail to save with 'scheduled' status

**Affected Files:**
- `src/types/session.ts` (line 2) - includes 'scheduled'
- `src/components/admin/AdminAlertsTab.tsx` (line 68) - filters by 'scheduled'
- Database constraint only allows: 'pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'

**Evidence:**
```typescript
// session.ts
export type SessionStatus = 
  | 'scheduled'  // ❌ Not in database
  | 'confirmed' 
  | 'in_progress'  // ❌ Not in database as 'in_progress' either
  | 'completed' 
  | 'cancelled' 
  | 'no_show' 
  | 'rescheduled';
```

```sql
-- bookings table
status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled')),
```

**Fix Required:**
1. Add 'scheduled' and 'in_progress' to database CHECK constraint
2. OR update TypeScript types and code to use only 'pending' and 'confirmed'

---

### 🟡 **ISSUE #5: Booking Query Using Wrong Column in useProviderAvailability**
**Severity:** MEDIUM  
**Status:** NEEDS FIX

**Problem:**
- `useProviderAvailability.ts` queries bookings using `.eq('date', dateStr)`
- Should use `.eq('booking_date', dateStr)` to match our standardized column name
- **Result:** Provider availability checks may be incorrect

**Affected Files:**
- `src/hooks/useProviderAvailability.ts` (line 47)

**Evidence:**
```typescript
// Line 47
.eq('date', dateStr)
```

**Fix Required:**
Change to `.eq('booking_date', dateStr)`

---

### 🟡 **ISSUE #6: Admin Alerts Query Using Wrong Column**
**Severity:** MEDIUM  
**Status:** NEEDS FIX

**Problem:**
- `AdminAlertsTab.tsx` queries bookings using `.eq('date', today)`
- Should use `.eq('booking_date', today)` for consistency
- **Result:** Today's bookings may not appear in alerts

**Affected Files:**
- `src/components/admin/AdminAlertsTab.tsx` (line 67)

**Evidence:**
```typescript
// Line 67
.eq('date', today)
```

**Fix Required:**
Change to `.eq('booking_date', today)`

---

### 🟠 **ISSUE #7: Specialist Call Log Missing 'outcome' Column**
**Severity:** LOW-MEDIUM  
**Status:** NEEDS FIX

**Problem:**
- `EspecialistaCallRequestsRevamped.tsx` tries to insert `outcome` field into `specialist_call_logs`
- Database schema for `specialist_call_logs` doesn't include `outcome` column
- **Result:** Call completion data fails to save properly

**Affected Files:**
- `src/pages/EspecialistaCallRequestsRevamped.tsx` - inserts outcome
- `supabase/migrations/20251007081734_0f3261dd-946f-4d26-b7b9-2fb255a9c03d.sql` - missing outcome column

**Database Schema:**
```sql
CREATE TABLE specialist_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id UUID REFERENCES chat_sessions(id),
  user_id UUID REFERENCES profiles(id),
  specialist_id UUID REFERENCES profiles(id),
  call_status TEXT DEFAULT 'pending' CHECK (call_status IN ('pending', 'completed', 'missed', 'scheduled')),
  call_notes TEXT,
  session_booked BOOLEAN DEFAULT false,
  booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);
-- Missing: outcome TEXT
```

**Fix Required:**
Add `outcome` column to `specialist_call_logs` table in a new migration.

---

### 🟢 **ISSUE #8: Prestador Availability Saving to Wrong Location**
**Severity:** LOW  
**Status:** INFORMATIONAL

**Problem:**
- `AvailabilitySettings.tsx` saves unavailable slots to `prestadores.blocked_dates` (JSONB column)
- There's also a `prestador_availability` table that's not being used for recurring availability
- Multiple availability-related tables exist: `prestador_availability`, `prestador_schedule`, `provider_availability`
- **Result:** Confusion about which table to use, potential inconsistency

**Affected Files:**
- `src/components/specialist/AvailabilitySettings.tsx` (line 204)
- Multiple availability table schemas

**Note:**
This is currently working but indicates schema complexity that could cause future issues. Consider consolidating availability management.

---

## Additional Observations

### ✅ **Working Correctly (Recently Fixed):**
1. ✅ Booking date standardization (fixed to use `booking_date`)
2. ✅ Call escalation status handling (added `phone_escalated` and `pending`)
3. ✅ Quota management (moved to triggers)
4. ✅ Notifications for bookings (trigger-based)

### 🔍 **Areas Requiring Attention (Non-Critical):**
1. **Pillar Value Inconsistency:** Some code uses English ('psychological', 'physical', 'financial', 'legal'), others use Portuguese ('saude_mental', 'bem_estar_fisico', etc.). Currently handled with mappings but could be standardized.
   
2. **Multiple Availability Tables:** Three different tables for availability:
   - `prestador_availability` (recurring weekly)
   - `prestador_schedule` (specific dates)
   - `provider_availability` (another table)
   
3. **Notification Types:** Some code creates notifications directly, others might miss them. Recent trigger additions help but not all events covered.

4. **Progress Tracking:** Uses `user_progress` table but some events might not be tracked (e.g., goal updates trigger notifications via RPC but not all progress logged).

---

## Recommended Fix Priority

### 🔴 **URGENT (Fix Immediately):**
1. Issue #1: Fix `useSessionCompletion` date column references
2. Issue #2: Fix pillar column mismatch (`pillars` vs `pillar_specialties`)
3. Issue #7: Add `outcome` column to `specialist_call_logs`

### 🟡 **HIGH PRIORITY (Fix Soon):**
4. Issue #3: Add 'escalated' and 'pending' to chat_sessions status constraint
5. Issue #4: Align session status values between TypeScript and database
6. Issue #5: Fix `useProviderAvailability` date column
7. Issue #6: Fix `AdminAlertsTab` date column

### 🟢 **MEDIUM PRIORITY (Address in Next Sprint):**
8. Issue #8: Consider availability table consolidation
9. Pillar value standardization across platform
10. Comprehensive notification coverage audit

---

## Testing Recommendations

After fixes are applied, test the following flows end-to-end:

1. **Booking Flow:**
   - Create booking → Verify it saves with correct date column
   - Check provider availability shows correct slots
   - Verify session auto-completes after end time

2. **Call Escalation Flow:**
   - User requests call → Verify specialist sees it
   - Specialist completes call → Verify outcome saves
   - Check all status transitions work

3. **Provider Management:**
   - Provider searches by pillar work correctly
   - Availability updates save and reflect in booking
   - Provider dashboard shows correct sessions

4. **Admin Views:**
   - Alerts show today's bookings
   - Matching tab shows providers by pillar
   - Session completion triggers quota updates

---

## Conclusion

The audit revealed **8 data synchronization issues**, primarily stemming from:
- Column name inconsistencies (date vs booking_date, pillars vs pillar_specialties)
- Status value mismatches between TypeScript types and database constraints
- Missing columns in database schemas

**All issues are fixable** with migrations and code updates. The patterns are similar to the previously fixed booking and call escalation issues.

**Estimated effort:**
- 3-4 hours for code changes
- 1-2 hours for migration creation and testing
- 2-3 hours for comprehensive testing

---

## Generated By
AI Assistant - Comprehensive Platform Audit
Date: November 3, 2025

