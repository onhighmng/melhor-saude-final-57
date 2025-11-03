# Dashboard Issues - Analysis & Fixes

## Issues Identified

### 1. **Progressive Personal Card - Progress Bar Not Moving**
**Root Cause**: No milestone data exists for users. The `user_milestones` table was empty because:
- Milestones are only initialized when `initialize_user_milestones()` is called
- This function was not being triggered automatically when users complete onboarding
- No trigger existed to mark milestones as completed when users achieve them

**Fix**: Created triggers and functions in migration `20251105000000_fix_dashboard_issues.sql`:
- `handle_onboarding_completion()`: Automatically initializes milestones when onboarding is completed
- `handle_session_completion()`: Marks first_session milestone as complete when a booking is marked as 'completed'
- `notify_booking_created()`: Marks booking_confirmed milestone when bookings are created

### 2. **Sessions Allocated Showing Zero**
**Root Cause**: No `company_employees` records existed for users. The database schema expects:
- Each user with a company_id should have a corresponding record in `company_employees`
- This table tracks `sessions_allocated` and `sessions_used` per user
- The frontend queries this table to display available sessions

**Fix**:
- Created `ensure_company_employee_record()` trigger that automatically creates company_employees records when a user is assigned to a company
- Added data migration to backfill company_employees for existing users
- Fixed `get_user_session_balance()` function to correctly return session counts

### 3. **Notifications Not Working for Booked Sessions**
**Root Cause**: The notification trigger exists but may not be firing correctly:
- `notify_booking_created()` function exists and should create notifications
- The trigger `booking_notification_trigger` is set up to fire AFTER INSERT on bookings
- However, the function needed improvements to handle edge cases

**Fix**:
- Enhanced `notify_booking_created()` to be more robust
- Added notifications for both users and providers
- Added milestone tracking integration
- Ensured proper error handling

### 4. **Specialist Call Request Not Creating Queries**
**Root Cause**: The call request system is working correctly but has a different flow than expected:
- When users request a call via the SpecialistContactCard, it:
  - Updates `chat_sessions` table with `status = 'phone_escalated'`
  - Creates entry in `specialist_call_logs` table
  - Does NOT create a separate "call request" record
- The specialist dashboard should query `chat_sessions` WHERE status = 'phone_escalated'
- OR query `specialist_call_logs` WHERE call_status = 'pending'

**Current Implementation** (in `src/components/booking/SpecialistContactCard.tsx`):
```typescript
const handleCallClick = async () => {
  if (user) {
    await supabase.from('chat_sessions').update({
      status: 'phone_escalated',
      phone_escalation_reason: context
    }).eq('id', sessionId);

    await supabase.from('specialist_call_logs').insert({
      chat_session_id: sessionId,
      user_id: user.id,
      call_status: 'pending'
    });
  }
  
  window.location.href = `tel:${phoneNumber}`;
};
```

**Verification Needed**: Check if the specialist dashboard is correctly querying these tables.

## Migration File Created

**File**: `supabase/migrations/20251105000000_fix_dashboard_issues.sql`

**To Apply**: Run `npx supabase db push` or apply via Supabase Dashboard

## Database State Before Fixes

```sql
-- No users had milestones
SELECT COUNT(*) FROM user_milestones; -- 0

-- No company_employees records
SELECT COUNT(*) FROM company_employees; -- 0

-- Only 2 test notifications existed
SELECT COUNT(*) FROM notifications; -- 2

-- User had no booking confirmation milestone
SELECT * FROM user_milestones WHERE milestone_type = 'booking_confirmed'; -- empty
```

## Expected Behavior After Fixes

1. **Progressive Card**:
   - When user completes onboarding → milestones initialized, onboarding marked complete (10% progress)
   - When user books a session → booking_confirmed milestone marked complete (+10%)
   - When user completes first session → first_session milestone marked complete (+25%)
   - Progress bar animates smoothly to show percentage

2. **Sessions Display**:
   - Shows correct number of allocated sessions (from company_employees.sessions_allocated)
   - Shows correct number of used sessions (from company_employees.sessions_used)
   - Shows remaining sessions calculated as (allocated - used)

3. **Notifications**:
   - User receives notification when booking is created
   - User receives notification when booking is completed
   - User receives notification when milestone is achieved
   - Provider receives notification when they have a new booking

4. **Call Requests**:
   - When user clicks "Request Call" in chat:
     - Chat session status updates to 'phone_escalated'
     - Entry created in specialist_call_logs
     - Specialist dashboard shows this in pending call requests

## Testing Steps

1. **Test Progressive Card**:
   ```sql
   -- Check if milestones exist for test user
   SELECT * FROM user_milestones WHERE user_id = '<user_id>';
   
   -- Check if onboarding milestone is marked complete
   SELECT * FROM user_milestones WHERE user_id = '<user_id>' AND milestone_type = 'onboarding';
   ```

2. **Test Sessions**:
   ```sql
   -- Check if company_employees record exists
   SELECT * FROM company_employees WHERE user_id = '<user_id>';
   
   -- Test the balance function
   SELECT * FROM get_user_session_balance('<user_id>');
   ```

3. **Test Notifications**:
   ```sql
   -- Create a test booking and check if notification was created
   SELECT * FROM notifications WHERE user_id = '<user_id>' ORDER BY created_at DESC LIMIT 5;
   ```

4. **Test Call Requests**:
   ```sql
   -- Check for escalated chats
   SELECT * FROM chat_sessions WHERE status = 'phone_escalated';
   
   -- Check for pending call logs
   SELECT * FROM specialist_call_logs WHERE call_status = 'pending';
   ```

## Additional Notes

- The migration includes data backfilling for existing users
- All triggers are set to SECURITY DEFINER to ensure they run with proper permissions
- Functions use `ON CONFLICT DO NOTHING` to prevent duplicate records
- Error handling is included to prevent cascade failures

## Next Steps

1. Apply the migration to the database
2. Test each feature manually
3. Verify the specialist dashboard is querying the correct tables for call requests
4. Monitor database logs for any trigger errors



