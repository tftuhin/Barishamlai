import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })

  // Always return success to prevent email enumeration
  if (!user) return NextResponse.json({ success: true })

  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpiry: expiry },
  })

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  await sendEmail({
    to:      user.email,
    toName:  user.name ?? undefined,
    subject: 'Reset your Bari Shamlai password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#1A3A5C;margin-bottom:8px">Reset your password</h2>
        <p style="color:#64748B;margin-bottom:24px">Hi ${user.name}, click the button below to reset your Bari Shamlai password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#2563EB;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
        <p style="color:#94A3B8;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  })

  return NextResponse.json({ success: true })
}
