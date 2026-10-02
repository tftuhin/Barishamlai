import crypto from 'crypto'

/**
 * Escapes dynamic string values to prevent stored HTML injection / XSS
 * in email templates, HTML reports, and generated PDF views.
 */
export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return ''
  const s = String(str)
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Hashes a token using SHA-256 for secure database storage.
 * Raw reset tokens must NEVER be stored in the database.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex')
}

/**
 * Generates a high-entropy random token and its secure SHA-256 hash.
 */
export function generateSecureToken(bytes = 32): { rawToken: string; hashedToken: string } {
  const rawToken = crypto.randomBytes(bytes).toString('hex')
  const hashedToken = hashToken(rawToken)
  return { rawToken, hashedToken }
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return crypto.timingSafeEqual(bufA, bufB)
}

/**
 * Resolves the canonical application base URL safely.
 * Rejects untrusted x-forwarded-host headers to prevent Host Header Injection.
 */
export function getSafeAppUrl(reqHeaders?: Headers): string {
  // 1. Strictly prefer configured environment variable
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/+$/, '')
  }
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '')
  }

  // 2. In non-production, fallback to host header if present
  if (process.env.NODE_ENV !== 'production' && reqHeaders) {
    const proto = reqHeaders.get('x-forwarded-proto') ?? 'http'
    const host = reqHeaders.get('host') ?? 'localhost:3000'
    return `${proto}://${host}`
  }

  // 3. Fallback safe default
  return 'http://localhost:3000'
}

// ── In-memory sliding window rate limiter for auth / reset endpoints ────────
interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

/**
 * Simple in-memory rate limiter.
 * @param key unique identifier (e.g. `ip:action` or `email:action`)
 * @param maxAttempts maximum requests allowed in window
 * @param windowMs window duration in milliseconds
 */
export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs
    rateLimitMap.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: maxAttempts - 1, resetAt }
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  return { allowed: true, remaining: maxAttempts - entry.count, resetAt: entry.resetAt }
}
