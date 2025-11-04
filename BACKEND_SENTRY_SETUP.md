# Backend Error Tracking with Sentry

## Overview

This guide sets up Sentry error tracking for your Supabase Edge Functions (backend). Errors from all edge functions will be automatically captured and sent to Sentry for monitoring and debugging.

## Architecture

```
Supabase Edge Functions (Deno)
        ↓
  _shared/sentry.ts (Shared module)
        ↓
All Edge Functions use this module
        ↓
Sentry Dashboard
```

## Setup Steps

### 1. Add Sentry Secrets to Supabase

In your Supabase project settings, add these secrets:

```bash
supabase secrets set SENTRY_DSN="https://4dfdee11a3b421661a39304936575b31@o4510291492929536.ingest.us.sentry.io/4510291498106880"
supabase secrets set ENVIRONMENT="production"
```

### 2. Use Sentry in Edge Functions

Add error tracking to any edge function by importing the shared module:

```typescript
import { captureException, captureMessage } from "../_shared/sentry.ts"

serve(async (req) => {
  try {
    // Your function logic here
    
    await captureMessage('Operation completed', 'info', {
      functionName: 'my-function',
      userId: userId,
    })
    
  } catch (error) {
    await captureException(error, {
      functionName: 'my-function',
      userId: userId,
      action: 'database_insert',
    })
  }
})
```

## Features

### ✅ Automatic Error Capture

```typescript
try {
  // Operation
} catch (error) {
  await captureException(error, {
    context: 'additional_data'
  })
}
```

### ✅ Message Logging

```typescript
await captureMessage('User signed up successfully', 'info', {
  userId: user.id,
  email: user.email
})
```

### ✅ Error Context

Include relevant context with every error:

```typescript
await captureException(error, {
  sessionId: sessionId,
  userId: userId,
  action: 'process_payment',
  amount: 99.99,
  paymentMethod: 'card',
})
```

## Integration with All Edge Functions

Currently integrated:
- ✅ `chat-assistant` - Chat message processing
- ⏳ `universal-specialist-chat` - Specialist routing
- ⏳ `prediagnostic-chat` - Pre-diagnostic chat
- ⏳ `send-booking-email` - Email sending
- ⏳ `send-auth-email` - Auth emails
- ⏳ All other functions

## What Gets Tracked

### Automatic Tracking

1. **Unhandled Exceptions** - All errors in try/catch blocks
2. **Database Errors** - Supabase query failures
3. **API Errors** - External API call failures
4. **Rate Limiting** - API rate limit errors
5. **Authentication Errors** - Auth failures

### Custom Tracking

```typescript
// Track user actions
await captureMessage('User action', 'info', {
  action: 'booking_created',
  userId: user.id,
  specialistId: specialist.id,
})

// Track business metrics
await captureMessage('Payment processed', 'info', {
  amount: 99.99,
  paymentMethod: 'card',
  status: 'success',
})

// Track warnings
await captureMessage('Unusual activity detected', 'warning', {
  userId: user.id,
  reason: 'multiple_failed_attempts',
})
```

## Error Severity Levels

| Level | Usage |
|-------|-------|
| `info` | Successful operations, user actions |
| `warning` | Unexpected but non-critical issues |
| `error` | Failures that affect functionality |

## Example: Complete Edge Function

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { captureException, captureMessage } from "../_shared/sentry.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, action } = await req.json()

    // Log action
    await captureMessage(`Processing ${action}`, 'info', {
      userId,
      action,
      timestamp: new Date().toISOString(),
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Perform operation
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Success
    await captureMessage('Action completed successfully', 'info', {
      userId,
      action,
      dataReturned: !!data,
    })

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    // Log error with context
    await captureException(error, {
      function: 'my-function',
      timestamp: new Date().toISOString(),
    })

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
```

## Viewing Backend Errors in Sentry

1. Go to https://sentry.io/organizations/melhor-saude/issues/
2. Filter by service: `edge-function`
3. View errors with full stack traces and context
4. Set up alerts for critical errors

## Best Practices

### ✅ DO

- Include user/session context with every error
- Use appropriate severity levels (info/warning/error)
- Log both successes and failures
- Include business context (what was the user trying to do?)
- Track performance-critical operations

### ❌ DON'T

- Log sensitive data (passwords, tokens, credit cards)
- Capture too much data (keep context reasonable)
- Log every single operation (sample high-frequency events)
- Ignore Sentry errors (review dashboard regularly)

## Troubleshooting

### No Errors Showing in Sentry

1. Verify `SENTRY_DSN` secret is set:
   ```bash
   supabase secrets list
   ```

2. Check function logs:
   ```bash
   supabase functions logs chat-assistant
   ```

3. Test manually:
   ```bash
   curl -X POST http://localhost:54321/functions/v1/chat-assistant \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

### Sentry Not Receiving Events

- Verify DSN is correct
- Check network connectivity in Supabase
- Review `beforeSend` filters in Sentry project settings
- Check if SENTRY_ENVIRONMENT is set correctly

## Integration Checklist

- [ ] Add SENTRY_DSN secret to Supabase
- [ ] Add ENVIRONMENT secret to Supabase
- [ ] Update all edge functions with error tracking
- [ ] Test error capture by triggering an error
- [ ] Set up Sentry alerts for critical errors
- [ ] Create team dashboard in Sentry
- [ ] Document error response procedures
- [ ] Train team on interpreting Sentry events

## Next Steps

1. **Deploy to Production**
   ```bash
   supabase deploy
   ```

2. **Monitor Dashboard**
   - Review Sentry issues dashboard daily
   - Set up email/Slack alerts

3. **Iterate**
   - Add more context as needed
   - Refine error severity levels
   - Optimize data capture

## Related Documentation

- [Frontend Sentry Setup](./SENTRY_SETUP.md)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Sentry Documentation](https://docs.sentry.io/)
- [Deno Manual](https://docs.deno.com/)

---

**Questions?** Check the Sentry dashboard or review the shared `_shared/sentry.ts` module.



