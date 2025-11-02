import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"
import { verifyAuth, requireRole, corsHeaders } from "../_shared/auth.ts"
import { checkRateLimit, getClientIP, RATE_LIMITS } from "../_shared/rateLimit.ts"
import {
  withErrorHandling,
  handleRateLimitError,
  successResponse,
  logErrorToSentry
} from "../_shared/errors.ts"

// Input validation schema
const createEmployeeSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(200),
  company_id: z.string().uuid(),
  role: z.enum(['user', 'hr', 'prestador', 'especialista_geral']), // Note: 'admin' removed - can't create admins
  sessions_allocated: z.number().int().min(0).max(1000).optional()
})

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Verify authentication
  const auth = await verifyAuth(req)

  // Require admin or HR role to create employees
  requireRole(auth, ['admin', 'hr'])

  // Rate limiting - per user
  const rateLimitResult = checkRateLimit(
    `create-employee:${auth.userId}`,
    RATE_LIMITS.STRICT // 5 requests per minute
  )

  if (!rateLimitResult.allowed) {
    return handleRateLimitError(rateLimitResult.resetAt)
  }

  // Also rate limit by IP to prevent abuse
  const clientIP = getClientIP(req)
  const ipRateLimitResult = checkRateLimit(
    `create-employee:ip:${clientIP}`,
    RATE_LIMITS.HOURLY_STRICT // 50 requests per hour
  )

  if (!ipRateLimitResult.allowed) {
    return handleRateLimitError(ipRateLimitResult.resetAt)
  }

  // Parse and validate input
  const body = await req.json()
  const validatedData = createEmployeeSchema.parse(body)
  const { email, password, name, company_id, role, sessions_allocated } = validatedData

  // Create admin Supabase client
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // If user is HR, verify they belong to the company they're creating employee for
  if (auth.role === 'hr') {
    const { data: hrProfile } = await supabaseAdmin
      .from('profiles')
      .select('company_id')
      .eq('id', auth.userId)
      .single()

    if (!hrProfile || hrProfile.company_id !== company_id) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized. HR can only create employees for their own company.',
          code: 'UNAUTHORIZED'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  // Verify company exists and is active
  const { data: company, error: companyError } = await supabaseAdmin
    .from('companies')
    .select('id, is_active')
    .eq('id', company_id)
    .single()

  if (companyError || !company) {
    return new Response(
      JSON.stringify({
        error: 'Company not found',
        code: 'COMPANY_NOT_FOUND'
      }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!company.is_active) {
    return new Response(
      JSON.stringify({
        error: 'Company is not active',
        code: 'COMPANY_INACTIVE'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check if email already exists
  const { data: existingUser } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    return new Response(
      JSON.stringify({
        error: 'User with this email already exists',
        code: 'EMAIL_EXISTS'
      }),
      { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Use a transaction-like approach: create all records and rollback on failure
  let userId: string | null = null

  try {
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm for company employees
    })

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    userId = authData.user.id

    // Step 2: Create profile
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: userId,
      email,
      name,
      company_id,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }

    // Step 3: Create role
    const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
      user_id: userId,
      role,
      created_by: auth.userId,
      created_at: new Date().toISOString()
    })

    if (roleError) {
      throw new Error(`Failed to assign role: ${roleError.message}`)
    }

    // Step 4: Create employee link
    const { error: employeeError } = await supabaseAdmin.from('company_employees').insert({
      company_id,
      user_id: userId,
      sessions_allocated: sessions_allocated || 0,
      sessions_used: 0,
      status: 'active',
      joined_at: new Date().toISOString()
    })

    if (employeeError) {
      throw new Error(`Failed to create employee record: ${employeeError.message}`)
    }

    // Step 5: Log the action for audit trail
    await supabaseAdmin.from('admin_logs').insert({
      action: 'create_employee',
      admin_id: auth.userId,
      target_id: userId,
      details: {
        email,
        name,
        role,
        company_id,
        sessions_allocated: sessions_allocated || 0
      },
      created_at: new Date().toISOString()
    })

    // Success!
    return successResponse({
      success: true,
      user_id: userId,
      email,
      role,
      message: 'Employee created successfully'
    }, 201)

  } catch (error) {
    // Rollback: If we created the auth user but failed later, delete it
    if (userId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId)
        console.log(`Rolled back auth user creation for ${userId}`)
      } catch (rollbackError) {
        // Log rollback failure
        logErrorToSentry(
          new Error('Failed to rollback user creation'),
          {
            userId,
            originalError: error instanceof Error ? error.message : String(error),
            rollbackError: rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
          }
        )
      }
    }

    // Re-throw to be handled by error handler
    throw error
  }
}

// Wrap with error handling
serve(withErrorHandling(handler))
