import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteAdminRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Set auth for the client
    await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
    
    const { email, name }: InviteAdminRequest = await req.json();

    console.log("Admin invitation request:", { email, name });

    // Validate input
    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Valid email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseClient
      .from("profiles")
      .select("id, email, role")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return new Response(JSON.stringify({ 
        error: `User with email ${email} already exists with role: ${existingUser.role}` 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if invitation already exists and is still valid
    const { data: existingInvitation } = await supabaseClient
      .from("admin_invitations")
      .select("id, expires_at")
      .eq("email", email)
      .is("used_at", null)
      .maybeSingle();

    if (existingInvitation && new Date(existingInvitation.expires_at) > new Date()) {
      return new Response(JSON.stringify({ 
        error: "An active invitation already exists for this email" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get current user info
    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Generate invitation token
    const invitationToken = crypto.randomUUID();

    // Create invitation record
    const { data: invitation, error: inviteError } = await supabaseClient
      .from("admin_invitations")
      .insert({
        email,
        invited_by: user.id,
        invitation_token: invitationToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Error creating invitation:", inviteError);
      return new Response(JSON.stringify({ error: "Failed to create invitation" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send invitation email
    const signupUrl = `https://xn--melhorsade-udb.com/cadastrar?invitation=${invitationToken}`;
    
    const { error: emailError } = await resend.emails.send({
      from: "Melhor Saúde <noreply@onhighmanagment.com>",
      to: [email],
      subject: "Convite para Administrador - Melhor Saúde",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; font-size: 28px; margin: 0;">🔐 Melhor Saúde</h1>
              <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">Convite para Administrador</p>
            </div>

            <!-- Welcome Message -->
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 15px;">Olá!</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                Foi convidado para se juntar à <strong>Melhor Saúde</strong> como administrador da plataforma.
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                Como administrador, terá acesso completo ao painel de controlo e poderá gerir utilizadores, prestadores, e todas as funcionalidades da plataforma.
              </p>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin-bottom: 30px;">
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
                Clique no botão abaixo para criar a sua conta de administrador:
              </p>
              <a href="${signupUrl}" 
                 style="display: inline-block; background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Criar Conta de Administrador
              </a>
            </div>

            <!-- Expiry Notice -->
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                ⚠️ <strong>Importante:</strong> Este convite expira em 7 dias. Certifique-se de criar a sua conta antes desta data.
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Este convite foi enviado pela equipa Melhor Saúde.<br>
                Se não esperava este email, pode ignorá-lo com segurança.
              </p>
            </div>

          </div>
        </div>
      `
    });

    if (emailError) {
      console.error("Error sending invitation email:", emailError);
      // Don't fail the request if email fails, the invitation is still created
    }

    console.log("Admin invitation sent successfully:", { email, invitationId: invitation.id });

    return new Response(JSON.stringify({ 
      success: true,
      message: "Admin invitation sent successfully",
      invitationId: invitation.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in admin invite function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);