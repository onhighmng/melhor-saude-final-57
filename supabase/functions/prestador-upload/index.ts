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
    const fileType = formData.get('fileType') as string; // 'photo' or 'video'

    if (!file || !fileType) {
      return new Response(
        JSON.stringify({ error: 'File and fileType are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate file type
    const allowedTypes = {
      photo: ['image/jpeg', 'image/png', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/mov']
    };

    if (!allowedTypes[fileType as keyof typeof allowedTypes]?.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: `Invalid file type for ${fileType}` }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate file size (5MB for photos, 50MB for videos)
    const maxSizes = { photo: 5 * 1024 * 1024, video: 50 * 1024 * 1024 };
    if (file.size > maxSizes[fileType as keyof typeof maxSizes]) {
      return new Response(
        JSON.stringify({ error: `File too large. Max size: ${maxSizes[fileType as keyof typeof maxSizes] / 1024 / 1024}MB` }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get prestador profile
    const { data: prestador, error: prestadorError } = await supabase
      .from('prestadores')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (prestadorError || !prestador) {
      return new Response(
        JSON.stringify({ error: 'Prestador profile not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Upload file to storage
    const bucket = fileType === 'photo' ? 'prestador-photos' : 'prestador-videos';
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${fileType}-${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
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
      .from(bucket)
      .getPublicUrl(fileName);

    // Update prestador profile with new file URL
    const updateField = fileType === 'photo' ? 'profile_photo_url' : 'video_url';
    const { error: updateError } = await supabase
      .from('prestadores')
      .update({ [updateField]: publicUrl })
      .eq('id', prestador.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`${fileType} uploaded successfully:`, publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        fileType,
        url: publicUrl,
        message: `${fileType} uploaded successfully`
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in prestador-upload function:', error);
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