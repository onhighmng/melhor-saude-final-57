# Frontend-Backend Integration Issues & User Flow Visibility Audit
**Date:** November 4, 2025  
**Platform:** Melhor Saúde Final

## Executive Summary

This audit identifies critical frontend-backend communication issues and user flow visibility problems throughout the platform. The findings reveal inconsistencies in data fetching patterns, missing visibility across user roles, and incorrect backend API calls.

---

## 🚨 CRITICAL ISSUES FOUND

### 1. **Specialist (Especialista Geral) - Incomplete Session Visibility**

**Issue Location:** `src/pages/SpecialistDashboard.tsx` (Lines 46-118)

**Problem:**
- Specialists are fetching sessions using `prestador_id` from the `prestadores` table
- **BUT** Especialista Geral users should see ALL escalated chats and call requests across the platform, NOT just bookings assigned to them as prestadores
- Current code:
```typescript:78:82:src/pages/SpecialistDashboard.tsx
// Then get bookings using the prestador ID (NOT profile.id)
const { data, error: bookingsError } = await supabase
  .from('bookings')
  .select('*, profiles!bookings_user_id_fkey(name)')
  .eq('prestador_id', prestador.id)
```

**Impact:** 
- Specialists cannot see sessions/bookings that were escalated directly to them via chat (not through prestador booking)
- Breaks the triage workflow where specialists handle phone-escalated chats

**Fix Required:**
- Specialists should see:
  1. Their assigned bookings (current implementation)
  2. Chat sessions escalated to them (`chat_sessions` where `session_booked_by_specialist = profile.id`)
  3. Call logs where they are the `specialist_id`

---

### 2. **Company Employee Visibility - Incorrect Filtering**

**Issue Location:** `src/pages/CompanyCollaborators.tsx` (Lines 26-81)

**Problem:**
- HR users fetch employees using `company_employees` table
- **Fallback mechanism** tries to match company by email if `company_id` is missing
- This is a WORKAROUND for missing data setup rather than proper user flow

**Code:**
```typescript:31:55:src/pages/CompanyCollaborators.tsx
// FALLBACK: If HR doesn't have company_id, try to find company by email
if (!companyId && profile?.role === 'hr' && profile?.email) {
  console.log('[CompanyCollaborators] HR without company_id, looking up by email:', profile.email);
  
  try {
    const { data: company, error } = await supabase
      .from('companies')
      .select('id')
      .eq('email', profile.email)
      .maybeSingle();
    
    if (!error && company) {
      companyId = company.id;
      console.log('[CompanyCollaborators] ✅ Found company by email:', companyId);
      
      // Update profile with company_id for future use
      await supabase
        .from('profiles')
        .update({ company_id: companyId })
        .eq('id', profile.id);
    }
  } catch (err) {
    console.error('[CompanyCollaborators] Error finding company by email:', err);
  }
}
```

**Impact:**
- HR users with missing `company_id` in their profile cannot see employees without the email fallback
- Updates profile silently in the background (potential race condition)
- Should be fixed during onboarding/registration, not at runtime

**Fix Required:**
- Ensure `company_id` is ALWAYS set during HR registration
- Remove fallback logic from UI components
- Add database constraint to validate `company_id` for HR role

---

### 3. **Session Deduction Not Reflected to Users**

**Issue Location:** `src/components/sessions/SessionHistoryCard.tsx` (Lines 96-102)

**Problem:**
- Frontend displays session deduction badges, but users cannot see when a session was actually deducted from their quota
- The `wasDeducted` flag is hardcoded based on status:

```typescript:110:112:src/pages/UserSessions.tsx
wasDeducted: booking.status === 'completed',
payerSource: 'company' as const,
deductedAt: booking.status === 'completed' ? booking.booking_date : undefined,
```

**Impact:**
- Users cannot track their session usage accurately
- No visibility into whether a cancelled/rescheduled session was deducted
- Discrepancy between displayed quota and actual database values

**Fix Required:**
- Add explicit `deduction_logged` and `deducted_at` columns to `bookings` table
- Update frontend to display actual deduction data from database
- Show deduction history in user dashboard

---

### 4. **Prestador Calendar - Missing Booking Source Context**

**Issue Location:** `src/hooks/usePrestadorCalendar.ts` & `src/pages/PrestadorCalendar.tsx`

**Problem:**
- Prestadores (specialists providing services) cannot differentiate between:
  - Direct bookings from users
  - Admin-created bookings
  - Referral bookings from other specialists
  - Chat-escalated bookings

