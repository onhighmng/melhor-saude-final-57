// Supabase Edge Function to send emails
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  try {
    const { to, subject, html, type } = await req.json()

    console.log(`[EMAIL ${type}]`, { to, subject })

    // Send email via Resend API
    if (RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Melhor Saúde <noreply@onhighmanagment.com>',
          to,
          subject,
          html
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(`Resend API error: ${result.message || result.error}`)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: result.id,
          message: 'Email sent successfully',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      // Fallback if API key is not configured
      console.warn('RESEND_API_KEY not configured, email not sent')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email would be sent (RESEND_API_KEY not configured)',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
  } catch (error: any) {
    console.error('Error sending email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

