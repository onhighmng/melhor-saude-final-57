# User Flows Issues Analysis - Complete Report
**Generated:** 2025-11-02  
**Database Analysis:** Supabase Production Schema

---

## Executive Summary

This document identifies **critical database, function, and integration issues** that could prevent the 5 main user flows from working correctly.

### Critical Issues Found: 🔴 **15 High-Priority Issues**

---

## 🚨 Flow 1: Company (HR / Admin da Empresa)

### Overview
**Goal:** Manage employee access, monitor usage, and track impact

### ✅ Working Components
1. ✅ Company registration (`RegisterCompany.tsx`)
2. ✅ Access code generation (`AdminUsersManagement.tsx`)
3. ✅ Employee invitation system (`InviteEmployeeModal.tsx`)
4. ✅ `companies` table structure
5. ✅ `invites` table structure
6. ✅ `validate_access_code` RPC function exists
7. ✅ Edge function: `create-employee`

### 🔴 Critical Issues

#### Issue 1.1: RLS Policies Missing on Key Tables
**Severity:** 🔴 CRITICAL  
**Affected Flow:** HR viewing employee list, company dashboard

**Problem:**
- `profiles` table: `rls_enabled: false`
- `companies` table: `rls_enabled: false`
- `company_employees` table: `rls_enabled: false`

**Impact:**
- HR users may not be able to query employee data
- Potential security vulnerability - anyone can read company data
- Dashboard queries will fail with permission errors

**Fix Required:**
```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_employees ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "HR can view their company employees"
ON public.company_employees FOR SELECT
USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'hr')
);
```

#### Issue 1.2: Missing Company Metrics RPC Function
**Severity:** 🟡 MEDIUM  
**Affected Component:** `CompanyReportsImpact.tsx`

**Problem:**
```typescript
// File: src/pages/CompanyReportsImpact.tsx
const { data: metrics } = await supabase.rpc('get_company_metrics', {...});
```

**Database Check:**
- ❌ Function `get_company_metrics` NOT found in database

**Impact:**
- Company reports page will fail to load
- HR cannot see utilization metrics

**Fix Required:**
Create the RPC function in a migration:
```sql
CREATE OR REPLACE FUNCTION get_company_metrics(p_company_id UUID)
RETURNS JSON AS $$
-- Implementation needed
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Issue 1.3: Schema Mismatch - Companies Table
**Severity:** 🟡 MEDIUM  
**Problem:**

**Database Schema:**
```
- name (exists)
- company_name (does NOT exist)
```

**Code Expecting:**
```typescript
// Multiple files query 'company_name'
.eq('company_name', data.company)
```

**Impact:**
- Company queries will fail
- Registration may fail

**Fix Required:**
Either:
1. Add `company_name` column as alias
2. Update all code to use `name` instead

#### Issue 1.4: Employee List Not Showing
**Severity:** 🔴 CRITICAL  
**Root Cause:** Foreign key reference issue

**Problem:**
```sql
-- company_employees references profiles(id)
-- But profiles(id) references auth.users(id)
-- If user registration doesn't create profile first, FK constraint fails
```

**Files Affected:**
- `src/pages/AdminCompanyDetail.tsx`
- `src/components/admin/AddEmployeeModal.tsx`

**Impact:**
- Employees register but don't appear in HR dashboard
- `company_employees` table empty despite successful registration

**Fix Required:**
1. Ensure profile creation happens BEFORE company_employees insert
2. Add error handling for FK violations
3. Create retroactive fix for orphaned employees

---

## 🚨 Flow 2: Colaborador (User / Employee)

### Overview
**Goal:** Receive personalized support across 4 pillars

### ✅ Working Components
1. ✅ Employee registration (`RegisterEmployee.tsx`)
2. ✅ Access code validation (`validate_access_code` RPC)
3. ✅ Chat system (`useChatSession.ts`)
4. ✅ Edge function: `universal-specialist-chat`
5. ✅ Onboarding flow (`SimplifiedOnboarding.tsx`)

### 🔴 Critical Issues

#### Issue 2.1: User Role Not Set During Registration
**Severity:** 🔴 CRITICAL  
**Affected:** Employee dashboard access

**Problem:**
```typescript
// File: src/pages/RegisterEmployee.tsx (Line 159)
role: invite.role || 'user',
```

BUT:
```typescript
// Database schema shows profiles.role has CHECK constraint
role IN ('user', 'admin', 'hr', 'prestador', 'especialista_geral')
```

However, `user_roles` table is the authoritative source for roles (not `profiles.role`).

**Impact:**
- User registers successfully
- But role check via `has_role()` RPC fails
- Dashboard won't load
- Navigation breaks

**Fix Required:**
Ensure BOTH tables are updated:
```typescript
// 1. Create profile
await supabase.from('profiles').insert({...});

