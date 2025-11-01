import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface AuthContext {
  userId: string
  userEmail: string | undefined
  role: string | null
}

/**
 * Verifies JWT token and extracts user information
 * @param req - The request object
 * @returns AuthContext with user information
 * @throws Error if token is invalid or missing
 */
export async function verifyAuth(req: Request): Promise<AuthContext> {
  // Extract token from Authorization header
  const authHeader = req.headers.get('Authorization')

  if (!authHeader) {
    throw new Error('Missing Authorization header')
  }

  const token = authHeader.replace('Bearer ', '')

  if (!token) {
    throw new Error('Missing JWT token')
  }

  // Create Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration')
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader }
    }
  })

  // Verify the JWT and get user
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw new Error('Invalid or expired token')
  }

  // Get user role
  const { data: roleData } = await supabase
    .rpc('get_user_primary_role', { p_user_id: user.id })
    .single()

  return {
    userId: user.id,
    userEmail: user.email,
    role: roleData || null
  }
}

/**
 * Checks if user has required role(s)
 * @param authContext - The auth context from verifyAuth
 * @param allowedRoles - Array of allowed roles
 * @returns true if user has one of the allowed roles
 */
export function hasRole(authContext: AuthContext, allowedRoles: string[]): boolean {
  if (!authContext.role) {
    return false
  }
  return allowedRoles.includes(authContext.role)
}

/**
 * Requires specific role(s) - throws error if not authorized
 * @param authContext - The auth context from verifyAuth
 * @param allowedRoles - Array of allowed roles
 * @throws Error if user doesn't have required role
 */
export function requireRole(authContext: AuthContext, allowedRoles: string[]): void {
  if (!hasRole(authContext, allowedRoles)) {
    throw new Error(`Unauthorized. Required role: ${allowedRoles.join(' or ')}`)
  }
}

/**
 * Get allowed origins based on environment
 * In production, only allow specific domains
 * In development, allow localhost and common dev ports
 */
function getAllowedOrigins(): string[] {
  const env = Deno.env.get('DENO_ENV') || 'development'
  const customOrigins = Deno.env.get('ALLOWED_ORIGINS')

  if (customOrigins) {
    return customOrigins.split(',').map(o => o.trim())
  }

  // Default origins based on environment
  if (env === 'production') {
    return [
      'https://onhighmanagment.com',
      'https://www.onhighmanagment.com',
      'https://app.onhighmanagment.com',
    ]
  }

  // Development origins
  return [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ]
}

/**
 * Get CORS headers for a request
 * Validates origin and returns appropriate headers
 * @param req - Request object (optional, for origin validation)
 * @returns CORS headers object
 */
export function getCorsHeaders(req?: Request): HeadersInit {
  const allowedOrigins = getAllowedOrigins()

  // For OPTIONS requests or if no request provided, use wildcard for development
  // This maintains compatibility with existing code
  if (!req || req.method === 'OPTIONS') {
    const env = Deno.env.get('DENO_ENV') || 'development'
    return {
      'Access-Control-Allow-Origin': env === 'development' ? '*' : allowedOrigins[0],
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
      'Access-Control-Max-Age': '86400', // 24 hours
    }
  }

  // Get origin from request
  const origin = req.headers.get('Origin') || ''

  // Check if origin is allowed
  const isAllowed = allowedOrigins.some(allowed => {
    // Exact match or subdomain match
    return origin === allowed || origin.endsWith('.' + allowed.replace('https://', '').replace('http://', ''))
  })

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin', // Important for caching
  }
}

/**
 * Standard CORS headers (backwards compatible)
 * For development and OPTIONS requests
 * @deprecated Use getCorsHeaders() for better security
 */
export const corsHeaders = getCorsHeaders()
