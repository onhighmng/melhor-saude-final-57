# External Provider (Prestador) Data Sources - Quick Reference

## 📋 Quick Overview

All prestador functional requirements are correctly implemented with proper data sources.

---

## 🗂️ Data Source Mapping

### 1. Assigned Cases from Specialists

**Tables:**
- `bookings` (prestador_id = current prestador)
- `profiles` (JOIN for user info)
- `companies` (JOIN for company name)

**Frontend:**
- `PrestadorDashboard.tsx`
- `PrestadorSessions.tsx`
- `PrestadorSessionDetail.tsx`

**Query Pattern:**
```typescript
const { data } = await supabase
  .from('bookings')
  .select('*, profiles(name, email), companies(company_name)')
  .eq('prestador_id', prestadorId);
```

---

### 2. User Diagnostic Info & Notes

**Tables:**
- `bookings` (main session data)
- `profiles` (user details)
- `chat_sessions` (if booking came from AI chat)
- `chat_messages` (diagnostic conversation)
- `session_notes` (prestador's internal notes)
- `onboarding_data` (user background - not currently displayed)

**Frontend:**
- `PrestadorSessionDetail.tsx` (loads booking with user info)

**Access Control:**
- ✅ RLS ensures prestadores only see their assigned bookings
- ✅ Can access chat history via `booking.chat_session_id`

---

### 3. Scheduling System

**Tables:**
- `prestador_availability` (weekly recurring availability)
- `prestador_schedule` (specific date blocks/unavailability)
- `bookings` (actual scheduled sessions)

**Frontend:**
- `usePrestadorCalendar.ts` (calendar view)
- `AvailabilitySettings.tsx` (mark unavailable)

**How It Works:**
1. `prestador_availability` = weekly template (e.g., "Mon 9-5")
2. `prestador_schedule` = overrides (e.g., "unavailable Dec 25")
3. `bookings` = actual confirmed sessions

---

### 4. Session Lifecycle Management

**Tables:**
- `bookings` (status field tracks lifecycle)

**Status Values:**
- `scheduled` → Assigned and waiting
- `in-progress` → Session currently happening
- `completed` → Session finished
- `cancelled` → Cancelled by either party
- `no_show` → User didn't attend

**Frontend:**
- `PrestadorSessionDetail.tsx` (start/complete actions)

**Code:**
```typescript
// Start session
await supabase.from('bookings')
  .update({ status: 'in-progress' })
  .eq('id', bookingId);

// Complete session
await supabase.from('bookings')
  .update({ status: 'completed' })
  .eq('id', bookingId);
```

---

### 5. Case Closure & Notes

**Tables:**
- `bookings.notes` (session summary - visible to admins/HR)
- `session_notes` (confidential internal notes - prestador only)

**Frontend:**
- `PrestadorSessionDetail.tsx` (save notes)
- `SessionNoteModal.tsx` (confidential notes)

**Note Types:**
1. **Booking Notes** (`bookings.notes`)
   - Session outcome summary
   - Visible to admins and HR (filtered by RLS)
   
2. **Session Notes** (`session_notes`)
   - Confidential clinical/internal notes
   - Only visible to prestador and admins
   - `is_private = true`

---

### 6. Performance Dashboard

**Tables:**
- `bookings` (source of truth for all metrics)
- `prestador_performance` (optional pre-aggregated data)

**Metrics Calculated From Bookings:**
```sql
-- Sessions this month
COUNT(*) WHERE date >= start_of_month

-- Total sessions
COUNT(*)

-- Completed sessions
COUNT(*) WHERE status = 'completed'

-- Average rating
AVG(rating) WHERE rating IS NOT NULL

-- Unique clients
COUNT(DISTINCT user_id)

-- Completion rate
(completed / total) * 100
```

**Frontend:**
- `PrestadorPerformance.tsx` (detailed analytics)
- `PrestadorDashboard.tsx` (quick stats)

**Revenue Calculation (Disabled):**
- Code exists but is commented out
- Would use `prestadores.cost_per_session` * completed_sessions
- Payment integration not currently active

---

### 7. Visibility Control (RLS)

**RLS Policies on `bookings`:**
```sql
-- Prestadores can only see their assigned bookings
CREATE POLICY "prestadores_view_assigned_bookings" 
ON bookings FOR SELECT
USING (
  prestador_id IN (
    SELECT id FROM prestadores WHERE user_id = auth.uid()
  )
);

-- Prestadores can update their assigned bookings
CREATE POLICY "prestadores_update_assigned_bookings" 
ON bookings FOR UPDATE
USING (
  prestador_id IN (
    SELECT id FROM prestadores WHERE user_id = auth.uid()
  )
);
```

**RLS Policies on `session_notes`:**
```sql
-- Prestadores can only view their own notes
CREATE POLICY "prestadores_view_own_notes" 
ON session_notes FOR SELECT
USING (
  prestador_id IN (
    SELECT id FROM prestadores WHERE user_id = auth.uid()
  )
);

-- Prestadores can only insert their own notes
CREATE POLICY "prestadores_insert_own_notes" 
ON session_notes FOR INSERT
WITH CHECK (
  prestador_id IN (
    SELECT id FROM prestadores WHERE user_id = auth.uid()
  )
);
```

**What Prestadores CANNOT Access:**
- ❌ Other prestadores' bookings or notes
- ❌ User bookings not assigned to them
- ❌ Company billing information
- ❌ Platform-wide statistics
- ❌ Admin configuration data

---

## 📊 Complete Table Reference

| Table | Used For | Access Level |
|-------|----------|--------------|
| `prestadores` | Provider profile, rates, specialty | Own profile only |
| `prestador_availability` | Weekly availability template | Own availability only |
| `prestador_schedule` | Date-specific blocks | Own schedule only |
| `prestador_performance` | Monthly aggregated stats | Own performance only |
| `bookings` | Assigned sessions | Only assigned bookings |
| `session_notes` | Confidential notes | Own notes only |
| `profiles` | User info (via JOIN) | For assigned bookings only |
| `companies` | Company info (via JOIN) | For assigned bookings only |
| `chat_sessions` | Diagnostic history | Via assigned bookings only |
| `chat_messages` | Chat transcript | Via assigned bookings only |

---

## 🔧 Common Query Patterns

### Load All Sessions for Prestador
```typescript
const { data: prestador } = await supabase
  .from('prestadores')
  .select('id')
  .eq('user_id', profile.id)
  .single();

const { data: bookings } = await supabase
  .from('bookings')
  .select(`
    *,
    profiles (name, email, avatar_url),
    companies (company_name)
  `)
  .eq('prestador_id', prestador.id)
  .order('date', { ascending: true });
```

### Load Session Details
```typescript
const { data: booking } = await supabase
  .from('bookings')
  .select(`
    *,
    profiles (name, avatar_url),
    companies (company_name)
  `)
  .eq('id', bookingId)
  .single();
```

### Mark Unavailable Slot
```typescript
await supabase
  .from('prestador_schedule')
  .insert({
    prestador_id: prestadorId,
    date: '2025-12-25',
    start_time: '09:00',
    end_time: '17:00',
    is_available: false
  });
```

### Save Session Notes
```typescript
// Save to bookings (session summary)
await supabase
  .from('bookings')
  .update({ notes: 'Session completed successfully...' })
  .eq('id', bookingId);

// Save confidential note
await supabase
  .from('session_notes')
  .insert({
    booking_id: bookingId,
    prestador_id: prestadorId,
    notes: 'Confidential clinical notes...',
    is_private: true
  });
```

### Calculate Performance Metrics
```typescript
const total = bookings.length;
const completed = bookings.filter(b => b.status === 'completed').length;
const avgRating = bookings
  .filter(b => b.rating)
  .reduce((sum, b) => sum + b.rating, 0) / 
  bookings.filter(b => b.rating).length;
const uniqueClients = new Set(bookings.map(b => b.user_id)).size;
```

---

## ✅ Verification Checklist

- [x] Prestadores can see assigned cases
- [x] Prestadores can access user diagnostic info
- [x] Prestadores can manage their availability
- [x] Prestadores can start/complete sessions
- [x] Prestadores can add confidential notes
- [x] Prestadores can view performance metrics
- [x] Prestadores can ONLY access their own data (RLS enforced)
- [x] All queries use correct tables
- [x] All data relationships are properly joined
- [x] Session lifecycle properly tracked

---

## 📝 Notes

1. **Payment System Disabled**: Revenue tracking code exists but is commented out pending payment integration
2. **Performance Aggregation**: Currently calculated real-time; could use `prestador_performance` table for optimization
3. **Chat History**: Available via `chat_session_id` but not prominently displayed in UI
4. **Session Recordings**: Table exists (`session_recordings`) but not currently used

---

**Last Updated:** November 2, 2025  
**Status:** ✅ All requirements verified and working correctly