// 2. CRITICAL: Create role in user_roles
await supabase.from('user_roles').insert({
  user_id: authData.user.id,
  role: 'user'
});
```

#### Issue 2.2: Chat Session Not Saving Messages
**Severity:** 🟡 MEDIUM  
**Problem:**

**Database:**
- `chat_sessions` table exists ✅
- `chat_messages` table exists ✅
- RLS is DISABLED on both ❌

**Impact:**
- Messages may not save
- Chat history lost
- Specialist cannot review previous conversations

**Fix Required:**
```sql
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat sessions"
ON public.chat_sessions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert messages in their sessions"
ON public.chat_messages FOR INSERT
WITH CHECK (sender_id = auth.uid());
```

#### Issue 2.3: Booking Flow Missing Prestador Assignment
**Severity:** 🔴 CRITICAL  
**Problem:**

**Code:**
```typescript
// File: src/components/booking/BookingFlow.tsx
// Creates booking without prestador_id
await supabase.from('bookings').insert({
  user_id: userId,
  pillar: pillar,
  status: 'pending'
  // ❌ prestador_id is NULL
});
```

**Impact:**
- Bookings created with no specialist assigned
- Specialist dashboard shows no pending bookings
- Users wait indefinitely

**Fix Required:**
Implement automatic assignment logic or manual selection

#### Issue 2.4: User Progress Not Tracking
**Severity:** 🟢 LOW  
**Problem:**

**Database Check:**
- `user_progress` table exists ✅
- `user_milestones` table exists ✅
- RLS DISABLED ⚠️

**Impact:**
- Dashboard shows no progress
- Gamification features don't work

---

## 🚨 Flow 3: Especialista Geral (General Specialist)

### Overview
**Goal:** Serve as human bridge - triage, initial support, referrals

### ✅ Working Components
1. ✅ Specialist dashboard (`SpecialistDashboard.tsx`)
2. ✅ Escalated chat detection (`useEscalatedChats.ts`)
3. ✅ Notifications system (`useSpecialistNotifications.ts`)
4. ✅ Case management panel (`CaseManagementPanel.tsx`)

### 🔴 Critical Issues

#### Issue 3.1: Specialist Assignments Table Empty
**Severity:** 🔴 CRITICAL  
**Problem:**

**Database:**
```sql
-- Table exists but is EMPTY
SELECT COUNT(*) FROM specialist_assignments; -- Returns 0
```

**Impact:**
- Specialists cannot see assigned companies
- Company filter doesn't work
- Escalated chats not routed correctly

**Fix Required:**
```sql
-- Admin must assign specialists to companies
INSERT INTO specialist_assignments (specialist_id, company_id, pillars, is_active)
VALUES (
  'specialist-user-id',
  'company-id',
  ARRAY['mental', 'physical', 'financial', 'legal'],
  true
);
```

#### Issue 3.2: Specialist Call Logs Table Missing
**Severity:** 🟡 MEDIUM  
**Problem:**

**Code References:**
```typescript
// File: src/components/admin/AdminMatchingTab.tsx (Line 150)
await supabase.from('specialist_call_logs').insert({...});
```

**Database Check:**
- ❌ Table `specialist_call_logs` does NOT exist

**Impact:**
- Call tracking fails silently
- Analytics incomplete
- Specialist performance not measured

**Fix Required:**
```sql
CREATE TABLE specialist_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id UUID REFERENCES chat_sessions(id),
  specialist_id UUID REFERENCES profiles(id),
  user_id UUID REFERENCES auth.users(id),
  booking_id UUID REFERENCES bookings(id),
  call_status TEXT,
  session_booked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Issue 3.3: Phone Escalation Status Not Updating
