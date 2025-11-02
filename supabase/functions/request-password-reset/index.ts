// Edge Function: Request Password Reset
// Generates a secure token and sends reset email
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/auth.ts";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "../_shared/rateLimit.ts";
import {
  withErrorHandling,
  handleRateLimitError,
  successResponse,
  logErrorToSentry
} from "../_shared/errors.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// Input validation schema
const requestResetSchema = z.object({
  email: z.string().email().max(255)
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

  // Strict rate limiting by IP to prevent abuse
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(
    `password-reset:${clientIP}`,
    RATE_LIMITS.STRICT // 5 requests per minute
  );

  if (!rateLimitResult.allowed) {
    return handleRateLimitError(rateLimitResult.resetAt);
  }

  // Also add hourly rate limit
  const hourlyRateLimit = checkRateLimit(
    `password-reset:hourly:${clientIP}`,
    { maxRequests: 10, windowMs: 60 * 60 * 1000 } // 10 per hour
  );

  if (!hourlyRateLimit.allowed) {
    return handleRateLimitError(hourlyRateLimit.resetAt);
  }

  // Parse and validate input
  const body = await req.json();
  const { email } = requestResetSchema.parse(body);

  // Create admin Supabase client
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // SECURITY: Always return success to prevent email enumeration
  // But only send email if user actually exists
  const { data: user } = await supabaseAdmin
    .from('profiles')
    .select('id, email, name')
    .eq('email', email)
    .single();

  if (user) {
    // Check if account is locked
    const { data: lockout } = await supabaseAdmin
      .from('account_lockouts')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .gte('unlock_at', new Date().toISOString())
      .single();

    if (lockout) {
      // Account is locked - still return success but don't send email
      console.warn(`Password reset requested for locked account: ${email}`);

      // Log security event
      await supabaseAdmin.from('security_logs').insert({
        user_id: user.id,
        event_type: 'password_reset_request_locked_account',
        severity: 'medium',
        description: 'Password reset requested for locked account',
        ip_address: clientIP,
        details: { email }
      });

      return successResponse({
        success: true,
        message: 'If that email exists, a password reset link has been sent.'
      });
    }

    // Generate secure token (crypto-random)
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes, byte => byte.toString(16).padStart(2, '0')).join('');

    // Hash the token before storing (never store plaintext)
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Invalidate any existing reset tokens for this user
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ is_valid: false })
      .eq('user_id', user.id)
      .eq('is_valid', true);

    // Create new reset token (expires in 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        ip_address: clientIP,
        requested_by_email: email
      });

    if (tokenError) {
      logErrorToSentry(new Error('Failed to create reset token'), {
        email,
        error: tokenError
      });
      throw new Error('Failed to create reset token');
    }

    // Generate reset link
    const resetUrl = `${Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'}/reset-password?token=${token}`;

    // Send email via Resend
    if (RESEND_API_KEY) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Melhor Saúde <noreply@onhighmanagment.com>',
            to: [email],
            subject: 'Redefinir a sua palavra-passe',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Redefinir Palavra-passe</h2>
                <p>Olá ${user.name || 'utilizador'},</p>
                <p>Recebemos um pedido para redefinir a palavra-passe da sua conta Melhor Saúde.</p>
                <p>Clique no botão abaixo para redefinir a sua palavra-passe:</p>
                <div style="margin: 30px 0; text-align: center;">
                  <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Redefinir Palavra-passe
                  </a>
                </div>
                <p>Ou copie e cole este link no seu navegador:</p>
                <p style="color: #666; word-break: break-all;">${resetUrl}</p>
                <p style="margin-top: 30px; color: #999; font-size: 14px;">
                  Este link expira em 1 hora por motivos de segurança.<br>
                  Se não solicitou esta redefinição, pode ignorar este email com segurança.
                </p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">
                  Melhor Saúde - Plataforma de Bem-Estar<br>
                  Este é um email automático, por favor não responda.
                </p>
              </div>
            `
          })
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('Failed to send reset email:', errorText);

          logErrorToSentry(new Error('Failed to send reset email'), {
            email,
            status: emailResponse.status,
            error: errorText
          });
        } else {
          console.log(`Password reset email sent to: ${email}`);

          // Log security event
          await supabaseAdmin.from('security_logs').insert({
            user_id: user.id,
            event_type: 'password_reset_requested',
            severity: 'low',
            description: 'Password reset email sent',
            ip_address: clientIP,
            details: { email }
          });
        }
      } catch (emailError) {
        logErrorToSentry(emailError as Error, { email });
        // Don't fail the request if email fails - user may retry
      }
    } else {
      console.warn('RESEND_API_KEY not configured - reset link:', resetUrl);
    }
  } else {
    // User doesn't exist - log the attempt
    console.log(`Password reset requested for non-existent email: ${email}`);

    // Log as potential enumeration attempt
    await supabaseAdmin.from('security_logs').insert({
      event_type: 'password_reset_nonexistent_user',
      severity: 'low',
      description: 'Password reset requested for non-existent email',
      ip_address: clientIP,
      details: { email }
    });
  }

  // ALWAYS return success to prevent email enumeration
  return successResponse({
    success: true,
    message: 'If that email exists, a password reset link has been sent.'
  });
}

serve(withErrorHandling(handler));
