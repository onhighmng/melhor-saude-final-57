# 🔧 Flow Fix Implementation Plan
**Date:** 2025-11-02  
**Status:** Ready to Execute

---

## 📋 Overview

All 4 missing features have **UI already built** but need backend wiring. This plan connects existing components to backend functions.

---

## ✅ FEATURE 1: HR Monthly Reports & PDF Downloads

### Current State:
- ✅ UI exists: `CompanyReportsImpact.tsx`, `CompanySessions.tsx`
- ✅ Export button present with `handleExportReport()` function
- ❌ Shows empty state: "Relatórios estarão disponíveis em breve"
- ❌ No real data calculation
- ❌ No PDF generation

### Files to Modify:
1. **`src/pages/CompanyReportsImpact.tsx`** (lines 28-497)
2. **`src/pages/CompanySessions.tsx`** (lines 42-468)

### Backend Requirements:
1. **New Edge Function:** `generate-company-report-pdf`
   - Input: `company_id`, `start_date`, `end_date`
   - Output: PDF blob with company logo, metrics, charts
   
2. **New RPC Function:** `get_company_monthly_metrics`
   ```sql
   CREATE OR REPLACE FUNCTION get_company_monthly_metrics(
     p_company_id UUID,
     p_start_date DATE,
     p_end_date DATE
   ) RETURNS JSON AS $$
   -- Calculate:
   -- - utilization_rate (sessions_used / sessions_allocated)
   -- - active_employees_count
   -- - pillar_usage (breakdown by pillar)
   -- - avg_satisfaction_score
   -- - goals_achieved_count
   -- - top_used_pillar
   ```

### Implementation Steps:
1. Create `supabase/functions/generate-company-report-pdf/index.ts`
   - Use `jspdf` library
   - Fetch data via `get_company_monthly_metrics` RPC
   - Generate charts with chart.js
   - Return PDF as base64

2. Update `CompanyReportsImpact.tsx`:
   - Remove empty state condition
   - Add `loadMonthlyMetrics()` function calling RPC
   - Wire `handleExportReport()` to edge function
   - Display metrics in existing card components

3. Update `CompanySessions.tsx`:
   - Use same `get_company_monthly_metrics` RPC
   - Populate pillar breakdown cards with real data

### Acceptance Criteria:
- [ ] HR can select date range (last 30/90 days)
- [ ] Metrics display: utilization %, active employees, pillar usage, satisfaction
- [ ] "Exportar PDF" button generates downloadable report
- [ ] PDF includes company name, date range, all metrics, charts

---

## ✅ FEATURE 2: Session Feedback (1-10 Rating)

### Current State:
- ✅ UI exists: `SessionRatingDialog.tsx` (lines 18-169)
- ✅ Backend works: Saves to `bookings.rating` and `feedback` table
- ❌ **Issue:** Dialog never opens after user completes a session
- ❌ No trigger to show rating modal

### Files to Modify:
1. **`src/pages/UserSessions.tsx`** (lines 18-302)
2. **`src/components/sessions/SessionRatingDialog.tsx`** (lines 18-169)

### Backend Requirements:
**None** - Backend already functional. Only need to wire the trigger.

### Implementation Steps:
1. Update `UserSessions.tsx`:
   - Add state: `const [ratingSession, setRatingSession] = useState<string | null>(null)`
   - After booking status changes to `completed`:
     ```typescript
     useEffect(() => {
       // Check for recently completed sessions without rating
       const unratedSessions = sessions.filter(s => 
         s.status === 'completed' && 
         !s.rating &&
         isWithin24Hours(s.scheduled_at)
       );
       if (unratedSessions.length > 0) {
         setRatingSession(unratedSessions[0].id);
       }
     }, [sessions]);
     ```
   
   - Add `<SessionRatingDialog>` component at bottom with:
     ```typescript
     <SessionRatingDialog
       open={!!ratingSession}
       onOpenChange={(open) => !open && setRatingSession(null)}
       sessionId={ratingSession || ''}
       pillarName={sessions.find(s => s.id === ratingSession)?.pillar || ''}
     />
     ```

2. Optional: Add "Avaliar" button to completed sessions in session list
   - Show button only if `session.status === 'completed' && !session.rating`

### Acceptance Criteria:
- [ ] After completing a 1:1 session, user automatically sees rating dialog
- [ ] User can rate 1-10 and add comments
- [ ] Rating saves to `bookings.rating` and `feedback` table
- [ ] User can manually trigger rating from session list

---

