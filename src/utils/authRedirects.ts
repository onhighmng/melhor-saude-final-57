/**
 * Centralized auth redirect URL management
 * Handles environment-aware redirects for production domain: www.melhorsaúde.com
 */

/**
 * Get the correct auth callback URL based on environment
 * Works in localhost, staging, and production
 */
export const getAuthCallbackUrl = (): string => {
  const origin = window.location.origin;
  
  // In development (localhost)
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return `${origin}/auth/callback`;
  }
  
  // In production (official domain)
  if (origin.includes('melhorsaúde.com')) {
    return `${origin}/auth/callback`;
  }
  
  // For Lovable staging
  if (origin.includes('lovable.app')) {
    return `${origin}/auth/callback`;
  }
  
  // Fallback to current origin
  return `${origin}/auth/callback`;
};

/**
 * Get the site URL for Supabase configuration
 */
export const getSiteUrl = (): string => {
  return window.location.origin;
};

/**
 * Role-based redirect targets after successful auth
 */
export const ROLE_REDIRECT_MAP = {
  admin: '/admin/dashboard',
  hr: '/company/dashboard',
  prestador: '/prestador/dashboard',
  especialista_geral: '/especialista/dashboard',
  user: '/user/dashboard'
} as const;

export type UserRole = keyof typeof ROLE_REDIRECT_MAP;
