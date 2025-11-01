import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

// Input validation schema
const createEmployeeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(200),
  company_id: z.string().uuid(),
  role: z.enum(['user', 'admin', 'hr', 'prestador', 'especialista_geral']),
  sessions_allocated: z.number().int().min(0).max(1000).optional()
})

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validate and parse input
    const body = await req.json()
    const { email, password, name, company_id, role, sessions_allocated } = createEmployeeSchema.parse(body)

    // Create user with admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) throw authError

    // Create profile
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      email,
      name,
      company_id
    })

    if (profileError) throw profileError

    // Create role
    const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
      user_id: authData.user.id,
      role,
      created_by: req.headers.get('x-user-id') // From JWT
    })

    if (roleError) throw roleError

    // Create employee link
    const { error: employeeError } = await supabaseAdmin.from('company_employees').insert({
      company_id,
      user_id: authData.user.id,
      sessions_allocated: sessions_allocated || 0,
      sessions_used: 0
    })

    if (employeeError) throw employeeError

    return new Response(
      JSON.stringify({ success: true, user_id: authData.user.id }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid input',
          details: error.errors
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

