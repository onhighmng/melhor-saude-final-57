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

    // Users can only view their own history unless they're admin or HR
    if (userId !== user.id && profile.role !== 'admin' && profile.role !== 'hr') {
      return new Response(
        JSON.stringify({ error: 'Can only view your own session history' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get query parameters for pagination and filtering
    const searchParams = url.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sessionType = searchParams.get('sessionType');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    console.log('Fetching session history for user:', userId);

    // Build the query
    let query = supabase
      .from('session_usage')
      .select(`
        *,
        session_allocation_id,
        session_allocations!inner(
          allocation_type,
          company_plan_id,
          allocated_by
        )
      `)
      .eq('user_id', userId)
      .order('session_date', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (sessionType) {
      query = query.eq('session_type', sessionType);
    }

    if (fromDate) {
      query = query.gte('session_date', fromDate);
    }

    if (toDate) {
      query = query.lte('session_date', toDate);
    }

    const { data: sessionHistory, error: historyError } = await query;

    if (historyError) {
      console.error('Error fetching session history:', historyError);
      return new Response(
        JSON.stringify({ error: historyError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get session allocations for the user
    const { data: allocations, error: allocationsError } = await supabase
      .from('session_allocations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (allocationsError) {
      console.error('Error fetching session allocations:', allocationsError);
    }

    // Get current balance
    const { data: balance } = await supabase
      .rpc('calculate_user_session_balance', {
        p_user_id: userId
      });

    console.log('Session history fetched:', sessionHistory?.length, 'records');

    return new Response(
      JSON.stringify({
        userId,
        sessionHistory: sessionHistory || [],
        sessionAllocations: allocations || [],
        currentBalance: balance?.[0] || null,
        pagination: {
          limit,
          offset,
          total: sessionHistory?.length || 0
        },
        filters: {
          sessionType,
          fromDate,
          toDate
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in session-history function:', error);
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