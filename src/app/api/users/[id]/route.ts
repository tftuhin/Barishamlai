import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAdmin } from '@/lib/api'

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
