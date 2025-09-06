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
    const category = formData.get('category') as string || 'video';
    const isPublic = formData.get('isPublic') === 'true';
    const expiresIn = formData.get('expiresIn'); // in hours

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'File is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate file type for videos
    const allowedTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Allowed: MP4, WebM, MOV, AVI, QuickTime' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate file size (100MB max for videos)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File too large. Max size: 100MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'mp4';
    const storedFilename = `video-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${user.id}/${storedFilename}`;

    console.log('Uploading video:', filePath);

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
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

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    // Calculate expiration date
    let expiresAt = null;
    if (expiresIn) {
      const hours = parseInt(expiresIn);
      if (!isNaN(hours) && hours > 0) {
        expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      }
    }

    // Video metadata
    const metadata: any = {
      duration: null, // Would need video processing to extract
      resolution: null,
      format: file.type,
      codec: null
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
            bucket_name: 'videos',
            public_url: publicUrl,
            is_public: isPublic,
            metadata: metadata,
            expires_at: expiresAt,
            upload_source: 'api',
            processing_status: 'completed' // Mark as completed for now
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
        } else {
          console.log('Video record created:', fileRecord.id);
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

    console.log('Video uploaded successfully:', publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        file: {
          id: uploadData.id,
          url: publicUrl,
          path: filePath,
          filename: storedFilename,
          originalFilename: file.name,
          size: file.size,
          type: file.type,
          category: category,
          isPublic: isPublic,
          expiresAt: expiresAt
        },
        message: 'Video uploaded successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in upload-video function:', error);
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