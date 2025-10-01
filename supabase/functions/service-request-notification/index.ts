import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ServiceRequestData {
  serviceName: string;
  userName: string;
  userEmail: string;
  message?: string;
  requestId: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const fromEmail = Deno.env.get("FROM_EMAIL") || "noreply@melhor-saude.com";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { serviceName, userName, userEmail, message, requestId }: ServiceRequestData = await req.json();

    console.log("Processing service request notification:", { serviceName, userName, userEmail, requestId });

    // Get admin emails
    const { data: adminProfiles, error: adminError } = await supabase
      .from('profiles')
      .select('email')
      .eq('role', 'admin')
      .eq('is_active', true);

    if (adminError) {
      console.error("Error fetching admin profiles:", adminError);
      throw new Error("Failed to fetch admin contacts");
    }

    const adminEmails = adminProfiles?.map(profile => profile.email) || [];

    if (adminEmails.length === 0) {
      console.error("No admin emails found");
      throw new Error("No admin contacts available");
    }

    // Send notification to admins
    const adminEmailResponse = await resend.emails.send({
      from: fromEmail,
      to: adminEmails,
      subject: `Nova Solicitação de Serviço: ${serviceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nova Solicitação de Serviço Extra</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">${serviceName}</h3>
            <p><strong>Cliente:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            ${message ? `<p><strong>Mensagem:</strong></p><p style="background-color: white; padding: 10px; border-radius: 4px;">${message}</p>` : ''}
          </div>
          
          <p>Para responder a esta solicitação, envie um email diretamente para <strong>${userEmail}</strong>.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p>Esta é uma notificação automática do sistema Melhor Saúde.</p>
            <p>ID da solicitação: ${requestId}</p>
          </div>
        </div>
      `,
    });

    console.log("Admin notification sent:", adminEmailResponse);

    // Send confirmation to user
    const userEmailResponse = await resend.emails.send({
      from: fromEmail,
      to: [userEmail],
      subject: `Solicitação Recebida: ${serviceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Solicitação Recebida com Sucesso</h2>
          
          <p>Olá ${userName},</p>
          
          <p>Recebemos a sua solicitação para o serviço:</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="margin-top: 0; color: #065f46;">${serviceName}</h3>
            ${message ? `<p><strong>Sua mensagem:</strong></p><p style="background-color: white; padding: 10px; border-radius: 4px;">${message}</p>` : ''}
          </div>
          
          <p>Nossa equipe analisará a sua solicitação e entrará em contato em breve através deste email para discutir os detalhes e próximos passos.</p>
          
          <p>Agradecemos o seu interesse nos nossos serviços!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p>Atenciosamente,<br>Equipe Melhor Saúde</p>
            <p>ID da solicitação: ${requestId}</p>
          </div>
        </div>
      `,
    });

    console.log("User confirmation sent:", userEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notifications sent successfully",
        adminEmailResponse,
        userEmailResponse 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in service-request-notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);