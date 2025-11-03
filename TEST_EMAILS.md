# 📧 Testing Your Email System

## ✅ Pre-Check

Before testing, confirm:
- [ ] Resend API key is set in Supabase (Edge Functions → Secrets → `RESEND_API_KEY`)
- [ ] Edge function is deployed: `./deploy-email-function.sh`

## 🧪 Test Each Email Type

### 1. Test Welcome Email

**Trigger:** User completes onboarding

**Option A - Using SQL:**
```sql
-- Find a user who hasn't completed onboarding
SELECT id, email, has_completed_onboarding 
FROM profiles 
WHERE has_completed_onboarding = false 
LIMIT 1;

-- Complete their onboarding (replace USER_ID)
UPDATE profiles 
SET has_completed_onboarding = true 
WHERE id = 'USER_ID';

-- Check email was queued
SELECT * FROM email_queue 
WHERE email_type = 'welcome' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Option B - In Your App:**
1. Create a new test account
2. Complete the onboarding flow
3. Email should be automatically queued

---

### 2. Test Booking Confirmation Email

**Trigger:** New booking is created

**Using SQL:**
```sql
-- Create a test booking (adjust values as needed)
INSERT INTO bookings (
  user_id,
  prestador_id,
  booking_date,
  start_time,
  end_time,
  status,
  pillar,
  company_id
)
VALUES (
  'YOUR_USER_ID',           -- Replace with real user ID
  'PRESTADOR_ID',           -- Replace with real prestador ID
  CURRENT_DATE + INTERVAL '7 days',  -- 7 days from now
  '14:00:00',
  '15:00:00',
  'confirmed',
  'saude_mental',
  NULL  -- Or your company ID if applicable
);

-- Check email was queued
SELECT * FROM email_queue 
WHERE email_type = 'booking_confirmation' 
ORDER BY created_at DESC 
LIMIT 1;
```

**In Your App:**
1. Log in as a user
2. Go to booking page
3. Select a provider and create a booking
4. Email should be automatically queued

---

### 3. Test Session Completed Email

**Trigger:** Booking status changes to 'completed'

**Using SQL:**
```sql
-- Find a confirmed booking
SELECT id, user_id, status, booking_date 
FROM bookings 
WHERE status = 'confirmed' 
LIMIT 1;

-- Mark it as completed (replace BOOKING_ID)
UPDATE bookings 
SET status = 'completed' 
WHERE id = 'BOOKING_ID';

-- Check email was queued
SELECT * FROM email_queue 
WHERE email_type = 'session_completed' 
ORDER BY created_at DESC 
LIMIT 1;
```

**In Your App:**
1. Log in as admin or provider
2. Go to session management
3. Mark a booking as "Completed"
4. Email should be automatically queued

---

## 🚀 Process the Email Queue

After triggering any email, you need to process the queue to actually send them:

```bash
# Process all pending emails
supabase functions invoke process-email-queue
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Processed 1 emails",
  "processed": 1,
  "succeeded": 1,
  "failed": 0
}
```

---

## 🔍 Verify Emails Were Sent

### Check Database Status

```sql
-- View all recent emails
SELECT 
  id,
  recipient_email,
  email_type,
  subject,
  status,
  attempts,
  created_at,
  sent_at,
  error_message
FROM email_queue
ORDER BY created_at DESC
LIMIT 10;

-- Count by type and status
SELECT 
  email_type,
  status,
  COUNT(*) as count
FROM email_queue
GROUP BY email_type, status
ORDER BY email_type, status;
```

**What to look for:**
- ✅ `status = 'sent'` means email was successfully delivered to Resend
- ✅ `sent_at` has a timestamp
- ❌ `status = 'failed'` with `error_message` indicates a problem

---

## 📧 Check Your Inbox

1. Check the email address associated with the test user
2. Look in **Inbox** and **Spam** folders
3. Emails come from: `Melhor Saúde <onboarding@resend.dev>`

---

## 🐛 Troubleshooting

### Email Queued But Not Sent

**Symptom:** `status = 'pending'` after running process function

**Solutions:**
```sql
-- Check if there's an error in the attempts
SELECT * FROM email_queue WHERE status = 'pending' OR status = 'failed';

-- Manually retry
UPDATE email_queue 
SET status = 'pending', attempts = 0 
WHERE id = 'EMAIL_ID';
```

Then run: `supabase functions invoke process-email-queue`

---

### "RESEND_API_KEY not configured"

**Check:**
1. Go to Supabase Dashboard → Edge Functions → Manage Secrets
2. Confirm `RESEND_API_KEY` is listed
3. Value should start with `re_`
4. Redeploy function: `./deploy-email-function.sh`

---

### Email Sent But Not Received

**Check:**
1. **Spam folder** - Resend dev emails often go to spam
2. **Email address** - Verify it's correct in `email_queue.recipient_email`
3. **Resend Dashboard** - Check [resend.com/emails](https://resend.com/emails) for delivery status
4. **Domain verification** - If using custom domain, ensure it's verified in Resend

---

### Wrong Email Template / Broken Links

**Fix:**
1. Update the migration: `supabase/migrations/20251104000001_add_welcome_and_improve_emails.sql`
2. Apply changes: `supabase db reset` (⚠️ resets entire database)
3. Or create a new migration with just the function changes

---

## 📊 Complete Test Checklist

Run through all three email types:

### Welcome Email
- [ ] User completes onboarding
- [ ] Email queued in `email_queue`
- [ ] Process queue with edge function
- [ ] Email status changes to 'sent'
- [ ] Email received in inbox
- [ ] Dashboard link works correctly
- [ ] Email looks good on mobile and desktop

### Booking Confirmation
- [ ] New booking created
- [ ] Email queued with correct booking details
- [ ] Process queue
- [ ] Email status = 'sent'
- [ ] Email received with correct date/time/provider
- [ ] Email looks professional

### Session Completed
- [ ] Booking marked as completed
- [ ] Email queued with booking ID
- [ ] Process queue
- [ ] Email status = 'sent'
- [ ] Email received
- [ ] Rating link works (`/dashboard?tab=past&highlight=BOOKING_ID`)
- [ ] Instructions are clear
- [ ] Can successfully rate the session from email link

---

## 🎯 Quick Test Script

Run this to test all three at once:

```sql
-- 1. Complete onboarding for a test user
UPDATE profiles SET has_completed_onboarding = true WHERE id = 'TEST_USER_ID';

-- 2. Create a test booking
INSERT INTO bookings (user_id, prestador_id, booking_date, start_time, end_time, status, pillar)
VALUES ('TEST_USER_ID', 'PRESTADOR_ID', CURRENT_DATE + 7, '14:00', '15:00', 'confirmed', 'saude_mental')
RETURNING id;

-- 3. Mark booking as completed (use ID from above)
UPDATE bookings SET status = 'completed' WHERE id = 'BOOKING_ID_FROM_STEP_2';

-- 4. Check all queued emails
SELECT email_type, status, recipient_email FROM email_queue ORDER BY created_at DESC LIMIT 3;
```

Then run:
```bash
supabase functions invoke process-email-queue
```

---

## ✅ Success Criteria

All tests pass when:
- ✅ All 3 email types are queued correctly
- ✅ All emails process without errors
- ✅ All emails arrive in inbox (check spam too)
- ✅ All links work correctly
- ✅ Email formatting looks professional on mobile and desktop
- ✅ Rating process works end-to-end from email

---

**Need help?** Check the logs:
```bash
supabase functions logs process-email-queue --tail
```

