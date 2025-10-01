import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateStatusRequest {
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  cancellationReason?: string;
  prestadorNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'PUT') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Extract booking ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const bookingId = pathParts[pathParts.length - 2]; // /bookings/:id/status

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'Booking ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const requestData: UpdateStatusRequest = await req.json();
    console.log('Updating booking status:', bookingId, requestData);

    // Validate required fields
    if (!requestData.status) {
      return new Response(
        JSON.stringify({ error: 'Status is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get the existing booking
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        *,
        prestador:prestadores!inner(user_id, name)
      `)
      .eq('id', bookingId)
      .single();

    if (fetchError || !existingBooking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check permissions
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Only allow booking owner, prestador, or admin to update status
    const isBookingOwner = existingBooking.user_id === user.id;
    const isPrestador = existingBooking.prestador.user_id === user.id;
    const isAdmin = profile.role === 'admin';

    if (!isBookingOwner && !isPrestador && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to update this booking' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate status transitions
    const currentStatus = existingBooking.status;
    const newStatus = requestData.status;

    // Define allowed status transitions
    const allowedTransitions: Record<string, string[]> = {
      'scheduled': ['confirmed', 'cancelled', 'rescheduled'],
      'confirmed': ['completed', 'cancelled', 'no_show', 'rescheduled'],
      'completed': [], // Completed bookings cannot be changed
      'cancelled': ['scheduled'], // Can reschedule cancelled bookings
      'no_show': [],
      'rescheduled': []
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      return new Response(
        JSON.stringify({ 
          error: `Cannot change status from ${currentStatus} to ${newStatus}`,
          allowedTransitions: allowedTransitions[currentStatus] || []
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Prepare update data
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    if (requestData.cancellationReason) {
      updateData.cancellation_reason = requestData.cancellationReason;
    }

    if (requestData.prestadorNotes) {
      updateData.prestador_notes = requestData.prestadorNotes;
    }

    // Update the booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select(`
        *,
        prestador:prestadores!inner(name, email),
        pillar_specialty:pillar_specialties(pillar_name, specialty_name)
      `)
      .single();

    if (updateError) {
      console.error('Error updating booking:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Send FCM notification for status change
    const notification = {
      user_id: isPrestador ? existingBooking.user_id : existingBooking.prestador.user_id,
      title: `Sessão ${newStatus === 'confirmed' ? 'Confirmada' : newStatus === 'cancelled' ? 'Cancelada' : 'Atualizada'}`,
      body: `Sua sessão foi ${newStatus === 'confirmed' ? 'confirmada' : newStatus === 'cancelled' ? 'cancelada' : 'atualizada'}`,
      booking_id: bookingId,
    };

    try {
      await supabase.functions.invoke('notification-send', {
        body: notification
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    // Handle session deduction for completed sessions
    if (newStatus === 'completed' && !existingBooking.session_usage_id) {
      try {
        // Use session automatically when booking is completed
        const { data: sessionUsageId, error: sessionError } = await supabase.rpc('use_session', {
          p_user_id: existingBooking.user_id,
          p_allocation_type: 'company', // Default to company sessions first
          p_session_type: existingBooking.session_type || 'individual',
          p_session_date: existingBooking.booking_date,
          p_prestador_id: existingBooking.prestador_id,
          p_notes: `Session completed via booking ${bookingId}`
        });

        if (sessionError) {
          // Try personal sessions if company sessions are not available
          const { data: personalSessionUsageId, error: personalSessionError } = await supabase.rpc('use_session', {
            p_user_id: existingBooking.user_id,
            p_allocation_type: 'personal',
            p_session_type: existingBooking.session_type || 'individual',
            p_session_date: existingBooking.booking_date,
            p_prestador_id: existingBooking.prestador_id,
            p_notes: `Session completed via booking ${bookingId} (personal session)`
          });

          if (!personalSessionError && personalSessionUsageId) {
            // Update booking with personal session usage ID
            await supabase
              .from('bookings')
              .update({ session_usage_id: personalSessionUsageId })
              .eq('id', bookingId);

            console.log('Session deducted successfully (personal):', personalSessionUsageId);
          } else {
            console.error('No available sessions to deduct:', sessionError, personalSessionError);
          }
        } else if (sessionUsageId) {
          // Update booking with company session usage ID
          await supabase
            .from('bookings')
            .update({ session_usage_id: sessionUsageId })
            .eq('id', bookingId);

          console.log('Session deducted successfully (company):', sessionUsageId);
        }
      } catch (error) {
        console.error('Error deducting session:', error);
      }
    }

    // If booking is cancelled or no-show, handle session refund
    if ((newStatus === 'cancelled' || newStatus === 'no_show') && existingBooking.session_usage_id) {
      try {
        // Mark the session usage as refunded for cancelled sessions
        // For no-show, we typically don't refund, but this can be configured
        if (newStatus === 'cancelled') {
          await supabase
            .from('session_usage')
            .update({ 
              session_status: 'refunded',
              notes: `${existingBooking.notes || ''} - Refunded due to cancellation`.trim()
            })
            .eq('id', existingBooking.session_usage_id);

          console.log('Session refunded due to cancellation:', existingBooking.session_usage_id);
        }
      } catch (error) {
        console.error('Error handling session refund:', error);
      }
    }

    console.log('Booking status updated successfully:', bookingId, newStatus);

    return new Response(
      JSON.stringify({
        success: true,
        booking: updatedBooking,
        previousStatus: currentStatus,
        message: `Booking status updated to ${newStatus}`
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in booking-update-status function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);