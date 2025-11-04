# Quick Email Testing Guide 🧪

## ✅ Emails Should Now Work!

The security restriction that was blocking emails has been fixed.

## 🚀 Quick Test Steps

### Test 1: Admin Sending Invitation Email (5 minutes)

1. **Login as Admin**
   - Go to: `/admin/companies`
   - Select a company

2. **Send Invitation Email**
   - Click "Gerar Códigos" if codes not generated
   - Click "Enviar Emails"
   - Watch the progress bar

3. **Check Results**
   - ✅ Status should show "Enviado" (green badge)
   - ❌ If error: Status shows "Erro no Envio" (red badge)

4. **Open Browser Console** (F12)
   - Look for: `[EMAIL invite]` log messages
   - Should show:
     ```
     {
       to: "employee@example.com",
       subject: "Seu Código de Acesso...",
       userId: "...",
       userRole: "admin",
       isPrivilegedSender: true,
       timestamp: "..."
     }
     ```
   - ✅ `isPrivilegedSender: true` means it worked!

5. **Check Employee's Email**
   - Look in inbox (and spam folder!)
   - Should receive: "Bem-vindo à Plataforma OnHigh Management"
   - Contains access code

### Test 2: Prestador Sending Meeting Link (3 minutes)

1. **Login as Prestador**
   - Go to: `/prestador/sessions`

2. **Add Meeting Link**
   - Find a virtual session
   - Click "Adicionar Link"
   - Enter a meeting URL
   - Click "Guardar"

3. **Check Results**
   - ✅ Toast should show: "Link atualizado"
   - Open browser console
   - Should see: Email sending to user

4. **Check User's Email**
   - User should receive: "Link da Sua Sessão Disponível"
   - Nice formatted email with meeting link

## 🐛 If Emails Still Don't Work

### Check 1: RESEND_API_KEY

```bash
# In Supabase Dashboard:
# Settings → Edge Functions → Secrets
# Verify RESEND_API_KEY is set
```

If not configured, you'll see:
```
console.warn('RESEND_API_KEY not configured, email not sent')
```

### Check 2: User Role

Open browser console and check:
```javascript
// The log should show:
isPrivilegedSender: true
```

If it shows `false`, the user doesn't have admin/hr/prestador role.

### Check 3: Supabase Edge Function Logs

1. Go to Supabase Dashboard
2. Navigate to: Edge Functions → send-email → Logs
3. Look for recent requests
4. Check status codes:
   - ✅ `200` = Success
   - ❌ `403` = Permission denied (shouldn't happen now!)
   - ❌ `500` = Server error

### Check 4: Network Errors

In browser console, look for:
```
Error sending email: FunctionsHttpError
```

This means the edge function call itself failed. Check:
- Internet connection
- Supabase project is running
- Edge function is deployed

## 📊 What Changed?

### Before ❌
```typescript
// Blocked all emails unless to === auth.userEmail
if (to !== auth.userEmail) {
  return 403 Unauthorized
}
```

**Result:** Admin couldn't send to employees ❌

### After ✅
```typescript
// Allow admins/HR/prestadores to send to anyone
const isPrivilegedRole = hasRole(auth, ['admin', 'hr', 'prestador'])

if (!isPrivilegedRole && to !== auth.userEmail) {
  return 403 Unauthorized
}
```

**Result:** Admin can send to employees ✅

## 📝 Common Email Types

| Email Type | Sent From | Sent To | Edge Function |
|-----------|-----------|---------|---------------|
| Invitation Code | Admin | Employee | `send-email` |
| Code Resend | Admin | Employee | `send-email` |
| Welcome Email | Admin | Employee | `send-email` |
| Meeting Link | Prestador | User | `send-booking-email` |
| Password Reset | System | User | `send-auth-email` |

## 🎯 Expected Behavior

### ✅ What Should Work:
- Admin sending invitation emails to employees
- HR sending invitation emails to employees
- Prestador sending meeting links to users
- Admin manually sending codes via modal
- Password reset emails from auth system

### ⚠️ What's Not Implemented Yet:
- Booking confirmation emails (code commented out)
- Booking cancellation emails (code commented out)
- Session reminder emails (emailService is stub)

These can be implemented by:
1. Uncommenting the email calls in `BookingFlow.tsx`
2. Implementing the `EmailService` class methods
3. Using the existing email templates in `src/utils/emailTemplates.ts`

## 🚨 Troubleshooting

### "Email enviado" but nothing received?

**Possible causes:**
1. Email in spam folder
2. RESEND_API_KEY not configured (check console for warning)
3. Invalid email address
4. Resend sender domain not verified

**Solution:**
- Check Resend dashboard for delivery status
- Verify sender email is configured: `noreply@onhighmanagment.com`

### Rate limiting errors?

**Current limits:**
- 5 emails/minute per user
- 10 emails/minute per IP

**Solution:**
- Wait 60 seconds between bulk sends
- Or increase limits in `_shared/rateLimit.ts`

## ✅ Success Indicators

You'll know emails are working when:

1. ✅ Browser console shows `[EMAIL type]` logs
2. ✅ Console shows `isPrivilegedSender: true` for admin/hr/prestador
3. ✅ No "Unauthorized" errors in console
4. ✅ Status badges show "Enviado" (green)
5. ✅ Emails appear in recipient's inbox
6. ✅ Supabase logs show 200 status codes

---

**Need Help?**
- Check `EMAIL_FIXES_COMPLETE.md` for full details
- Open browser console (F12) to see detailed logs
- Check Supabase Edge Function logs for server-side errors




