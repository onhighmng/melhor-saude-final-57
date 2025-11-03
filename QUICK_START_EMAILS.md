# 🚀 Email Notifications - Quick Start

## ✅ What's Done

Your email notification system is **installed and ready to configure**.

## 🎯 3-Step Setup (5 minutes)

### 1️⃣ Deploy Email Function

```bash
# Login to Supabase (if needed)
supabase login

# Deploy
./deploy-email-function.sh
```

### 2️⃣ Add Resend API Key

1. Get API key from [resend.com](https://resend.com/api-keys)
2. Go to [Supabase Dashboard](https://supabase.com/dashboard) → **Your Project**
3. Navigate to **Edge Functions** (left sidebar)
4. Click **Manage secrets**
5. Add: `RESEND_API_KEY` = `re_xxxxx...`

### 3️⃣ Test It

```bash
# Process any pending emails
supabase functions invoke process-email-queue
```

## 📧 What Emails Are Sent?

| Event | To | Email Contains |
|-------|-----|----------------|
| **New Booking** | User | Confirmation with date, time, provider |
| **Session Complete** | User | Feedback request + dashboard link |

## 🔄 Automatic Processing (Recommended)

Run this in Supabase SQL Editor to process emails every 5 minutes:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'process-email-queue',  
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ygxamuymjjpqhjoegweb.supabase.co/functions/v1/process-email-queue',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

**Replace `YOUR_SERVICE_ROLE_KEY`** with your key from Dashboard → Settings → API → service_role

## ⚠️ Important Notes

- Emails are **queued**, not sent immediately
- Run `process-email-queue` to send queued emails
- Set up cron job for automatic sending
- Check `email_queue` table to monitor status

## 🧪 Quick Test

1. Create a booking in your app
2. Run: `SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 1;`
3. Should see status='pending'
4. Run: `supabase functions invoke process-email-queue`
5. Check status changed to 'sent'

## 📚 More Info

- **Full guide:** `EMAIL_NOTIFICATIONS_SETUP.md`
- **Summary:** `EMAIL_SYSTEM_SUMMARY.md`
- **Troubleshooting:** See above docs

---

**Questions?** All triggers and templates are in:
`supabase/migrations/20251104000000_enable_email_notifications.sql`

