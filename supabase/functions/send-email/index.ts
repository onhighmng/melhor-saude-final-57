// Supabase Edge Function to send emails
// SECURITY: This function requires authentication and has strict rate limiting
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"
import { verifyAuth, corsHeaders, hasRole } from "../_shared/auth.ts"
import { checkRateLimit, getClientIP, RATE_LIMITS } from "../_shared/rateLimit.ts"
import {
  withErrorHandling,
  handleRateLimitError,
  successResponse
} from "../_shared/errors.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

// Input validation schema
const sendEmailSchema = z.object({
  to: z.string().email().max(255),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(100000).refine(html => !html.includes('<script>'), {
    message: 'Scripts are not allowed in email HTML'
  }),
  type: z.string().max(50).optional()
})

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Verify authentication
  const auth = await verifyAuth(req)

  // Strict rate limiting - per user (very restrictive to prevent spam)
  const rateLimitResult = checkRateLimit(
    `send-email:${auth.userId}`,
    RATE_LIMITS.STRICT // 5 emails per minute
  )

  if (!rateLimitResult.allowed) {
    return handleRateLimitError(rateLimitResult.resetAt)
  }

  // Also rate limit by IP
  const clientIP = getClientIP(req)
  const ipRateLimitResult = checkRateLimit(
    `send-email:ip:${clientIP}`,
    { maxRequests: 10, windowMs: 60 * 1000 } // 10 per minute per IP
  )

  if (!ipRateLimitResult.allowed) {
    return handleRateLimitError(ipRateLimitResult.resetAt)
  }

  // Parse and validate input
  const body = await req.json()
  const { to, subject, html, type } = sendEmailSchema.parse(body)

  // SECURITY: Only allow sending to the authenticated user's email
  // UNLESS the sender has admin/hr/prestador role (for invites, notifications, etc.)
  // This prevents abuse/spam to arbitrary email addresses
  const isPrivilegedRole = hasRole(auth, ['admin', 'hr', 'prestador'])
  
  if (!isPrivilegedRole && to !== auth.userEmail) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized. You can only send emails to your own email address.',
        code: 'UNAUTHORIZED'
      }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log(`[EMAIL ${type || 'generic'}]`, {
    to,
    subject,
    userId: auth.userId,
    userRole: auth.role,
    isPrivilegedSender: isPrivilegedRole,
    timestamp: new Date().toISOString()
  })

  // Send email via Resend API
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, email not sent')
    return successResponse({
      success: true,
      message: 'Email would be sent (RESEND_API_KEY not configured)',
      timestamp: new Date().toISOString()
    })
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Melhor Saúde <noreply@onhighmanagment.com>',
      to,
      subject,
      html
    })
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(`Resend API error: ${result.message || result.error || 'Unknown error'}`)
  }

  return successResponse({
    success: true,
    messageId: result.id,
    message: 'Email sent successfully',
    timestamp: new Date().toISOString()
  })
}

serve(withErrorHandling(handler))
