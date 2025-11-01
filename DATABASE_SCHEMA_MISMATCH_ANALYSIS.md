# Database Schema Mismatch Analysis

## 🔴 Critical Issue

After fixing the login redirect issue, the app now successfully logs in but encounters numerous 404 errors because the code is querying tables that don't exist in the database.

---

## Current Database Schema

Tables that actually exist in `public` schema:
- ✅ `bookings`
- ✅ `chat_messages`
- ✅ `chat_sessions`
- ✅ `company_organizations`
- ✅ `feedback`
- ✅ `notifications`
- ✅ `prestadores`
- ✅ `profiles`

---

## Missing Tables (Referenced in Code but Not in DB)

### 1. ❌ `user_milestones`
**Status:** Missing, but code expects it

**Files referencing it:**
- `src/hooks/useMilestones.ts` (lines 35, 52-56)
- `src/integrations/supabase/types.ts` (type definitions)

**Issue:**
```typescript
// Tries to query this table
const { data: existing } = await supabase
  .from('user_milestones')
  .select('*')
  .eq('user_id', profile.id);
```

**Browser Error:**
```
Failed to load resource: the server responded with a status of 404 ()
ygxamuymjjpqhjoegweb.supabase.co/rest/v1/user_milestones?select=*&user_id=eq...
```

---

### 2. ❌ `company_employees`
**Status:** Missing, but code expects it

**Files referencing it:**
- `src/hooks/useSessionBalance.ts` (lines 21-25)
- `src/hooks/useCompanyMetrics.ts` (lines 31-34)
- `src/components/booking/DirectBookingFlow.tsx`
- `src/components/booking/BookingFlow.tsx`

**Issue:**
```typescript
// Tries to query this table
const { data: employee } = await supabase
  .from('company_employees')
  .select('sessions_allocated, sessions_used')
  .eq('user_id', user.id)
  .single();
```

**Browser Error:**
```
Failed to load resource: the server responded with a status of 404 ()
ygxamuymjjpqhjoegweb.supabase.co/rest/v1/company_employees?select=...
```

---

### 3. ❌ `user_progress`
**Status:** Missing, but code expects it

**Files referencing it:**
- `src/hooks/useUserMilestones.ts` (lines 38-42)
- `src/hooks/useUserProgress.ts`
- `src/components/booking/UniversalAIChat.tsx`

**Issue:**
```typescript
// Tries to query this table
const { data: progressData } = await supabase
  .from('user_progress')
  .select('*')
  .eq('user_id', userId)
  .eq('action_type', 'session_completed');
```

---

### 4. ⚠️ `notifications` - Column Mismatch
**Status:** Table exists, but queried column doesn't

**Issue:**
```typescript
// Code queries is_read column
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', user_id)
  .eq('is_read', false);  // ❌ Column is 'read' not 'is_read'
```

**Browser Error:**
```
Failed to load resource: the server responded with a status of 404 ()
ygxamuymjtjpqhjoegweb.supabase.co/rest/v1/notifications?select=*&user_id=eq...&is_read=eq.false
```

**Actual column:** `read` (boolean, default false)

---

## Current UserDashboard Errors (from browser console)

```
1. user_milestones query → 404
   Error loading milestones: Object

2. company_employees query → 404
   useSessionBalance Error: Object

3. notifications query → 404 (is_read column doesn't exist)
   
4. profiles query → 400 (malformed query)

5. bookings query → 404 (likely prestadores relation issue)
   useBookings Error: Object
```

---

## Root Cause Analysis

The codebase was built with the expectation of a complete database schema that includes:
- Milestone tracking system (`user_milestones`, `user_progress`)
- Company employee management (`company_employees`)
- Enhanced notification system (`notifications` with `is_read` column)

However, the actual Supabase database only has the minimal schema with 8 tables.

---

## Solution Options

### Option A: Migrate Database (Complete)
**Effort:** High | **Impact:** Full feature set restored

Create missing tables:
1. Create `user_milestones` table
2. Create `company_employees` table  
3. Create `user_progress` table
4. Fix `notifications` table (rename `read` to `is_read` or update queries)
5. Run RPC functions (`initialize_user_milestones`, etc.)

**Pros:**
- Restores full app functionality
- Matches codebase design expectations
- Features work as intended

**Cons:**
- Significant database work
- May need multiple migrations
- Testing overhead

---

### Option B: Disable Failing Features (Quick)
**Effort:** Low | **Impact:** Limited but app is usable

Disable/remove components that require missing tables:
1. Remove milestone tracking from UserDashboard
2. Remove session balance/company employee features
3. Fix notifications column reference
4. Fallback to basic booking functionality

**Pros:**
- Quick fix (1-2 hours)
- App immediately usable for core features
- No database schema changes

**Cons:**
- Many features won't work
- Type errors may remain
- Technical debt

---

### Option C: Hybrid Approach (Recommended)
**Effort:** Medium | **Impact:** App works + incremental enhancement

1. Immediately disable failing queries (Option B)
2. Create error boundaries to prevent crashes
3. Gradually add missing tables as needed
4. Prioritize by feature importance

---

## Immediate Action Items

### 🔴 CRITICAL - Fix To Prevent Crashes

1. **Disable milestone loading** in `useMilestones.ts`
   ```typescript
   // Wrap in try-catch, fallback to empty state
   ```

2. **Disable session balance** in `useSessionBalance.ts`
   ```typescript
   // If company_employees doesn't exist, return null balance
   ```

3. **Fix notifications column** reference
   ```typescript
   // Change 'is_read' to 'read' or create computed column
   ```

4. **Disable user progress** in hooks
   ```typescript
   // Skip user_progress queries for now
   ```

---

## Affected Dashboard Components

**UserDashboard.tsx:**
- ❌ Milestones progress bar
- ❌ Session balance widget
- ❌ Notifications count
- ⚠️ Bookings list (may work if RLS is fixed)

**CompanyDashboard.tsx:**
- ❌ Employee metrics
- ❌ Session allocation tracking
- ✅ Basic company info (if exists)

**PrestadorDashboard.tsx:**
- ⚠️ Session listings (needs prestadores + bookings)

---

## Files That Need Modification

High Priority (causing immediate errors):
- [ ] `src/hooks/useMilestones.ts` - Add error handling
- [ ] `src/hooks/useSessionBalance.ts` - Add error handling
- [ ] `src/hooks/useUserMilestones.ts` - Skip queries
- [ ] `src/hooks/useUserProgress.ts` - Skip queries
- [ ] Notification query files - Fix column reference

Medium Priority (prevent future errors):
- [ ] `src/components/booking/UniversalAIChat.tsx` - user_progress
- [ ] `src/components/booking/DirectBookingFlow.tsx` - company_employees
- [ ] `src/pages/CompanyDashboard.tsx` - company_employees
- [ ] `src/pages/UserDashboard.tsx` - Remove milestone display

---

## Recommended Next Step

**BEFORE** attempting to create missing tables, verify:
1. What features are actually needed for MVP?
2. Is the missing schema intentional or an oversight?
3. Do we have the database migrations that create these tables?

**IF** the missing tables are intentional (simplified schema):
→ Implement Option B/C (disable failing features)

**IF** the missing tables are an oversight:
→ Find and run the original migration files to create them
