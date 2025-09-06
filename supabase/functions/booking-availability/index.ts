import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
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

    // Extract prestador ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const prestadorId = pathParts[pathParts.length - 1];

    if (!prestadorId) {
      return new Response(
        JSON.stringify({ error: 'Prestador ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get query parameters
    const searchParams = url.searchParams;
    const dateStr = searchParams.get('date');
    const duration = parseInt(searchParams.get('duration') || '60');
    const daysAhead = parseInt(searchParams.get('daysAhead') || '30');

    console.log('Fetching availability for prestador:', prestadorId);

    // Verify prestador exists and is approved
    const { data: prestador, error: prestadorError } = await supabase
      .from('prestadores')
      .select('id, name, is_active, is_approved')
      .eq('id', prestadorId)
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

    let availabilityData;

    if (dateStr) {
      // Get availability for a specific date
      const requestedDate = new Date(dateStr);
      
      const { data: slots, error: slotsError } = await supabase
        .rpc('get_available_slots', {
          p_prestador_id: prestadorId,
          p_date: requestedDate.toISOString().split('T')[0],
          p_duration: duration
        });

      if (slotsError) {
        console.error('Error fetching available slots:', slotsError);
        return new Response(
          JSON.stringify({ error: slotsError.message }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      availabilityData = {
        date: dateStr,
        slots: slots || [],
        prestadorId,
        duration
      };
    } else {
      // Get availability for the next N days
      const today = new Date();
      const availability = [];

      for (let i = 0; i < daysAhead; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];

        const { data: slots } = await supabase
          .rpc('get_available_slots', {
            p_prestador_id: prestadorId,
            p_date: dateString,
            p_duration: duration
          });

        const availableSlots = (slots || []).filter(slot => slot.is_available);

        if (availableSlots.length > 0) {
          availability.push({
            date: dateString,
            dayOfWeek: currentDate.getDay(),
            availableSlots: availableSlots.length,
            slots: availableSlots
          });
        }
      }

      availabilityData = {
        prestadorId,
        duration,
        daysAhead,
        availability
      };
    }

    // Get prestador's general availability schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('availability')
      .select('*')
      .eq('prestador_id', prestadorId)
      .eq('is_available', true)
      .order('day_of_week')
      .order('start_time');

    if (scheduleError) {
      console.error('Error fetching schedule:', scheduleError);
    }

    // Get existing bookings for context
    const { data: upcomingBookings } = await supabase
      .from('bookings')
      .select('booking_date, duration, status')
      .eq('prestador_id', prestadorId)
      .in('status', ['scheduled', 'confirmed'])
      .gte('booking_date', new Date().toISOString())
      .order('booking_date');

    console.log('Availability data fetched successfully');

    return new Response(
      JSON.stringify({
        ...availabilityData,
        generalSchedule: schedule || [],
        upcomingBookings: upcomingBookings || [],
        prestador: {
          id: prestador.id,
          name: prestador.name
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in booking-availability function:', error);
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