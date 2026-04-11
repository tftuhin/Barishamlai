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
      admin:           b.users[0] ?? null,
      createdAt:       b.createdAt.toISOString(),
    }))

    return ok(result)
  } catch {
    return Err.internal()
  }
}
