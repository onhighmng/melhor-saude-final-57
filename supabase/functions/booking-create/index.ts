import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateBookingRequest {
  prestadorId: string;
  pillarSpecialtyId?: string;
  bookingDate: string;
  duration?: number;
  sessionType?: 'individual' | 'group' | 'emergency';
  notes?: string;
  useSessionType?: 'company' | 'personal';
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

    const requestData: CreateBookingRequest = await req.json();
    console.log('Creating booking:', requestData);

    // Validate required fields
    if (!requestData.prestadorId || !requestData.bookingDate) {
      return new Response(
        JSON.stringify({ error: 'prestadorId and bookingDate are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const bookingDate = new Date(requestData.bookingDate);
    const duration = requestData.duration || 60;
    const sessionType = requestData.sessionType || 'individual';
    const useSessionType = requestData.useSessionType || 'company';

    // Check if the booking date is in the future
    if (bookingDate <= new Date()) {
      return new Response(
        JSON.stringify({ error: 'Booking date must be in the future' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Verify prestador exists and is approved
    const { data: prestador, error: prestadorError } = await supabase
      .from('prestadores')
      .select('id, name, is_active, is_approved')
      .eq('id', requestData.prestadorId)
      .single();

    if (prestadorError || !prestador) {
      return new Response(
        JSON.stringify({ error: 'Prestador not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!prestador.is_active || !prestador.is_approved) {
      return new Response(
        JSON.stringify({ error: 'Prestador is not available for bookings' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check availability using the database function
    const { data: isAvailable, error: availabilityError } = await supabase
      .rpc('check_booking_availability', {
        p_prestador_id: requestData.prestadorId,
        p_booking_date: bookingDate.toISOString(),
        p_duration: duration
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

    // Use a session if the user has available sessions
    let sessionUsageId = null;
    try {
      const { data: usageId, error: sessionError } = await supabase
        .rpc('use_session', {
          p_user_id: user.id,
          p_allocation_type: useSessionType,
          p_session_type: sessionType,
          p_session_date: bookingDate.toISOString(),
          p_prestador_id: requestData.prestadorId,
          p_notes: `Booking for ${prestador.name} on ${bookingDate.toISOString()}`
        });

      if (!sessionError && usageId) {
        sessionUsageId = usageId;
        console.log('Session used for booking:', usageId);
      } else {
        console.log('No available sessions, booking without session usage');
      }
    } catch (error) {
      console.log('Could not use session, proceeding with booking:', error);
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        prestador_id: requestData.prestadorId,
        session_usage_id: sessionUsageId,
        pillar_specialty_id: requestData.pillarSpecialtyId,
        booking_date: bookingDate.toISOString(),
        duration: duration,
        session_type: sessionType,
        notes: requestData.notes,
        status: 'scheduled'
      })
      .select(`
        *,
        prestador:prestadores!inner(name, email),
        pillar_specialty:pillar_specialties(pillar_name, specialty_name)
      `)
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return new Response(
        JSON.stringify({ error: bookingError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Send FCM notifications
    const notifications = [
      {
        user_id: user.id,
        title: 'Sessão Confirmada',
        body: `Sua sessão com ${booking.prestador.name} foi confirmada para ${new Date(booking.booking_date).toLocaleDateString('pt-PT')}`,
        booking_id: booking.id,
      },
      {
        user_id: prestador.user_id,
        title: 'Nova Sessão Agendada',
        body: `Nova sessão agendada para ${new Date(booking.booking_date).toLocaleDateString('pt-PT')}`,
        booking_id: booking.id,
      }
    ];

    // Send notifications using FCM service
    for (const notification of notifications) {
      try {
        await supabase.functions.invoke('notification-send', {
          body: notification
        });
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }

    console.log('Booking created successfully:', booking.id);

    return new Response(
      JSON.stringify({
        success: true,
        booking,
        sessionUsed: !!sessionUsageId,
        message: 'Booking created successfully'
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in booking-create function:', error);
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