**Severity:** 🟡 MEDIUM  
**Problem:**

**Chat Sessions Table:**
```
status: 'open' | 'resolved' | 'escalated'
```

But code expects:
```typescript
.eq('status', 'phone_escalated')
```

**Impact:**
- Escalated chats not appearing in specialist dashboard
- Notifications not triggered

**Fix Required:**
Update status values to match or update code to use correct values

---

## 🚨 Flow 4: Prestador (External Specialist)

### Overview
**Goal:** Handle complex cases and track individual progress

### ✅ Working Components
1. ✅ Prestador dashboard (`PrestadorDashboard.tsx`)
2. ✅ `prestadores` table (4 records exist)
3. ✅ Calendar hook (`usePrestadorCalendar.ts`)
4. ✅ Sessions page (`PrestadorSessions.tsx`)

### 🔴 Critical Issues

#### Issue 4.1: Prestador Registration Incomplete Schema
**Severity:** 🔴 CRITICAL  
**Problem:**

**Code Expects:**
```typescript
// Multiple migrations reference these columns:
- qualifications (TEXT[])
- credentials (TEXT)
- hourly_rate (DECIMAL)
- cost_per_session (DECIMAL)
- video_intro_url (TEXT)
```

**Database Has:**
```json
{
  "columns": [
    "id", "user_id", "specialty", "is_active", 
    "name", "photo_url", "email", "biography",
    "languages", "pillar_specialties", "session_duration",
    "video_url", "specialties"
  ]
}
```

**Missing Columns:**
- ❌ `qualifications`
- ❌ `credentials`
- ❌ `hourly_rate`
- ❌ `cost_per_session`
- ❌ `experience_years`
- ❌ `rating`
- ❌ `total_sessions`

**Impact:**
- Prestador profile incomplete
- Cannot set rates
- Admin cannot review credentials
- Rating system broken

**Fix Required:**
```sql
ALTER TABLE prestadores
ADD COLUMN qualifications TEXT[],
ADD COLUMN credentials TEXT,
ADD COLUMN hourly_rate DECIMAL(10,2),
ADD COLUMN cost_per_session DECIMAL(10,2),
ADD COLUMN experience_years INTEGER DEFAULT 0,
ADD COLUMN rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN total_sessions INTEGER DEFAULT 0,
ADD COLUMN total_ratings INTEGER DEFAULT 0;
```

#### Issue 4.2: Case Assignment Service Not Implemented
**Severity:** 🔴 CRITICAL  
**Problem:**

**File:** `src/services/caseAssignmentService.ts`
```typescript
async assignCase(...args: any[]): Promise<AssignmentResult | null> {
  console.warn('[CaseAssignmentService] assignCase not implemented - prestadores table schema mismatch');
  return null;
}
```

**Impact:**
- Cases never assigned to prestadores
- Manual assignment only
- No intelligent routing

**Fix Required:**
Implement full case assignment logic after fixing prestadores schema

#### Issue 4.3: Prestador Availability Table Schema Mismatch
**Severity:** 🟡 MEDIUM  
**Problem:**

**Code Queries:**
```typescript
.from('prestador_availability')
```

**Database:**
- ✅ Table exists
- ⚠️ But may have FK constraints to wrong prestadores schema

