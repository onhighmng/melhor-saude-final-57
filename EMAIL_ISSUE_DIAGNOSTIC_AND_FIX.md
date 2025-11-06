# 🔧 Email System Diagnostic & Fix Guide

## 🔍 **PROBLEM IDENTIFIED**

Your emails are **NOT being sent** because the **RESEND_API_KEY is missing** from your Supabase Edge Functions secrets.

### Current Status:
- ✅ **Edge Functions Deployed**: All email functions are active
- ✅ **Database Infrastructure**: Email queue tables exist
- ❌ **API Key Missing**: RESEND_API_KEY is not configured
- ❌ **Emails Not Sending**: Functions return success but no actual emails are sent

## 📊 Technical Details

### What's Happening:
1. Your code calls email edge functions (e.g., `send-email`, `send-booking-email`, `send-auth-email`)
2. Edge functions receive the request successfully
3. Functions check for `RESEND_API_KEY` in environment
4. **KEY IS MISSING** → Functions log a warning and return "success" without sending
5. Your app thinks email was sent, but nothing actually happened

### Evidence from Code Review:

```typescript
// From: supabase/functions/send-email/index.ts (lines 92-99)
if (!RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not configured, email not sent')
  return successResponse({
    success: true,
    message: 'Email would be sent (RESEND_API_KEY not configured)',
    timestamp: new Date().toISOString()
  })
}
```

```typescript
// From: supabase/functions/send-booking-email/index.ts (lines 86-95)
if (!RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not configured. Email would have been sent to:', to);
  console.warn('Subject:', subject);
  return successResponse({
    success: true,
    message: 'Email sent (development mode - no actual email sent)',
    id: 'dev-mode-' + Date.now()
  });
}
```

```typescript
// From: supabase/functions/send-auth-email/index.ts (lines 30-32)
if (!RESEND_API_KEY) {
  console.warn('⚠️ Missing RESEND_API_KEY env var - emails will not be sent');
}
```

## 🎯 **THE FIX** (3 Steps - 5 Minutes)

### Step 1: Get Your Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign in (or create account if you don't have one)
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Give it a name (e.g., "Melhor Saude Production")
6. Copy the API key (starts with `re_`)
   - ⚠️ **IMPORTANT**: Save it somewhere safe - you won't see it again!

### Step 2: Add API Key to Supabase Secrets

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **melhor-saude-final-57**
3. In the left sidebar, click **Edge Functions**
4. Click the **Manage secrets** button (top right)
5. Click **Add new secret**
6. Enter:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_your_actual_api_key_here`
7. Click **Save**

**Option B: Via Supabase CLI**

```bash
# Set the secret
npx supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here

# Verify it was set
npx supabase secrets list
```

### Step 3: Verify & Test

#### Quick Verification:
```bash
# Check secrets are set (should show RESEND_API_KEY)
npx supabase secrets list
```

#### Test Email Sending:

**Method 1: Through Your App**
1. Try triggering an email action (e.g., add employee, create booking)
2. Check your email inbox

**Method 2: Direct Function Call**
```bash
# Test send-email function directly
curl -X POST \
  https://ygxamuymjjpqhjoegweb.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-test-email@example.com",
    "subject": "Test Email from Melhor Saúde",
    "html": "<h1>Hello!</h1><p>This is a test email.</p>",
    "type": "test"
  }'
```

**Method 3: Check Edge Function Logs**
```bash
# View recent logs for send-email function
npx supabase functions logs send-email --tail
```

Look for:
- ✅ **Before fix**: `RESEND_API_KEY not configured, email not sent`
- ✅ **After fix**: `Email sent successfully` with message ID

## 🔐 Additional Secret Needed (for Password Reset Emails)

The `send-auth-email` function also needs a webhook secret for security:

```bash
# Generate a secure random secret
npx supabase secrets set SEND_AUTH_EMAIL_HOOK_SECRET="$(openssl rand -base64 32)"

# Or set it in dashboard:
# Name: SEND_AUTH_EMAIL_HOOK_SECRET
# Value: any-long-random-string-here
```

**Then configure Auth Hook in Supabase:**

1. Go to **Authentication** → **Hooks** in Supabase Dashboard
2. Enable **Send Email** hook
3. Set hook URL: `https://ygxamuymjjpqhjoegweb.supabase.co/functions/v1/send-auth-email`
4. Set hook secret to the same value as `SEND_AUTH_EMAIL_HOOK_SECRET`

