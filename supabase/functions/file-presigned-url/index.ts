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

    const body = await req.json();
    const { fileName, fileType, fileSize, bucket = 'documents', expiresIn = 300 } = body;

    if (!fileName || !fileType) {
      return new Response(
        JSON.stringify({ error: 'fileName and fileType are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024;
    if (fileSize && fileSize > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File too large. Max size: 100MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Generate unique file path
    const fileExt = fileName.split('.').pop() || '';
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${user.id}/${uniqueFileName}`;

    console.log('Generating presigned URL for:', filePath);

    // Create presigned URL for upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath, {
        expiresIn: expiresIn
      });

    if (uploadError) {
      console.error('Presigned URL error:', uploadError);
      return new Response(
        JSON.stringify({ error: uploadError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Pre-create file record in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('file_uploads')
      .insert({
        user_id: user.id,
        original_filename: fileName,
        stored_filename: uniqueFileName,
        file_path: filePath,
        file_size: fileSize || 0,
        file_type: fileType,
        file_category: 'upload',
        bucket_name: bucket,
        public_url: null, // Will be updated after upload
        is_public: false,
        upload_source: 'presigned'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: dbError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Presigned URL generated successfully');

    return new Response(
      JSON.stringify({
        uploadUrl: uploadData.signedUrl,
        filePath: filePath,
        fileId: fileRecord.id,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
        instructions: {
          method: 'PUT',
          headers: {
            'Content-Type': fileType,
            'Content-Length': fileSize?.toString()
          }
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in file-presigned-url function:', error);
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