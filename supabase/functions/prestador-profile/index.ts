import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const prestadorId = pathParts[pathParts.length - 2]; // /prestadores/:id/profile

    if (!prestadorId) {
      return new Response(
        JSON.stringify({ error: 'Prestador ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Fetching prestador profile:', prestadorId);

    // Get prestador profile with related data
    const { data: prestador, error: prestadorError } = await supabase
      .from('prestadores')
      .select(`
        *,
        specialties,
        prestador_cases!inner(
          id,
          case_title,
          specialty_area,
          difficulty_level,
          case_status,
          session_count
        )
      `)
      .eq('id', prestadorId)
      .eq('is_active', true)
      .single();

    if (prestadorError || !prestador) {
      return new Response(
        JSON.stringify({ error: 'Prestador not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get specialty details
    let specialtyDetails = [];
    if (prestador.specialties && prestador.specialties.length > 0) {
      const { data: specialties } = await supabase
        .from('pillar_specialties')
        .select('*')
        .in('id', prestador.specialties);
      specialtyDetails = specialties || [];
    }

    // Get availability schedule
    const { data: availability } = await supabase
      .from('availability')
      .select('*')
      .eq('prestador_id', prestadorId)
      .eq('is_available', true)
      .order('day_of_week')
      .order('start_time');

    // Get recent bookings count
    const { data: bookingsStats } = await supabase
      .from('bookings')
      .select('status, count(*)', { count: 'exact' })
      .eq('prestador_id', prestadorId)
      .gte('booking_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const stats = {
      totalCases: prestador.prestador_cases?.length || 0,
      completedCases: prestador.prestador_cases?.filter(c => c.case_status === 'completed').length || 0,
      activeCases: prestador.prestador_cases?.filter(c => c.case_status === 'active').length || 0,
      recentBookings: bookingsStats?.length || 0
    };

    console.log('Prestador profile fetched successfully');

    return new Response(
      JSON.stringify({
        prestador: {
          ...prestador,
          specialtyDetails,
          availability: availability || [],
          stats
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in prestador-profile function:', error);
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