import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RescheduleRequest {
  newBookingDate: string;
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
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
    const bookingId = pathParts[pathParts.length - 2]; // /bookings/reschedule/:id

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'Booking ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const requestData: RescheduleRequest = await req.json();
    console.log('Rescheduling booking:', bookingId, requestData);

    // Validate required fields
    if (!requestData.newBookingDate) {
      return new Response(
        JSON.stringify({ error: 'newBookingDate is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const newBookingDate = new Date(requestData.newBookingDate);

    // Check if the new booking date is in the future
    if (newBookingDate <= new Date()) {
      return new Response(
        JSON.stringify({ error: 'New booking date must be in the future' }),
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

    // Only allow booking owner, prestador, or admin to reschedule
    const isBookingOwner = existingBooking.user_id === user.id;
    const isPrestador = existingBooking.prestador.user_id === user.id;
    const isAdmin = profile.role === 'admin';

    if (!isBookingOwner && !isPrestador && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to reschedule this booking' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if booking can be rescheduled
    const reschedulableStatuses = ['scheduled', 'confirmed'];
    if (!reschedulableStatuses.includes(existingBooking.status)) {
      return new Response(
        JSON.stringify({ 
          error: `Cannot reschedule booking with status: ${existingBooking.status}`,
          reschedulableStatuses
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check availability for the new time slot
    const { data: isAvailable, error: availabilityError } = await supabase
      .rpc('check_booking_availability', {
        p_prestador_id: existingBooking.prestador_id,
        p_booking_date: newBookingDate.toISOString(),
        p_duration: existingBooking.duration,
        p_exclude_booking_id: bookingId
      });

    if (availabilityError) {
      console.error('Error checking availability:', availabilityError);
      return new Response(
        JSON.stringify({ error: 'Error checking availability' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!isAvailable) {
      return new Response(
        JSON.stringify({ error: 'Prestador is not available at the requested time' }),
        { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Update the existing booking to mark it as rescheduled
    await supabase
      .from('bookings')
      .update({
        status: 'rescheduled',
        cancellation_reason: `Rescheduled to ${newBookingDate.toISOString()}. Reason: ${requestData.reason || 'No reason provided'}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    // Create a new booking with the new date
    const { data: newBooking, error: createError } = await supabase
      .from('bookings')
      .insert({
        user_id: existingBooking.user_id,
        prestador_id: existingBooking.prestador_id,
        session_usage_id: existingBooking.session_usage_id,
        pillar_specialty_id: existingBooking.pillar_specialty_id,
        booking_date: newBookingDate.toISOString(),
        duration: existingBooking.duration,
        session_type: existingBooking.session_type,
        notes: existingBooking.notes,
        status: 'scheduled',
        rescheduled_from: bookingId
      })
      .select(`
        *,
        prestador:prestadores!inner(name, email),
        pillar_specialty:pillar_specialties(pillar_name, specialty_name)
      `)
      .single();

    if (createError) {
      console.error('Error creating rescheduled booking:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Update session usage record if exists
    if (existingBooking.session_usage_id) {
      await supabase
        .from('session_usage')
        .update({
          session_date: newBookingDate.toISOString(),
          notes: `Rescheduled booking. Original date: ${existingBooking.booking_date}. ${existingBooking.notes || ''}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBooking.session_usage_id);
    }

    // Create notifications for both parties
    const notifications = [
      {
        booking_id: newBooking.id,
        notification_type: 'reschedule',
        recipient_type: 'user',
        recipient_id: existingBooking.user_id
      },
      {
        booking_id: newBooking.id,
        notification_type: 'reschedule',
        recipient_type: 'prestador',
        recipient_id: existingBooking.prestador.user_id
      }
    ];

    await supabase
      .from('booking_notifications')
      .insert(notifications);

    console.log('Booking rescheduled successfully:', bookingId, '->', newBooking.id);

    return new Response(
      JSON.stringify({
        success: true,
        originalBooking: { id: bookingId, status: 'rescheduled' },
        newBooking,
        message: 'Booking rescheduled successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in booking-reschedule function:', error);
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