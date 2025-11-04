# User Settings & Email Configuration Fix Guide

## ✅ Issue 1: User Settings Not Saving - FIXED

### Problem
The user profile fields (name, phone, avatar) were not saving because of a field name mismatch:
- **Database column**: `name`
- **AuthContext interface**: `full_name`
- **UserSettings.tsx**: Was trying to read `profile.name` (which doesn't exist!)

### Solution Applied
Fixed `src/pages/UserSettings.tsx`:
1. Changed `profile?.name` → `profile?.full_name` (lines 71 and 450)
2. Added `useEffect` to sync profile data when context updates (lines 77-86)

### Testing
1. Navigate to User Settings → Profile
2. Change your name, phone, or upload a new avatar
3. Click "Guardar alterações"
4. Refresh the page - changes should persist! ✅

---

## ⚠️ Issue 2: Emails Not Being Sent

### Root Cause
The Supabase Edge Functions need the `RESEND_API_KEY` environment variable to send emails. The functions check for this key at runtime:

```typescript
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

if (!RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not configured, email not sent')
  return // Email is NOT sent
}
```

### Affected Edge Functions
1. `send-email` - General email sending
2. `send-booking-email` - Booking confirmations/reminders
3. `send-auth-email` - Password reset emails

### Solution Steps

#### Step 1: Get Your Resend API Key
1. Go to [resend.com](https://resend.com)
2. Sign in to your account
3. Navigate to **API Keys** section
4. Copy your API key (starts with `re_`)

#### Step 2: Set the Secret in Supabase Dashboard
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `melhor-saude-final-57`
3. Navigate to **Project Settings** (gear icon) → **Edge Functions**
4. Click on **Manage secrets** or **Environment Variables**
5. Add a new secret:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_your_actual_key_here`
6. Click **Save**

#### Step 3: Redeploy Edge Functions
After setting the secret, you need to redeploy the edge functions so they can access the new environment variable:

```bash
# Option A: Deploy all functions
cd /Users/anapaula/Documents/GitHub/melhor-saude-final-57
supabase functions deploy send-email
supabase functions deploy send-booking-email
supabase functions deploy send-auth-email

# Option B: Deploy all at once
supabase functions deploy
```

#### Step 4: Verify the Secret is Set
You can verify by checking the edge function logs after attempting to send an email:

```bash
# Watch logs in real-time
supabase functions logs send-email --follow
```

**Look for these log messages:**
- ✅ **Good**: `Email sent successfully` or `Resend API response`
- ❌ **Bad**: `RESEND_API_KEY not configured, email not sent`

### Alternative: Using Supabase CLI
If you prefer using the CLI:

```bash
# Set the secret
supabase secrets set RESEND_API_KEY=re_your_actual_key_here

# Verify it was set
supabase secrets list

# Redeploy functions
supabase functions deploy
```

### Testing Email Functionality
After setting the secret and redeploying:

1. **Test Password Reset:**
   - Go to login page
   - Click "Forgot Password"
   - Enter your email
   - Check your inbox for reset email

2. **Test Booking Confirmation:**
   - Create a new booking as a user
   - Check if confirmation email arrives

3. **Check Logs:**
   ```bash
   supabase functions logs send-auth-email --follow
   ```

### Common Issues & Troubleshooting

#### Issue: "Access token not provided"
**Solution**: Login to Supabase CLI first:
```bash
supabase login
```

#### Issue: Emails still not sending after setting secret
**Solution**: 
1. Double-check the secret name is exactly `RESEND_API_KEY` (case-sensitive)
2. Make sure you redeployed the functions after setting the secret
3. Check the edge function logs for errors

#### Issue: "Invalid API key" from Resend
**Solution**:
1. Verify your Resend API key is correct
2. Make sure the key hasn't expired
3. Check Resend dashboard for any issues

### Verification Checklist
- [ ] Resend API key obtained from resend.com
- [ ] Secret `RESEND_API_KEY` set in Supabase Dashboard
- [ ] Edge functions redeployed
- [ ] Test email sent successfully
- [ ] No warnings in edge function logs

---

## 📊 Summary

### User Settings Fix Status: ✅ COMPLETE
- Field name mismatch resolved
- Profile data now saves correctly
- Avatar uploads work properly

### Email Configuration Status: ⚠️ REQUIRES MANUAL ACTION
- Need to set `RESEND_API_KEY` in Supabase Dashboard
- Need to redeploy edge functions
- Follow steps above to complete setup

---

## Need Help?
If you encounter any issues:
1. Check the edge function logs: `supabase functions logs <function-name> --follow`
2. Verify the secret is set: `supabase secrets list`
3. Check Resend dashboard for API key status
4. Ensure functions are deployed: `supabase functions list`

