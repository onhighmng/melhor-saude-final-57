# 📧 Session Reminder Emails - Complete Guide

## ✅ What's Been Added

Your system now sends **FOUR reminder emails** for each booking:

### **When Session is Booked:**
1. ✅ **Booking Confirmation** (to USER) - Immediate
2. ✅ **Booking Confirmation** (to PROVIDER) - Immediate *(via existing trigger)*

### **Before Session Starts:**
3. ⏰ **1 Hour Reminder** (to USER & PROVIDER) - Scheduled
4. 🔔 **10 Minute Reminder** (to USER & PROVIDER) - Scheduled

---

## 📅 Email Timeline

```
Booking Created
    ↓ Immediately
✅ Confirmation emails sent to user and provider
    ↓
    ... time passes ...
    ↓ 1 hour before session
⏰ "Sessão em 1 Hora" sent to user and provider
    ↓
    ... 50 minutes pass ...
    ↓ 10 minutes before session
🔔 "URGENTE: Sessão em 10 Minutos!" sent to user and provider
    ↓
    Session starts!
```

---

## 🎨 Email Designs

### **1 Hour Reminder - User**
- **Subject:** ⏰ Lembrete: Sessão em 1 Hora - Melhor Saúde
- **Color:** Orange (#f59e0b)
- **Contains:**
  - Session details (date, time, provider)
  - Preparation tips
  - "Ver Sessão" button

### **1 Hour Reminder - Provider**
- **Subject:** ⏰ Sessão em 1 Hora
- **Color:** Purple (#8b5cf6)
- **Contains:**
  - Session details (time, client name)
  - "Ver Agenda" button

### **10 Minute Reminder - User**
- **Subject:** 🔔 URGENTE: Sessão em 10 Minutos!
- **Color:** Red (#ef4444)
- **Contains:**
  - Urgent styling
  - Session time
  - "Aceder Agora" button

### **10 Minute Reminder - Provider**
- **Subject:** 🔔 Sessão em 10 Minutos
- **Color:** Dark Purple (#7c3aed)
- **Contains:**
  - Client name
  - "Iniciar" button

---

## 🔧 How It Works

### **Database Flow:**

```sql
-- When booking is created:
1. INSERT INTO bookings (status = 'confirmed')
   ↓
2. Trigger: schedule_booking_reminders()
   ↓
3. Inserts 4 emails into email_queue:
   - 2 with scheduled_for = booking_time - 1 hour
   - 2 with scheduled_for = booking_time - 10 minutes
   ↓
4. process-email-queue function runs every 5 minutes
   ↓
5. Checks for emails where:
   - scheduled_for IS NULL (immediate)
   - OR scheduled_for <= NOW() (due now)
   ↓
6. Sends emails via Resend API
```

### **Scheduling Logic:**

```typescript
// Calculate reminder times
booking_datetime = booking_date + start_time
reminder_1h = booking_datetime - 1 hour
reminder_10min = booking_datetime - 10 minutes

// Store in database
INSERT INTO email_queue (..., scheduled_for = reminder_1h)
INSERT INTO email_queue (..., scheduled_for = reminder_10min)
```

---

## 🚀 Setup & Testing

### **1. Deploy Updated Function**

The process-email-queue function now handles scheduled emails:

```bash
cd /Users/anapaula/Documents/GitHub/melhor-saude-final-57
supabase functions deploy process-email-queue --no-verify-jwt
```

### **2. Set Up Cron Job**

Run this SQL to process emails every 5 minutes:

```sql
SELECT cron.schedule(
  'process-email-queue',
  '*/5 * * * *',  -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://ygxamuymjjpqhjoegweb.supabase.co/functions/v1/process-email-queue',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

Replace `YOUR_SERVICE_ROLE_KEY` with your actual service role key.

---

## 🧪 Testing Reminders

### **Test 1: Create a Booking**

```sql
-- Create a booking 2 hours from now
INSERT INTO bookings (
  user_id,
  prestador_id,
  booking_date,
  start_time,
  end_time,
  status,
  pillar
)
VALUES (
  'USER_ID',
  'PRESTADOR_ID',
  CURRENT_DATE,
  (CURRENT_TIME + INTERVAL '2 hours')::TIME,
  (CURRENT_TIME + INTERVAL '3 hours')::TIME,
  'confirmed',
  'saude_mental'
);
```

### **Test 2: Check Scheduled Emails**

```sql
-- View all scheduled reminder emails
SELECT 
  recipient_email,
  email_type,
  subject,
  scheduled_for,
  status,
  metadata->>'recipient_type' as recipient_type
FROM email_queue
WHERE email_type IN ('session_reminder_1h', 'session_reminder_10min')
ORDER BY scheduled_for;
```

Expected result: 4 emails scheduled
- 2 for 1 hour before (user + provider)
- 2 for 10 minutes before (user + provider)

### **Test 3: Test Immediate Sending** (For Testing Only)

To test without waiting:

```sql
-- Move scheduled_for to past (makes them send immediately)
UPDATE email_queue
SET scheduled_for = NOW() - INTERVAL '1 minute'
WHERE email_type IN ('session_reminder_1h', 'session_reminder_10min')
  AND status = 'pending';

-- Then run processor
-- supabase functions invoke process-email-queue
```

### **Test 4: Verify Emails Sent**

```sql
SELECT 
  email_type,
  recipient_email,
  status,
  sent_at,
  scheduled_for as was_scheduled_for
FROM email_queue
WHERE email_type IN ('session_reminder_1h', 'session_reminder_10min')
ORDER BY sent_at DESC;
```

Status should be 'sent' and sent_at should have a timestamp.

---

## 📊 Monitor Reminder System

### **Check Upcoming Reminders**

```sql
-- See next reminders to be sent
SELECT 
  scheduled_for,
  email_type,
  recipient_email,
  metadata->>'booking_id' as booking_id,
  metadata->>'recipient_type' as recipient_type
FROM email_queue
WHERE scheduled_for > NOW()
  AND status = 'pending'
ORDER BY scheduled_for
LIMIT 20;
```

### **Check Sent Reminders**

```sql
-- See recently sent reminders
SELECT 
  sent_at,
  email_type,
  recipient_email,
  metadata->>'reminder_type' as reminder_type
FROM email_queue
WHERE email_type IN ('session_reminder_1h', 'session_reminder_10min')
  AND status = 'sent'
ORDER BY sent_at DESC
LIMIT 20;
```

### **Check Failed Reminders**

```sql
-- See failed reminder emails
SELECT 
  email_type,
  recipient_email,
  error_message,
  attempts,
  scheduled_for
FROM email_queue
WHERE email_type IN ('session_reminder_1h', 'session_reminder_10min')
  AND status = 'failed'
ORDER BY created_at DESC;
```

---

## 🐛 Troubleshooting

### **Reminders Not Being Sent**

**Problem:** Scheduled emails stay in 'pending' status

**Solutions:**
1. Check cron job is running:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'process-email-queue';
   ```

2. Manually trigger processor:
   ```bash
   supabase functions invoke process-email-queue
   ```

3. Check edge function logs:
   ```bash
   supabase functions logs process-email-queue --tail
   ```

### **Reminders Sent at Wrong Time**

**Problem:** Emails sent too early/late

**Check:**
```sql
-- Verify scheduled times are correct
SELECT 
  booking_date,
  start_time,
  (booking_date || ' ' || start_time)::TIMESTAMPTZ as booking_datetime,
  (booking_date || ' ' || start_time)::TIMESTAMPTZ - INTERVAL '1 hour' as should_send_1h,
  scheduled_for as actual_scheduled,
  scheduled_for - ((booking_date || ' ' || start_time)::TIMESTAMPTZ) as time_diff
FROM bookings b
JOIN email_queue e ON e.metadata->>'booking_id' = b.id::text
WHERE e.email_type = 'session_reminder_1h'
LIMIT 5;
```

### **Duplicate Reminders**

**Problem:** Users receive multiple reminder emails

**Solution:**
```sql
-- Check for duplicates
SELECT 
  recipient_email,
  email_type,
  metadata->>'booking_id',
  COUNT(*)
FROM email_queue
WHERE email_type IN ('session_reminder_1h', 'session_reminder_10min')
GROUP BY recipient_email, email_type, metadata->>'booking_id'
HAVING COUNT(*) > 1;

-- Delete duplicates (keep oldest)
DELETE FROM email_queue
WHERE id NOT IN (
  SELECT MIN(id)
  FROM email_queue
  WHERE email_type IN ('session_reminder_1h', 'session_reminder_10min')
  GROUP BY recipient_email, email_type, metadata->>'booking_id'
);
```

---

## ✅ Complete Email System Summary

Your platform now sends **5 types of emails**:

| Email Type | When Sent | Recipients | Color Theme |
|------------|-----------|------------|-------------|
| **Welcome** | User completes onboarding | User | Green |
| **Booking Confirmation** | Booking created | User + Provider | Blue/Purple |
| **1 Hour Reminder** | 1h before session | User + Provider | Orange/Purple |
| **10 Min Reminder** | 10min before session | User + Provider | Red/Dark Purple |
| **Session Completed** | Session marked complete | User | Blue |

---

## 🎯 Next Steps

1. ✅ Deploy updated `process-email-queue` function
2. ✅ Set up cron job for automatic processing
3. ✅ Create test booking to verify reminders
4. ✅ Monitor `email_queue` table
5. ✅ Check Resend dashboard for delivery stats

---

**Questions?** Check the logs or the email_queue table for debugging!

