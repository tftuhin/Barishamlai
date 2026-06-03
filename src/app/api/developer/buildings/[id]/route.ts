import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireDeveloper } from '@/lib/api'
import bcrypt from 'bcryptjs'

/** Resolve the admin of a building — direct user or via UserBuilding. */
async function resolveAdmin(buildingId: string) {
  // Try direct user first
  const direct = await prisma.user.findFirst({
    where: { buildingId, role: 'ADMIN' },
    select: { id: true, name: true, email: true, createdAt: true },
  })
  if (direct) return direct

  // Fall back to UserBuilding (multi-property admin)
  const ub = await prisma.userBuilding.findFirst({
    where: { buildingId, user: { role: 'ADMIN' } },
    include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
  })
  return ub?.user ?? null
}

/**
 * PATCH /api/developer/buildings/[id]
 * Edit building name and/or admin details (name, email, phone, password).
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const [, e] = await requireDeveloper()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { buildingName, adminName, adminEmail, adminPhone, adminPassword } = body

    if (!await prisma.building.findUnique({ where: { id: params.id } }))
      return Err.notFound('Building not found')

    // Update building name
    if (buildingName && String(buildingName).trim()) {
      await prisma.building.update({
        where: { id: params.id },
        data: { name: String(buildingName).trim() },
      })
    }

    // Find the admin (direct or via UserBuilding) and update their details
    const admin = await resolveAdmin(params.id)
    if (admin && (adminName || adminEmail || adminPhone !== undefined || adminPassword)) {
      const data: Record<string, string | null> = {}
      if (adminName) data.name = String(adminName).trim()
      if (adminEmail) data.email = String(adminEmail).trim().toLowerCase()
      if (adminPhone !== undefined) data.phone = adminPhone ? String(adminPhone).trim() : null
      if (adminPassword && String(adminPassword).length >= 6) {
        data.password = await bcrypt.hash(String(adminPassword), 10)
      }
      await prisma.user.update({ where: { id: admin.id }, data })
    }

    // Re-fetch and return updated building
    const updated = await prisma.building.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { units: true, users: true } },
        users: { where: { role: 'ADMIN' }, select: { id: true, name: true, email: true, createdAt: true }, take: 1 },
      },
    })
    if (!updated) return Err.internal()

    const resolvedAdmin = await resolveAdmin(params.id)
    const now = new Date()

    return ok({
      id:            updated.id,
      name:          updated.name,
      plan:          updated.plan,
      tier:          updated.tier ?? null,
      premiumUntil:  updated.premiumUntil?.toISOString() ?? null,
      effectivePlan: updated.plan === 'PREMIUM' && updated.premiumUntil && updated.premiumUntil < now ? 'FREE' : updated.plan,
      status:        updated.status,
      statusNote:    updated.statusNote ?? null,
      unitCount:     updated._count.units,
      userCount:     updated._count.users,
      admin:         resolvedAdmin,
      createdAt:     updated.createdAt.toISOString(),
    })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002')
      return Err.conflict('That email is already in use by another account')
    return Err.internal('Failed to update property')
  }
}

/**
 * DELETE /api/developer/buildings/[id]
 * Permanently delete a building and ALL its data in dependency order.
 * The Prisma schema has many relations without onDelete: Cascade, so we
 * manually delete child records before removing the building.
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const [, e] = await requireDeveloper()
  if (e) return e

  const bId = params.id

  try {
    if (!await prisma.building.findUnique({ where: { id: bId } }))
      return Err.notFound('Building not found')

    await prisma.$transaction(async tx => {
      // 1. Collect IDs needed for nested deletes
      const units    = await tx.unit.findMany({ where: { buildingId: bId }, select: { id: true } })
      const bills    = await tx.bill.findMany({ where: { buildingId: bId }, select: { id: true } })
      const messages = await tx.message.findMany({ where: { buildingId: bId }, select: { id: true } })
      const unitIds    = units.map(u => u.id)
      const billIds    = bills.map(b => b.id)
      const messageIds = messages.map(m => m.id)

      // 2. Delete receipts (reference bills and units)
      if (billIds.length)    await tx.receipt.deleteMany({ where: { billId: { in: billIds } } })

      // 3. Delete message recipients
      if (messageIds.length) await tx.messageRecipient.deleteMany({ where: { messageId: { in: messageIds } } })

      // 4. Delete messages
      await tx.message.deleteMany({ where: { buildingId: bId } })

      // 5. Delete bills
      await tx.bill.deleteMany({ where: { buildingId: bId } })

      // 6. Delete unit opening balances
      if (unitIds.length) await tx.unitOpeningBalance.deleteMany({ where: { unitId: { in: unitIds } } })
      await tx.unitOpeningBalance.deleteMany({ where: { buildingId: bId } })

      // 7. Delete units (after bills and receipts are gone)
      await tx.unit.deleteMany({ where: { buildingId: bId } })

      // 8. Delete expenses
      await tx.expense.deleteMany({ where: { buildingId: bId } })

      // 9. Delete fund balances
      await tx.fundBalance.deleteMany({ where: { buildingId: bId } })

      // 10. Delete join requests
      await tx.joinRequest.deleteMany({ where: { buildingId: bId } })

      // 11. Delete invitations
      await tx.invitation.deleteMany({ where: { buildingId: bId } })

      // 12. Delete subscription payments
      await tx.subscriptionPayment.deleteMany({ where: { buildingId: bId } })

      // 13. Delete multi-property requests referencing this building
      await tx.multiPropertyRequest.deleteMany({ where: { buildingId: bId } })

      // 14. Delete building config (1-to-1, no cascade)
      await tx.buildingConfig.deleteMany({ where: { id: bId } })

      // 15. UserBuilding has onDelete: Cascade but be explicit
      await tx.userBuilding.deleteMany({ where: { buildingId: bId } })

      // 16. Nullify buildingId on users who belong to this building
      //     (don't delete the users — they may have cross-building data)
      await tx.user.updateMany({ where: { buildingId: bId }, data: { buildingId: null } })

      // 17. Delete the building itself
      await tx.building.delete({ where: { id: bId } })
    }, { timeout: 15000 })

    return ok({ deleted: true })
  } catch {
    return Err.internal('Failed to delete property')
  }
}