## ✅ FEATURE 3: Prestador Referral Flow (Especialista → Prestador)

### Current State:
- ✅ UI exists: `SessionNoteModal.tsx` (lines 22-233) with "Encaminhar" button
- ✅ UI exists: `ReferralBookingFlow.tsx` (lines 47-308) - full booking flow
- ✅ Backend partially works: Can create bookings in `bookings` table
- ❌ **Issue:** Clicking "Encaminhar" doesn't actually create the referral booking
- ❌ No connection between `SessionNoteModal` and `ReferralBookingFlow`

### Files to Modify:
1. **`src/components/specialist/SessionNoteModal.tsx`** (lines 22-233)
2. **`src/components/specialist/ReferralBookingFlow.tsx`** (lines 47-308)
3. **`src/pages/EspecialistaSessionsRevamped.tsx`** (lines 23-1031)

### Backend Requirements:
**None** - All tables and functions already exist. Just need to wire components.

### Implementation Steps:
1. Update `SessionNoteModal.tsx`:
   - Currently line 165 has: `onClick={() => { setOutcome('escalated'); setShowReferralFlow(true); }}`
   - Keep this but ensure `showReferralFlow` state is passed to parent
   
2. Update `EspecialistaSessionsRevamped.tsx`:
   - Import `ReferralBookingFlow` component
   - Add state: `const [showReferralFlow, setShowReferralFlow] = useState(false)`
   - Add state: `const [referralSession, setReferralSession] = useState<any>(null)`
   
   - When specialist clicks "Encaminhar":
     ```typescript
     const handleReferralClick = (session) => {
       setReferralSession(session);
       setShowReferralFlow(true);
     };
     ```
   
   - Add `ReferralBookingFlow` component:
     ```typescript
     <ReferralBookingFlow
       isOpen={showReferralFlow}
       onClose={() => setShowReferralFlow(false)}
       sessionPillar={referralSession?.pillar}
       userName={referralSession?.user_name}
       userId={referralSession?.user_id}
       onBookingComplete={async (providerId, dateTime, notes) => {
         // Create booking
         const { data: booking, error } = await supabase
           .from('bookings')
           .insert({
             user_id: referralSession.user_id,
             prestador_id: providerId,
             scheduled_at: dateTime.toISOString(),
             pillar: referralSession.pillar,
             status: 'scheduled',
             booking_source: 'specialist_referral',
             notes: notes
           })
           .select()
           .single();

         if (!error) {
           // Update chat session to mark as referred
           await supabase
             .from('chat_sessions')
             .update({
               status: 'referred_to_provider',
               session_booked_by_specialist: providerId
             })
             .eq('id', referralSession.chat_session_id);

           toast({ title: 'Encaminhamento realizado!' });
           setShowReferralFlow(false);
           loadSessions(); // Refresh list
         }
       }}
     />
     ```

### Acceptance Criteria:
- [ ] Especialista completes session note
- [ ] Clicks "Encaminhar" button
- [ ] `ReferralBookingFlow` modal opens
- [ ] Can select pillar → provider → date/time
- [ ] Booking is created in `bookings` table with `booking_source='specialist_referral'`
- [ ] Chat session status updates to `referred_to_provider`
- [ ] User receives notification about new booking

---

## ✅ FEATURE 4: Admin Supervision Dashboard (Especialista & Prestadores)

### Current State:
- ✅ UI exists: `AdminDashboard.tsx` (lines 17-195)
- ✅ UI exists: `AdminProviderDetailMetrics.tsx` (lines 1-114)
- ❌ **Missing:** Comprehensive specialist performance tracking
- ❌ **Missing:** Side-by-side comparison of all specialists/providers

### Files to Modify:
1. **`src/pages/AdminDashboard.tsx`** (lines 17-195)
2. **New file:** `src/pages/AdminPerformanceSupervision.tsx`

### Backend Requirements:
1. **New RPC Function:** `get_specialist_performance`
   ```sql
   CREATE OR REPLACE FUNCTION get_specialist_performance(
     p_start_date DATE,
     p_end_date DATE
   ) RETURNS TABLE (
     specialist_id UUID,
     specialist_name TEXT,
     total_cases INT,
     resolved_cases INT,
     referred_cases INT,
     avg_resolution_time INTERVAL,
     avg_satisfaction_rating NUMERIC
   ) AS $$
   -- Aggregate data from chat_sessions and bookings
   ```

