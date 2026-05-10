import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireViewer } from '@/lib/api'

// GET /api/dashboard/fund-data?month=5&year=2026
// Returns per-module fund summary for a given month/year
export async function GET(req: NextRequest) {
  const [session, e] = await requireViewer()
  if (e) return e
  const bId = session.user.buildingId!
  const { searchParams } = new URL(req.url)
  const month = parseInt(searchParams.get('month') ?? '0')
  const year  = parseInt(searchParams.get('year')  ?? '0')
  if (!month || !year) return Err.badRequest('month and year required')

  const prevFilter = { OR: [{ year: { lt: year } }, { year, month: { lt: month } }] }

  type FundSource = 'SERVICE_CHARGE' | 'GAS' | 'WATER' | 'GARBAGE' | 'COMMUNITY_SECURITY' | 'RENT'
  type FundTypeKey = 'SERVICE_CHARGE' | 'GAS' | 'WATER' | 'GARBAGE' | 'COMMUNITY_SECURITY' | 'RENT'
  type BillTypeKey = 'SERVICE_CHARGE' | 'GAS' | 'WATER' | 'GARBAGE' | 'COMMUNITY_SECURITY' | 'RENT'

  const modules: Array<{ key: string; billType: BillTypeKey; expSource: FundSource; fundType: FundTypeKey }> = [
    { key: 'sc',        billType: 'SERVICE_CHARGE',    expSource: 'SERVICE_CHARGE',    fundType: 'SERVICE_CHARGE' },
    { key: 'gas',       billType: 'GAS',               expSource: 'GAS',               fundType: 'GAS' },
    { key: 'water',     billType: 'WATER',             expSource: 'WATER',             fundType: 'WATER' },
    { key: 'garbage',   billType: 'GARBAGE',           expSource: 'GARBAGE',           fundType: 'GARBAGE' },
    { key: 'cs',        billType: 'COMMUNITY_SECURITY', expSource: 'COMMUNITY_SECURITY', fundType: 'COMMUNITY_SECURITY' },
    { key: 'rent',      billType: 'RENT',              expSource: 'RENT',              fundType: 'RENT' },
  ]

  try {
    const [fundBalances, ...moduleData] = await Promise.all([
      prisma.fundBalance.findMany({ where: { buildingId: bId } }),
      ...modules.flatMap(m => [
        // all-time paid bills
        prisma.bill.aggregate({ _sum: { amount: true }, where: { buildingId: bId, type: m.billType as any, status: 'PAID' } }),
        // all-time expenses
        prisma.expense.aggregate({ _sum: { amount: true }, where: { buildingId: bId, incomeSource: m.expSource as any } }),
        // prev-month paid bills (for opening balance)
        prisma.bill.aggregate({ _sum: { amount: true }, where: { buildingId: bId, type: m.billType as any, status: 'PAID', ...prevFilter } }),
        // prev-month expenses
        prisma.expense.aggregate({ _sum: { amount: true }, where: { buildingId: bId, incomeSource: m.expSource as any, ...prevFilter } }),
        // this-month paid bills
        prisma.bill.aggregate({ _sum: { amount: true }, where: { buildingId: bId, type: m.billType as any, status: 'PAID', month, year } }),
        // this-month expenses
        prisma.expense.aggregate({ _sum: { amount: true }, where: { buildingId: bId, incomeSource: m.expSource as any, month, year } }),
      ]),
    ])

    const result: Record<string, { opening: number; collection: number; expenses: number; closing: number }> = {}
    modules.forEach((m, i) => {
      const base = i * 6
      const fundAmt = fundBalances.find(f => f.fundType === (m.fundType as any))?.amount ?? 0
      const prevBills = (moduleData[base + 2] as any)._sum.amount ?? 0
      const prevExp   = (moduleData[base + 3] as any)._sum.amount ?? 0
      const thisBills = (moduleData[base + 4] as any)._sum.amount ?? 0
      const thisExp   = (moduleData[base + 5] as any)._sum.amount ?? 0
      const allBills  = (moduleData[base + 0] as any)._sum.amount ?? 0
      const allExp    = (moduleData[base + 1] as any)._sum.amount ?? 0
      const opening   = fundAmt + prevBills - prevExp
      const closing   = fundAmt + allBills - allExp
      result[m.key] = { opening, collection: thisBills, expenses: thisExp, closing }
    })

    return ok(result)
  } catch {
    return Err.internal()
  }
}
