import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { escapeHtml, hashToken, generateSecureToken, constantTimeEquals, getSafeAppUrl, checkRateLimit } from '../src/lib/security'
import { sanitizeUser, USER_PUBLIC_SELECT } from '../src/lib/dto'

describe('Security & DTO Sanitization Tests', () => {
  it('escapeHtml correctly escapes dangerous HTML characters to prevent XSS (T04)', () => {
    const malicious = '<script>alert("XSS")</script>&<img src=x onerror=alert(1)>'
    const escaped = escapeHtml(malicious)
    assert.ok(!escaped.includes('<script>'), 'Must not contain unescaped script tag')
    assert.ok(!escaped.includes('<img'), 'Must not contain unescaped img tag')
    assert.ok(escaped.includes('&lt;script&gt;'), 'Must encode < and >')
    assert.ok(escaped.includes('&amp;'), 'Must encode &')
    assert.ok(escaped.includes('&quot;'), 'Must encode quotes')
  })

  it('escapeHtml handles null and undefined safely', () => {
    assert.equal(escapeHtml(null), '')
    assert.equal(escapeHtml(undefined), '')
  })

  it('generateSecureToken creates high-entropy random token and matching SHA-256 hash (T03)', () => {
    const { rawToken, hashedToken } = generateSecureToken()
    assert.equal(rawToken.length, 64) // 32 bytes hex
    assert.equal(hashedToken.length, 64) // sha256 hex
    assert.equal(hashToken(rawToken), hashedToken)
    assert.notEqual(rawToken, hashedToken, 'Hashed token must never equal raw token')
  })

  it('constantTimeEquals compares strings safely', () => {
    assert.ok(constantTimeEquals('secret-token-123', 'secret-token-123'))
    assert.ok(!constantTimeEquals('secret-token-123', 'secret-token-456'))
    assert.ok(!constantTimeEquals('short', 'longer-string'))
  })

  it('getSafeAppUrl prevents host header injection (T03)', () => {
    process.env.NEXTAUTH_URL = 'https://barishamlai.com'
    const fakeHeaders = new Headers({
      host: 'attacker.com',
      'x-forwarded-host': 'malicious-domain.com',
    })
    const resolvedUrl = getSafeAppUrl(fakeHeaders)
    assert.equal(resolvedUrl, 'https://barishamlai.com', 'Must honor NEXTAUTH_URL over untrusted headers')
  })

  it('sanitizeUser strips password, passwordResetToken, and passwordResetExpiry (T01)', () => {
    const fullUser = {
      id: 'usr_123',
      name: 'Test Tenant',
      email: 'tenant@example.com',
      password: '$2a$12$eX4mPl3H4shD0N0tL34k...',
      passwordResetToken: 'raw-secret-token',
      passwordResetExpiry: new Date(Date.now() + 3600000),
      role: 'TENANT',
      buildingId: 'bld_456',
    }

    const sanitized = sanitizeUser(fullUser)
    assert.ok(sanitized)
    assert.equal((sanitized as Record<string, unknown>).password, undefined, 'password must be stripped')
    assert.equal((sanitized as Record<string, unknown>).passwordResetToken, undefined, 'passwordResetToken must be stripped')
    assert.equal((sanitized as Record<string, unknown>).passwordResetExpiry, undefined, 'passwordResetExpiry must be stripped')
    assert.equal(sanitized.email, 'tenant@example.com')
    assert.equal(sanitized.name, 'Test Tenant')
  })

  it('USER_PUBLIC_SELECT excludes sensitive fields (T01)', () => {
    const keys = Object.keys(USER_PUBLIC_SELECT)
    assert.ok(!keys.includes('password'), 'USER_PUBLIC_SELECT must not include password')
    assert.ok(!keys.includes('passwordResetToken'), 'USER_PUBLIC_SELECT must not include passwordResetToken')
    assert.ok(!keys.includes('passwordResetExpiry'), 'USER_PUBLIC_SELECT must not include passwordResetExpiry')
  })

  it('checkRateLimit throttles excessive requests (T03)', () => {
    const key = `test_ip_${Date.now()}`
    for (let i = 0; i < 3; i++) {
      const res = checkRateLimit(key, 3, 60000)
      assert.ok(res.allowed, `Attempt ${i + 1} should be allowed`)
    }
    const blocked = checkRateLimit(key, 3, 60000)
    assert.ok(!blocked.allowed, '4th attempt must be throttled')
  })
})