2. **New RPC Function:** `get_provider_performance`
   ```sql
   CREATE OR REPLACE FUNCTION get_provider_performance(
     p_start_date DATE,
     p_end_date DATE
   ) RETURNS TABLE (
     provider_id UUID,
     provider_name TEXT,
     total_sessions INT,
     completed_sessions INT,
     cancelled_sessions INT,
     avg_rating NUMERIC,
     total_revenue NUMERIC
   ) AS $$
   -- Aggregate data from bookings and feedback
   ```

### Implementation Steps:
1. Create new admin page: `AdminPerformanceSupervision.tsx`
   - Two tabs: "Especialistas Gerais" | "Prestadores Externos"
   - Date range selector (last 7/30/90 days)
   - Leaderboard table with:
     - Name
     - Total cases/sessions
     - Resolution rate
     - Avg satisfaction
     - Status indicator (active/inactive)
   
2. Add route in `App.tsx`:
   ```typescript
   <Route path="/admin/performance" element={
     <ProtectedRoute requiredRole="admin">
       <AdminLayout>
         <AdminPerformanceSupervision />
       </AdminLayout>
     </ProtectedRoute>
   } />
   ```

3. Add navigation link in `AdminLayout`:
   - Add "Supervisão de Desempenho" link to sidebar

### Acceptance Criteria:
- [ ] Admin can view all specialists' performance metrics
- [ ] Admin can view all providers' performance metrics
- [ ] Metrics include: total cases, resolution rate, avg satisfaction, revenue
- [ ] Can filter by date range
- [ ] Can sort by any metric column
- [ ] Click on specialist/provider opens detail view

---

## 🚀 Implementation Order

### Priority 1: Quick Wins (1-2 hours each)
1. **Session Feedback Trigger** (Feature 2) - Just wiring, no backend
2. **Prestador Referral Flow** (Feature 3) - Connect existing components

### Priority 2: Backend + Frontend (3-4 hours each)
3. **HR Monthly Reports** (Feature 1) - Need PDF generation edge function
4. **Admin Supervision Dashboard** (Feature 4) - Need new RPC functions

---

## 📦 New Files to Create

1. `supabase/functions/generate-company-report-pdf/index.ts`
2. `supabase/migrations/YYYYMMDD_add_performance_rpc_functions.sql`
3. `src/pages/AdminPerformanceSupervision.tsx`
4. `QUICK_FIX_HR.sql` (already created - run this first!)

---

## ✅ Testing Checklist

### Feature 1: HR Reports
- [ ] HR logs in
- [ ] Goes to "Relatórios de Impacto"
- [ ] Sees real metrics (not empty state)
- [ ] Clicks "Exportar PDF"
- [ ] Downloads PDF with company logo, metrics, charts

### Feature 2: Session Feedback
- [ ] User completes 1:1 session
- [ ] Rating dialog appears automatically
- [ ] User rates 1-10 and adds comment
- [ ] Rating saves to database
- [ ] Can see rating in session history

### Feature 3: Referral Flow
- [ ] Especialista views session list
- [ ] Clicks "Encaminhar" on a case
- [ ] Booking flow modal opens
- [ ] Selects provider and date/time
- [ ] Booking created successfully
- [ ] User receives notification

### Feature 4: Admin Supervision
- [ ] Admin goes to "Supervisão de Desempenho"
- [ ] Sees list of all specialists with metrics
- [ ] Sees list of all providers with metrics
- [ ] Can filter by date range
- [ ] Can sort by columns
- [ ] Clicks name to see details

---

## 🔧 Immediate Action: Fix HR Account First

**Before anything else, run:**
```bash
# In Supabase SQL Editor
# File: QUICK_FIX_HR.sql (already created)
```

This will:
- Create your auth user in database
- Link to Test Company (50 seats)
- Assign HR role
- Fix "Perfil não vinculado" error

Then the "Gerar Código" button will work! ✅

---

## 📊 Estimated Time

| Feature | Frontend | Backend | Total |
|---------|----------|---------|-------|
| 1. HR Reports | 2h | 3h | 5h |
| 2. Session Feedback | 1h | 0h | 1h |
| 3. Referral Flow | 1.5h | 0h | 1.5h |
| 4. Admin Supervision | 2h | 2h | 4h |
| **TOTAL** | **6.5h** | **5h** | **11.5h** |

---

## 🎯 Success Criteria

All flows match the documented user journeys:
- ✅ Company can generate codes and view detailed monthly reports
- ✅ Colaborador provides 1-10 feedback after every session
- ✅ Especialista can refer complex cases to Prestadores
- ✅ Admin can supervise all specialists and providers

**Ready to execute!** 🚀




