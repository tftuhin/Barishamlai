import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, created, Err, isPrismaConflict, requireAuth, requireAdmin } from '@/lib/api'

const TIER_LIMITS: Record<string, number> = {
  FREE:       5,
  BASIC:      10,
  STANDARD:   20,
  PRO:        30,
  ENTERPRISE: Infinity,
}

export async function GET() {
  const [session, e] = await requireAuth()
  if (e) return e

  try {
    const units = await prisma.unit.findMany({
      where: { buildingId: session.user.buildingId ?? undefined },
      include: { owner: true, tenant: true },
      orderBy: { number: 'asc' },
    })
    return ok(units)
  } catch {
    return Err.internal()
  }
}

export async function POST(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { number, floor, area, monthlyRent, ownerId, tenantId } = body

    if (!number || !floor || !monthlyRent)
      return Err.badRequest('number, floor and monthlyRent are required')

    const bId = session.user.buildingId!
    const building = await prisma.building.findUnique({
      where: { id: bId },
      select: { plan: true, tier: true, premiumUntil: true, _count: { select: { units: true } } },
    })

    const isActivePremium =
      building?.plan === 'PREMIUM' &&
      building.premiumUntil &&
      building.premiumUntil > new Date()
    const tierKey = isActivePremium && building?.tier ? building.tier : 'FREE'
    const limit   = TIER_LIMITS[tierKey] ?? 5

    if ((building?._count.units ?? 0) >= limit)
      return NextResponse_unitLimit(limit, tierKey)

    const unit = await prisma.unit.create({
      data: {
        number:      String(number),
        floor:       Number(floor),
        area:        area  ? Number(area)       : null,
        monthlyRent: Number(monthlyRent),
        ownerId:     ownerId  ? String(ownerId)  : null,
        tenantId:    tenantId ? String(tenantId) : null,
        buildingId:  bId,
      },
      include: { owner: true, tenant: true },
    })
    return created(unit)
  } catch (e) {
    if (isPrismaConflict(e))
      return Err.conflict('Unit number already exists in this building')
    return Err.internal('Failed to create unit')
  }
}

// Keep the structured error clients expect for the unit-limit case
import { NextResponse } from 'next/server'
function NextResponse_unitLimit(limit: number, tier: string) {
  return NextResponse.json({ error: 'UNIT_LIMIT_REACHED', limit, tier }, { status: 403 })
}
