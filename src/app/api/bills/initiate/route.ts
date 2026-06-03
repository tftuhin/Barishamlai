/**
 * POST /api/bills/initiate
 * Admin-only (no premium gate). Generates bills for all applicable units
 * for a given type/month/year. Used by Rent, Service Charge, and Gas pages
 * for the "Initiate Bills" button.
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, isPrismaConflict, requireAdmin } from '@/lib/api'
import type { BillType } from '@prisma/client'

export async function POST(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { type, month, year, dueDate } = body

    if (!type || !month || !year || !dueDate)
      return Err.badRequest('Missing required fields: type, month, year, dueDate')

    const validTypes = new Set(['RENT', 'SERVICE_CHARGE', 'GAS'])
    if (!validTypes.has(String(type)))
      return Err.badRequest('Invalid type. Must be RENT, SERVICE_CHARGE, or GAS')

    const bId      = session.user.buildingId!
    const billType = type as BillType
    const m        = Number(month)
    const y        = Number(year)
    const due      = new Date(String(dueDate))

    const [units, config] = await Promise.all([
      prisma.unit.findMany({
        where: { buildingId: bId },
        include: {
          tenant: { select: { id: true, email: true, name: true } },
          owner:  { select: { id: true, email: true, name: true } },
          mergedUnits: { select: { id: true, customServiceCharge: true, status: true } },
        },
        orderBy: [{ floor: 'asc' }, { number: 'asc' }],
      }),
      prisma.buildingConfig.findUnique({ where: { id: bId } }),
    ])

    let created = 0
    let skipped = 0

    for (const unit of units) {
      let amount: number | null = null

      if (billType === 'RENT') {
        // Only occupied, non-owner-occupied units with monthlyRent > 0
        if (unit.status !== 'OCCUPIED' || unit.isOwnerOccupied || unit.monthlyRent <= 0) {
          skipped++
          continue
        }
        amount = unit.monthlyRent
      } else if (billType === 'SERVICE_CHARGE') {
        // Merged units are absorbed into their primary — skip them individually
        if ((unit as any).occupancyType === 'MERGED') { skipped++; continue }
        const occupied = config?.serviceChargeOccupied ?? 0
        const vacant   = config?.serviceChargeVacant   ?? 0
        const baseAmount = unit.customServiceCharge != null
          ? unit.customServiceCharge
          : (unit.status === 'VACANT' ? vacant : occupied)
        // Add the charge of any flats merged into this one
        const mergedExtra = ((unit as any).mergedUnits as { customServiceCharge: number | null; status: string }[])
          .reduce((sum, mu) => sum + (mu.customServiceCharge != null ? mu.customServiceCharge : occupied), 0)
        amount = baseAmount + mergedExtra
        if (amount <= 0) { skipped++; continue }
      } else if (billType === 'GAS') {
        // Gas bills require per-unit meter readings; can't auto-generate without them
        skipped++
        continue
      }

      try {
        await prisma.bill.create({
          data: {
            unitId: unit.id,
            buildingId: bId,
            type: billType,
            amount: amount!,
            month: m,
            year: y,
            dueDate: due,
            status: 'PENDING',
          },
        })
        created++
      } catch (err) {
        if (isPrismaConflict(err)) skipped++
        else throw err
      }
    }

    return ok({ created, skipped })
  } catch {
    return Err.internal('Failed to initiate bills')
  }
}
