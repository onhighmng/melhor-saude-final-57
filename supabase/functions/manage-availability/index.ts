// Edge Function: Manage Prestador Availability
// Manage working hours, breaks, and vacation for prestadores
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { verifyAuth, requireRole, corsHeaders, hasRole } from "../_shared/auth.ts";
import { checkRateLimit, RATE_LIMITS } from "../_shared/rateLimit.ts";
import {
  withErrorHandling,
  handleRateLimitError,
  successResponse
} from "../_shared/errors.ts";

// Input validation schemas
const workingHoursSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  is_available: z.boolean().default(true),
  buffer_before_minutes: z.number().int().min(0).max(60).default(0),
  buffer_after_minutes: z.number().int().min(0).max(60).default(0)
});

const breakSchema = z.object({
  break_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  day_of_week: z.number().int().min(0).max(6).optional(),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  is_recurring: z.boolean().default(false),
  break_type: z.enum(['lunch', 'personal', 'buffer', 'other']).default('other'),
  description: z.string().max(500).optional()
});

const vacationSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  leave_type: z.enum(['vacation', 'sick_leave', 'personal', 'conference', 'training', 'other']),
  reason: z.string().max(500).optional(),
  auto_cancel_bookings: z.boolean().default(true)
});

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify authentication
  const auth = await verifyAuth(req);

  // Only prestadores and admins can manage availability
  if (!hasRole(auth, ['prestador', 'admin'])) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized. Only prestadores can manage availability.',
        code: 'UNAUTHORIZED'
      }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Rate limiting
  const rateLimitResult = checkRateLimit(
    `manage-availability:${auth.userId}`,
    RATE_LIMITS.MODERATE // 20 requests per minute
  );

  if (!rateLimitResult.allowed) {
    return handleRateLimitError(rateLimitResult.resetAt);
  }

  // Create Supabase client
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Get prestador ID for this user
  const { data: prestador, error: prestadorError } = await supabaseAdmin
    .from('prestadores')
    .select('id')
    .eq('user_id', auth.userId)
    .single();

  if (prestadorError || !prestador) {
    return new Response(
      JSON.stringify({
        error: 'Prestador profile not found',
        code: 'PRESTADOR_NOT_FOUND'
      }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const prestadorId = prestador.id;
  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  // ========================================================================
  // WORKING HOURS MANAGEMENT
  // ========================================================================
  if (path === 'working-hours') {
    // GET - List working hours
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('prestador_availability')
        .select('*')
        .eq('prestador_id', prestadorId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch working hours: ${error.message}`);
      }

      return successResponse({ working_hours: data || [] });
    }

    // POST - Add working hours
    if (req.method === 'POST') {
      const body = await req.json();
      const validatedData = workingHoursSchema.parse(body);

      const { error } = await supabaseAdmin
        .from('prestador_availability')
        .insert({
          prestador_id: prestadorId,
          ...validatedData
        });

      if (error) {
        throw new Error(`Failed to add working hours: ${error.message}`);
      }

      return successResponse({
        success: true,
        message: 'Working hours added successfully'
      }, 201);
    }

    // DELETE - Remove working hours
    if (req.method === 'DELETE') {
      const { availability_id } = await req.json();

      const { error } = await supabaseAdmin
        .from('prestador_availability')
        .delete()
        .eq('id', availability_id)
        .eq('prestador_id', prestadorId);

      if (error) {
        throw new Error(`Failed to delete working hours: ${error.message}`);
      }

      return successResponse({
        success: true,
        message: 'Working hours deleted successfully'
      });
    }
  }

  // ========================================================================
  // BREAKS MANAGEMENT
  // ========================================================================
  if (path === 'breaks') {
    // GET - List breaks
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('prestador_breaks')
        .select('*')
        .eq('prestador_id', prestadorId)
        .eq('is_active', true)
        .order('break_date', { ascending: true, nullsFirst: false })
        .order('start_time', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch breaks: ${error.message}`);
      }

      return successResponse({ breaks: data || [] });
    }

    // POST - Add break
    if (req.method === 'POST') {
      const body = await req.json();
      const validatedData = breakSchema.parse(body);

      // Validate recurrence consistency
      if (validatedData.is_recurring && !validatedData.day_of_week) {
        return new Response(
          JSON.stringify({
            error: 'day_of_week is required for recurring breaks',
            code: 'VALIDATION_ERROR'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!validatedData.is_recurring && !validatedData.break_date) {
        return new Response(
          JSON.stringify({
            error: 'break_date is required for one-time breaks',
            code: 'VALIDATION_ERROR'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabaseAdmin
        .from('prestador_breaks')
        .insert({
          prestador_id: prestadorId,
          created_by: auth.userId,
          ...validatedData
        });

      if (error) {
        throw new Error(`Failed to add break: ${error.message}`);
      }

      return successResponse({
        success: true,
        message: 'Break added successfully'
      }, 201);
    }

    // DELETE - Remove break
    if (req.method === 'DELETE') {
      const { break_id } = await req.json();

      const { error } = await supabaseAdmin
        .from('prestador_breaks')
        .update({ is_active: false })
        .eq('id', break_id)
        .eq('prestador_id', prestadorId);

      if (error) {
        throw new Error(`Failed to delete break: ${error.message}`);
      }

      return successResponse({
        success: true,
        message: 'Break deleted successfully'
      });
    }
  }

  // ========================================================================
  // VACATION MANAGEMENT
  // ========================================================================
  if (path === 'vacation') {
    // GET - List vacation
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('prestador_vacation')
        .select('*, approved_by_profile:approved_by(name)')
        .eq('prestador_id', prestadorId)
        .order('start_date', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch vacation: ${error.message}`);
      }

      return successResponse({ vacation: data || [] });
    }

    // POST - Request vacation
    if (req.method === 'POST') {
      const body = await req.json();
      const validatedData = vacationSchema.parse(body);

      // Validate dates
      if (new Date(validatedData.start_date) > new Date(validatedData.end_date)) {
        return new Response(
          JSON.stringify({
            error: 'start_date must be before or equal to end_date',
            code: 'INVALID_DATES'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert vacation request
      const { data: vacation, error } = await supabaseAdmin
        .from('prestador_vacation')
        .insert({
          prestador_id: prestadorId,
          status: 'pending',
          ...validatedData
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to request vacation: ${error.message}`);
      }

      return successResponse({
        success: true,
        vacation_id: vacation.id,
        message: 'Vacation request submitted successfully'
      }, 201);
    }

    // PATCH - Approve/reject vacation (admin only)
    if (req.method === 'PATCH') {
      requireRole(auth, ['admin']);

      const { vacation_id, status, rejection_reason } = await req.json();

      if (!['approved', 'rejected'].includes(status)) {
        return new Response(
          JSON.stringify({
            error: 'Invalid status. Must be "approved" or "rejected"',
            code: 'INVALID_STATUS'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update vacation status
      const { data: vacation, error } = await supabaseAdmin
        .from('prestador_vacation')
        .update({
          status,
          approved_by: auth.userId,
          approved_at: new Date().toISOString(),
          rejection_reason: status === 'rejected' ? rejection_reason : null
        })
        .eq('id', vacation_id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update vacation: ${error.message}`);
      }

      // If approved and auto_cancel_bookings is true, cancel conflicting bookings
      if (status === 'approved' && vacation.auto_cancel_bookings) {
        const { data: cancelResult } = await supabaseAdmin
          .rpc('auto_cancel_vacation_bookings', { p_vacation_id: vacation_id });

        console.log(`Auto-canceled ${cancelResult?.canceled_count || 0} bookings for vacation`);
      }

      return successResponse({
        success: true,
        message: `Vacation ${status} successfully`,
        vacation_id: vacation.id
      });
    }

    // DELETE - Cancel vacation request
    if (req.method === 'DELETE') {
      const { vacation_id } = await req.json();

      const { error } = await supabaseAdmin
        .from('prestador_vacation')
        .update({ status: 'canceled' })
        .eq('id', vacation_id)
        .eq('prestador_id', prestadorId)
        .eq('status', 'pending'); // Can only cancel pending requests

      if (error) {
        throw new Error(`Failed to cancel vacation: ${error.message}`);
      }

      return successResponse({
        success: true,
        message: 'Vacation request canceled successfully'
      });
    }
  }

  return new Response(
    JSON.stringify({ error: 'Endpoint not found' }),
    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

serve(withErrorHandling(handler));
