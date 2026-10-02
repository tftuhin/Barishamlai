import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireViewer, requireAdmin } from '@/lib/api'
import { createHash } from 'crypto'
import type { PeriodStatus } from '@prisma/client'

// GET /api/periods?year=2026&month=10
export async function GET(req: NextRequest) {
  const [session, e] = await requireViewer()
  if (e) return e

  const bId = session.user.buildingId!
  const { searchParams } = new URL(req.url)
  const month = parseInt(searchParams.get('month') ?? '0')
  const year  = parseInt(searchParams.get('year')  ?? '0')

  if (!month || !year) return Err.badRequest('month and year required')

  const periodClose = await prisma.periodClose.findUnique({
    where: {
      buildingId_periodYear_periodMonth: {
        buildingId: bId,
        periodYear: year,
        periodMonth: month,
      },
    },
  })

  return ok(periodClose ?? {
    buildingId:  bId,
    periodYear:  year,
    periodMonth: month,
    status:      'OPEN' as PeriodStatus,
    closedAt:    null,
    notes:       null,
  })
}

// POST /api/periods
// Body: { year: number, month: number, action: 'CLOSE' | 'REOPEN', notes?: string }
export async function POST(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e

  const bId = session.user.buildingId!

  try {
    const body = await req.json()
    const { year, month, action, notes } = body

    if (!year || !month || !action) {
      return Err.badRequest('year, month, and action (CLOSE | REOPEN) are required')
    }

    if (action === 'CLOSE') {
      // Calculate financial snapshot for audit hash
      const [paidBills, expenses] = await Promise.all([
        prisma.bill.aggregate({
          _sum: { amount: true },
          where: { buildingId: bId, month, year, status: 'PAID' },
        }),
        prisma.expense.aggregate({
          _sum: { amount: true },
          where: { buildingId: bId, month, year },
        }),
      ])

      const snapshotString = JSON.stringify({
        buildingId: bId,
        year,
        month,
        paidBillsSum: paidBills._sum.amount ?? 0,
        expensesSum:  expenses._sum.amount ?? 0,
        closedAt:     new Date().toISOString(),
        closedBy:     session.user.id,
      })

      const reportSnapshotHash = createHash('sha256').update(snapshotString).digest('hex')

      const record = await prisma.$transaction(async (tx) => {
        const period = await tx.periodClose.upsert({
          where: {
            buildingId_periodYear_periodMonth: {
              buildingId: bId,
              periodYear: Number(year),
              periodMonth: Number(month),
            },
          },
          update: {
            status:             'CLOSED',
            approvedByUserId:   session.user.id,
            closedAt:           new Date(),
            reportSnapshotHash,
            notes:              notes ?? null,
          },
          create: {
            buildingId:         bId,
            periodYear:         Number(year),
            periodMonth:        Number(month),
            status:             'CLOSED',
            approvedByUserId:   session.user.id,
            closedAt:           new Date(),
            reportSnapshotHash,
            notes:              notes ?? null,
          },
        })

        await tx.financialEvent.create({
          data: {
            buildingId:      bId,
            fund:            'GENERAL',
            eventType:       'PERIOD_CLOSED',
            amountPaisa:     BigInt(0),
            direction:       'INFLOW',
            effectiveAt:     new Date(),
            entityType:      'PeriodClose',
            entityId:        period.id,
            createdByUserId: session.user.id,
            reason:          `Period ${month}/${year} locked and closed by administrator`,
          },
        })

        return period
      })

      return ok(record)
    } else if (action === 'REOPEN') {
      const record = await prisma.periodClose.upsert({
        where: {
          buildingId_periodYear_periodMonth: {
            buildingId: bId,
            periodYear: Number(year),
            periodMonth: Number(month),
          },
        },
        update: {
          status:   'OPEN',
          closedAt: null,
          notes:    notes ?? 'Reopened by administrator',
        },
        create: {
          buildingId:  bId,
          periodYear:  Number(year),
          periodMonth: Number(month),
          status:      'OPEN',
          notes:       notes ?? 'Reopened by administrator',
        },
      })

      return ok(record)
    } else {
      return Err.badRequest(`Unsupported action: ${action}`)
    }
  } catch (err: any) {
    return Err.internal(err?.message || 'Failed to update period close status')
  }
}
