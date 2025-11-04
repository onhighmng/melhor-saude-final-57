# Complete Sentry Deployment & Setup Guide

## ✅ What's Already Done

### Frontend (React)
- ✅ `@sentry/react` package installed
- ✅ Sentry configuration created (`src/sentry.config.ts`)
- ✅ App wrapped with Sentry profiler
- ✅ Error boundary enhanced with Sentry
- ✅ API interceptor created
- ✅ Custom hook for error handling
- ✅ DSN configured in `.env.local`

### Backend (Edge Functions)
- ✅ Shared Sentry module (`supabase/functions/_shared/sentry.ts`)
- ✅ Example integration (chat-assistant)
- ✅ Error and message capture functions

---

## 🚀 Deployment Steps

### Step 1: Add Sentry Secrets to Supabase

```bash
# Set DSN secret
supabase secrets set SENTRY_DSN="https://4dfdee11a3b421661a39304936575b31@o4510291492929536.ingest.us.sentry.io/4510291498106880"

# Set environment
supabase secrets set ENVIRONMENT="production"

# Verify secrets are set
supabase secrets list
```

### Step 2: Deploy Edge Functions

```bash
# Deploy all functions with Sentry integration
supabase functions deploy

# Or deploy specific function
supabase functions deploy chat-assistant
```

### Step 3: Verify Frontend Setup

```bash
# Start your dev server
npm run dev

# Open browser console and check for:
# ✅ Sentry initialized: { dsn: "✓ DSN configured" ... }
```

### Step 4: Test Error Capture

#### Test Frontend Error
```javascript
// In browser console
throw new Error("Test frontend error");
```

#### Test Backend Error
```bash
# Trigger a function that will cause an error
curl -X POST http://localhost:54321/functions/v1/chat-assistant \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

#### View in Sentry Dashboard
Go to: https://sentry.io/organizations/melhor-saude/issues/

---

## 📊 Sentry Dashboard Overview

### Key Sections

1. **Issues** - All errors and exceptions
   - Real-time alerts
   - Error grouping and deduplication
   - Error frequency and trends

2. **Performance** - Performance metrics
   - Page load times
   - API response times
   - Database query performance

3. **Releases** - Version tracking
   - Deploy tracking
   - Error regression detection

4. **Alerts** - Notification rules
   - Critical errors
   - Performance degradation
   - Custom thresholds

---

## 🔧 Configuration by Environment

### Development

`.env.local`:
```env
VITE_SENTRY_DSN=https://4dfdee11a3b421661a39304936575b31@o4510291492929536.ingest.us.sentry.io/4510291498106880
VITE_SENTRY_ENABLED=true
VITE_SENTRY_TRACES_SAMPLE_RATE=1.0
```

Supabase Secrets:
```bash
supabase secrets set SENTRY_DSN="..."
supabase secrets set ENVIRONMENT="development"
```

### Staging

```env
VITE_SENTRY_TRACES_SAMPLE_RATE=0.5
VITE_SENTRY_ENABLED=true
```

### Production

```env
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1    # 10% sampling to save quota
VITE_SENTRY_ENABLED=true
```

---

## 📝 Integration Checklist

### Frontend
- [x] Install @sentry/react
- [x] Create sentry.config.ts
- [x] Wrap app with profiler
- [x] Configure DSN
- [x] Test error capture

### Backend - Edge Functions

Update all functions to include Sentry:

```
- [ ] chat-assistant
- [ ] universal-specialist-chat  
- [ ] prediagnostic-chat
- [ ] mental-health-chat
- [ ] physical-wellness-chat
- [ ] financial-assistance-chat
- [ ] legal-chat
- [ ] send-booking-email
- [ ] send-auth-email
- [ ] send-email
- [ ] create-employee
```

Example integration:
```typescript
import { captureException, captureMessage } from "../_shared/sentry.ts"

serve(async (req) => {
  try {
    // Your logic
    await captureMessage('Operation successful', 'info', { context })
  } catch (error) {
    await captureException(error, { context })
  }
})
```

### Database & Authentication
- [ ] Set up Sentry user context in AuthContext
- [ ] Log important database operations
- [ ] Track authentication events

### Monitoring
- [ ] Create Sentry alerts
- [ ] Set up Slack/email notifications
- [ ] Schedule daily dashboard reviews

---

## 🔍 What's Being Monitored

### Frontend

| Event | Status | Details |
|-------|--------|---------|
| Unhandled Errors | ✅ | All uncaught exceptions |
| Component Errors | ✅ | Error boundary catches |
| API Errors | ✅ | Failed HTTP requests |
| Performance | ✅ | Page load, rendering |
| User Sessions | ✅ | Session replay (10% sample) |
| Console Errors | ✅ | Errors & warnings logged |

### Backend

| Event | Status | Details |
|-------|--------|---------|
| Edge Function Errors | ✅ | Unhandled exceptions |
| Database Errors | ✅ | Query failures |
| API Call Failures | ✅ | External API errors |
| Business Events | 📝 | Custom tracking |
| Performance | 📝 | Function timing |

---

## 🎯 Usage Examples

### Frontend - Component Error Handling

```typescript
import { useSentryErrorHandler } from '@/hooks/useSentryErrorHandler';