## 📋 Complete Secrets Checklist

Your Supabase project needs these secrets configured:

- [ ] `RESEND_API_KEY` - Your Resend API key (from resend.com)
- [ ] `SEND_AUTH_EMAIL_HOOK_SECRET` - Random secure string for auth webhook
- [ ] (Optional) Any other custom secrets your functions use

## 🧪 Testing Each Email Type

### 1. Employee Invite Emails
**Trigger**: Add employee via Admin → Companies → Add Employee
**Expected**: Welcome email with access code
**Function**: `send-email`

### 2. Booking Confirmation Emails
**Trigger**: Create a booking
**Expected**: Confirmation email with booking details
**Function**: `send-booking-email`

### 3. Password Reset Emails
**Trigger**: Use "Forgot Password" on login page
**Expected**: Password reset email with link
**Function**: `send-auth-email`

## 🔍 Troubleshooting

### Issue: "Secrets not showing up in function"

**Solution**: Redeploy the functions after setting secrets
```bash
# Redeploy all email functions
npx supabase functions deploy send-email
npx supabase functions deploy send-booking-email
npx supabase functions deploy send-auth-email
```

### Issue: "Emails still not arriving"

**Checklist**:
1. ✅ Check spam/junk folder
2. ✅ Verify API key is correct (try on resend.com dashboard)
3. ✅ Check Resend domain verification (if using custom domain)
4. ✅ View logs: `npx supabase functions logs send-email`
5. ✅ Check email queue: `SELECT * FROM email_queue ORDER BY created_at DESC;`

### Issue: "Invalid from address" error

**Solution**: Verify your sending domain in Resend:
- Default: `onboarding@resend.dev` (works for testing)
- Production: Add and verify your custom domain in Resend dashboard
- Update `from` address in edge function code to match verified domain

### Issue: Getting 403/401 errors

**Solution**: Check that edge functions have proper authentication:
- `send-email`: Requires authenticated user (JWT)
- `send-booking-email`: Requires authenticated user (JWT)
- `send-auth-email`: No JWT required (set `verify_jwt: false`)

## 📊 Monitoring Email Delivery

### Check Email Queue Status:
```sql
-- View all pending emails
SELECT * FROM email_queue 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- View failed emails
SELECT * FROM email_queue 
WHERE status = 'failed' 
ORDER BY created_at DESC;

-- Email statistics
SELECT 
  email_type,
  status,
  COUNT(*) as count
FROM email_queue
GROUP BY email_type, status;
```

### Check Resend Dashboard:
1. Go to [resend.com/emails](https://resend.com/emails)
2. View delivery status, opens, clicks
3. Check for bounces or spam complaints

## 🎉 Success Indicators

After fixing, you should see:

✅ Secrets appear in `npx supabase secrets list`
✅ Function logs show: "Email sent successfully" with message IDs
✅ Emails arrive in recipient inbox (check spam folder first time)
✅ Resend dashboard shows sent emails
✅ `email_queue` table shows status='sent' (if using queue)

## 🚀 Next Steps After Fix

1. **Test all email flows** - Employee invites, bookings, password resets
2. **Set up domain verification** in Resend (for better deliverability)
3. **Configure email templates** (customize branding, content)
4. **Monitor delivery rates** in Resend dashboard
5. **Set up email preferences** (allow users to opt-out of certain emails)

## 📞 Need More Help?

If emails still don't work after following this guide:

1. Check edge function logs: `npx supabase functions logs send-email --tail`
2. Check Resend logs in their dashboard
3. Verify all secrets are set: `npx supabase secrets list`
4. Test with a simple curl command (see above)
5. Check this file's troubleshooting section

---

**Project Info:**
- **Project URL**: https://ygxamuymjjpqhjoegweb.supabase.co
- **Email Functions**: send-email, send-booking-email, send-auth-email
- **Email Provider**: Resend (resend.com)

**Files to Reference:**
- Edge function code: `supabase/functions/send-email/index.ts`
- Email templates: `supabase/functions/send-auth-email/_templates/`
- Setup guides: `EMAIL_SYSTEM_SUMMARY.md`, `QUICK_START_EMAILS.md`

