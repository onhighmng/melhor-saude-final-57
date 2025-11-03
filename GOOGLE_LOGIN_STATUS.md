# 🔐 Google Login Status & Setup Guide

## ✅ Current Status

### **Where Google Login Works NOW:**

| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| **LoginDialog** | `src/components/LoginDialog.tsx` | ✅ **WORKING** | Fully implemented OAuth |
| UnifiedAuthCard | `src/components/UnifiedAuthCard.tsx` | ❌ Placeholder | Shows "em desenvolvimento" toast |
| EnhancedUnifiedAuthCard | `src/components/EnhancedUnifiedAuthCard.tsx` | ❌ Placeholder | Shows "em desenvolvimento" toast |
| RegisterEmployee | `src/pages/RegisterEmployee.tsx` | ❌ Placeholder | Shows "em breve" toast |
| RegisterCompany | `src/pages/RegisterCompany.tsx` | ❌ Placeholder | Shows "em breve" toast |

### **Summary:**
- ✅ **LoginDialog has full Google OAuth implementation**
- ❌ **Other components only have placeholder buttons**
- 🔧 **Google OAuth needs to be enabled in Supabase Dashboard**

---

## 🚀 How to Enable Google Login

### **Step 1: Set Up Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** (or People API)
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth 2.0 Client ID**
6. Select **Web application**
7. Add **Authorized redirect URIs**:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   Replace `YOUR_PROJECT_REF` with your actual Supabase project reference
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

### **Step 2: Configure Supabase**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Enable the toggle
6. Paste your **Google Client ID**
7. Paste your **Google Client Secret**
8. Click **Save**

### **Step 3: Configure Site URL**

Still in Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://melhorsaude.com`
3. Add **Redirect URLs**:
   ```
   https://melhorsaude.com/auth/callback
   http://localhost:5173/auth/callback (for development)
   ```
4. Click **Save**

### **Step 4: Test Google Login**

1. Go to your app's login page
2. Click "Entrar com Google" button (in LoginDialog)
3. Should redirect to Google authentication
4. After authenticating, should redirect back to your app
5. User should be logged in automatically

---

## 🔧 How Google Login Currently Works

### **Flow Diagram:**

```
User clicks "Entrar com Google"
        ↓
Supabase redirects to Google OAuth
        ↓
User authenticates with Google
        ↓
Google redirects back to: /auth/callback
        ↓
AuthCallback page processes the OAuth response
        ↓
Supabase creates/updates auth.users record
        ↓
handle_new_user trigger creates profiles record
        ↓
User is logged in and redirected to dashboard
```

### **Code Implementation (LoginDialog.tsx):**

```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: getAuthCallbackUrl(), // Returns: https://melhorsaude.com/auth/callback
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    }
  }
});
```

---

## 🐛 Troubleshooting

### **Problem: "Invalid OAuth callback URL"**

**Solution:**
- Check that redirect URL is added in Google Cloud Console
- Format should be: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- Also add to Supabase Dashboard → Authentication → URL Configuration

### **Problem: User logs in but no profile is created**

**Solution:**
Check that `handle_new_user` trigger exists:

```sql
-- Check if trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- If missing, create it (check your migrations)
```

### **Problem: "Provider not enabled" error**

**Solution:**
- Go to Supabase Dashboard → Authentication → Providers
- Make sure Google toggle is **ON**
- Verify Client ID and Secret are saved

### **Problem: Redirect after login doesn't work**

**Solution:**
- Check `AuthCallback.tsx` component exists at `/auth/callback` route
- Verify it handles the OAuth response properly
- Check browser console for errors

---

## 🎯 Enable Google Login in All Components (Optional)

If you want Google login to work in **UnifiedAuthCard**, **EnhancedUnifiedAuthCard**, etc., you need to replace the placeholder toast with actual OAuth code.

### **Template for All Components:**

Replace this:
```typescript
onClick={() => {
  toast({
    title: 'OAuth',
    description: 'Login com Google em desenvolvimento',
  });
}}
```

With this:
```typescript
onClick={async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  } catch (error: any) {
    toast({
      title: 'Erro ao iniciar sessão com Google',
      description: error.message,
      variant: 'destructive'
    });
  }
}}
```

### **Files to Update:**

1. `src/components/UnifiedAuthCard.tsx` (2 places - login and register tabs)
2. `src/components/EnhancedUnifiedAuthCard.tsx` (1 place)
3. `src/pages/RegisterEmployee.tsx` (handleGoogleLogin function)
4. `src/pages/RegisterCompany.tsx` (1 place)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Google OAuth is enabled in Supabase Dashboard
- [ ] Client ID and Secret are configured
- [ ] Redirect URLs are added in Google Cloud Console
- [ ] Redirect URLs are added in Supabase URL Configuration
- [ ] Site URL is set correctly in Supabase
- [ ] LoginDialog component works when clicking "Entrar com Google"
- [ ] User is redirected to Google auth page
- [ ] After Google auth, user is redirected back to app
- [ ] User profile is created automatically
- [ ] User is logged in after redirect

---

## 🎉 Summary

**Current Status:**
- ✅ Google OAuth code is implemented in `LoginDialog.tsx`
- ⚠️ Needs Google OAuth enabled in Supabase Dashboard
- ⚠️ Needs Google Cloud Console setup
- ⚠️ Other auth components have placeholder buttons

**To Make It Work:**
1. Set up Google Cloud Console OAuth credentials
2. Enable Google provider in Supabase Dashboard
3. Configure redirect URLs
4. Test with LoginDialog component

**Result:**
Once configured, users will be able to:
- ✅ Log in with existing Google accounts
- ✅ Create new accounts via Google (automatic profile creation)
- ✅ Get redirected to dashboard after authentication
- ✅ Have profile automatically created via `handle_new_user` trigger

---

**Need Help?** Check Supabase logs if authentication fails:
```bash
supabase functions logs --tail
```

