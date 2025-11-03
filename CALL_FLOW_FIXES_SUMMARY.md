# Call Flow Data Synchronization Fixes

**Date**: November 3, 2025  
**Status**: ✅ Complete  
**Issue**: User-triggered calls not appearing in specialist call requests list

---

## Problem Description

When users clicked the "Ligar Agora" (Call Now) button in the chat interface:
1. ✅ The call request was saved to the database
2. ✅ The `chat_sessions` status was updated to `'phone_escalated'`
3. ❌ **BUT** specialists couldn't see these calls in their Call Requests dashboard
4. ❌ Completed calls were not being saved properly

**Root Cause**: Status value mismatch - same issue as the booking `date`/`booking_date` problem.

---

## Technical Analysis

### The Flow

**User Side (Working Correctly)**:
```typescript
// src/components/booking/SpecialistContactCard.tsx
handleCallClick = async () => {
  // Updates chat session to phone_escalated
  await supabase.from('chat_sessions').update({
    status: 'phone_escalated',  // ✅ Sets this status
    phone_escalation_reason: context
  }).eq('id', sessionId);

  // Creates pending call log
  await supabase.from('specialist_call_logs').insert({
    chat_session_id: sessionId,
    user_id: user.id,
    call_status: 'pending'
  });
}
```

**Specialist Side (Was Broken)**:
```typescript
// src/pages/EspecialistaCallRequests.tsx (OLD - BROKEN)
const filteredRequests = escalatedChats.filter((chat: any) => 
  chat.status === 'pending'  // ❌ Looking for wrong status!
);

// Should be:
const filteredRequests = escalatedChats.filter((chat: any) => 
  chat.status === 'phone_escalated' || chat.status === 'pending'  // ✅ Correct
);
```

### Type Definition Mismatch

```typescript
// src/hooks/useEscalatedChats.ts (OLD - INCOMPLETE)
status: session.status as 'active' | 'escalated' | 'resolved'
// ❌ Missing 'phone_escalated' and 'pending'

// NEW - COMPLETE
status: session.status as 'active' | 'escalated' | 'resolved' | 'phone_escalated' | 'pending'
// ✅ Includes all possible statuses
```

---

## Fixes Implemented

### ✅ Fix 1: Updated Type Definitions

**Files Modified**:
- `src/types/specialist.ts`
- `src/hooks/useEscalatedChats.ts`

**Changes**:
```typescript
// BEFORE
export interface ChatSession {
  status: 'active' | 'resolved' | 'escalated';
  // ...
}

// AFTER
export interface ChatSession {
  status: 'active' | 'resolved' | 'escalated' | 'phone_escalated' | 'pending';
  // ...
}
```

**Impact**: TypeScript now recognizes all valid chat session statuses, preventing type errors and improving code safety.

---

### ✅ Fix 2: Corrected Status Filtering

**File Modified**:
- `src/pages/EspecialistaCallRequests.tsx`

**Changes**:
```typescript
// BEFORE (Broken)
const filteredRequests = escalatedChats.filter((chat: any) => 
  chat.status === 'pending'
);

// AFTER (Fixed)
const filteredRequests = escalatedChats.filter((chat: any) => 
  chat.status === 'phone_escalated' || chat.status === 'pending'
);
```

**Impact**: Specialists can now see calls triggered by users in their Call Requests dashboard.

---

### ✅ Fix 3: Implemented Call Completion Saving

**File Modified**:
- `src/pages/EspecialistaCallRequestsRevamped.tsx`

**Problem**: When specialists completed a call, the outcome and notes were displayed in a toast but **NOT saved to the database**.

**Solution**: Implemented full database persistence:

```typescript
const handleCallComplete = async (outcome: string, notes: string) => {
  // 1. Save call log
  await supabase
    .from('specialist_call_logs')
    .insert({
      chat_session_id: selectedRequest.id,
      user_id: selectedRequest.user_id,
      specialist_id: profile?.id,
      call_status: 'completed',
      call_notes: notes,
      outcome: outcome,
      completed_at: new Date().toISOString(),
    });

  // 2. Update chat session status
  const newStatus = outcome === 'resolved_by_phone' || outcome === 'session_booked' 
    ? 'resolved' 
    : 'phone_escalated';
  
  await supabase
    .from('chat_sessions')
    .update({
      status: newStatus,
      phone_contact_made: true,
      ...(newStatus === 'resolved' && { ended_at: new Date().toISOString() })
    })
    .eq('id', selectedRequest.id);

  // 3. Refresh the list
  window.location.reload();
};
```

**Impact**: 
- ✅ Call outcomes are now permanently saved
- ✅ Call notes are stored for future reference
- ✅ Chat session status updates appropriately
- ✅ Resolved calls move out of pending list
- ✅ Full audit trail of specialist actions

---

## Database Schema

### Relevant Tables

**chat_sessions**:
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  pillar TEXT,
  status TEXT CHECK (status IN (
    'active', 
    'resolved', 
    'phone_escalated',  -- Key status for call requests
    'abandoned', 
    'pending'
  )),
  phone_escalation_reason TEXT,  -- Why user requested call
  phone_contact_made BOOLEAN,    -- Whether specialist called
  session_booked_by_specialist UUID,
  created_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);
