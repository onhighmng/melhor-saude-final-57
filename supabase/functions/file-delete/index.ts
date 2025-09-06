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

  if (req.method !== 'DELETE') {
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

    // Check permissions - only owner or admin can delete
    const isOwner = file.user_id === user.id;
    const isAdmin = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (!isOwner && !isAdmin.data) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(file.bucket_name)
      .remove([file.file_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('file_uploads')
      .delete()
      .eq('id', fileId);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return new Response(
        JSON.stringify({ error: dbError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Log admin action if admin deleted the file
    if (isAdmin.data && !isOwner) {
      await supabase.rpc('log_admin_action', {
        p_admin_user_id: user.id,
        p_action_type: 'file_delete',
        p_target_type: 'file',
        p_target_id: fileId,
        p_details: { filename: file.original_filename, owner_id: file.user_id }
      });
    }

    console.log('File deleted successfully:', fileId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'File deleted successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in file-delete function:', error);
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