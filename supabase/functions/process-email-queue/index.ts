import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { Resend } from 'npm:resend@4.0.0'
import { corsHeaders } from "../_shared/auth.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get pending emails from queue (limit to 10 per run)
    // Include scheduled emails that are due now
    const { data: pendingEmails, error: fetchError } = await supabaseAdmin
      .from('email_queue')
      .select('*')
      .in('status', ['pending', 'failed'])
      .lt('attempts', 3)
      .or(`scheduled_for.is.null,scheduled_for.lte.${new Date().toISOString()}`)
      .order('created_at', { ascending: true })
      .limit(10)

    if (fetchError) {
      console.error('Error fetching emails:', fetchError)
      throw fetchError
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No pending emails to process',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing ${pendingEmails.length} emails...`)

    let successCount = 0
    let failureCount = 0

    // Process each email
    for (const email of pendingEmails) {
      try {
        // Update status to sending
        await supabaseAdmin
          .from('email_queue')
          .update({ 
            status: 'sending',
            attempts: email.attempts + 1,
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', email.id)

        // Check if Resend is configured
        if (!resend) {
          console.warn(`⚠️ RESEND_API_KEY not configured, skipping email ${email.id}`)
          await supabaseAdmin
            .from('email_queue')
            .update({ 
              status: 'failed',
              error_message: 'RESEND_API_KEY not configured'
            })
            .eq('id', email.id)
          failureCount++
          continue
        }

        // Send email via Resend
        const { data: sendData, error: sendError } = await resend.emails.send({
          from: 'Melhor Saúde <onboarding@resend.dev>',
          to: [email.recipient_email],
          subject: email.subject,
          html: email.body_html,
        })

        if (sendError) {
          console.error(`Error sending email ${email.id}:`, sendError)
          
          // Mark as failed
          await supabaseAdmin
            .from('email_queue')
            .update({ 
              status: 'failed',
              error_message: JSON.stringify(sendError)
            })
            .eq('id', email.id)
          
          failureCount++
        } else {
          console.log(`✅ Email ${email.id} sent successfully, Resend ID:`, sendData?.id)
          
          // Mark as sent
          await supabaseAdmin
            .from('email_queue')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString(),
              error_message: null
            })
            .eq('id', email.id)
          
          successCount++
        }
      } catch (emailError: any) {
        console.error(`Exception processing email ${email.id}:`, emailError)
        
        // Mark as failed
        await supabaseAdmin
          .from('email_queue')
          .update({ 
            status: 'failed',
            error_message: emailError.message || 'Unknown error'
          })
          .eq('id', email.id)
        
        failureCount++
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Processed ${pendingEmails.length} emails`,
        processed: pendingEmails.length,
        succeeded: successCount,
        failed: failureCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Error processing email queue:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

