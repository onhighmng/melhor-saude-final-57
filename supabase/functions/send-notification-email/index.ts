import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  message: string
  type: string
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'low_sessions': return 'Sessões Baixas'
    case 'inactive_account': return 'Conta Inativa'
    case 'booking_reminder': return 'Lembrete'
    case 'feedback_received': return 'Feedback'
    default: return 'Notificação'
  }
}

Deno.serve(async (req) => {
  console.log('🔔 Email notification function called:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    console.log('🔐 Checking user authorization...')

    // Verify admin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('❌ No user found')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('👤 User found:', user.email)

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.log('❌ User is not admin:', profile?.role)
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ Admin user verified')

    const { to, subject, message, type }: EmailRequest = await req.json()
    console.log('📧 Email request:', { to, subject, type })

    // Check if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.log('❌ RESEND_API_KEY not found in environment')
      return new Response(JSON.stringify({ 
        error: 'RESEND_API_KEY not configured. Please add it to edge function secrets.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('🔑 RESEND_API_KEY found')

    const resend = new Resend(resendApiKey)
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'notifications@resend.dev'

    console.log('📤 From email:', fromEmail)

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 20px; border: 1px solid #e9ecef; }
            .footer { background: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
            .badge { padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px; font-weight: bold; }
            .low-sessions { background: #ffa500; }
            .inactive { background: #dc3545; }
            .reminder { background: #007bff; }
            .feedback { background: #28a745; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0; color: #495057;">
                🔔 Notificação do Sistema
                <span class="badge ${type.replace('_', '-')}">${getTypeLabel(type)}</span>
              </h2>
            </div>
            <div class="content">
              <div style="white-space: pre-wrap;">${message}</div>
            </div>
            <div class="footer">
              <p>Esta é uma notificação automática do sistema de gestão.<br>
              Por favor, não responda a este email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    console.log('📮 Sending email via Resend...')

    const emailResponse = await resend.emails.send({
      from: `Sistema de Gestão <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: htmlContent,
    })

    console.log('✅ Email sent successfully:', emailResponse)

    // Log the action
    await supabase.rpc('log_admin_action', {
      p_admin_user_id: user.id,
      p_action_type: 'send_notification_email',
      p_target_type: 'email',
      p_details: { 
        recipient: to, 
        subject: subject,
        email_type: type,
        resend_id: emailResponse.data?.id
      }
    })

    console.log('📝 Action logged successfully')

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      message: 'Email enviado com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Error in send-notification-email function:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to send email',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})