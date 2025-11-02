import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"
import { corsHeaders } from "./auth.ts"

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string
  details?: any
  code?: string
}

/**
 * Log error to Sentry (when configured)
 * @param error - Error to log
 * @param context - Additional context
 */
export function logErrorToSentry(error: Error, context?: Record<string, any>): void {
  // TODO: Initialize Sentry SDK and uncomment
  // const SENTRY_DSN = Deno.env.get('SENTRY_DSN')
  // if (SENTRY_DSN) {
  //   Sentry.captureException(error, {
  //     extra: context,
  //     level: 'error'
  //   })
  // }

  // For now, just log to console with context
  console.error('ERROR:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  })
}

/**
 * Handle Zod validation errors
 * @param error - Zod error
 * @returns Response with validation error details
 */
export function handleZodError(error: z.ZodError): Response {
  console.warn('Validation error:', error.errors)

  return new Response(
    JSON.stringify({
      error: 'Invalid input',
      details: error.errors,
      code: 'VALIDATION_ERROR'
    } as ErrorResponse),
    {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

/**
 * Handle authentication errors
 * @param error - Auth error
 * @returns Response with auth error
 */
export function handleAuthError(error: Error): Response {
  console.warn('Authentication error:', error.message)

  return new Response(
    JSON.stringify({
      error: error.message,
      code: 'UNAUTHORIZED'
    } as ErrorResponse),
    {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

/**
 * Handle rate limit errors
 * @param resetAt - When the rate limit resets
 * @returns Response with rate limit error
 */
export function handleRateLimitError(resetAt: number): Response {
  const resetDate = new Date(resetAt).toISOString()

  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded. Please try again later.',
      details: { resetAt: resetDate },
      code: 'RATE_LIMIT_EXCEEDED'
    } as ErrorResponse),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString()
      }
    }
  )
}

/**
 * Handle generic errors
 * @param error - Error to handle
 * @param context - Additional context for logging
 * @returns Response with error message
 */
export function handleGenericError(error: Error, context?: Record<string, any>): Response {
  // Log to Sentry
  logErrorToSentry(error, context)

  // Don't expose internal error details in production
  const isDevelopment = Deno.env.get('DENO_ENV') === 'development'

  return new Response(
    JSON.stringify({
      error: isDevelopment ? error.message : 'Internal server error',
      code: 'INTERNAL_ERROR'
    } as ErrorResponse),
    {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

/**
 * Wrap async function with error handling
 * @param handler - Async function to wrap
 * @returns Wrapped function with error handling
 */
export function withErrorHandling(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req)
    } catch (error) {
      // Handle specific error types
      if (error instanceof z.ZodError) {
        return handleZodError(error)
      }

      if (error instanceof Error) {
        // Check for auth errors
        if (error.message.includes('token') ||
            error.message.includes('Authorization') ||
            error.message.includes('Unauthorized')) {
          return handleAuthError(error)
        }

        return handleGenericError(error, {
          method: req.method,
          url: req.url
        })
      }

      // Unknown error type
      return handleGenericError(
        new Error('Unknown error occurred'),
        { originalError: error }
      )
    }
  }
}

/**
 * Create success response
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @returns Response with data
 */
export function successResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}
