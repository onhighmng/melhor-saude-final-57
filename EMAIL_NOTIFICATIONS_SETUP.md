# 📧 Email Notifications System - Setup & Usage

## ✅ What's Been Set Up

Your email notification system is now configured with:

1. **Email Queue Table** (`email_queue`) - Stores all emails to be sent
2. **Database Triggers** - Automatically queue emails when:
   - A booking is created → Sends confirmation email
   - A session is completed → Sends feedback request email
3. **Edge Function** - `process-email-queue` processes and sends queued emails
4. **In-app Notifications** - Still working alongside email notifications

## 🔧 Configuration Required

### 1. Set RESEND_API_KEY

The system uses [Resend](https://resend.com) to send emails. You need to:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add a secret named `RESEND_API_KEY` with your Resend API key
4. If you don't have one, sign up at [resend.com](https://resend.com) and get your API key

### 2. Verify Email Domain (For Production)

In the Resend dashboard:
1. Add and verify your domain (e.g., `melhorsaude.com`)
2. Update the "from" address in `/supabase/functions/process-email-queue/index.ts`:
   ```typescript
   from: 'Melhor Saúde <noreply@yourdomain.com>'
   ```

## 🚀 How It Works

### Automatic Email Flow

```
User Action → Database Trigger → Queue Email → Process Queue → Send via Resend
     ↓
In-app Notification (immediate)
```

### When Emails Are Sent

1. **Booking Confirmation** - When a new booking is created
   - Contains: Date, time, provider name, booking details
   - Priority: High

2. **Session Completed** - When a booking status changes to 'completed'
   - Contains: Feedback request, link to dashboard
   - Priority: Normal

## 📬 Processing the Email Queue

The email queue is NOT processed automatically yet. You have 3 options:

### Option 1: Manual Processing (Immediate)

Call the edge function manually to process pending emails:

```bash
# Using curl
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-email-queue \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Or using Supabase CLI
supabase functions invoke process-email-queue
```

### Option 2: Set Up a Cron Job (Recommended)

Add to your Supabase Dashboard SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule email processing every 5 minutes
SELECT cron.schedule(
  'process-email-queue',
  '*/5 * * * *',  -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-email-queue',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

### Option 3: Frontend Trigger

Add a button in your admin dashboard to manually trigger processing:

```typescript
const processEmailQueue = async () => {
  const { data, error } = await supabase.functions.invoke('process-email-queue');
  if (error) console.error('Error:', error);
  else console.log('Processed:', data);
};
```

## 📊 Monitoring Email Queue

### View Pending Emails

```sql
-- See all pending emails
SELECT * FROM email_queue WHERE status = 'pending';

-- See failed emails
SELECT * FROM email_queue WHERE status = 'failed';

-- Count by status
SELECT status, COUNT(*) FROM email_queue GROUP BY status;
```

### Retry Failed Emails

Failed emails (with attempts < 3) will be automatically retried when you run the processor.

To manually reset a failed email:

```sql
UPDATE email_queue 
SET status = 'pending', attempts = 0, error_message = NULL
WHERE id = 'SOME_UUID';
```

## 🧪 Testing the System

### Test 1: Create a Test Booking

```typescript
// In your app or SQL editor
const { data, error } = await supabase
  .from('bookings')
  .insert({
    user_id: 'YOUR_USER_ID',
    prestador_id: 'SOME_PRESTADOR_ID',
    booking_date: '2025-12-01',
    start_time: '14:00',
    end_time: '15:00',
    status: 'confirmed',
    pillar: 'saude_mental'
  });
```

### Test 2: Check Email Was Queued

```sql
-- Check if email was queued
SELECT * FROM email_queue 
ORDER BY created_at DESC 
LIMIT 5;
```

### Test 3: Process the Queue

```bash
supabase functions invoke process-email-queue
```

### Test 4: Verify Email Was Sent

Check the `email_queue` table - status should be 'sent':

```sql
SELECT status, recipient_email, subject, sent_at, error_message
FROM email_queue 
ORDER BY created_at DESC 
LIMIT 5;
```

## 🐛 Troubleshooting

### Problem: Emails are queued but not sent

**Solutions:**
1. Check if `RESEND_API_KEY` is set in Edge Function secrets
2. Manually trigger `process-email-queue` function
3. Check edge function logs: `supabase functions logs process-email-queue`

### Problem: "RESEND_API_KEY not configured" error

**Solution:** Add the API key to your Supabase project secrets (see Configuration section above)

### Problem: Emails sent but not received

**Solutions:**
1. Check spam folder
2. Verify email address is correct in the queue
3. Check Resend dashboard for delivery status
4. Verify domain is properly configured in Resend

### Problem: Emails failing with "Invalid from address"

**Solution:** Update the `from` address in `process-email-queue/index.ts` to use your verified domain

## 📝 Customizing Email Templates

Edit the email HTML in the trigger functions:

- **Booking confirmation**: `supabase/migrations/LATEST_MIGRATION.sql` → `notify_booking_created_with_email()`
- **Session completion**: Same file → `notify_session_completion_with_email()`

After editing, run:
```bash
supabase db reset
```

Or apply just the migration.

## 🔮 Future Enhancements

Consider adding:

1. **More email types:**
   - Booking reminders (24h and 1h before)
   - Cancellation notifications
   - Welcome emails for new users
   - Monthly reports

2. **Email templates:**
   - Use a template engine like React Email
   - Store templates in database
   - Allow admins to customize templates

3. **Email preferences:**
   - Let users opt in/out of specific email types
   - Create a `notification_preferences` table

4. **Email analytics:**
   - Track open rates
   - Track click rates
   - Store in `email_analytics` table

## ✅ Summary

Your email notification system is now:
- ✅ **Installed** - Database tables, triggers, and edge function ready
- ⏳ **Pending** - Needs RESEND_API_KEY configuration
- ⏳ **Pending** - Needs cron job setup for automatic processing

Once configured, emails will be automatically queued and sent for booking confirmations and session completions!

