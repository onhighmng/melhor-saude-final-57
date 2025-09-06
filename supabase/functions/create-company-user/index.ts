import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@4.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'hr';
  company: string;
  companySessions: number;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role client for admin operations
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Use anon client to verify admin permissions
    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify admin role
    const { data: { user } } = await supabaseAnon.auth.getUser()
    if (!user) {
      console.log('No authenticated user found')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: profile } = await supabaseAnon
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.log('User is not admin:', profile)
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const body: CreateUserRequest = await req.json()
    const { name, email, password, role = 'user', company, companySessions = 0 } = body

    console.log('Creating user with data:', { name, email, role, company, companySessions })

    if (!name || !email || !password || !company) {
      return new Response(JSON.stringify({ 
        error: 'Name, email, password, and company are required',
        received: { name: !!name, email: !!email, password: !!password, company: !!company }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Validate company exists
    const { data: companyExists } = await supabaseServiceRole
      .from('company_organizations')
      .select('company_name')
      .eq('company_name', company)
      .eq('is_active', true)
      .single()

    if (!companyExists) {
      console.log('Company not found:', company)
      return new Response(JSON.stringify({ error: `Company '${company}' not found or inactive` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Step 1: Create user in auth.users with verified email and password
    console.log('Creating auth user...')
    const { data: authUser, error: authError } = await supabaseServiceRole.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-verify email
      user_metadata: { 
        name,
        company,
        role 
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      const anyErr: any = authError as any
      const msg = anyErr?.message || 'Failed to create user account'
      const code = anyErr?.code || anyErr?.status
      // Handle duplicate email explicitly with a proper status code
      if (anyErr?.code === 'email_exists' || anyErr?.status === 422 || String(msg).toLowerCase().includes('already been registered')) {
        console.log('Email already exists, attempting to assign existing user to company...')
        // Try to find existing profile by email
        const { data: existingProfile, error: lookupErr } = await supabaseServiceRole
          .from('profiles')
          .select('user_id, name, role, company, is_active, created_at, email')
          .eq('email', email)
          .maybeSingle()
        
        let targetUserId = existingProfile?.user_id
        
        if (!targetUserId) {
          // Fallback: search auth users list for the email
          const { data: usersList } = await supabaseServiceRole.auth.admin.listUsers()
          targetUserId = usersList?.users?.find((u: any) => u.email === email)?.id
        }
        
        if (!targetUserId) {
          return new Response(JSON.stringify({ 
            error: 'Email already registered',
            code: 'email_exists',
            message: 'Este email já está registado e não foi possível localizar o utilizador para atualização.'
          }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
        
        // Upsert profile with new company/role
        const { data: upserted, error: upsertErr } = await supabaseServiceRole
          .from('profiles')
          .upsert([{ 
            user_id: targetUserId,
            name,
            email,
            company,
            role: role as any,
            is_active: true
          }], { onConflict: 'user_id' })
          .select()
          .single()
        
        if (upsertErr) {
          console.error('Failed to upsert existing user profile:', upsertErr)
          return new Response(JSON.stringify({ error: 'Falha ao atualizar o utilizador existente.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
        
        // Allocate sessions if requested
        if (companySessions > 0) {
          await supabaseServiceRole.from('session_allocations').insert({
            user_id: targetUserId,
            allocation_type: 'company',
            sessions_allocated: companySessions,
            sessions_used: 0,
            allocated_by: user.id,
            reason: 'Initial company allocation',
            is_active: true
          })
        }
        
        // Log admin action
        await supabaseServiceRole.rpc('log_admin_action', {
          p_admin_user_id: user.id,
          p_action_type: 'assign_existing_user_to_company',
          p_target_type: 'user',
          p_target_id: targetUserId,
          p_details: { name, email, company, role, companySessions }
        })
        
        // Notify existing user (no password included)
        try {
          const fromEmail = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev'
          const loginUrl = `https://xn--melhorsade-udb.com/`
          await resend.emails.send({
            from: `Melhor Saúde <${fromEmail}>`,
            to: [email],
            subject: `Atribuição à empresa ${company}`,
            html: `<p>Olá ${name},</p><p>A sua conta foi associada à empresa <strong>${company}</strong> com o papel <strong>${role}</strong>.</p><p>Pode entrar em <a href="${loginUrl}">${loginUrl}</a> com o seu email atual.</p>`
          })
        } catch (e) {
          console.warn('Failed to send assignment email to existing user:', e)
        }
        
        return new Response(JSON.stringify({
          success: true,
          user: {
            id: targetUserId,
            name: upserted.name,
            email: upserted.email,
            company: upserted.company,
            role: upserted.role,
            companySessions,
            isActive: upserted.is_active,
            createdAt: upserted.created_at
          },
          isExistingUser: true
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      return new Response(JSON.stringify({ 
        error: 'Failed to create user account',
        details: msg 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!authUser.user) {
      console.error('No user returned from auth creation')
      return new Response(JSON.stringify({ error: 'User creation failed - no user returned' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Auth user created successfully:', authUser.user.id)

    try {
      // Step 2: Upsert profile with company and role info
      console.log('Upserting profile...')
      const { data: profileData, error: profileError } = await supabaseServiceRole
        .from('profiles')
        .upsert([
          { 
            user_id: authUser.user.id,
            name,
            email,
            company,
            role: role as any,
            is_active: true 
          }
        ], { onConflict: 'user_id' })
        .select()
        .single()

      if (profileError) {
        console.error('Error updating profile:', profileError)
        // Try to cleanup auth user if profile creation fails
        await supabaseServiceRole.auth.admin.deleteUser(authUser.user.id)
        throw new Error(`Failed to create user profile: ${profileError.message}`)
      }

      console.log('Profile updated successfully')

      // Step 3: Create initial session allocation if companySessions > 0
      if (companySessions > 0) {
        console.log('Creating session allocation...')
        const { error: sessionError } = await supabaseServiceRole
          .from('session_allocations')
          .insert({
            user_id: authUser.user.id,
            allocation_type: 'company',
            sessions_allocated: companySessions,
            sessions_used: 0,
            allocated_by: user.id,
            reason: 'Initial company allocation',
            is_active: true
          })

        if (sessionError) {
          console.error('Error creating session allocation:', sessionError)
          // Don't fail the entire operation for session allocation errors
        } else {
          console.log('Session allocation created successfully')
        }
      }

      // Step 4: Send welcome email
      console.log('Sending welcome email...')
      const loginUrl = `https://xn--melhorsade-udb.com/`
      
      try {
        const fromEmail = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev'
        const emailResponse = await resend.emails.send({
          from: `Melhor Saúde <${fromEmail}>`,
          to: [email],
          subject: `Bem-vindo à ${company} - Credenciais de Acesso`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb; text-align: center;">Bem-vindo à Melhor Saúde</h1>
              
              <p>Olá ${name},</p>
              
              <p>A sua conta foi criada com sucesso para a empresa <strong>${company}</strong>.</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">As suas credenciais de acesso:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Palavra-passe:</strong> ${password}</p>
                <p><strong>Função:</strong> ${role === 'hr' ? 'Recursos Humanos' : 'Utilizador'}</p>
                ${companySessions > 0 ? `<p><strong>Sessões atribuídas:</strong> ${companySessions}</p>` : ''}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Fazer Login
                </a>
              </div>
              
              <div style="background-color: #fef3c7; padding: 16px; border-radius: 6px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #92400e;">Próximos passos:</h4>
                <ul style="color: #92400e; margin-bottom: 0;">
                  <li>Faça login na plataforma usando as credenciais acima</li>
                  <li>Complete o seu perfil pessoal</li>
                  <li>Explore os prestadores de serviços disponíveis</li>
                  <li>Agende a sua primeira sessão</li>
                </ul>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
                Por favor, guarde este email para futuras referências.<br>
                Se tiver alguma dúvida, contacte o administrador da sua empresa.
              </p>
            </div>
          `,
        })

        console.log('Welcome email sent successfully:', emailResponse)
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError)
        // Don't fail the operation if email sending fails
      }

      // Step 5: Log admin action
      await supabaseServiceRole.rpc('log_admin_action', {
        p_admin_user_id: user.id,
        p_action_type: 'create_company_user',
        p_target_type: 'user',
        p_target_id: authUser.user.id,
        p_details: { name, email, company, role, companySessions }
      })

      console.log('User creation completed successfully')

      return new Response(JSON.stringify({ 
        success: true,
        user: {
          id: authUser.user.id,
          name: profileData.name,
          email: profileData.email,
          company: profileData.company,
          role: profileData.role,
          companySessions,
          isActive: profileData.is_active,
          createdAt: profileData.created_at
        }
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (error) {
      console.error('Error in user creation process:', error)
      
      // Cleanup: Try to delete the auth user if something went wrong
      try {
        await supabaseServiceRole.auth.admin.deleteUser(authUser.user.id)
        console.log('Cleaned up auth user after error')
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError)
      }
      
      throw error
    }

  } catch (error) {
    console.error('Error in create-company-user function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(JSON.stringify({ 
      error: 'User creation failed',
      details: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})