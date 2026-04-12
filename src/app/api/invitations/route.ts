import type { Role } from '@prisma/client'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, created, Err, requireAdmin } from '@/lib/api'
import { sendEmail, emailBase } from '@/lib/email'

export async function GET() {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const invitations = await prisma.invitation.findMany({
      where: { buildingId: session.user.buildingId! },
      orderBy: { createdAt: 'desc' },
      include: { invitedBy: { select: { name: true } } },
    })
    return ok(invitations)
  } catch {
    return Err.internal()
  }
}

export async function POST(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { email, role } = body

    if (!email || !role)
      return Err.badRequest('email and role are required')
    if (!['OWNER', 'TENANT'].includes(String(role)))
      return Err.badRequest('role must be OWNER or TENANT')

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const invitation = await prisma.invitation.create({
      data: {
        email:       String(email).toLowerCase().trim(),
        buildingId:  session.user.buildingId!,
        role:        String(role) as Role,
        expiresAt,
        invitedById: session.user.id,
      },
    })

    const appUrl      = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const signupUrl   = `${appUrl}/signup?token=${invitation.token}`
    const buildingName = session.user.buildingName || 'Bari Shamlai'
    const roleLabel   = String(role) === 'OWNER' ? 'Owner' : 'Tenant'

    let emailWarning: string | null = null
    try {
      await sendEmail({
        to:      String(email).toLowerCase().trim(),
        subject: `You've been invited to join ${buildingName}`,
        html: emailBase({
          heading:    "You're Invited!",
          subheading: buildingName,
          bodyHtml: `
            <p style="color:#1A2E2A;margin:0 0 12px">Hello,</p>
            <p style="color:#3D5A53;margin:0 0 20px;line-height:1.65">
              You've been invited to join <strong>${buildingName}</strong> as a <strong>${roleLabel}</strong>.
              Click the button below to create your account and accept the invitation.
            </p>
            <p style="color:#94a3b8;font-size:13px;margin:0">
              This invitation expires in <strong>7 days</strong>. If you weren't expecting this, you can safely ignore this email.
            </p>
          `,
          ctaLabel: 'Accept Invitation →',
          ctaUrl:   signupUrl,
        }),
      })
    } catch (e) {
      emailWarning = e instanceof Error ? e.message : 'Email failed to send'
    }

    return created({ ...invitation, emailWarning })
  } catch {
    return Err.internal('Failed to create invitation')
  }
}

export async function DELETE(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { id } = body

    if (!id) return Err.badRequest('id required')

    await prisma.invitation.deleteMany({
      where: { id: String(id), buildingId: session.user.buildingId! },
    })
    return ok({ success: true })
  } catch {
    return Err.internal('Failed to delete invitation')
  }
}
