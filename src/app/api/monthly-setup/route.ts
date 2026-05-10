import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAdmin } from '@/lib/api'

// GET /api/monthly-setup?month=5&year=2026
export async function GET(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e
  const bId = session.user.buildingId!
  const { searchParams } = new URL(req.url)
  const month = parseInt(searchParams.get('month') ?? '0')
  const year  = parseInt(searchParams.get('year')  ?? '0')
  if (!month || !year) return Err.badRequest('month and year required')

  try {
    const setup = await prisma.monthlySetup.findUnique({
      where: { buildingId_month_year: { buildingId: bId, month, year } },
    })
    return ok(setup ?? { buildingId: bId, month, year, waterBillTotal: null, waterOccupied: null, waterBillsGenerated: false, scOccupancyConfirmed: false, scBillsGenerated: false, garbageBillsGenerated: false, csBillsGenerated: false })
  } catch {
    return Err.internal()
  }
}

// PATCH /api/monthly-setup — upsert fields
export async function PATCH(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e
  const bId = session.user.buildingId!

  try {
    const body = await req.json()
    const { month, year, ...fields } = body as {
      month: number; year: number
      waterBillTotal?: number | null
      waterOccupied?: number | null
      waterBillsGenerated?: boolean
      scOccupancyConfirmed?: boolean
      scBillsGenerated?: boolean
      garbageBillsGenerated?: boolean
      csBillsGenerated?: boolean
    }
    if (!month || !year) return Err.badRequest('month and year required')

    const allowed: Record<string, unknown> = {}
    if (fields.waterBillTotal  !== undefined) allowed.waterBillTotal  = fields.waterBillTotal
    if (fields.waterOccupied   !== undefined) allowed.waterOccupied   = fields.waterOccupied
    if (fields.waterBillsGenerated !== undefined) allowed.waterBillsGenerated = fields.waterBillsGenerated
    if (fields.scOccupancyConfirmed !== undefined) allowed.scOccupancyConfirmed = fields.scOccupancyConfirmed
    if (fields.scBillsGenerated !== undefined) allowed.scBillsGenerated = fields.scBillsGenerated
    if (fields.garbageBillsGenerated !== undefined) allowed.garbageBillsGenerated = fields.garbageBillsGenerated
    if (fields.csBillsGenerated !== undefined) allowed.csBillsGenerated = fields.csBillsGenerated

    const setup = await prisma.monthlySetup.upsert({
      where:  { buildingId_month_year: { buildingId: bId, month, year } },
      update: allowed,
      create: { buildingId: bId, month, year, ...allowed },
    })
    return ok(setup)
  } catch {
    return Err.internal()
  }
}
