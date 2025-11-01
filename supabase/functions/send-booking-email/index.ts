import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// JWT parsing helper
function parseJWT(authHeader: string | null): { userId: string; role: string } | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  try {
    const token = authHeader.substring(7) // Remove 'Bearer '
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    return {
      userId: payload.sub,
      role: payload.user_role || payload.role || 'user'
    }
  } catch {
    return null
  }
}

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  type?: 'booking_confirmation' | 'booking_cancellation' | 'booking_reminder';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ Parse JWT properly
    const authHeader = req.headers.get('Authorization')
    const jwt = parseJWT(authHeader)

    if (!jwt) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid or missing JWT' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { to, subject, html, type }: EmailRequest = await req.json();

    console.log(`Sending ${type || 'generic'} email to ${to}`);

    // If RESEND_API_KEY is not configured, log and return success (development mode)
    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email would have been sent to:', to);
      console.warn('Subject:', subject);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent (development mode - no actual email sent)',
          id: 'dev-mode-' + Date.now()
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Melhor Saúde <noreply@onhighmanagment.com>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Resend API error:', error);
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await res.json();
    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, ...data }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in send-booking-email function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
