// Edge Function: Verify Password Reset Token
// Validates a reset token before allowing password change
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/auth.ts";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "../_shared/rateLimit.ts";
import {
  withErrorHandling,
  handleRateLimitError,
  successResponse
} from "../_shared/errors.ts";

// Input validation schema
const verifyTokenSchema = z.object({
  token: z.string().length(64) // SHA-256 hex string
});

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
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

  // Rate limiting by IP
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(
    `verify-reset-token:${clientIP}`,
    RATE_LIMITS.MODERATE // 20 requests per minute
  );

  if (!rateLimitResult.allowed) {
    return handleRateLimitError(rateLimitResult.resetAt);
  }

  // Parse and validate input
  const body = await req.json();
  const { token } = verifyTokenSchema.parse(body);

  // Hash the token to compare with stored hash
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Create admin Supabase client
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Look up the token
  const { data: resetToken, error: tokenError } = await supabaseAdmin
    .from('password_reset_tokens')
    .select('id, user_id, expires_at, is_valid, used_at')
    .eq('token_hash', tokenHash)
    .single();

  if (tokenError || !resetToken) {
    return new Response(
      JSON.stringify({
        valid: false,
        error: 'Invalid or expired reset token',
        code: 'INVALID_TOKEN'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check if token is still valid
  const now = new Date();
  const expiresAt = new Date(resetToken.expires_at);

  if (!resetToken.is_valid) {
    return new Response(
      JSON.stringify({
        valid: false,
        error: 'This reset token has been invalidated',
        code: 'TOKEN_INVALIDATED'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (resetToken.used_at) {
    return new Response(
      JSON.stringify({
        valid: false,
        error: 'This reset token has already been used',
        code: 'TOKEN_USED'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (now > expiresAt) {
    // Mark token as invalid
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ is_valid: false })
      .eq('id', resetToken.id);

    return new Response(
      JSON.stringify({
        valid: false,
        error: 'This reset token has expired. Please request a new one.',
        code: 'TOKEN_EXPIRED'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check if account is locked
  const { data: lockout } = await supabaseAdmin
    .from('account_lockouts')
    .select('id, unlock_at')
    .eq('user_id', resetToken.user_id)
    .eq('is_active', true)
    .gte('unlock_at', new Date().toISOString())
    .single();

  if (lockout) {
    return new Response(
      JSON.stringify({
        valid: false,
        error: 'This account is currently locked. Please try again later.',
        code: 'ACCOUNT_LOCKED',
        unlock_at: lockout.unlock_at
      }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Token is valid!
  return successResponse({
    valid: true,
    expires_at: resetToken.expires_at,
    message: 'Token is valid. You may proceed with password reset.'
  });
}

serve(withErrorHandling(handler));
