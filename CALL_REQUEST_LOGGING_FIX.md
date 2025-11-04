# Call Request Logging Issue - FIXED ✅

## Problem Summary

Call requests from users were not appearing on the specialist's call request page, even though they were being created in the database.

## Root Cause

The issue was in the **feedback submission flow**. When users closed the chat and provided feedback, the code was **overwriting the `phone_escalated` status** with `resolved`, making the requests invisible to specialists.

### The Bug Flow:
1. ✅ User requests a call → status changed to `phone_escalated`
2. ✅ `specialist_call_logs` entry created
3. ❌ User closes chat and provides feedback → status changed to `resolved` (overwrites phone_escalated)
4. ❌ Specialist page filters for `phone_escalated` status → request NOT found!

## Files Fixed

### 1. `/src/components/booking/ChatExitFeedback.tsx`
**Before:**
```typescript
await supabase
  .from('chat_sessions')
  .update({
    satisfaction_rating: selectedRating,
    status: 'resolved',  // ❌ Always overwrites status
    ended_at: new Date().toISOString()
  })
  .eq('id', sessionId);
```

**After:**
```typescript
// Get current session status first
const { data: currentSession } = await supabase
  .from('chat_sessions')
  .select('status')
  .eq('id', sessionId)
  .single();

// IMPORTANT: Don't override phone_escalated status
await supabase
  .from('chat_sessions')
  .update({
    satisfaction_rating: selectedRating,
    // Only set to resolved if it wasn't escalated
    status: currentSession?.status === 'phone_escalated' ? 'phone_escalated' : 'resolved',
    ended_at: new Date().toISOString()
  })
  .eq('id', sessionId);
```

### 2. `/src/components/booking/ChatExitFeedbackButtons.tsx`
Same fix applied - preserves `phone_escalated` status when feedback is submitted.

## Database Fixes

### 1. Cleaned up existing data
- Fixed 1 session that was incorrectly marked as `resolved` but should be `phone_escalated`
- Removed 4 duplicate call log entries

### 2. Applied Migration: `fix_call_request_status_handling`
- ✅ Added unique constraint to prevent duplicate pending call logs per session
- ✅ Added indexes for better query performance
- ✅ Added helpful comments to tables

```sql
-- Prevent duplicate pending call logs
CREATE UNIQUE INDEX specialist_call_logs_unique_pending_session 
ON specialist_call_logs (chat_session_id) 
WHERE call_status = 'pending';

-- Speed up specialist queries
CREATE INDEX idx_specialist_call_logs_pending 
ON specialist_call_logs (call_status, created_at DESC) 
WHERE call_status = 'pending';

CREATE INDEX idx_chat_sessions_phone_escalated 
ON chat_sessions (status, created_at DESC) 
WHERE status = 'phone_escalated';
```

## Verification

### Current State (After Fix):
```
session_id                                | status          | user_name | call_log_count
------------------------------------------|-----------------|-----------|----------------
b30c8aba-1709-4e4a-9a30-266e7afe50bc     | phone_escalated | Lorino    | 1
70fe8c8c-92db-4946-9e58-350a466ff776     | phone_escalated | Lorino    | 1
```

✅ All call requests now properly maintain `phone_escalated` status
✅ No duplicate call logs
✅ Specialists can now see these requests

## How It Works Now

### User Flow:
1. User chats with AI assistant
2. User clicks "Falar com Especialista" (Talk to Specialist) button
3. Session status → `phone_escalated`
4. Entry created in `specialist_call_logs` with `call_status = 'pending'`
5. **NEW:** When user provides feedback, status remains `phone_escalated` (not changed to resolved)

### Specialist Flow:
1. Specialist navigates to `/especialista/call-requests`
2. The `useEscalatedChats` hook queries for sessions with `phone_escalated` status
3. **NOW VISIBLE:** Requests appear in the specialist's dashboard
4. Specialist can call the user and mark as resolved

## Database Schema

### Key Tables:

**chat_sessions**
- `id` - session identifier
- `status` - session status (open, phone_escalated, resolved)
- `phone_escalation_reason` - why user requested call
- `satisfaction_rating` - user feedback (satisfied/unsatisfied)

**specialist_call_logs**
- `id` - log identifier
- `chat_session_id` - FK to chat_sessions
- `user_id` - FK to profiles
- `specialist_id` - FK to profiles (when assigned)
- `call_status` - pending, completed, missed, scheduled
- `call_notes` - specialist's notes after call

## RLS Policies

✅ Verified - All RLS policies are in place:
- Specialists can view all call logs
- Specialists can view escalated chats
- Users can view their own call logs
- Users can create call logs for their own sessions

## Testing Checklist

- [x] User can request a call from chat
- [x] Call request is logged in `specialist_call_logs`
- [x] Session status is set to `phone_escalated`
- [x] User can provide feedback without losing `phone_escalated` status
- [x] Specialist can see the call request in their dashboard
- [x] No duplicate call logs are created
- [x] Database indexes improve query performance

## Future Improvements

1. Add email notification to specialist when new call request is created
2. Add SLA tracking for call response time
3. Add automatic escalation if call not handled within X hours
4. Add call status dashboard for managers

## Related Files

- `/src/hooks/useEscalatedChats.ts` - Hook that fetches escalated chats
- `/src/pages/EspecialistaCallRequests.tsx` - Specialist call request page
- `/src/pages/EspecialistaCallRequestsRevamped.tsx` - Alternative specialist call request page
- `/src/components/booking/UniversalAIChat.tsx` - Chat component where users request calls

## Date Fixed
November 4, 2025

## Status
✅ **RESOLVED** - All call requests now properly logged and visible to specialists

