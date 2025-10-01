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

  if (!['POST', 'PUT'].includes(req.method)) {
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
    const pathParts = url.pathname.split('/');
    const prestadorId = pathParts[2]; // /prestadores/:id/availability
    const availabilityId = pathParts[4]; // /prestadores/:id/availability/:availabilityId

    if (!prestadorId) {
      return new Response(
        JSON.stringify({ error: 'Prestador ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const body = await req.json();

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

    let result;
    let statusCode = 200;

    if (req.method === 'POST') {
      // Create new availability
      const { day_of_week, start_time, end_time, timezone = 'Europe/Lisbon', is_available = true } = body;

      if (day_of_week === undefined || !start_time || !end_time) {
        return new Response(
          JSON.stringify({ error: 'day_of_week, start_time, and end_time are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Validate day_of_week (0-6)
      if (day_of_week < 0 || day_of_week > 6) {
        return new Response(
          JSON.stringify({ error: 'day_of_week must be between 0 (Sunday) and 6 (Saturday)' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Check for overlapping availability on the same day
      const { data: existing } = await supabase
        .from('availability')
        .select('id')
        .eq('prestador_id', prestadorId)
        .eq('day_of_week', day_of_week)
        .lte('start_time', end_time)
        .gte('end_time', start_time);

      if (existing && existing.length > 0) {
        return new Response(
          JSON.stringify({ error: 'Time slot overlaps with existing availability' }),
          { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const { data: availability, error: createError } = await supabase
        .from('availability')
        .insert({
          prestador_id: prestadorId,
          day_of_week,
          start_time,
          end_time,
          timezone,
          is_available
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

      result = { availability, message: 'Availability created successfully' };
      statusCode = 201;

    } else if (req.method === 'PUT') {
      // Update existing availability
      if (!availabilityId) {
        return new Response(
          JSON.stringify({ error: 'Availability ID is required for updates' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Verify availability exists and belongs to prestador
      const { data: existingAvailability, error: availabilityError } = await supabase
        .from('availability')
        .select('id')
        .eq('id', availabilityId)
        .eq('prestador_id', prestadorId)
        .single();

      if (availabilityError || !existingAvailability) {
        return new Response(
          JSON.stringify({ error: 'Availability not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const updates = { ...body, updated_at: new Date().toISOString() };

      const { data: availability, error: updateError } = await supabase
        .from('availability')
        .update(updates)
        .eq('id', availabilityId)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      result = { availability, message: 'Availability updated successfully' };
    }

    console.log('Availability operation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        ...result
      }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in prestador-availability function:', error);
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