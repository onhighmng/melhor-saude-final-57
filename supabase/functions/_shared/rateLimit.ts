/**
 * Simple in-memory rate limiter
 * For production, use Redis or similar distributed cache
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check if request is within rate limit
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param config - Rate limit configuration
 * @returns RateLimitResult indicating if request is allowed
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // If no entry or expired, create new entry
  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowMs
    rateLimitStore.set(identifier, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt
    }
  }

  // If within limit, increment count
  if (entry.count < config.maxRequests) {
    entry.count++
    rateLimitStore.set(identifier, entry)
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt
    }
  }

  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetAt: entry.resetAt
  }
}

/**
 * Get client IP address from request
 * @param req - Request object
 * @returns IP address or 'unknown'
 */
export function getClientIP(req: Request): string {
  // Try various headers that might contain the real IP
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'true-client-ip',
  ]

  for (const header of headers) {
    const value = req.headers.get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(',')[0].trim()
    }
  }

  return 'unknown'
}

/**
 * Standard rate limit configurations
 */
export const RATE_LIMITS = {
  // Very restrictive - for sensitive operations
  STRICT: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 req/min

  // Moderate - for API calls with costs
  MODERATE: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 req/min

  // Generous - for general API access
  GENEROUS: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 req/min

  // Per hour limits for expensive operations
  HOURLY_STRICT: { maxRequests: 50, windowMs: 60 * 60 * 1000 }, // 50 req/hour
}
