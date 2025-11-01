import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// JWT parsing helper
function parseJWT(authHeader: string | null): { userId: string; role: string } | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  try {
    const token = authHeader.substring(7) // Remove 'Bearer '
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    return {
      userId: payload.sub,
      role: payload.user_role || payload.role || 'user'
    }
  } catch {
    return null
  }
}

serve(async (req) => {
  try {
    // ✅ Parse JWT properly (don't trust x-user-id headers)
    const authHeader = req.headers.get('Authorization')
    const jwt = parseJWT(authHeader)

    if (!jwt) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid or missing JWT' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // ✅ Verify caller has admin or HR role
    if (!['admin', 'hr'].includes(jwt.role)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Only admin and HR can create employees' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, name, company_id, role, sessions_allocated } = await req.json()

    // Validate inputs
    if (!email || !password || !name || !company_id || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

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

    // Create role - ✅ Use JWT user_id instead of trusting header
    const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
      user_id: authData.user.id,
      role,
      created_by: jwt.userId // ✅ Get user_id from JWT payload
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