**Current Code Pattern:**
```typescript
// Only fetches booking data without source context
.from('bookings')
.select('*, profiles!bookings_user_id_fkey(name, email)')
.eq('prestador_id', prestador.id)
```

**Impact:**
- Prestadores don't know which bookings were manually created by admin vs user-initiated
- Cannot see booking origin for better context during sessions
- No visibility into referral chains

**Fix Required:**
- Expose `booking_source` field in calendar view
- Add visual indicators for different booking types
- Show referral specialist name if applicable

---

### 5. **Escalated Chat Sessions - Incomplete User Data**

**Issue Location:** `src/hooks/useEscalatedChats.ts` (Lines 11-117)

**Problem:**
- Escalated chats fetch user profiles separately after fetching sessions
- Company information is NOT fetched, breaking visibility

```typescript:14:45:src/hooks/useEscalatedChats.ts
// Fetch chat sessions with phone escalation
const { data: sessions, error: sessionsError } = await supabase
  .from('chat_sessions')
  .select('*')
  .not('phone_escalation_reason', 'is', null)
  .order('created_at', { ascending: false });

if (sessionsError) throw sessionsError;

if (!sessions || sessions.length === 0) {
  setEscalatedChats([]);
  setIsLoading(false);
  return;
}

// Fetch user profiles for these sessions
const userIds = [...new Set(sessions.map(s => s.user_id).filter(Boolean))];
const { data: profiles, error: profilesError } = await supabase
  .from('profiles')
  .select('id, name, email, phone')
  .in('id', userIds);
```

**Missing:**
- Company name for employee users
- Company context (which company the user belongs to)
- Employee session quota information

**Impact:**
- Specialists see escalated chats but don't know which company the user belongs to
- Cannot provide company-specific context during calls
- No visibility into user's remaining sessions

**Fix Required:**
```typescript
// Should be:
const { data: profiles, error: profilesError } = await supabase
  .from('profiles')
  .select(`
    id, 
    name, 
    email, 
    phone, 
    company_id,
    companies!profiles_company_id_fkey(company_name)
  `)
  .in('id', userIds);
```

---

### 6. **Meeting Links Not Synced Across Views**

**Issue Location:** Multiple files

**Problem:**
- Prestadores can update meeting links in `PrestadorCalendar.tsx` (Line 105-129)
- **BUT** users don't see updated links immediately in `UserSessions.tsx`
- No realtime update mechanism for meeting link changes

