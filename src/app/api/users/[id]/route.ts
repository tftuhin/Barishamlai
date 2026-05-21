import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAdmin } from '@/lib/api'

const VALID_ROLES = ['ADMIN', 'PRESIDENT', 'SECRETARY', 'OWNER', 'TENANT']

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [session, e] = await requireAdmin()
    if (e) return e

    const target = await prisma.user.findUnique({ where: { id: params.id }, select: { buildingId: true } })
    if (!target) return Err.notFound('User not found')
    if (target.buildingId !== session.user.buildingId) return Err.forbidden()

    const body = await req.json()
    if (body.role && !VALID_ROLES.includes(body.role)) return Err.badRequest('Invalid role')

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(body.name  !== undefined && { name:  body.name  }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
        ...(body.role  !== undefined && { role:  body.role  }),
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    })
    return ok(updated)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update user'
    return Err.internal(msg)
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const [session, e] = await requireAdmin()
  if (e) return e

  if (params.id === session.user.id)
    return Err.badRequest('Cannot delete your own account')

  // Ensure target user belongs to the admin's building
  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: { buildingId: true },
  })
  if (!target) return Err.notFound('User not found')
  if (target.buildingId !== session.user.buildingId)
    return Err.forbidden()

  try {
    await prisma.$transaction(async tx => {
      // Nullify unit owner/tenant references
      await tx.unit.updateMany({ where: { ownerId:  params.id }, data: { ownerId:  null } })
      await tx.unit.updateMany({ where: { tenantId: params.id }, data: { tenantId: null } })

      // Remove message recipient records for this user
      await tx.messageRecipient.deleteMany({ where: { userId: params.id } })

      // Delete sent messages (and their recipient records)
      const sentMessages = await tx.message.findMany({
        where: { senderId: params.id },
        select: { id: true },
      })
      if (sentMessages.length > 0) {
        await tx.messageRecipient.deleteMany({
          where: { messageId: { in: sentMessages.map(m => m.id) } },
        })
        await tx.message.deleteMany({ where: { senderId: params.id } })
      }

      // Delete invitations they sent
      await tx.invitation.deleteMany({ where: { invitedById: params.id } })

      // Delete join requests (also has onDelete: Cascade but be explicit)
      await tx.joinRequest.deleteMany({ where: { userId: params.id } })

      // Delete receipts referencing this user
      await tx.receipt.deleteMany({
        where: { OR: [{ issuedById: params.id }, { recipientId: params.id }] },
      })

      await tx.user.delete({ where: { id: params.id } })
    })
    return ok({ success: true })
  } catch {
    return Err.internal('Failed to delete user')
  }
}
