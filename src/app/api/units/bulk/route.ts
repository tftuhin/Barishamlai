import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAdmin } from '@/lib/api'

const TIER_LIMITS: Record<string, number> = {
  FREE:       5,
  BASIC:      10,
  STANDARD:   20,
  PRO:        30,
  ENTERPRISE: Infinity,
}

export async function POST(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const body = await req.json() as { units?: Array<{ number: string; floor: number }> }
    const { units } = body

    if (!Array.isArray(units) || units.length === 0)
      return Err.badRequest('units array is required')

    const bId = session.user.buildingId!
    const building = await prisma.building.findUnique({
      where:  { id: bId },
      select: { plan: true, tier: true, premiumUntil: true, _count: { select: { units: true } } },
    })

    const isActivePremium =
      building?.plan === 'PREMIUM' &&
      building.premiumUntil &&
      building.premiumUntil > new Date()
    const tierKey = isActivePremium && building?.tier ? building.tier : 'FREE'
    const limit   = TIER_LIMITS[tierKey] ?? 5
    const existing = building?._count.units ?? 0

    if (existing + units.length > limit) {
      return NextResponse.json({
        error:   'UNIT_LIMIT_REACHED',
        limit,
        tier:    tierKey,
        message: `Cannot create ${units.length} units — limit is ${limit} (currently have ${existing}).`,
      }, { status: 403 })
    }

    await prisma.unit.createMany({
      data: units.map(u => ({
        number:      String(u.number),
        floor:       Number(u.floor),
        monthlyRent: 0,
        buildingId:  bId,
      })),
      skipDuplicates: true,
    })

    const allUnits = await prisma.unit.findMany({
      where:   { buildingId: bId },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
      select:  { id: true, number: true, floor: true },
    })

    return ok(allUnits)
  } catch {
    return Err.internal('Failed to create units')
  }
}
