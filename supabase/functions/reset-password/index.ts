// Edge Function: Reset Password
// Updates user password with valid reset token
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
const resetPasswordSchema = z.object({
  token: z.string().length(64), // SHA-256 hex string
  new_password: z.string().min(8).max(100)
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

  // Rate limiting by IP to prevent abuse
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(
    `reset-password:${clientIP}`,
    RATE_LIMITS.STRICT // 5 requests per minute
  );

  if (!rateLimitResult.allowed) {
    return handleRateLimitError(rateLimitResult.resetAt);
  }

  // Parse and validate input
  const body = await req.json();
  const { token, new_password } = resetPasswordSchema.parse(body);

  // Hash the token to find it in database
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

  // Look up and validate the token (with FOR UPDATE to prevent race conditions)
  const { data: resetToken, error: tokenError } = await supabaseAdmin
    .from('password_reset_tokens')
    .select('id, user_id, expires_at, is_valid, used_at')
    .eq('token_hash', tokenHash)
    .single();

  if (tokenError || !resetToken) {
    return new Response(
      JSON.stringify({
        error: 'Invalid or expired reset token',
        code: 'INVALID_TOKEN'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validate token status
  const now = new Date();
  const expiresAt = new Date(resetToken.expires_at);

  if (!resetToken.is_valid || resetToken.used_at || now > expiresAt) {
    return new Response(
      JSON.stringify({
        error: 'This reset token is no longer valid',
        code: 'TOKEN_INVALID'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check if account is locked
  const { data: lockout } = await supabaseAdmin
    .from('account_lockouts')
    .select('id')
    .eq('user_id', resetToken.user_id)
    .eq('is_active', true)
    .gte('unlock_at', new Date().toISOString())
    .single();

  if (lockout) {
    return new Response(
      JSON.stringify({
        error: 'This account is currently locked',
        code: 'ACCOUNT_LOCKED'
      }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get user details for email notification
  const { data: user } = await supabaseAdmin
    .from('profiles')
    .select('email, name')
    .eq('id', resetToken.user_id)
    .single();

  if (!user) {
    return new Response(
      JSON.stringify({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Update the password via Supabase Auth Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      resetToken.user_id,
      { password: new_password }
    );

    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`);
    }

    // Mark token as used
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({
        used_at: new Date().toISOString(),
        is_valid: false
      })
      .eq('id', resetToken.id);

    // Invalidate all user sessions (force re-login)
    await supabaseAdmin
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', resetToken.user_id)
      .eq('is_active', true);

    // Clear any account lockouts
    await supabaseAdmin
      .from('account_lockouts')
      .update({ is_active: false, unlocked_at: new Date().toISOString(), unlock_method: 'password_reset' })
      .eq('user_id', resetToken.user_id)
      .eq('is_active', true);

    // Log security event
    await supabaseAdmin.from('security_logs').insert({
      user_id: resetToken.user_id,
      event_type: 'password_reset_completed',
      severity: 'medium',
      description: 'Password successfully reset via token',
      ip_address: clientIP,
      details: { email: user.email }
    });

    // Send confirmation email
    if (RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Melhor Saúde <noreply@onhighmanagment.com>',
            to: [user.email],
            subject: 'Palavra-passe alterada com sucesso',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Palavra-passe Alterada</h2>
                <p>Olá ${user.name || 'utilizador'},</p>
                <p>A palavra-passe da sua conta Melhor Saúde foi alterada com sucesso.</p>
                <p><strong>Data e hora:</strong> ${new Date().toLocaleString('pt-PT')}</p>
                <p><strong>Endereço IP:</strong> ${clientIP}</p>
                <div style="margin: 30px 0; padding: 15px; background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 5px;">
                  <strong>⚠️ Não foi você?</strong><br>
                  Se não solicitou esta alteração, a sua conta pode estar comprometida.
                  Por favor, entre em contacto connosco imediatamente.
                </div>
                <p style="margin-top: 30px;">
                  Por motivos de segurança, todas as suas sessões ativas foram encerradas.
                  Será necessário fazer login novamente.
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

        console.log(`Password reset confirmation email sent to: ${user.email}`);
      } catch (emailError) {
        logErrorToSentry(emailError as Error, { email: user.email });
        // Don't fail the request if email fails
      }
    }

    return successResponse({
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    });

  } catch (error) {
    logErrorToSentry(error as Error, {
      user_id: resetToken.user_id,
      email: user.email
    });

    throw new Error('Failed to reset password. Please try again.');
  }
}

serve(withErrorHandling(handler));
