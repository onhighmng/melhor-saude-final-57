import React from 'npm:react@18.3.1';
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { PasswordResetEmail } from './_templates/password-reset.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
const hookSecret = Deno.env.get('SEND_AUTH_EMAIL_HOOK_SECRET') as string;

Deno.serve(async (req) => {
  console.log('🔔 Auth email hook triggered');
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    console.log('📧 Processing auth email webhook...');
    
    // Verify webhook signature
    const wh = new Webhook(hookSecret);
    const webhookData = wh.verify(payload, headers) as {
      user: {
        email: string;
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
      };
    };

    const { user, email_data } = webhookData;
    const { email_action_type, token_hash, redirect_to } = email_data;

    console.log('📬 Email action type:', email_action_type);
    console.log('👤 User email:', user.email);

    // Only handle password recovery emails
    if (email_action_type !== 'recovery') {
      console.log('⏭️  Skipping non-recovery email');
      return new Response(JSON.stringify({ message: 'Not a recovery email' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build confirmation URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=recovery&redirect_to=${redirect_to}`;

    console.log('🔗 Confirmation URL generated');

    // Render React Email template
    const html = await renderAsync(
      React.createElement(PasswordResetEmail, {
        confirmationUrl,
        email: user.email,
      })
    );

    console.log('✉️  Sending password reset email via Resend...');

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Melhor Saúde <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Recuperar Palavra-passe - Melhor Saúde',
      html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw error;
    }

    console.log('✅ Email sent successfully:', data?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset email sent',
        emailId: data?.id 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error in send-auth-email function:', error);
    
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
