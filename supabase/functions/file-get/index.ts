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
    const fileId = url.pathname.split('/').pop();

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'File ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get file details
    const { data: file, error: fileError } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError || !file) {
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check access permissions
    const isOwner = file.user_id === user.id;
    const isPublic = file.is_public;
    const isAdmin = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (!isOwner && !isPublic && !isAdmin.data) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Track access
    await supabase.rpc('track_file_access', { p_file_id: fileId });

    // Get download URL from storage
    const { data: downloadData } = supabase.storage
      .from(file.bucket_name)
      .getPublicUrl(file.file_path);

    console.log('File accessed successfully:', fileId);

    return new Response(
      JSON.stringify({
        file: {
          ...file,
          downloadUrl: downloadData.publicUrl
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in file-get function:', error);
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