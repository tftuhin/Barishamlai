import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAdmin } from '@/lib/api'
import type { FundType } from '@prisma/client'

// GET /api/fund-balance — all fund balances for this building
export async function GET() {
  const [session, e] = await requireAdmin()
  if (e) return e
  const bId = session.user.buildingId!
  try {
    const balances = await prisma.fundBalance.findMany({ where: { buildingId: bId } })
    return ok(balances)
  } catch {
    return Err.internal()
  }
}

// PATCH /api/fund-balance { fundType, amount }
export async function PATCH(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e
  const bId = session.user.buildingId!
  try {
    const { fundType, amount } = await req.json() as { fundType: string; amount: number }
    if (!fundType || amount == null) return Err.badRequest('fundType and amount required')
    const balance = await prisma.fundBalance.upsert({
      where:  { buildingId_fundType: { buildingId: bId, fundType: fundType as FundType } },
      update: { amount: Number(amount) },
      create: { buildingId: bId, fundType: fundType as FundType, amount: Number(amount) },
    })
    return ok(balance)
  } catch {
    return Err.internal()
  }
}
