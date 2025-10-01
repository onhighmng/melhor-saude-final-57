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

  if (req.method !== 'PUT') {
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
    const prestadorId = url.pathname.split('/')[2]; // /prestadores/:id/update

    if (!prestadorId) {
      return new Response(
        JSON.stringify({ error: 'Prestador ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const body = await req.json();
    const updates = body;

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

    // Check permissions
    const isOwner = prestador.user_id === user.id;
    const isAdmin = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (!isOwner && !isAdmin.data) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Filter allowed fields for non-admin updates
    let allowedUpdates = { ...updates };
    if (!isAdmin.data) {
      // Non-admin users can only update certain fields
      const allowedFields = [
        'name', 'email', 'phone', 'bio', 'profile_photo_url', 
        'video_url', 'specialties', 'languages', 'certifications'
      ];
      allowedUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key];
          return obj;
        }, {} as any);
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid fields to update' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Add updated_at timestamp
    allowedUpdates.updated_at = new Date().toISOString();

    // Update prestador
    const { data: updatedPrestador, error: updateError } = await supabase
      .from('prestadores')
      .update(allowedUpdates)
      .eq('id', prestadorId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Log admin action if admin updated
    if (isAdmin.data && !isOwner) {
      await supabase.rpc('log_admin_action', {
        p_admin_user_id: user.id,
        p_action_type: 'prestador_update',
        p_target_type: 'prestador',
        p_target_id: prestadorId,
        p_details: { 
          updated_fields: Object.keys(allowedUpdates),
          prestador_name: prestador.name
        }
      });
    }

    console.log('Prestador updated successfully:', prestadorId);

    return new Response(
      JSON.stringify({
        success: true,
        prestador: updatedPrestador,
        message: 'Prestador updated successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in prestador-update function:', error);
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