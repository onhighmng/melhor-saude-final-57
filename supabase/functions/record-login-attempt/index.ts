// Edge Function: Record Login Attempt
// Tracks login attempts and automatically locks accounts after too many failures
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

// Configuration
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MINUTES = 10; // Check for failures in last 10 minutes
const LOCKOUT_DURATION_MINUTES = 30; // Lock account for 30 minutes

// Input validation schema
const recordAttemptSchema = z.object({
  email: z.string().email().max(255),
  success: z.boolean(),
  failure_reason: z.string().max(200).optional(),
  user_agent: z.string().max(500).optional()
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

  // Rate limiting
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(
    `record-login:${clientIP}`,
    RATE_LIMITS.GENEROUS // 100 requests per minute
  );

  if (!rateLimitResult.allowed) {
    return handleRateLimitError(rateLimitResult.resetAt);
  }

  // Parse and validate input
  const body = await req.json();
  const { email, success, failure_reason, user_agent } = recordAttemptSchema.parse(body);

  // Create admin Supabase client
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Get user ID if exists
  const { data: user } = await supabaseAdmin
    .from('profiles')
    .select('id, email, name')
    .eq('email', email)
    .single();

  const userId = user?.id || null;

  // Record the login attempt
  const { error: insertError } = await supabaseAdmin
    .from('user_login_attempts')
    .insert({
      email,
      user_id: userId,
      success,
      ip_address: clientIP,
      user_agent: user_agent || req.headers.get('user-agent'),
      failure_reason: failure_reason || null,
      triggered_lockout: false // Will update if we trigger lockout
    });

  if (insertError) {
    logErrorToSentry(new Error('Failed to record login attempt'), {
      email,
      error: insertError
    });
  }

  // If login was successful, clear any lockout and return
  if (success && userId) {
    // Clear any active lockouts
    await supabaseAdmin
      .from('account_lockouts')
      .update({
        is_active: false,
        unlocked_at: new Date().toISOString(),
        unlock_method: 'automatic'
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    return successResponse({
      success: true,
      locked: false,
      message: 'Login attempt recorded'
    });
  }

  // If login failed and user exists, check if we should lock the account
  if (!success && userId) {
    // Count recent failed attempts (last 10 minutes)
    const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000).toISOString();

    const { count: failedCount } = await supabaseAdmin
      .from('user_login_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('success', false)
      .gte('attempted_at', windowStart);

    const recentFailures = failedCount || 0;

    // Check if account is already locked
    const { data: existingLockout } = await supabaseAdmin
      .from('account_lockouts')
      .select('id, unlock_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('unlock_at', new Date().toISOString())
      .single();

    if (existingLockout) {
      return successResponse({
        success: true,
        locked: true,
        unlock_at: existingLockout.unlock_at,
        message: 'Account is locked',
        remaining_attempts: 0
      });
    }

    // Check if we should lock the account
    if (recentFailures >= MAX_FAILED_ATTEMPTS) {
      const unlockAt = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString();

      // Create lockout record
      const { error: lockoutError } = await supabaseAdmin
        .from('account_lockouts')
        .insert({
          user_id: userId,
          email,
          unlock_at: unlockAt,
          reason: `${MAX_FAILED_ATTEMPTS} failed login attempts in ${LOCKOUT_WINDOW_MINUTES} minutes`,
          failed_attempts_count: recentFailures
        });

      if (lockoutError) {
        logErrorToSentry(new Error('Failed to create account lockout'), {
          user_id: userId,
          email,
          error: lockoutError
        });
      } else {
        // Log security event
        await supabaseAdmin.from('security_logs').insert({
          user_id: userId,
          event_type: 'account_locked',
          severity: 'high',
          description: `Account locked after ${recentFailures} failed login attempts`,
          ip_address: clientIP,
          details: {
            email,
            failed_attempts: recentFailures,
            unlock_at: unlockAt
          }
        });

        // Send lockout notification email
        if (RESEND_API_KEY && user) {
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'Melhor Saúde <noreply@onhighmanagment.com>',
                to: [email],
                subject: '🔒 Conta temporariamente bloqueada',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #DC2626;">🔒 Conta Bloqueada</h2>
                    <p>Olá ${user.name || 'utilizador'},</p>
                    <p>A sua conta Melhor Saúde foi temporariamente bloqueada devido a múltiplas tentativas de login falhadas.</p>

                    <div style="margin: 30px 0; padding: 20px; background-color: #FEE2E2; border-left: 4px solid #DC2626; border-radius: 5px;">
                      <strong>Detalhes do bloqueio:</strong><br>
                      <ul style="margin: 10px 0;">
                        <li><strong>Tentativas falhadas:</strong> ${recentFailures}</li>
                        <li><strong>Hora:</strong> ${new Date().toLocaleString('pt-PT')}</li>
                        <li><strong>IP:</strong> ${clientIP}</li>
                        <li><strong>Duração:</strong> ${LOCKOUT_DURATION_MINUTES} minutos</li>
                      </ul>
                    </div>

                    <p>A sua conta será automaticamente desbloqueada em <strong>${LOCKOUT_DURATION_MINUTES} minutos</strong>.</p>

                    <p>Se não reconhece estas tentativas de login:</p>
                    <ol>
                      <li>A sua conta pode estar em risco</li>
                      <li>Redefina a sua palavra-passe imediatamente após o desbloqueio</li>
                      <li>Entre em contacto com o suporte se necessitar de assistência</li>
                    </ol>

                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">
                      Melhor Saúde - Segurança da Conta<br>
                      Este é um email automático, por favor não responda.
                    </p>
                  </div>
                `
              })
            });

            console.log(`Account lockout notification sent to: ${email}`);
          } catch (emailError) {
            logErrorToSentry(emailError as Error, { email });
          }
        }

        return successResponse({
          success: true,
          locked: true,
          unlock_at: unlockAt,
          message: `Account locked after ${recentFailures} failed attempts`,
          remaining_attempts: 0
        });
      }
    }

    // Not locked yet, return remaining attempts
    const remainingAttempts = MAX_FAILED_ATTEMPTS - recentFailures;

    return successResponse({
      success: true,
      locked: false,
      message: 'Login attempt recorded',
      remaining_attempts: remainingAttempts,
      warning: remainingAttempts <= 2 ? `Only ${remainingAttempts} attempts remaining before lockout` : undefined
    });
  }

  // Login failed for non-existent user - just record it
  return successResponse({
    success: true,
    locked: false,
    message: 'Login attempt recorded'
  });
}

serve(withErrorHandling(handler));
