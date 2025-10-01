import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UseSessionRequest {
  userId?: string;
  allocationType?: 'company' | 'personal';
  sessionType?: 'individual' | 'group' | 'emergency';
  sessionDate?: string;
  prestadorId?: string;
  notes?: string;
  sessionDuration?: number;
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

    const requestData: UseSessionRequest = await req.json();
    console.log('Using session:', requestData);

    // Use current user ID if not specified (for self-service)
    const targetUserId = requestData.userId || user.id;
    const allocationType = requestData.allocationType || 'company';
    const sessionType = requestData.sessionType || 'individual';
    const sessionDate = requestData.sessionDate || new Date().toISOString();

    // Check permissions - users can only use their own sessions unless they're admin
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

    // Only allow using sessions for own account unless admin
    if (targetUserId !== user.id && profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Can only use your own sessions' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Use the database function to use a session
    const { data: usageId, error: usageError } = await supabase
      .rpc('use_session', {
        p_user_id: targetUserId,
        p_allocation_type: allocationType,
        p_session_type: sessionType,
        p_session_date: sessionDate,
        p_prestador_id: requestData.prestadorId || null,
        p_notes: requestData.notes || null,
      });

    if (usageError) {
      console.error('Error using session:', usageError);
      return new Response(
        JSON.stringify({ error: usageError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Update session duration if provided
    if (requestData.sessionDuration && usageId) {
      await supabase
        .from('session_usage')
        .update({ session_duration: requestData.sessionDuration })
        .eq('id', usageId);
    }

    console.log('Session used successfully, usage ID:', usageId);

    // Get updated balance
    const { data: balance } = await supabase
      .rpc('calculate_user_session_balance', {
        p_user_id: targetUserId
      });

    return new Response(
      JSON.stringify({
        success: true,
        usageId,
        balance: balance?.[0] || null,
        message: `Successfully used a ${allocationType} session`
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in session-use function:', error);
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