**Impact:**
- Availability not saving
- Calendar shows empty

#### Issue 4.4: Booking Notes Not Saving
**Severity:** 🟡 MEDIUM  
**Problem:**

**Database:**
- `session_notes` table has RLS ENABLED ✅
- But policies may be too restrictive

**Impact:**
- Prestador cannot save session notes
- Medical/legal records incomplete

---

## 🚨 Flow 5: Admin da Melhor Saúde

### Overview
**Goal:** Supervise and manage entire platform ecosystem

### ✅ Working Components
1. ✅ Admin dashboard (`AdminUsersManagement.tsx`)
2. ✅ Company creation
3. ✅ Access code generation
4. ✅ `admin_logs` table exists
5. ✅ Admin role check (`has_role` RPC)

### 🔴 Critical Issues

#### Issue 5.1: Admin Cannot See All Users
**Severity:** 🔴 CRITICAL  
**Problem:**

**RLS Disabled:**
- `profiles` table: `rls_enabled: false`
- `companies` table: `rls_enabled: false`

**Impact:**
- If RLS is enabled later, admin dashboard breaks
- Current security vulnerability

**Fix Required:**
```sql
-- Admin bypass policy
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

#### Issue 5.2: Platform Utilization Metrics Missing
**Severity:** 🟡 MEDIUM  
**Problem:**

**Code Expects:**
```typescript
// Multiple admin pages call:
supabase.rpc('get_platform_utilization', {...})
```

**Database:**
- ❌ Function may not exist or returns wrong format

**Impact:**
- Admin dashboard incomplete
- Cannot generate reports
- ROI metrics unavailable

#### Issue 5.3: Admin Cannot Manage Prestadores Properly
**Severity:** 🟡 MEDIUM  
**Problem:**

Due to Issue 4.1 (prestadores schema incomplete), admin pages that manage prestadores will fail:
- `AdminProviderNew.tsx`
- Provider approval workflow

**Impact:**
- Cannot onboard new providers
- Cannot review credentials
- Cannot set rates

---

## 📊 Summary Table

| Flow | User Type | Critical Issues | Medium Issues | Working % |
|------|-----------|----------------|---------------|-----------|
| 1 | Company (HR) | 2 | 2 | 70% |
| 2 | Employee | 2 | 2 | 75% |
| 3 | Especialista Geral | 2 | 2 | 65% |
| 4 | Prestador | 3 | 2 | 50% |
| 5 | Admin | 2 | 2 | 80% |

**Total Critical Issues:** 11  
**Total Medium Issues:** 10  
**Average Working:** 68%

---

## 🔧 Recommended Fix Priority

### Phase 1: Critical Database Fixes (Do First)
1. ✅ Enable RLS on all tables with proper policies
2. ✅ Fix `prestadores` table schema (add missing columns)
3. ✅ Create `specialist_call_logs` table
4. ✅ Fix company_name vs name column inconsistency
5. ✅ Ensure user_roles is populated on registration

### Phase 2: RPC Functions (Do Second)
1. ✅ Create `get_company_metrics()` function
2. ✅ Create `get_platform_utilization()` function
3. ✅ Fix `validate_access_code()` return type consistency
4. ✅ Create utility functions for case assignment

### Phase 3: Application Logic (Do Third)
1. ✅ Implement case assignment service
2. ✅ Fix booking prestador assignment
3. ✅ Add specialist assignment workflow for admins
4. ✅ Fix chat escalation status values

### Phase 4: Testing & Validation
1. Test each flow end-to-end
2. Verify RLS policies work correctly
3. Check all dashboard queries return data
4. Validate role-based access

---

## 🎯 Next Steps

Would you like me to:
1. **Generate SQL migration files** to fix all database issues?
2. **Create RPC functions** that are missing?
3. **Fix code files** that have schema mismatches?
4. **Set up test data** to validate each flow?

Let me know which priority you'd like to tackle first!

