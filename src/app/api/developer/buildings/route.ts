import { prisma } from '@/lib/prisma'
import { ok, Err, requireDeveloper } from '@/lib/api'

export async function GET() {
  const [, e] = await requireDeveloper()
  if (e) return e

  try {
    const buildings = await prisma.building.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { units: true, users: true } },
        users: {
          where: { role: 'ADMIN' },
          select: { id: true, name: true, email: true, createdAt: true },
          take: 1,
        },
      },
    })

    // For buildings with no direct admin user (multi-property buildings),
    // look up the admin via the UserBuilding join table.
    const noAdminIds = buildings.filter(b => b.users.length === 0).map(b => b.id)

    const ubAdminMap = new Map<string, { id: string; name: string; email: string; createdAt: Date }>()
    if (noAdminIds.length > 0) {
      const ubRecords = await prisma.userBuilding.findMany({
        where: { buildingId: { in: noAdminIds }, user: { role: 'ADMIN' } },
        include: { user: { select: { id: true, name: true, email: true, role: true, createdAt: true } } },
      })
      for (const ub of ubRecords) {
        if (!ubAdminMap.has(ub.buildingId)) {
          ubAdminMap.set(ub.buildingId, ub.user)
        }
      }
    }

    const now = new Date()
    const result = buildings.map(b => ({
      id:              b.id,
      name:            b.name,
      plan:            b.plan,
      tier:            b.tier ?? null,
      premiumUntil:    b.premiumUntil?.toISOString() ?? null,
      effectivePlan:   b.plan === 'PREMIUM' && b.premiumUntil && b.premiumUntil < now ? 'FREE' : b.plan,
      status:          b.status,
      statusNote:      b.statusNote ?? null,
      statusUpdatedAt: b.statusUpdatedAt?.toISOString() ?? null,
      unitCount:       b._count.units,
      userCount:       b._count.users,
      admin:           b.users[0] ?? ubAdminMap.get(b.id) ?? null,
      createdAt:       b.createdAt.toISOString(),
    }))

    return ok(result)
  } catch {
    return Err.internal()
  }
}
