import { prisma } from '@/lib/prisma'
import { ok, Err, requireViewer } from '@/lib/api'

/**
 * Returns fund balance summaries:
 * { fundType, openingBalance, totalCollected, totalExpenses, currentBalance }
 */
export async function GET() {
  const [session, e] = await requireViewer()
  if (e) return e

  const bId = session.user.buildingId!

  try {
    // Opening balances
    const fundBalances = await prisma.fundBalance.findMany({ where: { buildingId: bId } })

    // Total paid bills per type
    const scPaid = await prisma.bill.aggregate({
      where: { buildingId: bId, type: 'SERVICE_CHARGE', status: 'PAID' },
      _sum: { amount: true },
    })
    const gasPaid = await prisma.bill.aggregate({
      where: { buildingId: bId, type: 'GAS', status: 'PAID' },
      _sum: { amount: true },
    })

    // Total expenses per fund
    const scExpenses = await prisma.expense.aggregate({
      where: { buildingId: bId, incomeSource: 'SERVICE_CHARGE' },
      _sum: { amount: true },
    })
    const gasExpenses = await prisma.expense.aggregate({
      where: { buildingId: bId, incomeSource: 'GAS' },
      _sum: { amount: true },
    })

    const scOpening  = fundBalances.find(f => f.fundType === 'SERVICE_CHARGE')?.amount ?? 0
    const gasOpening = fundBalances.find(f => f.fundType === 'GAS')?.amount ?? 0

    const scCollected   = scPaid._sum.amount   ?? 0
    const gasCollected  = gasPaid._sum.amount  ?? 0
    const scExpTotal    = scExpenses._sum.amount  ?? 0
    const gasExpTotal   = gasExpenses._sum.amount ?? 0

    return ok([
      {
        fundType:        'SERVICE_CHARGE',
        openingBalance:  scOpening,
        totalCollected:  scCollected,
        totalExpenses:   scExpTotal,
        currentBalance:  scOpening + scCollected - scExpTotal,
      },
      {
        fundType:        'GAS',
        openingBalance:  gasOpening,
        totalCollected:  gasCollected,
        totalExpenses:   gasExpTotal,
        currentBalance:  gasOpening + gasCollected - gasExpTotal,
      },
    ])
  } catch {
    return Err.internal()
  }
}