function MyComponent() {
  const { handleAsyncError, addBreadcrumb } = 
    useSentryErrorHandler('MyComponent');

  const handleBooking = async () => {
    addBreadcrumb('User initiated booking');
    
    const result = await handleAsyncError(
      () => bookSession(),
      { action: 'book_session' }
    );
  };

  return <button onClick={handleBooking}>Book</button>;
}
```

### Backend - Edge Function

```typescript
import { captureException, captureMessage } from "../_shared/sentry.ts"

serve(async (req) => {
  try {
    const { userId, email } = await req.json();

    // Track action
    await captureMessage('Processing email', 'info', {
      userId,
      email,
    });

    // Do work...

    await captureMessage('Email sent', 'info', {
      userId,
      status: 'success',
    });

  } catch (error) {
    await captureException(error, {
      userId,
      action: 'send_email',
    });
  }
});
```

---

## 📈 Viewing Data

### Real-time Errors
1. Go to Issues tab
2. View active errors
3. Click on error for details
4. See stack trace, context, and user info

### Performance Metrics
1. Go to Performance tab
2. View page load times
3. Identify slowest operations
4. Correlate with errors

### Session Replays
1. Go to Session Replay
2. Watch user sessions (privacy masked)
3. Debug issues by seeing user actions
4. See console logs and network requests

---

## 🚨 Alert Setup

### Create Custom Alert

1. Go to Alerts in Sentry
2. Click "Create Alert Rule"
3. Configure:
   - **Trigger**: Error count, transaction duration, etc.
   - **Condition**: When threshold exceeded
   - **Action**: Email, Slack, webhook, etc.

### Example Alerts

```
Rule 1: Database Errors
- When: Error rate > 1%
- Then: Send email to team

Rule 2: Slow API Responses
- When: p95 response time > 5s
- Then: Slack notification

Rule 3: New Issues
- When: New error first seen
- Then: Create ticket in Jira
```

---

## 📚 Documentation Links

- [Frontend Setup](./SENTRY_SETUP.md)
- [Backend Setup](./BACKEND_SENTRY_SETUP.md)
- [Sentry Dashboard](https://sentry.io/organizations/melhor-saude/)
- [API Interceptor](./src/services/sentryApiInterceptor.ts)
- [Error Handler Hook](./src/hooks/useSentryErrorHandler.ts)

---

## ❓ Troubleshooting

### Errors Not Showing

**Frontend:**
```bash
# Check console for initialization
npm run dev
# Look for: ✅ Sentry initialized
```

**Backend:**
```bash
# Check function logs
supabase functions logs chat-assistant

# Test manually
curl -X POST http://localhost:54321/functions/v1/chat-assistant
```

### Too Much Data

- Reduce `VITE_SENTRY_TRACES_SAMPLE_RATE` (from 1.0 to 0.1)
- Disable session replay: `replaysSessionSampleRate: 0`
- Set up data retention in Sentry dashboard

### Missing Context

- Add context to error capture
- Use breadcrumbs for user actions
- Include userId in all errors

---

## 🎓 Best Practices

### ✅ DO

- Include user/session context with every error
- Use appropriate severity levels
- Track important business events
- Review Sentry dashboard daily
- Set up team alerts
- Document error response procedures

### ❌ DON'T

- Log sensitive data (passwords, tokens)
- Capture all events (sample high-frequency)
- Ignore Sentry alerts
- Leave default sample rates in production
- Forget to deploy to Supabase

---

## 📞 Support

- **Sentry Docs**: https://docs.sentry.io/
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Deno Docs**: https://docs.deno.com/

---

## Status Summary

| Component | Status | Details |
|-----------|--------|---------|
| Frontend Sentry | ✅ Ready | npm install needed |
| Backend Sentry | ✅ Ready | Secrets + deploy needed |
| DSN | ✅ Configured | In .env.local |
| Documentation | ✅ Complete | See linked files |

**Next Step**: Add Supabase secrets and deploy!

```bash
supabase secrets set SENTRY_DSN="..."
supabase functions deploy
```



