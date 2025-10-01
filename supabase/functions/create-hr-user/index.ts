import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.1";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateHRUserRequest {
  email: string;
  password: string;
  companyName: string;
  loginUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, companyName, loginUrl }: CreateHRUserRequest = await req.json();

    console.log(`Creating HR user: ${email} for company: ${companyName}`);

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser.users.some(user => user.email === email);

    if (userExists) {
      // User already exists, try to update their role instead
      const existingUserData = existingUser.users.find(user => user.email === email);
      
      if (existingUserData) {
        // Update profile with HR role and company link
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert([{
            user_id: existingUserData.id,
            name: `HR ${companyName}`,
            role: 'hr',
            company: companyName,
            email
          }], { onConflict: 'user_id' });
        if (profileError) {
          console.error("Error updating existing user profile:", profileError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: `Utilizador com email ${email} já existe, mas não foi possível atualizar o papel para HR. Contacte o administrador.`
          }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        console.log("Existing user updated to HR role successfully");

        // Send welcome email for existing user
        try {
          const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
          
          const emailResponse = await resend.emails.send({
            from: "Sistema Melhor Saúde <onboarding@resend.dev>",
            to: [email],
            subject: `Acesso HR atribuído - ${companyName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #1a365d;">Acesso HR Atribuído</h1>
                
                <p>Olá,</p>
                
                <p>A sua conta no Sistema Melhor Saúde foi atualizada com acesso HR para a empresa <strong>${companyName}</strong>.</p>
                
                <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1a365d; margin-top: 0;">As suas credenciais de acesso:</h3>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Link de acesso:</strong> <a href="${loginUrl}" style="color: #3182ce;">${loginUrl}</a></p>
                  <p><em>Use a sua palavra-passe atual para fazer login.</em></p>
                </div>
                
                <p>Como utilizador HR, agora tem acesso a:</p>
                <ul>
                  <li>Gestão de utilizadores da sua empresa</li>
                  <li>Alocação de sessões para colaboradores</li>
                  <li>Relatórios de utilização</li>
                  <li>Histórico de sessões da empresa</li>
                </ul>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 14px;">
                  Este email foi enviado automaticamente pelo Sistema Melhor Saúde.
                </p>
              </div>
            `,
          });

          console.log("HR access notification email sent successfully:", emailResponse);
        } catch (emailError) {
          console.error("Error sending notification email:", emailError);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          user: existingUserData,
          message: "Utilizador existente atualizado para HR com sucesso",
          isExistingUser: true
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
    }

    // Create HR user with auto-verification
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { 
        name: `HR ${companyName}`,
        company: companyName
      }
    });

    if (authError) {
      console.error("Error creating auth user:", authError);

      if (authError.message?.includes("already been registered")) {
        console.log("User already registered. Attempting to upgrade existing profile by email...");
        // Try to find existing profile by email and upgrade to HR
        const { data: existingProfile, error: profileLookupError } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('email', email)
          .maybeSingle();

        if (profileLookupError) {
          console.error("Profile lookup error:", profileLookupError);
        }

        if (existingProfile?.user_id) {
          const { error: upgradeError } = await supabaseAdmin
            .from('profiles')
            .upsert([{
              user_id: existingProfile.user_id,
              name: `HR ${companyName}`,
              role: 'hr',
              company: companyName,
              email
            }], { onConflict: 'user_id' });

          if (!upgradeError) {
            // Send notification email
            try {
              const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
              await resend.emails.send({
                from: `Melhor Saúde <${Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev'}>`,
                to: [email],
                subject: `Acesso HR atribuído - ${companyName}`,
                html: `<p>O seu acesso HR foi atribuído. Pode entrar em: <a href="${loginUrl}">${loginUrl}</a></p>`
              });
            } catch (emailError) {
              console.error("Error sending HR upgrade email:", emailError);
            }

            return new Response(JSON.stringify({
              success: true,
              message: "Utilizador existente atualizado para HR com sucesso",
              isExistingUser: true
            }), {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          }
        }

        return new Response(JSON.stringify({
          success: false,
          error: `O email ${email} já está registado. O sistema não conseguiu atualizar o perfil automaticamente. Peça ao utilizador para iniciar sessão uma vez (para criar o perfil) ou contacte o administrador.`
        }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      throw authError;
    }
    console.log("Auth user created successfully:", authUser.user.id);

    // Ensure profile exists and set HR role/company
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert([{
        user_id: authUser.user.id,
        name: `HR ${companyName}`,
        role: 'hr',
        company: companyName,
        email
      }], { onConflict: 'user_id' });
    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }

    console.log("Profile updated successfully");

    // Send welcome email
    try {
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
      
      const emailResponse = await resend.emails.send({
        from: `Melhor Saúde <${Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev'}>`,
        to: [email],
        subject: `Bem-vindo ao Sistema Melhor Saúde - ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a365d;">Bem-vindo ao Sistema Melhor Saúde</h1>
            
            <p>Olá,</p>
            
            <p>Foi criada uma conta HR para si no Sistema Melhor Saúde para a empresa <strong>${companyName}</strong>.</p>
            
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin-top: 0;">As suas credenciais de acesso:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Palavra-passe:</strong> ${password}</p>
              <p><strong>Link de acesso:</strong> <a href="${loginUrl}" style="color: #3182ce;">${loginUrl}</a></p>
            </div>
            
            <p><strong>Por motivos de segurança, recomendamos que altere a sua palavra-passe após o primeiro login.</strong></p>
            
            <p>Como utilizador HR, terá acesso a:</p>
            <ul>
              <li>Gestão de utilizadores da sua empresa</li>
              <li>Alocação de sessões para colaboradores</li>
              <li>Relatórios de utilização</li>
              <li>Histórico de sessões da empresa</li>
            </ul>
            
            <p>Se tiver alguma questão ou precisar de ajuda, não hesite em contactar-nos.</p>
            
            <p>Bem-vindo à equipa!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; font-size: 14px;">
              Este email foi enviado automaticamente pelo Sistema Melhor Saúde.<br>
              Se não solicitou esta conta, pode ignorar este email.
            </p>
          </div>
        `,
      });

      console.log("Welcome email sent successfully:", emailResponse);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't throw error as user creation was successful
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: authUser.user,
      message: "HR user created successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in create-hr-user function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to create HR user" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);