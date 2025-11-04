/**
 * Sentry integration for Supabase Edge Functions
 * Captures errors and sends them to Sentry for monitoring
 */

const SENTRY_DSN = Deno.env.get('SENTRY_DSN') || '';
const SENTRY_ENVIRONMENT = Deno.env.get('ENVIRONMENT') || 'development';

/**
 * Send error to Sentry
 */
export async function captureException(error: Error, context?: Record<string, any>) {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured, skipping error capture');
    return;
  }

  try {
    const dsn = new URL(SENTRY_DSN);
    const projectId = dsn.pathname.split('/').pop();
    const host = dsn.hostname;

    const payload = {
      event_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level: 'error',
      platform: 'node',
      environment: SENTRY_ENVIRONMENT,
      server_name: 'supabase-edge-function',
      exception: {
        values: [
          {
            type: error.name || 'Error',
            value: error.message,
            stacktrace: {
              frames: parseStackTrace(error.stack || ''),
            },
          },
        ],
      },
      contexts: context
        ? {
            custom: context,
          }
        : undefined,
      tags: {
        runtime: 'deno',
        service: 'edge-function',
      },
    };

    const response = await fetch(
      `https://${host}/api/${projectId}/store/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentry-Auth': `Sentry sentry_key=${dsn.username}, sentry_version=7`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      console.log('[Sentry] Error captured successfully');
    } else {
      console.error('[Sentry] Failed to capture error:', response.statusText);
    }
  } catch (sentryError) {
    console.error('[Sentry] Error sending to Sentry:', sentryError);
  }
}

/**
 * Parse stack trace from error
 */
function parseStackTrace(stack: string) {
  const lines = stack.split('\n').slice(1); // Skip first line
  const frames = lines
    .filter((line) => line.includes('at '))
    .map((line) => {
      const match = line.match(/at (.+) \((.+):(\d+):(\d+)\)/);
      if (match) {
        return {
          function: match[1],
          filename: match[2],
          lineno: parseInt(match[3]),
          colno: parseInt(match[4]),
        };
      }
      return null;
    })
    .filter(Boolean);

  return frames;
}

/**
 * Log message to Sentry
 */
export async function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
) {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured, skipping message capture');
    return;
  }

  try {
    const dsn = new URL(SENTRY_DSN);
    const projectId = dsn.pathname.split('/').pop();
    const host = dsn.hostname;

    const payload = {
      event_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      platform: 'node',
      environment: SENTRY_ENVIRONMENT,
      server_name: 'supabase-edge-function',
      message: {
        message,
      },
      contexts: context
        ? {
            custom: context,
          }
        : undefined,
      tags: {
        runtime: 'deno',
        service: 'edge-function',
      },
    };

    const response = await fetch(
      `https://${host}/api/${projectId}/store/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentry-Auth': `Sentry sentry_key=${dsn.username}, sentry_version=7`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      console.log('[Sentry] Message captured');
    }
  } catch (sentryError) {
    console.error('[Sentry] Error sending message to Sentry:', sentryError);
  }
}

export default {
  captureException,
  captureMessage,
};




