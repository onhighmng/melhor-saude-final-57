import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { PasswordResetEmail } from './_templates/password-reset.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PasswordResetRequest {
  email: string
  reset_link: string
  token: string
  user_name?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Password reset email function called')
    
    if (!Deno.env.get('RESEND_API_KEY')) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const { email, reset_link, token, user_name }: PasswordResetRequest = await req.json()
    
    console.log(`Sending password reset email to: ${email}`)

    // Render the React email template
    const html = await renderAsync(
      React.createElement(PasswordResetEmail, {
        user_name,
        reset_link,
        token,
      })
    )

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: Deno.env.get('FROM_EMAIL') || 'Fruitful <no-reply@fruitful.pt>',
      to: [email],
      subject: 'Redefinir a sua palavra-passe - Fruitful',
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Password reset email sent successfully:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset email sent successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('Error in password reset email function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})