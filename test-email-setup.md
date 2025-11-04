# 🧪 Test Your Email Setup

## Quick Test Commands

### 1. Check if emails are being queued

```sql
-- Run this in Supabase SQL Editor
SELECT 
  id,
  recipient_email,
  email_type,
  status,
  created_at,
  error_message
FROM email_queue
ORDER BY created_at DESC
LIMIT 10;
```

### 2. Manually process email queue

```bash
# From terminal
supabase functions invoke process-email-queue
```

### 3. Send a test email

Go to your app and:
1. **Admin → Company Detail** page
2. Add an employee with YOUR email
3. Click "Gerar Códigos"
4. Click "Enviar Emails"
5. Check Resend dashboard

### 4. Check Resend Dashboard

- Go to https://resend.com/emails
- You should see the sent emails there!

## ✅ Success Checklist

- [ ] `RESEND_API_KEY` added to Supabase Edge Functions secrets
- [ ] Edge functions deployed (`process-email-queue`, `send-email`)
- [ ] Test email sent from Admin Company Detail page
- [ ] Email appears in Resend dashboard
- [ ] Email appears in your inbox

## 🔧 If Emails Still Don't Send

### Check 1: Verify API Key

```bash
# Check if RESEND_API_KEY is set
supabase functions list
# Then look at function secrets in the dashboard
```

### Check 2: Check Function Logs

```bash
# View logs for errors
supabase functions logs send-email --tail
supabase functions logs process-email-queue --tail
```

### Check 3: Verify Email Queue

```sql
-- Check for failed emails
SELECT * FROM email_queue WHERE status = 'failed';

-- Reset failed emails to retry
UPDATE email_queue SET status = 'pending', attempts = 0 WHERE status = 'failed';
```

### Check 4: Test with Console

```javascript
// In browser console on Admin Company Detail page
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'your-email@example.com',
    subject: 'Test Email',
    html: '<h1>Hello!</h1><p>This is a test email.</p>',
    type: 'test'
  }
});
console.log('Result:', { data, error });
```

## 🎯 Expected Behavior

1. **When you send employee codes:**
   - Email immediately queued in `email_queue` table
   - Status: 'pending'
   
2. **When `process-email-queue` runs:**
   - Picks up pending emails
   - Sends via Resend API
   - Updates status to 'sent'
   - Or 'failed' with error message

3. **In Resend Dashboard:**
   - Email appears with status
   - Shows delivery status
   - Shows open/click rates

## 📊 Monitor Email Activity

```sql
-- Email statistics
SELECT 
  email_type,
  status,
  COUNT(*) as count
FROM email_queue
GROUP BY email_type, status
ORDER BY email_type, status;

-- Recent emails
SELECT 
  recipient_email,
  email_type,
  status,
  created_at,
  sent_at,
  error_message
FROM email_queue
ORDER BY created_at DESC
LIMIT 20;
```

## 🚀 Set Up Automatic Processing (Recommended)

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Process emails every 5 minutes
SELECT cron.schedule(
  'process-email-queue',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-email-queue',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- Check cron jobs
SELECT * FROM cron.job;

-- View cron job history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

Replace:
- `YOUR_PROJECT_REF` - From Supabase Dashboard URL
- `YOUR_SERVICE_ROLE_KEY` - From Dashboard → Settings → API → service_role key

---

**Need more help?** Check:
- `EMAIL_SYSTEM_SUMMARY.md` - Overview
- `EMAIL_NOTIFICATIONS_SETUP.md` - Detailed setup
- `QUICK_START_EMAILS.md` - Quick start guide

