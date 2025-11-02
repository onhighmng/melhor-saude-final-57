import React from 'npm:react@18.3.1';
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { PasswordResetEmail } from './_templates/password-reset.tsx';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Webhook payload validation schema
const webhookDataSchema = z.object({
  user: z.object({
    email: z.string().email()
  }),
  email_data: z.object({
    token: z.string().min(1),
    token_hash: z.string().min(1),
    redirect_to: z.string().url(),
    email_action_type: z.string().min(1),
    site_url: z.string().url()
  })
});

// Initialize services - read secrets once at module load time
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? null;
const hookSecret = Deno.env.get('SEND_AUTH_EMAIL_HOOK_SECRET') ?? null;

// Fail-fast logging for missing secrets
if (!hookSecret) {
  console.error('❌ CRITICAL: Missing SEND_AUTH_EMAIL_HOOK_SECRET env var - webhook verification will fail');
}
if (!RESEND_API_KEY) {
  console.warn('⚠️ Missing RESEND_API_KEY env var - emails will not be sent');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Simple in-memory cache for idempotency (prevents duplicate sends for same token_hash)
// In production, consider using Redis or a database table for persistence
const processedTokens = new Map<string, number>(); // token_hash -> timestamp
const TOKEN_CACHE_TTL = 60 * 60 * 1000; // 1 hour TTL

// Helper to check if token was already processed (idempotency)
function isTokenProcessed(tokenHash: string): boolean {
  const processedTime = processedTokens.get(tokenHash);
  if (!processedTime) return false;
  
  // Check if cache entry is still valid
  if (Date.now() - processedTime > TOKEN_CACHE_TTL) {
    processedTokens.delete(tokenHash);
    return false;
  }
  
  return true;
}

// Helper to mark token as processed
function markTokenProcessed(tokenHash: string): void {
  processedTokens.set(tokenHash, Date.now());
  // Cleanup old entries periodically (keep map size manageable)
  if (processedTokens.size > 1000) {
    const now = Date.now();
    for (const [token, time] of processedTokens.entries()) {
      if (now - time > TOKEN_CACHE_TTL) {
        processedTokens.delete(token);
      }
    }
  }
}

Deno.serve(async (req: Request) => {
  // Log method and path upfront for debugging
  console.log('🔔 Auth email hook triggered - method:', req.method, 'path:', new URL(req.url).pathname);
  
  // Accept both POST and GET methods
  if (!['POST', 'GET'].includes(req.method)) {
    console.log('❌ Method not allowed:', req.method);
    return new Response('Method not allowed', { status: 405 });
  }
  
  // Handle GET requests (health checks)
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        method: 'GET',
        service: 'send-auth-email',
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  // POST handling - process webhook
  try {
    // Parse payload
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    // Log request metadata (not sensitive data)
    console.log('📧 Received POST request, payload length:', payload.length);
    console.log('📋 Header keys:', Object.keys(headers).filter(k => !k.toLowerCase().includes('authorization')).join(', '));
    
    // Ensure hookSecret is defined
    if (!hookSecret) {
      console.error('❌ CRITICAL: Missing SEND_AUTH_EMAIL_HOOK_SECRET - cannot verify webhook');
      // Return 200 to prevent Auth hook retries, but abort processing
      return new Response(
        JSON.stringify({ 
          status: 'ok',
          error: 'Server misconfiguration (logged)'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Verify webhook signature with error handling
    let webhookData: {
      user: {
        email: string;
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
      };
    };
    
    try {
      const wh = new Webhook(hookSecret);
      const verifiedData = wh.verify(payload, headers);

      // Validate webhook data structure with Zod
      webhookData = webhookDataSchema.parse(verifiedData);
      console.log('✅ Webhook signature verified and payload validated successfully');
      // METRIC: verified_success (could be tracked in production)
    } catch (webhookError: any) {
      // CRITICAL: Log verification failure with high severity for alerting
      // Structured log for easy filtering/monitoring
      console.error('❌ SECURITY: Webhook verification failed', JSON.stringify({
        verification: 'failed',
        error: webhookError.message || 'Invalid signature',
        payload_length: payload.length,
        timestamp: new Date().toISOString(),
        // METRIC: verified_failed - trigger alerting in production
      }));
      // Return 200 to Auth to prevent retries, but abort all processing
      // This is safe because we abort background work if signature fails
      return new Response(
        JSON.stringify({ 
          status: 'ok',
          message: 'Webhook processed (verification failed - logged)',
          verification_failed: true
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { user, email_data } = webhookData;
    const { email_action_type, token_hash, redirect_to } = email_data;

    // Log safely - redact sensitive tokens
    console.log('📬 Email action type:', email_action_type);
    console.log('👤 Processing email for user:', user.email ? `${user.email.substring(0, 3)}***` : 'unknown');
    console.log('🔐 Token hash (redacted):', token_hash ? `${token_hash.substring(0, 10)}...` : 'none');

    // Only handle password recovery emails
    if (email_action_type !== 'recovery') {
      console.log('⏭️  Skipping non-recovery email (type:', email_action_type, ')');
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          message: 'Not a recovery email',
          email_action_type 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // IDEMPOTENCY CHECK: Prevent duplicate email sends for the same token
    if (isTokenProcessed(token_hash)) {
      console.log('⏭️  Token already processed (idempotency check) - skipping duplicate send');
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          message: 'Email already sent for this token',
          idempotent: true
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Mark token as processing (idempotency safeguard)
    markTokenProcessed(token_hash);

    // Respond quickly to Auth hook, then process email in background
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=recovery&redirect_to=${redirect_to}`;

    // Background task to send email (non-blocking)
    const sendEmailTask = async () => {
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      try {
        console.log(`🔄 [${taskId}] Background: Starting email send process for user:`, user.email ? `${user.email.substring(0, 3)}***` : 'unknown');

        // Render React Email template
        const html = await renderAsync(
          React.createElement(PasswordResetEmail, {
            confirmationUrl,
            email: user.email,
          })
        );

        console.log(`✉️  [${taskId}] Background: Sending password reset email via Resend...`);

        if (!resend) {
          console.warn(`⚠️ [${taskId}] Background: RESEND_API_KEY not configured, email not sent`);
          return;
        }

        const { data, error } = await resend.emails.send({
          from: 'Melhor Saúde <onboarding@resend.dev>',
          to: [user.email],
          subject: 'Recuperar Palavra-passe - Melhor Saúde',
          html,
        });

        if (error) {
          console.error(`❌ [${taskId}] Background: Resend error:`, error);
          // METRIC: Email send failed (could be tracked in production)
          return;
        }

        console.log(`✅ [${taskId}] Background: Email sent successfully, ID:`, data?.id);
        // METRIC: Email sent successfully (could be tracked in production)
      } catch (bgError: any) {
        console.error(`❌ [${taskId}] Background: Email send task error:`, bgError.message || bgError);
        // METRIC: Background task error (could be tracked in production)
      }
    };

    // Use EdgeRuntime.waitUntil if available, otherwise fallback to fire-and-forget
    // This ensures background task completes even after response is sent
    try {
      // Check for EdgeRuntime.waitUntil (Cloudflare Workers / Supabase Edge Functions)
      // @ts-ignore - EdgeRuntime may be available in some runtimes
      const globalThisAny = globalThis as any;
      if (globalThisAny.EdgeRuntime && typeof globalThisAny.EdgeRuntime.waitUntil === 'function') {
        globalThisAny.EdgeRuntime.waitUntil(sendEmailTask());
        console.log('✅ Using EdgeRuntime.waitUntil for background task');
      } else if (typeof Deno !== 'undefined' && 'serve' in Deno) {
        // Deno Deploy pattern - start task, response completes first
        const promise = sendEmailTask();
        promise.catch(err => {
          console.error('❌ Background email task failed:', err.message || err);
        });
        // Note: Deno Deploy keeps execution context alive for pending promises
        console.log('✅ Using Deno Deploy background task pattern');
      } else {
        // Fallback: fire-and-forget
        sendEmailTask().catch(err => {
          console.error('❌ Background email task failed:', err.message || err);
        });
        console.log('⚠️ Using fallback background task pattern');
      }
    } catch (runtimeError: any) {
      // If runtime detection fails, use fallback
      console.warn('⚠️ Runtime detection failed, using fallback:', runtimeError.message);
      sendEmailTask().catch(err => {
        console.error('❌ Background email task failed:', err.message || err);
      });
    }

    // Respond immediately - email sending happens in background
    return new Response(
      JSON.stringify({ 
        status: 'ok',
        success: true, 
        message: 'Password reset email queued for sending'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('❌ Handler error:', err.message || err);
    // Always return 200 to prevent Auth hook retries
    return new Response(
      JSON.stringify({ 
        status: 'ok',
        error: 'Internal server error (logged)'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
