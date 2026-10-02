import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailBase } from '@/lib/email'
import { generateSecureToken, escapeHtml, getSafeAppUrl, checkRateLimit } from '@/lib/security'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rateLimitKey = `reset:${ip}`
  const { allowed } = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many reset requests. Please try again later.' }, { status: 429 })
  }

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } })

  // Always return success to prevent email enumeration
  if (!user) return NextResponse.json({ success: true })

  // Generate raw high-entropy token for user URL and secure SHA-256 hash for database
  const { rawToken, hashedToken } = generateSecureToken(32)
  const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data:  { passwordResetToken: hashedToken, passwordResetExpiry: expiry },
  })

  const appUrl   = getSafeAppUrl(req.headers)
  const resetUrl = `${appUrl}/reset-password?token=${rawToken}`
  const safeName = escapeHtml(user.name ?? 'there')

  await sendEmail({
    to:      user.email,
    toName:  user.name ?? undefined,
    subject: 'Reset your Bari Shamlai password',
    html: emailBase({
      heading:    'Reset Your Password',
      subheading: 'বাড়ি সামলাই — Bari Shamlai',
      bodyHtml: `
        <p style="color:#1A2E2A;margin:0 0 12px">Hi <strong>${safeName}</strong>,</p>
        <p style="color:#3D5A53;margin:0 0 20px;line-height:1.65">
          We received a request to reset your <strong>Bari Shamlai</strong> password.
          Click the button below to set a new one. This link expires in <strong>1 hour</strong>.
        </p>
        <p style="color:#94a3b8;font-size:13px;margin:0">
          If you didn't request a password reset, you can safely ignore this email — your account is not affected.
        </p>
      `,
      ctaLabel: 'Reset Password →',
      ctaUrl:   resetUrl,
    }),
  })

  return NextResponse.json({ success: true })
}
