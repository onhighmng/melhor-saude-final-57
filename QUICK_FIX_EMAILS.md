# 🚨 URGENT: Fix Email Sending - 2 Minutes

## 🔴 **THE PROBLEM**
**19 emails are stuck in queue** and not being sent because `RESEND_API_KEY` is missing.

## ✅ **THE SOLUTION**

### Option 1: Via Supabase Dashboard (Easiest - 2 minutes)

1. **Go to**: https://supabase.com/dashboard/project/ygxamuymjjpqhjoegweb/settings/functions
2. **Click**: "Manage secrets" (top right)
3. **Add secret**:
   - Name: `RESEND_API_KEY`
   - Value: Get from https://resend.com/api-keys
4. **Click**: Save

### Option 2: Via Command Line

```bash
# Set the Resend API key
npx supabase secrets set RESEND_API_KEY="re_your_key_here"

# Verify it worked
npx supabase secrets list
```

## 📧 Send Pending Emails

After adding the API key, process the 19 queued emails:

```bash
# Option A: Via Supabase Function
npx supabase functions invoke process-email-queue

# Option B: Via curl
curl -X POST \
  https://ygxamuymjjpqhjoegweb.supabase.co/functions/v1/process-email-queue \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

Your service role key is in `.env` file (starts with `sbp_`).

## 🧪 Test It Works

Try adding an employee or creating a booking - email should arrive within 30 seconds.

## ❓ Need Your Resend API Key?

1. Go to https://resend.com
2. Sign in (or create free account)
3. Navigate to **API Keys**
4. Click **Create API Key**
5. Copy the key (starts with `re_`)

---

**For detailed troubleshooting**: See `EMAIL_ISSUE_DIAGNOSTIC_AND_FIX.md`

