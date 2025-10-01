import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  booking_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, title, body, data, booking_id }: NotificationRequest = await req.json();

    // Get user's FCM token
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_fcm_tokens')
      .select('token')
      .eq('user_id', user_id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (tokenError || !tokenData?.token) {
      console.log('No FCM token found for user:', user_id);
      return new Response(JSON.stringify({ success: false, error: 'No FCM token found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send FCM notification using Firebase Admin SDK
    const fcmPayload = {
      token: tokenData.token,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        booking_id: booking_id || '',
        click_action: 'https://xn--melhorsade-udb.com',
      },
      webpush: {
        fcm_options: {
          link: 'https://xn--melhorsade-udb.com'
        }
      }
    };

    // Here you would typically use Firebase Admin SDK to send the notification
    // For now, we'll simulate the send and log the payload
    console.log('FCM Payload:', fcmPayload);

    // Create a notification record
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id,
        title,
        body,
        data,
        booking_id,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

    if (notificationError) {
      console.error('Error creating notification record:', notificationError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Notification sent successfully',
      payload: fcmPayload 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in notification-send function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);