// Edge Function: Manage User Sessions
// View and revoke active sessions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { verifyAuth, requireRole, corsHeaders } from "../_shared/auth.ts";
import { checkRateLimit, RATE_LIMITS } from "../_shared/rateLimit.ts";
import {
  withErrorHandling,
  handleRateLimitError,
  successResponse
} from "../_shared/errors.ts";

// Input validation schemas
const revokeSessionSchema = z.object({
  session_id: z.string().uuid(),
  revoke_all: z.boolean().optional()
});

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify authentication
  const auth = await verifyAuth(req);

  // Rate limiting per user
  const rateLimitResult = checkRateLimit(
    `manage-sessions:${auth.userId}`,
    RATE_LIMITS.GENEROUS // 100 requests per minute
  );

  if (!rateLimitResult.allowed) {
    return handleRateLimitError(rateLimitResult.resetAt);
  }

  // Create Supabase client with user's auth
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // GET - List active sessions
  if (req.method === 'GET') {
    const { data: sessions, error } = await supabaseAdmin
      .from('user_sessions')
      .select('id, device_fingerprint, ip_address, user_agent, created_at, last_activity_at, expires_at, is_active, login_method, country, city')
      .eq('user_id', auth.userId)
      .eq('is_active', true)
      .order('last_activity_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }

    // Enhance with "current session" detection (simplified)
    const enhancedSessions = sessions?.map(session => ({
      ...session,
      is_current: false // TODO: Could detect by comparing tokens if needed
    }));

    return successResponse({
      sessions: enhancedSessions || [],
      total: enhancedSessions?.length || 0
    });
  }

  // DELETE - Revoke session(s)
  if (req.method === 'DELETE') {
    const body = await req.json();
    const { session_id, revoke_all } = revokeSessionSchema.parse(body);

    if (revoke_all) {
      // Revoke all sessions except current (if we can identify it)
      const { error } = await supabaseAdmin
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', auth.userId)
        .eq('is_active', true);

      if (error) {
        throw new Error(`Failed to revoke sessions: ${error.message}`);
      }

      // Log security event
      await supabaseAdmin.from('security_logs').insert({
        user_id: auth.userId,
        event_type: 'sessions_revoked_all',
        severity: 'medium',
        description: 'User revoked all active sessions',
        details: { revoked_by: auth.userId }
      });

      return successResponse({
        success: true,
        message: 'All sessions revoked successfully',
        revoked_count: 'all'
      });
    } else {
      // Revoke specific session
      // First verify the session belongs to this user
      const { data: session } = await supabaseAdmin
        .from('user_sessions')
        .select('id, user_id')
        .eq('id', session_id)
        .single();

      if (!session || session.user_id !== auth.userId) {
        return new Response(
          JSON.stringify({
            error: 'Session not found or unauthorized',
            code: 'SESSION_NOT_FOUND'
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Revoke the session
      const { error } = await supabaseAdmin
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', session_id);

      if (error) {
        throw new Error(`Failed to revoke session: ${error.message}`);
      }

      // Log security event
      await supabaseAdmin.from('security_logs').insert({
        user_id: auth.userId,
        event_type: 'session_revoked',
        severity: 'low',
        description: 'User revoked a session',
        details: {
          session_id,
          revoked_by: auth.userId
        }
      });

      return successResponse({
        success: true,
        message: 'Session revoked successfully'
      });
    }
  }

  // POST - Create/track new session (called after login)
  if (req.method === 'POST') {
    const body = await req.json();
    const createSessionSchema = z.object({
      device_fingerprint: z.string().max(500).optional(),
      login_method: z.enum(['email', 'oauth', 'magic_link', 'sso']).optional()
    });

    const { device_fingerprint, login_method } = createSessionSchema.parse(body);

    // Get client info
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                      req.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = req.headers.get('user-agent') || '';

    // Create session token (in production, use the actual JWT)
    const sessionToken = crypto.randomUUID();

    // Calculate expiry (24 hours)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Insert session record
    const { data: session, error } = await supabaseAdmin
      .from('user_sessions')
      .insert({
        user_id: auth.userId,
        session_token: sessionToken,
        device_fingerprint,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt,
        login_method: login_method || 'email',
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    // Track device fingerprint if provided
    if (device_fingerprint) {
      // Check if this is a known device
      const { data: knownDevice } = await supabaseAdmin
        .from('user_device_fingerprints')
        .select('id, login_count, is_trusted')
        .eq('user_id', auth.userId)
        .eq('fingerprint_hash', device_fingerprint)
        .single();

      if (knownDevice) {
        // Update last seen
        await supabaseAdmin
          .from('user_device_fingerprints')
          .update({
            last_seen_at: new Date().toISOString(),
            login_count: knownDevice.login_count + 1,
            is_trusted: knownDevice.login_count >= 3 // Trust after 3 successful logins
          })
          .eq('id', knownDevice.id);
      } else {
        // New device
        await supabaseAdmin
          .from('user_device_fingerprints')
          .insert({
            user_id: auth.userId,
            fingerprint_hash: device_fingerprint,
            user_agent: userAgent,
            first_seen_ip: ipAddress,
            is_trusted: false
          });

        // Log security event for new device
        await supabaseAdmin.from('security_logs').insert({
          user_id: auth.userId,
          event_type: 'new_device_login',
          severity: 'low',
          description: 'Login from new device',
          ip_address: ipAddress,
          user_agent: userAgent,
          details: { device_fingerprint }
        });
      }
    }

    return successResponse({
      success: true,
      session_id: session.id,
      expires_at: session.expires_at,
      message: 'Session created successfully'
    }, 201);
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

serve(withErrorHandling(handler));
