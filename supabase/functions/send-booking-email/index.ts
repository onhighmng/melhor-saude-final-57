import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const sendBookingEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).refine(html => !html.includes('<script>'), {
    message: 'Scripts are not allowed in email HTML'
  }),
  type: z.enum(['booking_confirmation', 'booking_cancellation', 'booking_reminder']).optional()
});

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate and parse input
    const body = await req.json();
    const { to, subject, html, type } = sendBookingEmailSchema.parse(body);

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

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid input',
          details: error.errors
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

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
