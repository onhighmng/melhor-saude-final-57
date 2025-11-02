import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { verifyAuth, corsHeaders, hasRole } from "../_shared/auth.ts";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "../_shared/rateLimit.ts";
import {
  withErrorHandling,
  handleRateLimitError,
  successResponse
} from "../_shared/errors.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// Input validation schema
const sendBookingEmailSchema = z.object({
  to: z.string().email().max(255),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(100000).refine(html => !html.includes('<script>'), {
    message: 'Scripts are not allowed in email HTML'
  }),
  type: z.enum(['booking_confirmation', 'booking_cancellation', 'booking_reminder', 'booking_update']).optional(),
  booking_id: z.string().uuid().optional() // Optional booking ID for audit trail
});

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verify authentication
  const auth = await verifyAuth(req);

  // Only admins, HR, and prestadores can send booking emails
  // This prevents abuse of the email system
  if (!hasRole(auth, ['admin', 'hr', 'prestador'])) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized. Only admins, HR, and prestadores can send booking emails.',
        code: 'UNAUTHORIZED'
      }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Rate limiting - per user
  const rateLimitResult = checkRateLimit(
    `send-booking-email:${auth.userId}`,
    RATE_LIMITS.MODERATE // 20 per minute
  );

  if (!rateLimitResult.allowed) {
    return handleRateLimitError(rateLimitResult.resetAt);
  }

  // Also rate limit by IP
  const clientIP = getClientIP(req);
  const ipRateLimitResult = checkRateLimit(
    `send-booking-email:ip:${clientIP}`,
    RATE_LIMITS.HOURLY_STRICT // 50 per hour
  );

  if (!ipRateLimitResult.allowed) {
    return handleRateLimitError(ipRateLimitResult.resetAt);
  }

  // Parse and validate input
  const body = await req.json();
  const { to, subject, html, type, booking_id } = sendBookingEmailSchema.parse(body);

  console.log(`[BOOKING EMAIL ${type || 'generic'}]`, {
    to,
    subject,
    booking_id,
    sent_by: auth.userId,
    timestamp: new Date().toISOString()
  });

  // If RESEND_API_KEY is not configured, return success (development mode)
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Email would have been sent to:', to);
    console.warn('Subject:', subject);
    return successResponse({
      success: true,
      message: 'Email sent (development mode - no actual email sent)',
      id: 'dev-mode-' + Date.now()
    });
  }

  // Send email via Resend
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Melhor Saúde <noreply@onhighmanagment.com>',
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error('Resend API error:', error);
    throw new Error(`Resend API error: ${error}`);
  }

  const data = await res.json();
  console.log('Booking email sent successfully:', data);

  return successResponse({
    success: true,
    messageId: data.id,
    message: 'Booking email sent successfully',
    timestamp: new Date().toISOString()
  });
}

serve(withErrorHandling(handler));
