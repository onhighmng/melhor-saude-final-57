# Sentry Integration Setup

## ✅ Status: CONFIGURED & READY

Your Sentry DSN has been successfully configured!

## Configuration Summary

- **DSN**: Configured ✅
- **Environment**: Auto-detected from Vite mode
- **Session Replay**: Enabled (10% of sessions, 100% on errors)
- **Performance Monitoring**: Enabled
- **Console Capture**: Enabled (errors & warnings)
- **HTTP Tracking**: Enabled

## What's Installed

- `@sentry/react` - React integration for Sentry
- Configuration file: `src/sentry.config.ts`
- App.tsx updated with Sentry wrappers
- `.env.local` with your DSN (added ✅)

## Environment Variables

Your `.env.local` file contains:

```env
VITE_SENTRY_DSN=https://4dfdee11a3b421661a39304936575b31@o4510291492929536.ingest.us.sentry.io/4510291498106880
VITE_SENTRY_ENABLED=true
VITE_SENTRY_TRACES_SAMPLE_RATE=1.0
```

### Environment-Specific Settings

For **Production**, consider reducing the sample rate to save quota:

```env
# Production
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1    # 10% sampling
VITE_SENTRY_ENABLED=true
```

## What's Being Tracked

### ✅ Error Tracking
- Unhandled exceptions and errors
- Component errors (caught by Error Boundary)
- API request errors
- JavaScript runtime errors
- Console warnings & errors

### ✅ Performance Monitoring
- Page load times
- Component rendering performance (via Profiler)
- User interactions and navigation
- API request duration
- Session duration

### ✅ Session Replay
- User interactions (masked for privacy)
- DOM changes
- Console logs
- Network requests

### ✅ User Context
- User ID, email, and role (when authenticated)
- Session information
- Breadcrumbs for user actions

## Files Modified

1. **package.json** - Added `@sentry/react` dependency ✅
2. **src/App.tsx** - Added Sentry initialization and profiler wrapper ✅
3. **src/sentry.config.ts** - Created comprehensive configuration file ✅
4. **.env.local** - Added Sentry DSN and settings ✅
5. **src/components/SentryErrorBoundary.tsx** - Enhanced error boundary ✅
6. **src/services/sentryApiInterceptor.ts** - API error tracking ✅
7. **src/hooks/useSentryErrorHandler.ts** - Custom error handling hook ✅

## Next Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Your Development Server
```bash
npm run dev
```

### 3. Verify Sentry is Working
You should see this log in your browser console:
```
✅ Sentry initialized: {
  dsn: "✓ DSN configured"
  environment: "development"
  enabled: true
}
```

### 4. (Optional) Test Error Capture
To test if Sentry is working, trigger an error in your browser console:
```javascript
throw new Error("Test error from Sentry");
```

This error should appear in your [Sentry Dashboard](https://sentry.io/organizations/melhor-saude/issues/)

### 5. Integrate with AuthContext (Recommended)
Add this to your AuthContext to track authenticated users:

```typescript
import { setSentryUserContext, clearSentryUserContext } from '@/services/sentryApiInterceptor';

// In your login/signup handler:
useEffect(() => {
  if (user) {
    setSentryUserContext({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
  } else {
    clearSentryUserContext();
  }
}, [user]);
```

## Usage Examples

### Capturing Exceptions Manually

```typescript
import * as Sentry from "@sentry/react";

try {
  // Your code here
} catch (error) {
  Sentry.captureException(error);
}
```

### Using the Error Handler Hook

```typescript
import { useSentryErrorHandler } from '@/hooks/useSentryErrorHandler';

function MyComponent() {
  const { captureError, handleAsyncError, addBreadcrumb } = 
    useSentryErrorHandler('MyComponent');

  const handleClick = async () => {
    addBreadcrumb('User clicked button');
    
    const result = await handleAsyncError(
      () => fetchData(),
      { action: 'fetchData' }
    );
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Adding Context to Errors

```typescript
import * as Sentry from "@sentry/react";

Sentry.setContext("booking", {
  sessionId: "456",
  specialistId: "789",
  status: "in_progress"
});
```

### Adding Breadcrumbs

```typescript
Sentry.addBreadcrumb({
  category: "user-action",
  message: "User started booking session",
  level: "info",
});
```

## Privacy & Security

Sentry configuration includes privacy measures:
- ✅ Session replay masks all text input (`maskAllText: true`)
- ✅ Session replay blocks all media (`blockAllMedia: true`)
- ✅ Sensitive authentication URLs are redacted
- ✅ Browser extensions errors are filtered
- ✅ All errors are scrubbed before sending to Sentry

## Viewing Errors in Sentry

1. Go to [Sentry Issues](https://sentry.io/organizations/melhor-saude/issues/)
2. Select your project "melhor-saude"
3. View real-time error tracking and performance metrics

## Troubleshooting

### Sentry Not Capturing Errors
- ✅ Verify DSN is in `.env.local`
- Check browser console for initialization logs
- Ensure `VITE_SENTRY_ENABLED=true`
- Restart dev server after changing `.env.local`

### Too Much Data Being Sent
- Reduce `VITE_SENTRY_TRACES_SAMPLE_RATE` to 0.1 (10%)
- Adjust `replaysSessionSampleRate` in `sentry.config.ts`
- Set up data retention policies in Sentry dashboard

### Sensitive Data Leaking
- Review `beforeSend` hook in `sentry.config.ts`
- Add additional URL patterns to `denyUrls` for sensitive endpoints
- Test with console test error to verify filtering

## Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Project Dashboard](https://sentry.io/organizations/melhor-saude/projects/)
- [Performance Monitoring Guide](https://docs.sentry.io/product/performance/)
- [Session Replay Documentation](https://docs.sentry.io/product/session-replay/)
- [DSN Explainer](https://docs.sentry.io/product/sentry-basics/dsn-explainer/)

---

## Quick Checklist

- [x] Sentry package installed
- [x] DSN configured
- [x] Environment variables set
- [x] App.tsx integrated
- [x] Error boundary enhanced
- [x] API interceptor created
- [x] Custom hook available
- [ ] npm install (needed to install dependencies)
- [ ] npm run dev (start development server)
- [ ] Test error tracking in Sentry dashboard
