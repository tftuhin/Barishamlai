import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireDeveloper } from '@/lib/api'
import bcrypt from 'bcryptjs'

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

    const building = await prisma.building.findUnique({
      where: { id: params.id },
      include: { users: { where: { role: 'ADMIN' }, take: 1, select: { id: true } } },
    })
    if (!building) return Err.notFound('Building not found')

    // Update building name
    if (buildingName && String(buildingName).trim()) {
      await prisma.building.update({
        where: { id: params.id },
        data: { name: String(buildingName).trim() },
      })
    }

    // Update admin user if details provided
    const adminId = building.users[0]?.id
    if (adminId && (adminName || adminEmail || adminPhone || adminPassword)) {
      const data: Record<string, string | null> = {}
      if (adminName)     data.name  = String(adminName).trim()
      if (adminEmail)    data.email = String(adminEmail).trim().toLowerCase()
      if (adminPhone !== undefined) data.phone = adminPhone ? String(adminPhone).trim() : null
      if (adminPassword && String(adminPassword).length >= 6) {
        data.password = await bcrypt.hash(String(adminPassword), 10)
      }
      await prisma.user.update({ where: { id: adminId }, data })
    }

    // Re-fetch and return updated building with admin
    const updated = await prisma.building.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { units: true, users: true } },
        users: { where: { role: 'ADMIN' }, select: { id: true, name: true, email: true, createdAt: true }, take: 1 },
      },
    })
    if (!updated) return Err.internal()

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
      admin:         updated.users[0] ?? null,
      createdAt:     updated.createdAt.toISOString(),
    })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
      return Err.conflict('That email is already in use by another account')
    }
    return Err.internal('Failed to update property')
  }
}

/**
 * DELETE /api/developer/buildings/[id]
 * Permanently delete a building and all its data, including its users.
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const [, e] = await requireDeveloper()
  if (e) return e

  try {
    const building = await prisma.building.findUnique({ where: { id: params.id } })
    if (!building) return Err.notFound('Building not found')

    await prisma.$transaction(async tx => {
      // Delete all users belonging to this building (users are not cascade-deleted by the schema)
      await tx.user.deleteMany({ where: { buildingId: params.id } })
      // Delete the building — cascades units, bills, expenses, config, messages, etc.
      await tx.building.delete({ where: { id: params.id } })
    })

    return ok({ deleted: true })
  } catch {
    return Err.internal('Failed to delete property')
  }
}
