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

  if (req.method !== 'POST') {
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
    const prestadorId = url.pathname.split('/')[2]; // /prestadores/:id/change-requests

    if (!prestadorId) {
      return new Response(
        JSON.stringify({ error: 'Prestador ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const body = await req.json();
    const { field, fieldLabel, currentValue, requestedValue, reason } = body;

    if (!field || !fieldLabel || !currentValue || !requestedValue) {
      return new Response(
        JSON.stringify({ error: 'field, fieldLabel, currentValue, and requestedValue are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Verify prestador exists and user has permission
    const { data: prestador, error: prestadorError } = await supabase
      .from('prestadores')
      .select('user_id, name')
      .eq('id', prestadorId)
      .single();

    if (prestadorError || !prestador) {
      return new Response(
        JSON.stringify({ error: 'Prestador not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check permissions - only the prestador can create change requests for themselves
    if (prestador.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if there's already a pending change request for this field
    const { data: existingRequest } = await supabase
      .from('change_requests')
      .select('id')
      .eq('prestador_id', prestadorId)
      .eq('field', field)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return new Response(
        JSON.stringify({ error: 'There is already a pending change request for this field' }),
        { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Create change request
    const { data: changeRequest, error: createError } = await supabase
      .from('change_requests')
      .insert({
        prestador_id: prestadorId,
        prestador_name: prestador.name,
        field,
        field_label: fieldLabel,
        current_value: currentValue,
        requested_value: requestedValue,
        reason: reason || null
      })
      .select()
      .single();

    if (createError) {
      console.error('Create error:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Change request created successfully:', changeRequest.id);

    return new Response(
      JSON.stringify({
        success: true,
        changeRequest,
        message: 'Change request submitted successfully'
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in prestador-change-requests function:', error);
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