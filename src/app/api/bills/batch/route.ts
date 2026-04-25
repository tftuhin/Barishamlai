import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, isPrismaConflict, requirePremium } from '@/lib/api'
import type { BillType } from '@prisma/client'

interface BillInput {
  unitId: string
  type: string
  amount: number
  month: number
  year: number
  dueDate: string
  meterReading?: number | null
  note?: string | null
}

export async function POST(req: NextRequest) {
  const [session, e] = await requirePremium()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const bills = body.bills

    if (!Array.isArray(bills) || bills.length === 0)
      return Err.badRequest('No bills provided')

    const buildingId = session.user.buildingId

    // Pre-fetch all valid unit IDs for this building to prevent cross-building bill creation
    const validUnits = await prisma.unit.findMany({
      where: { buildingId: buildingId! },
      select: { id: true },
    })
    const validUnitIds = new Set(validUnits.map(u => u.id))

    let created = 0, skipped = 0
    const errors: string[] = []

    for (const b of bills as BillInput[]) {
      const { unitId, type, amount, month, year, dueDate, meterReading, note } = b
      if (!unitId || !type || !amount || !month || !year || !dueDate) {
        skipped++
        continue
      }
      // Reject unit IDs that don't belong to this building
      if (!validUnitIds.has(unitId)) {
        skipped++
        continue
      }
      try {
        await prisma.bill.create({
          data: {
            unitId,
            type:         type as BillType,
            amount:       Number(amount),
            month:        Number(month),
            year:         Number(year),
            dueDate:      new Date(dueDate),
            status:       'PENDING',
            meterReading: meterReading != null ? Number(meterReading) : null,
            note:         note ?? null,
            buildingId,
          },
        })
        created++
      } catch (err) {
        if (isPrismaConflict(err)) {
          skipped++
        } else {
          errors.push(`Unit ${unitId}: unexpected error`)
        }
      }
    }

    return ok({ created, skipped, errors })
  } catch {
    return Err.internal('Failed to process batch bills')
  }
}
