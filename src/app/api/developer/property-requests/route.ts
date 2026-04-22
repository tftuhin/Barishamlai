/**
 * GET /api/developer/property-requests
 * List all multi-property activation requests.
 */
import { prisma } from '@/lib/prisma'
import { ok, Err, requireDeveloper } from '@/lib/api'

export async function GET() {
  const [, e] = await requireDeveloper()
  if (e) return e

  try {
    const requests = await prisma.multiPropertyRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user:     { select: { id: true, name: true, email: true } },
        building: { select: { id: true, name: true, plan: true, tier: true } },
      },
    })

    return ok(requests.map(r => ({
      id:              r.id,
      status:          r.status,
      phone:           r.phone,
      totalProperties: r.totalProperties,
      totalFlats:      r.totalFlats,
      note:            r.note,
      createdAt:       r.createdAt.toISOString(),
      updatedAt:       r.updatedAt.toISOString(),
      user:            r.user,
      building:        r.building,
    })))
  } catch {
    return Err.internal()
  }
}
