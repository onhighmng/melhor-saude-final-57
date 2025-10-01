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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const url = new URL(req.url);
    const prestadorId = url.pathname.split('/')[2]; // /prestadores/:id/bookings

    if (!prestadorId) {
      return new Response(
        JSON.stringify({ error: 'Prestador ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get query parameters
    const status = url.searchParams.get('status');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Verify prestador exists and user has permission
    const { data: prestador, error: prestadorError } = await supabase
      .from('prestadores')
      .select('user_id')
      .eq('id', prestadorId)
      .single();

    if (prestadorError || !prestador) {
      return new Response(
        JSON.stringify({ error: 'Prestador not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check permissions
    const isOwner = prestador.user_id === user.id;
    const isAdmin = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (!isOwner && !isAdmin.data) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Build query
    let query = supabase
      .from('bookings')
      .select(`
        *,
        profiles!inner(name, email),
        pillar_specialties(specialty_name, pillar_name)
      `)
      .eq('prestador_id', prestadorId)
      .order('booking_date', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('booking_date', startDate);
    }

    if (endDate) {
      query = query.lte('booking_date', endDate);
    }

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError) {
      console.error('Bookings query error:', bookingsError);
      return new Response(
        JSON.stringify({ error: bookingsError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get count for pagination
    let countQuery = supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('prestador_id', prestadorId);

    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    if (startDate) {
      countQuery = countQuery.gte('booking_date', startDate);
    }
    if (endDate) {
      countQuery = countQuery.lte('booking_date', endDate);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Count query error:', countError);
    }

    console.log('Prestador bookings retrieved successfully');

    return new Response(
      JSON.stringify({
        bookings: bookings || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in prestador-bookings function:', error);
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