```

**specialist_call_logs**:
```sql
CREATE TABLE specialist_call_logs (
  id UUID PRIMARY KEY,
  chat_session_id UUID REFERENCES chat_sessions(id),
  user_id UUID REFERENCES profiles(id),
  specialist_id UUID REFERENCES profiles(id),
  call_status TEXT CHECK (call_status IN (
    'pending',     -- Waiting for specialist
    'completed',   -- Call finished
    'missed',      -- User didn't answer
    'scheduled'    -- Follow-up scheduled
  )),
  call_notes TEXT,          -- Specialist's notes
  outcome TEXT,             -- resolved_by_phone, session_booked, escalated
  session_booked BOOLEAN,
  booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

---

## Status Flow Diagram

```
User triggers call
       ↓
chat_sessions.status = 'phone_escalated'
specialist_call_logs.call_status = 'pending'
       ↓
Appears in Specialist's Call Requests Dashboard
       ↓
Specialist makes call
       ↓
       ├→ Resolved by phone
       │  └→ chat_sessions.status = 'resolved'
       │     specialist_call_logs.outcome = 'resolved_by_phone'
       │
       ├→ Session booked
       │  └→ chat_sessions.status = 'resolved'
       │     specialist_call_logs.outcome = 'session_booked'
       │     Creates booking record
       │
       └→ Needs escalation
          └→ chat_sessions.status = 'phone_escalated'
             specialist_call_logs.outcome = 'escalated'
```

---

## Files Changed Summary

### Type Definitions (1 file)
- ✅ `src/types/specialist.ts` - Added missing status types

### Hooks (1 file)
- ✅ `src/hooks/useEscalatedChats.ts` - Updated type casting

### Pages (2 files)
- ✅ `src/pages/EspecialistaCallRequests.tsx` - Fixed status filtering
- ✅ `src/pages/EspecialistaCallRequestsRevamped.tsx` - Implemented call completion saving

---

## Testing Checklist

### ✅ User Triggering Call
1. User chats with AI
2. AI escalates to phone (shows "Ligar Agora" button)
3. User clicks button
4. System saves:
   - `chat_sessions.status` = 'phone_escalated'
   - `chat_sessions.phone_escalation_reason` = reason text
   - `specialist_call_logs` entry with status 'pending'

### ✅ Specialist Viewing Calls
1. Specialist logs into dashboard
2. Navigates to Call Requests page
3. Sees list of pending calls with:
   - User name
   - Company name
   - Pillar (psychological, physical, financial, legal)
   - Wait time
   - Reason for escalation

### ✅ Specialist Completing Call
1. Specialist clicks "Ligar" (Call) button
2. CallModal opens showing chat history
3. Specialist makes call and enters:
   - Outcome (resolved_by_phone, session_booked, escalated)
   - Notes about the call
4. Clicks "Concluir" (Complete)
5. System saves:
   - Call log with all details
   - Updates chat session status
   - Marks call as completed with timestamp

### ✅ Data Persistence
1. Specialist completes call
2. Refreshes page
3. Call moves from "Pending" to "Resolved" tab
4. Call history shows completion details
5. User's chat session shows phone contact was made

---

## Impact & Benefits

### For Users
✅ **Reliability**: Calls they trigger are actually seen by specialists  
✅ **Responsiveness**: Specialists can now respond to call requests  
✅ **Continuity**: Call context is preserved for specialists to see  

### For Specialists
✅ **Visibility**: All call requests now appear in their dashboard  
✅ **History**: Call outcomes and notes are permanently saved  
✅ **Accountability**: Full audit trail of all specialist actions  
✅ **Filtering**: Can see pending vs resolved calls separately  

### For System
✅ **Data Integrity**: All call interactions are properly tracked  
✅ **Reporting**: Can generate metrics on call volume and outcomes  
✅ **Compliance**: Complete records for quality assurance  

---

## Related Issues Fixed

This fix resolves the same category of issue as the booking data sync problem:
- **Root Cause**: Column/value mismatches between where data is saved vs where it's queried
- **Pattern**: Data exists in database but UI can't find it due to filtering on wrong values
- **Solution**: Align status values and type definitions across entire flow

### Similar Fixes Applied
1. ✅ Booking `date` vs `booking_date` column mismatch
2. ✅ Call `status` values alignment
3. 🔍 **Recommendation**: Audit other flows for similar mismatches

---

## Recommendations

### 1. Add Database Constraints
Ensure only valid status values can be saved:
```sql
ALTER TABLE chat_sessions
DROP CONSTRAINT IF EXISTS chat_sessions_status_check;

ALTER TABLE chat_sessions
ADD CONSTRAINT chat_sessions_status_check
CHECK (status IN ('active', 'resolved', 'phone_escalated', 'abandoned', 'pending'));
```

### 2. Create Status Constants
Centralize status values to prevent typos:
```typescript
// src/constants/statuses.ts
export const CHAT_SESSION_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  PHONE_ESCALATED: 'phone_escalated',
  ABANDONED: 'abandoned',
  PENDING: 'pending',
} as const;

export type ChatSessionStatus = typeof CHAT_SESSION_STATUS[keyof typeof CHAT_SESSION_STATUS];
```

### 3. Add Integration Tests
Test the full flow end-to-end:
```typescript
describe('Call Escalation Flow', () => {
  it('should save call request when user clicks Ligar Agora', async () => {
    // Trigger call
    // Verify chat_sessions.status === 'phone_escalated'
    // Verify specialist_call_logs entry exists
  });

  it('should show call in specialist dashboard', async () => {
    // Create test call request
    // Query specialist dashboard
    // Verify call appears in list
  });

  it('should save call completion details', async () => {
    // Complete a call
    // Verify specialist_call_logs updated
    // Verify chat_sessions.status updated
  });
});
```

---

## Conclusion

The call flow is now working end-to-end:
- ✅ Users can trigger calls
- ✅ Specialists can see and respond to calls
- ✅ Call outcomes are properly saved
- ✅ Full audit trail is maintained
- ✅ Data flows correctly from user → specialist → database

This fix follows the same pattern as the booking data sync fix: identifying and resolving mismatches in how data is saved vs how it's queried.


