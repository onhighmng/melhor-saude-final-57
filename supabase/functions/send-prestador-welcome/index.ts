import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { name, email, password }: WelcomeEmailRequest = await req.json();

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: "Name, email, and password are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use the actual application URL
    const baseUrl = 'https://xn--melhorsade-udb.com';
    const loginUrl = `${baseUrl}/entrar`;

    const emailResponse = await resend.emails.send({
      from: Deno.env.get("FROM_EMAIL") || "Sistema <noreply@yourdomain.com>",
      to: [email],
      subject: "Bem-vindo à Plataforma - Credenciais de Acesso",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">Bem-vindo à Nossa Plataforma!</h1>
          
          <p>Olá <strong>${name}</strong>,</p>
          
          <p>A sua conta de prestador foi criada com sucesso! Pode agora aceder à plataforma utilizando as seguintes credenciais:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Credenciais de Acesso:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Palavra-passe:</strong> ${password}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h4 style="margin-top: 0; color: #92400e;">Acesso Restrito:</h4>
            <p style="margin-bottom: 0; color: #92400e;">A sua conta de prestador tem acesso exclusivo ao painel de prestador (/prestador/dashboard). Não poderá aceder a outras páginas da plataforma. Após o login, será automaticamente redirecionado para o seu painel.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Iniciar Sessão Agora
            </a>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #475569;">Próximos Passos:</h4>
            <ol style="color: #475569; margin-bottom: 0;">
              <li>Faça login em <strong>${loginUrl}</strong> utilizando as credenciais acima</li>
              <li>Será automaticamente redirecionado para /prestador/dashboard</li>
              <li>Complete o seu perfil no painel de prestador</li>
              <li>Configure a sua integração com Calendly (se aplicável)</li>
              <li>Aguarde a aprovação da administração para começar a receber marcações</li>
              <li><strong>Importante:</strong> Altere a sua palavra-passe após o primeiro login</li>
            </ol>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          
          <p style="color: #64748b; font-size: 14px;">
            Se tiver alguma dúvida ou precisar de ajuda, não hesite em contactar-nos.<br>
            <strong>Importante:</strong> Recomendamos que altere a sua palavra-passe após o primeiro login.
          </p>
          
          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">
            Este email foi enviado automaticamente. Por favor não responda a este email.
          </p>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Welcome email sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-prestador-welcome function:", error);
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