**Example:**
```typescript:105:129:src/pages/PrestadorCalendar.tsx
const handleSaveLink = async () => {
  // Normalize URL to ensure it has https:// protocol
  const normalizedLink = meetingLink.trim() ? (
    meetingLink.trim().match(/^https?:\/\//i) ? meetingLink.trim() : `https://${meetingLink.trim()}`
  ) : null;

  const { error } = await supabase
    .from('bookings')
    .update({ meeting_link: normalizedLink })
    .eq('id', event.id);
  
  if (error) {
    toast({
      title: 'Erro',
      description: 'Não foi possível guardar o link',
      variant: 'destructive'
    });
  } else {
    setIsEditingLink(false);
    toast({
      title: 'Link guardado',
      description: 'O link da reunião foi atualizado'
    });
  }
};
```

**Impact:**
- Users may not see meeting links until page refresh
- Specialists update links but users still see old/missing links
- Creates confusion close to session time

**Fix Required:**
- Add realtime subscription to `bookings` table changes in `useBookings.ts`
- Broadcast meeting link updates to all subscribed clients
- Show notification when specialist updates meeting link

---

### 7. **Admin Company Detail - Incomplete Employee Data**

**Issue Location:** `src/pages/AdminCompanyDetail.tsx` & `src/components/admin/AdminEmployeesTab.tsx`

**Problem:**
- Admin views fetch employee data with multiple sequential queries (N+1 problem)

```typescript:145:201:src/components/admin/AdminEmployeesTab.tsx
const formattedEmployees = await Promise.all(
  data.map(async (emp) => {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email, avatar_url')
      .eq('id', emp.user_id)
      .single();
    
    // Get company info
    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('id', emp.company_id)
      .single();

    // Get pillar preferences from onboarding
    const { data: onboarding } = await supabase
      .from('onboarding_data')
      .select('pillar_preferences')
      .eq('user_id', emp.user_id)
      .single();

    // Get session count (optimized)
    const { count: sessionCount } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', emp.user_id)
      .eq('status', 'completed');

    // Get progress count (optimized)
    const { count: progressCount } = await supabase
      .from('user_progress')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', emp.user_id);

    // Calculate progress percentage
    const progress = emp.sessions_allocated > 0
      ? Math.round((sessionCount || 0) / emp.sessions_allocated * 100)
      : 0;

    return {
      id: emp.id,
```

**Impact:**
- Extremely slow loading for companies with many employees
- Each employee triggers 5 separate database queries
- Page freezes during loading

**Fix Required:**
- Use a single RPC function to fetch all employee data with aggregations
- Create database view for employee details
- Implement pagination (currently limited to 100 employees)

---

### 8. **Booking Flow - Missing Validation for Company Quota**

**Issue Location:** `src/components/booking/BookingFlow.tsx` (Lines 217-394)

**Problem:**
- Frontend creates bookings without checking if company has available sessions
- Quota check happens AFTER booking is created (should be BEFORE)

```typescript:368:398:src/components/booking/BookingFlow.tsx
const bookingData = {
  user_id: user_id,
  company_id: company_id,
  prestador_id: prestador_id,
  pillar: pillar,
  topic: selectedTopics.length > 0 ? sanitizeInput(selectedTopics.join(', ')) : null,
  booking_date: String(selectedDate.toISOString().split('T')[0]),
  start_time: String(selectedTime),
  end_time: String(endTime),
  status: 'pending',
  session_type: meetingType === 'virtual' ? 'virtual' : meetingType === 'phone' ? 'phone' : 'presencial',
  meeting_type: meetingType,
  quota_type: 'employer',
  meeting_link: meetingType === 'virtual' ? `https://meet.example.com/${profile.id}-${new Date().getTime()}` : null,
  notes: additionalNotes ? sanitizeInput(additionalNotes) : null,
  booking_source: 'direct'
};

console.log('[BookingFlow] Inserting booking with primitives:', bookingData);

// Use Supabase client with clean data
const { data: booking, error } = await supabase
  .from('bookings')
  .insert(bookingData)
  .select()
  .single();

if (error) {
  console.error('[BookingFlow] Booking insert error:', error);
  throw error;
}
```

**Impact:**
- Users can book sessions even when company quota is exhausted
- Database triggers may fail, leaving booking in invalid state
- No user-friendly error message before attempting booking

**Fix Required:**
- Check session balance BEFORE showing booking form
- Use RPC function `get_user_session_balance()` to validate availability
- Disable booking button if no sessions available
- Show clear message about quota limits

---

### 9. **Chat Session Not Linked to Bookings**

**Issue Location:** Multiple chat interfaces

**Problem:**
- When users complete chat assessments and want to book a session, the `chat_session_id` is NOT linked to the booking
- No way to track which bookings originated from which chat sessions

**Impact:**
- Specialists can't see chat history when viewing booked sessions
- No context about user's concerns during pre-session review
- Analytics cannot track chat-to-booking conversion

**Fix Required:**
- Add `chat_session_id` column to `bookings` table (may already exist)
- Pass `chat_session_id` when creating bookings from chat interfaces
- Display chat summary in prestador calendar view

---

### 10. **Notification System Incomplete**

**Issue Location:** `src/hooks/useSpecialistNotifications.ts` (Lines 43-145)

**Problem:**
- Specialists get notifications for escalated chats and session requests
- **BUT** no notification when:
  - Admin assigns a booking to them
  - User cancels a booking
  - Company increases session quota
  - User completes session (needs notes reminder)

```typescript:43:81:src/hooks/useSpecialistNotifications.ts
const loadNotifications = useCallback(async () => {
  if (!user?.id) return;

  setLoading(true);
  try {
    // Load escalated chats
    const { data: escalatedChats, error: chatsError } = await supabase
      .from('chat_sessions')
      .select(`
        id,
        user_id,
        pillar,
        phone_escalation_reason,
        created_at,
        profiles!chat_sessions_user_id_fkey(name)
      `)
      .eq('status', 'phone_escalated')
      .order('created_at', { ascending: false })
      .limit(20);

    if (chatsError) throw chatsError;

    // Load session requests
    const { data: sessionRequests, error: sessionsError } = await supabase
      .from('bookings')
      .select(`
        id,
        user_id,
        pillar,
        status,
        created_at,
        profiles!bookings_user_id_fkey(name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(20);

    if (sessionsError) throw sessionsError;

    // Transform data into notifications
```

**Impact:**
- Specialists miss important updates
- Users don't get confirmation when specialist accepts booking
- No notification system for quota changes

**Fix Required:**
- Add comprehensive notification triggers for all user flows
- Implement push notifications (currently only loads on mount)
- Add notification bell icon with unread count

---

## 📊 USER FLOW VISIBILITY ISSUES

### Issue 1: **Employee Registration Flow - No Confirmation to HR**

**Problem:**
- When employee registers using company access code, HR admin doesn't see notification
- Company dashboard employee count updates, but no alert
- HR cannot track which employees successfully registered

**Impact:**
- HR doesn't know when to follow up with pending employees
- Cannot celebrate onboarding milestones
- Miss opportunity to contact newly registered employees

**Fix:** Add notification to company/HR dashboard when new employee registers

---

### Issue 2: **Session Completion - No Follow-up Workflow**

**Problem:**
- After session is marked complete, there's no automatic workflow for:
  - Session notes by specialist
  - Rating by user
  - Follow-up booking suggestion
  
**Impact:**
- Specialists forget to add session notes
- Users don't rate sessions
- Miss opportunity for continuity of care

**Fix:** Add post-session workflow with required actions

---

### Issue 3: **Provider Referrals - No Visibility to Original Provider**

**Problem:**
- Specialists can refer bookings to other specialists (`ReferralBookingModal.tsx`)
- **BUT** original specialist doesn't see:
  - If referral was accepted
  - How referred session went
  - If user needs to come back

**Impact:**
- Breaks continuity of care
- Original specialist cannot follow up
- No feedback loop for referral quality

**Fix:** Add referral tracking dashboard for specialists

---

### Issue 4: **Admin Cannot See Real-Time Session Status**

**Problem:**
- Admin views show sessions but not real-time status (waiting, in-progress, completed)
- No way to see which sessions are currently happening
- Cannot intervene if issues arise

**Impact:**
- Support team cannot help with live session issues
- No visibility into platform usage patterns
- Cannot monitor specialist performance in real-time

**Fix:** Add real-time session status dashboard for admins

---

## 🔧 RECOMMENDED FIXES (Priority Order)

### 1. **IMMEDIATE** (Must fix this week)
- [ ] Fix #8: Booking quota validation before creation
- [ ] Fix #5: Add company context to escalated chats
- [ ] Fix #6: Implement realtime meeting link sync

### 2. **HIGH PRIORITY** (Fix within 2 weeks)
- [ ] Fix #1: Specialist session visibility (all sources)
- [ ] Fix #7: Optimize admin employee queries (performance)
- [ ] Fix #3: Track actual session deductions

### 3. **MEDIUM PRIORITY** (Fix within 1 month)
- [ ] Fix #2: Remove company email fallback hack
- [ ] Fix #4: Add booking source context to calendar
- [ ] Fix #9: Link chat sessions to bookings
- [ ] Fix #10: Comprehensive notification system

### 4. **LOW PRIORITY** (Enhancement)
- [ ] Add referral tracking (Issue 3)
- [ ] Add real-time session status (Issue 4)
- [ ] Add post-session workflow (Issue 2)
- [ ] Add employee registration notifications (Issue 1)

---

## 🧪 TESTING CHECKLIST

After implementing fixes, test these scenarios:

- [ ] Specialist can see all assigned sessions (from bookings + chats)
- [ ] Especialista Geral can see all escalated chats with company context
- [ ] Meeting link updates reflect immediately for users
- [ ] User cannot book session when quota is exhausted
- [ ] Session deduction appears correctly in user history
- [ ] Admin employee list loads quickly (< 2 seconds)
- [ ] HR users always have valid company_id (no fallback needed)
- [ ] Notifications appear for all critical user flows

---

## 📝 NOTES

**Database RPC Functions Used:**
- `get_user_primary_role()` - Fetching user roles
- `get_company_seat_stats()` - Company metrics
- `get_user_session_balance()` - User quota
- `book_session_with_quota_check()` - Creating bookings
- `cancel_booking_as_specialist()` - Cancellation
- `reschedule_booking_as_specialist()` - Rescheduling

**Key Tables:**
- `bookings` - Session bookings
- `chat_sessions` - User chat sessions
- `company_employees` - Employee-company relationships
- `profiles` - User profiles
- `prestadores` - Service providers
- `user_roles` - Role assignments

**Realtime Subscriptions:**
- Currently implemented for `bookings` table in `useBookings.ts`
- Currently implemented for `chat_sessions` in `useEscalatedChats.ts`
- **Missing** for `company_employees`, `user_roles`, `prestador_availability`

---

## End of Report

**Next Steps:**
1. Review this report with development team
2. Prioritize fixes based on user impact
3. Create implementation tickets
4. Test each fix thoroughly
5. Update this document as fixes are deployed


