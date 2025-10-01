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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'document';
    const isPublic = formData.get('isPublic') === 'true';
    const expiresIn = formData.get('expiresIn'); // in hours

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'File is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate file type for documents
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/rtf'
    ];

    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, RTF' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate file size (25MB max for documents)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File too large. Max size: 25MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'pdf';
    const storedFilename = `doc-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${user.id}/${storedFilename}`;

    console.log('Uploading document:', filePath);

    // Upload to storage (documents are private by default)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: uploadError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get signed URL for private documents (valid for 1 hour)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600); // 1 hour

    if (urlError) {
      console.error('Signed URL error:', urlError);
    }

    const fileUrl = isPublic ? 
      supabase.storage.from('documents').getPublicUrl(filePath).data.publicUrl :
      signedUrlData?.signedUrl;

    // Calculate expiration date
    let expiresAt = null;
    if (expiresIn) {
      const hours = parseInt(expiresIn);
      if (!isNaN(hours) && hours > 0) {
        expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      }
    }

    // Document metadata
    const metadata: any = {
      pageCount: null, // Would need document processing to extract
      format: file.type,
      size: file.size
    };

    // Record in database using background task
    const backgroundTask = async () => {
      try {
        const { data: fileRecord, error: dbError } = await supabase
          .from('file_uploads')
          .insert({
            user_id: user.id,
            original_filename: file.name,
            stored_filename: storedFilename,
            file_path: filePath,
            file_size: file.size,
            file_type: file.type,
            file_category: category,
            bucket_name: 'documents',
            public_url: fileUrl,
            is_public: isPublic,
            metadata: metadata,
            expires_at: expiresAt,
            upload_source: 'api',
            processing_status: 'completed'
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
        } else {
          console.log('Document record created:', fileRecord.id);
        }
      } catch (error) {
        console.error('Background task error:', error);
      }
    };

    // Start background task
    if (typeof EdgeRuntime !== 'undefined') {
      EdgeRuntime.waitUntil(backgroundTask());
    } else {
      backgroundTask();
    }

    console.log('Document uploaded successfully:', fileUrl);

    return new Response(
      JSON.stringify({
        success: true,
        file: {
          id: uploadData.id,
          url: fileUrl,
          path: filePath,
          filename: storedFilename,
          originalFilename: file.name,
          size: file.size,
          type: file.type,
          category: category,
          isPublic: isPublic,
          expiresAt: expiresAt,
          signedUrl: !isPublic ? signedUrlData?.signedUrl : null
        },
        message: 'Document uploaded successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in upload-document function:', error);
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