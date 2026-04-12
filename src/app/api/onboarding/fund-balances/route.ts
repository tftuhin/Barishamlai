import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, created, Err, requireAdmin, requireViewer } from '@/lib/api'
import type { FundType } from '@prisma/client'

export async function GET() {
  const [session, e] = await requireViewer()
  if (e) return e

  try {
    const balances = await prisma.fundBalance.findMany({
      where: { buildingId: session.user.buildingId! },
      orderBy: { fundType: 'asc' },
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
    const { balances } = body as { balances: { fundType: string; amount: number; note?: string }[] }

    if (!Array.isArray(balances) || balances.length === 0)
      return Err.badRequest('balances array is required')

    const bId = session.user.buildingId!

    const upserted = await Promise.all(
      balances.map(b =>
        prisma.fundBalance.upsert({
          where:  { buildingId_fundType: { buildingId: bId, fundType: b.fundType as FundType } },
          update: { amount: Number(b.amount), note: b.note ?? null },
          create: { buildingId: bId, fundType: b.fundType as FundType, amount: Number(b.amount), note: b.note ?? null },
        })
      )
    )

    return created(upserted)
  } catch {
    return Err.internal('Failed to save fund balances')
  }
}
