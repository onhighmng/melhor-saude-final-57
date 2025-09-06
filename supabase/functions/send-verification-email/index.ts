import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    console.log("Auth webhook called for email processing");
    
    const payload = await req.text();
    console.log("Webhook payload received:", payload);
    
    const webhookData = JSON.parse(payload);
    console.log("Parsed webhook data:", webhookData);

    // Check if this is a password recovery request
    if (webhookData.email_data?.email_action_type === 'recovery') {
      console.log("Password recovery detected - suppressing welcome email");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Password recovery detected - welcome email suppressed",
        suppressed: true
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let userEmail = "";
    let userName = "";
    
    // Handle different webhook formats
    if (webhookData.user && webhookData.user.email) {
      userEmail = webhookData.user.email;
      userName = webhookData.user.user_metadata?.name || webhookData.user.email.split('@')[0];
    } else if (webhookData.email) {
      userEmail = webhookData.email;
      userName = webhookData.name || userEmail.split('@')[0];
    } else {
      console.error("No email found in webhook data");
      return new Response(JSON.stringify({ error: "No email found" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Processing welcome email for:", userEmail);

    // Check if we have the Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("Email service not configured");
    }
    console.log("Resend API key is available");
    const welcomeEmail = {
      from: "Melhor Saúde <noreply@onhighmanagment.com>",
      to: [userEmail],
      subject: "Bem-vindo à Melhor Saúde! 🌟",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; font-size: 28px; margin: 0;">🌟 Melhor Saúde</h1>
              <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">A sua jornada para uma vida mais saudável começa aqui</p>
            </div>

            <!-- Welcome Message -->
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 15px;">Olá, ${userName}! 👋</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                Bem-vindo à <strong>Melhor Saúde</strong>! Estamos muito felizes por se ter juntado à nossa comunidade de bem-estar e saúde.
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                A sua conta foi criada com sucesso e já pode começar a explorar todos os nossos serviços de saúde e bem-estar.
              </p>
            </div>

            <!-- Features -->
            <div style="background-color: #f3f4f6; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
              <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 20px;">✨ O que pode fazer na nossa plataforma:</h3>
              <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li><strong>Agendar Consultas:</strong> Marque sessões com profissionais especializados</li>
                <li><strong>Acesso a Especialistas:</strong> Psicologia, Medicina, Nutrição e muito mais</li>
                <li><strong>Acompanhamento Personalizado:</strong> Planos de saúde adaptados às suas necessidades</li>
                <li><strong>Recursos Educativos:</strong> Guias e conteúdos para uma vida mais saudável</li>
              </ul>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin-bottom: 30px;">
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
                Pronto para começar? Faça login na sua conta e explore tudo o que temos para oferecer!
              </p>
              <a href="https://xn--melhorsade-udb.com/entrar" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Aceder à Minha Conta
              </a>
            </div>

            <!-- Support -->
            <div style="border-top: 2px solid #e5e7eb; padding-top: 25px;">
              <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">🤝 Precisa de Ajuda?</h3>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
                A nossa equipa de apoio está sempre disponível para o ajudar. Se tiver alguma questão ou precisar de assistência, não hesite em contactar-nos.
              </p>
              <p style="color: #6b7280; font-size: 14px;">
                <strong>Email:</strong> apoio@melhorsaude.com<br>
                <strong>Telefone:</strong> +351 XXX XXX XXX
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Este email foi enviado automaticamente pelo sistema Melhor Saúde.<br>
                © 2025 Melhor Saúde. Todos os direitos reservados.
              </p>
            </div>

          </div>
        </div>
      `
    };

    const { error } = await resend.emails.send(welcomeEmail);

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Welcome email sent successfully to:", userEmail);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Welcome email sent successfully",
      email: userEmail 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in welcome email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);