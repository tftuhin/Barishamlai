import { NextRequest } from 'next/server'
import { BillType } from '@prisma/client'
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

type OpeningDue = { type: string; month: number; year: number; amount: number }

export async function POST(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { number, floor, area, monthlyRent, ownerId, tenantId, openingDues } = body

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

    const dues: OpeningDue[] = Array.isArray(openingDues) ? openingDues : []

    const unit = await prisma.$transaction(async (tx) => {
      const newUnit = await tx.unit.create({
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

      if (dues.length > 0) {
        await tx.bill.createMany({
          data: dues.map(d => ({
            unitId:    newUnit.id,
            buildingId: bId,
            type:      d.type as BillType,
            amount:    Number(d.amount),
            month:     Number(d.month),
            year:      Number(d.year),
            dueDate:   new Date(Number(d.year), Number(d.month) - 1, 1),
            status:    'PENDING' as const,
            note:      'Opening balance',
          })),
          skipDuplicates: true,
        })
      }

      return newUnit
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
