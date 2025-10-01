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

    // Extract userId from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check permissions
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, company')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Users can only view their own bookings unless they're admin, HR, or prestador
    if (userId !== user.id && profile.role !== 'admin' && profile.role !== 'hr' && profile.role !== 'prestador') {
      return new Response(
        JSON.stringify({ error: 'Can only view your own bookings' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get query parameters for filtering
    const searchParams = url.searchParams;
    const status = searchParams.get('status');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const prestadorId = searchParams.get('prestadorId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('Fetching bookings for user:', userId);

    // Build the query based on user role
    let query;

    if (profile.role === 'prestador') {
      // If user is a prestador, get bookings for their services
      const { data: prestadorData } = await supabase
        .from('prestadores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (prestadorData) {
        query = supabase
          .from('bookings')
          .select(`
            *,
            user:profiles!inner(name, email),
            prestador:prestadores!inner(name, email),
            pillar_specialty:pillar_specialties(pillar_name, specialty_name),
            session_usage:session_usage(session_type, notes)
          `)
          .eq('prestador_id', prestadorData.id);
      } else {
        return new Response(
          JSON.stringify({ bookings: [], message: 'Prestador profile not found' }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    } else {
      // Regular user or admin viewing specific user's bookings
      query = supabase
        .from('bookings')
        .select(`
          *,
          prestador:prestadores!inner(name, email, profile_photo_url),
          pillar_specialty:pillar_specialties(pillar_name, specialty_name),
          session_usage:session_usage(session_type, notes)
        `)
        .eq('user_id', userId);
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (fromDate) {
      query = query.gte('booking_date', fromDate);
    }

    if (toDate) {
      query = query.lte('booking_date', toDate);
    }

    if (prestadorId) {
      query = query.eq('prestador_id', prestadorId);
    }

    // Apply pagination and ordering
    query = query
      .order('booking_date', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return new Response(
        JSON.stringify({ error: bookingsError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get booking statistics
    const { data: stats } = await supabase
      .from('bookings')
      .select('status, count(*)', { count: 'exact' })
      .eq(profile.role === 'prestador' ? 'prestador_id' : 'user_id', 
          profile.role === 'prestador' ? 
            (await supabase.from('prestadores').select('id').eq('user_id', user.id).single()).data?.id || '' : 
            userId);

    const bookingStats = {
      total: bookings?.length || 0,
      scheduled: bookings?.filter(b => b.status === 'scheduled').length || 0,
      confirmed: bookings?.filter(b => b.status === 'confirmed').length || 0,
      completed: bookings?.filter(b => b.status === 'completed').length || 0,
      cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0
    };

    console.log('Bookings fetched:', bookings?.length, 'records');

    return new Response(
      JSON.stringify({
        bookings: bookings || [],
        stats: bookingStats,
        pagination: {
          limit,
          offset,
          total: bookings?.length || 0
        },
        filters: {
          status,
          fromDate,
          toDate,
          prestadorId
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in booking-list function:', error);
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