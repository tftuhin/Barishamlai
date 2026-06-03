import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, created, Err, requireAdmin, requireViewer } from '@/lib/api'
import type { BillType } from '@prisma/client'

export async function GET() {
  const [session, e] = await requireViewer()
  if (e) return e

  try {
    const balances = await prisma.unitOpeningBalance.findMany({
      where: { buildingId: session.user.buildingId! },
      include: { unit: { select: { id: true, number: true, floor: true } } },
      orderBy: [{ unit: { floor: 'asc' } }, { billType: 'asc' }],
    })
    return ok(balances)
  } catch {
    return Err.internal()
  }
}

export async function POST(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { balances } = body as { balances: { unitId: string; billType: string; amount: number; note?: string }[] }

    if (!Array.isArray(balances))
      return Err.badRequest('balances array is required')

    const bId = session.user.buildingId!

    // Fetch valid unit IDs for this building to prevent cross-building writes
    const validUnits = await prisma.unit.findMany({
      where: { buildingId: bId },
      select: { id: true },
    })
    const validUnitIds = new Set(validUnits.map(u => u.id))

    // Filter out zero-amount entries and units not belonging to this building
    const nonZero = balances.filter(b => b.amount !== 0 && validUnitIds.has(b.unitId))

    const upserted = await Promise.all(
      nonZero.map(b =>
        prisma.unitOpeningBalance.upsert({
          where:  { unitId_billType: { unitId: b.unitId, billType: b.billType as BillType } },
          update: { amount: Number(b.amount), note: b.note ?? null },
          create: {
            unitId:     b.unitId,
            buildingId: bId,
            billType:   b.billType as BillType,
            amount:     Number(b.amount),
            note:       b.note ?? null,
          },
        })
      )
    )

    // Mark onboarding complete
    await prisma.buildingConfig.upsert({
      where:  { id: bId },
      update: { onboardingComplete: true },
      create: { id: bId, onboardingComplete: true },
    })

    return created({ saved: upserted.length })
  } catch {
    return Err.internal('Failed to save unit balances')
  }
}
