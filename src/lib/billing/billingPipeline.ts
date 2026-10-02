import { prisma } from '@/lib/prisma'
import { toPaisa, toTaka, allocatePaisaEvenly } from '@/lib/finance/money'
import { billTypeToFundType } from '@/lib/finance/paymentService'
import type { BillType, UnitStatus } from '@prisma/client'

export interface BillableUnitItem {
  unitId: string
  unitNumber: string
  status: UnitStatus
  amountPaisa: bigint
  amountTaka: number
  note?: string
  recipientName?: string
  recipientEmail?: string
  existingBillId?: string
  canGenerate: boolean
  skipReason?: string
}

export interface BillingPeriod {
  month: number
  year: number
}

/**
 * Pure calculation logic for water bill division ensuring zero remainder.
 */
export function calculateWaterShares(
  totalWaterAmount: number,
  occupiedUnits: Array<{ id: string; number: string }>
): Array<{ unitId: string; unitNumber: string; amountPaisa: bigint; amountTaka: number }> {
  if (occupiedUnits.length === 0 || totalWaterAmount <= 0) return []

  const totalPaisa = toPaisa(totalWaterAmount)
  const allocations = allocatePaisaEvenly(totalPaisa, occupiedUnits.length)

  return occupiedUnits.map((unit, index) => ({
    unitId: unit.id,
    unitNumber: unit.number,
    amountPaisa: allocations[index],
    amountTaka: toTaka(allocations[index]),
  }))
}

/**
 * Centralized resolution of billable units for any module and billing period.
 * Guarantees that preview, manual issue, and cron generation use identical logic.
 */
export async function getBillableUnits(
  buildingId: string,
  module: BillType,
  period: BillingPeriod
): Promise<{
  items: BillableUnitItem[]
  totalAmountPaisa: bigint
  totalAmountTaka: number
  billableCount: number
}> {
  const building = await prisma.building.findUnique({
    where: { id: buildingId },
    include: {
      config: true,
      units: {
        include: {
          tenant: { select: { id: true, name: true, email: true } },
          owner:  { select: { id: true, name: true, email: true } },
          bills: {
            where: {
              type: module,
              month: period.month,
              year: period.year,
            },
            select: { id: true, status: true, amount: true },
          },
        },
        orderBy: { number: 'asc' },
      },
    },
  })

  if (!building) {
    throw new Error(`Building ${buildingId} not found`)
  }

  const cfg = building.config
  const items: BillableUnitItem[] = []

  if (module === 'RENT') {
    for (const unit of building.units) {
      const existingBill = unit.bills[0]
      const rentPaisa = toPaisa(unit.monthlyRent)

      let canGenerate = true
      let skipReason: string | undefined

      if (existingBill) {
        canGenerate = false
        skipReason = `Bill already exists (${existingBill.status})`
      } else if (unit.status !== 'OCCUPIED') {
        canGenerate = false
        skipReason = 'Unit is vacant'
      } else if (unit.isOwnerOccupied) {
        canGenerate = false
        skipReason = 'Unit is owner-occupied'
      } else if (unit.skipRentModule) {
        canGenerate = false
        skipReason = 'Rent module disabled for unit'
      } else if (rentPaisa <= BigInt(0)) {
        canGenerate = false
        skipReason = 'Rent amount is zero'
      }

      items.push({
        unitId: unit.id,
        unitNumber: unit.number,
        status: unit.status,
        amountPaisa: rentPaisa,
        amountTaka: toTaka(rentPaisa),
        recipientName: unit.tenant?.name ?? undefined,
        recipientEmail: unit.tenant?.email ?? undefined,
        existingBillId: existingBill?.id,
        canGenerate,
        skipReason,
      })
    }
  } else if (module === 'SERVICE_CHARGE') {
    const scOccupied = toPaisa(cfg?.serviceChargeOccupied ?? 0)
    const scVacant   = toPaisa(cfg?.serviceChargeVacant ?? 0)

    for (const unit of building.units) {
      const existingBill = unit.bills[0]
      const customPaisa = unit.customServiceCharge != null ? toPaisa(unit.customServiceCharge) : null
      const standardPaisa = unit.status === 'VACANT' ? scVacant : scOccupied
      const amountPaisa = customPaisa !== null ? customPaisa : standardPaisa

      let canGenerate = true
      let skipReason: string | undefined

      if (existingBill) {
        canGenerate = false
        skipReason = `Bill already exists (${existingBill.status})`
      } else if (amountPaisa <= BigInt(0)) {
        canGenerate = false
        skipReason = 'Service charge rate is zero'
      }

      items.push({
        unitId: unit.id,
        unitNumber: unit.number,
        status: unit.status,
        amountPaisa,
        amountTaka: toTaka(amountPaisa),
        recipientName: unit.status === 'OCCUPIED' ? (unit.tenant?.name ?? unit.owner?.name) : unit.owner?.name,
        recipientEmail: unit.status === 'OCCUPIED' ? (unit.tenant?.email ?? unit.owner?.email) : unit.owner?.email,
        existingBillId: existingBill?.id,
        canGenerate,
        skipReason,
      })
    }
  } else if (module === 'WATER') {
    // Water division based on MonthlySetup
    const monthlySetup = await prisma.monthlySetup.findUnique({
      where: {
        buildingId_month_year: {
          buildingId,
          month: period.month,
          year: period.year,
        },
      },
    })

    const occupiedUnits = building.units.filter(u => u.status === 'OCCUPIED')
    const shares = monthlySetup?.waterBillTotal
      ? calculateWaterShares(monthlySetup.waterBillTotal, occupiedUnits)
      : []

    const shareMap = new Map(shares.map(s => [s.unitId, s]))

    for (const unit of building.units) {
      const existingBill = unit.bills[0]
      const share = shareMap.get(unit.id)
      const amountPaisa = share ? share.amountPaisa : BigInt(0)

      let canGenerate = true
      let skipReason: string | undefined

      if (existingBill) {
        canGenerate = false
        skipReason = `Bill already exists (${existingBill.status})`
      } else if (unit.status !== 'OCCUPIED') {
        canGenerate = false
        skipReason = 'Unit is vacant (not included in water division)'
      } else if (!monthlySetup?.waterBillTotal) {
        canGenerate = false
        skipReason = 'Monthly water bill total not set'
      } else if (amountPaisa <= BigInt(0)) {
        canGenerate = false
        skipReason = 'Water share is zero'
      }

      items.push({
        unitId: unit.id,
        unitNumber: unit.number,
        status: unit.status,
        amountPaisa,
        amountTaka: toTaka(amountPaisa),
        recipientName: unit.tenant?.name ?? unit.owner?.name,
        recipientEmail: unit.tenant?.email ?? unit.owner?.email,
        existingBillId: existingBill?.id,
        canGenerate,
        skipReason,
      })
    }
  } else if (module === 'GARBAGE') {
    const garbageRate = toPaisa(cfg?.garbageRate ?? 0)

    for (const unit of building.units) {
      const existingBill = unit.bills[0]
      let canGenerate = true
      let skipReason: string | undefined

      if (existingBill) {
        canGenerate = false
        skipReason = `Bill already exists (${existingBill.status})`
      } else if (unit.status !== 'OCCUPIED') {
        canGenerate = false
        skipReason = 'Unit is vacant'
      } else if (garbageRate <= BigInt(0)) {
        canGenerate = false
        skipReason = 'Garbage rate is zero'
      }

      items.push({
        unitId: unit.id,
        unitNumber: unit.number,
        status: unit.status,
        amountPaisa: garbageRate,
        amountTaka: toTaka(garbageRate),
        recipientName: unit.tenant?.name ?? unit.owner?.name,
        recipientEmail: unit.tenant?.email ?? unit.owner?.email,
        existingBillId: existingBill?.id,
        canGenerate,
        skipReason,
      })
    }
  } else if (module === 'COMMUNITY_SECURITY') {
    const csRate = toPaisa(cfg?.communitySecurityRate ?? 0)

    for (const unit of building.units) {
      const existingBill = unit.bills[0]
      let canGenerate = true
      let skipReason: string | undefined

      if (existingBill) {
        canGenerate = false
        skipReason = `Bill already exists (${existingBill.status})`
      } else if (unit.status !== 'OCCUPIED') {
        canGenerate = false
        skipReason = 'Unit is vacant'
      } else if (csRate <= BigInt(0)) {
        canGenerate = false
        skipReason = 'Community security rate is zero'
      }

      items.push({
        unitId: unit.id,
        unitNumber: unit.number,
        status: unit.status,
        amountPaisa: csRate,
        amountTaka: toTaka(csRate),
        recipientName: unit.tenant?.name ?? unit.owner?.name,
        recipientEmail: unit.tenant?.email ?? unit.owner?.email,
        existingBillId: existingBill?.id,
        canGenerate,
        skipReason,
      })
    }
  } else {
    // Other modules fallback
    for (const unit of building.units) {
      const existingBill = unit.bills[0]
      items.push({
        unitId: unit.id,
        unitNumber: unit.number,
        status: unit.status,
        amountPaisa: BigInt(0),
        amountTaka: 0,
        existingBillId: existingBill?.id,
        canGenerate: false,
        skipReason: `Unsupported automatic billing for ${module}`,
      })
    }
  }

  const billableItems = items.filter(i => i.canGenerate)
  const totalAmountPaisa = billableItems.reduce((acc, i) => acc + i.amountPaisa, BigInt(0))

  return {
    items,
    totalAmountPaisa,
    totalAmountTaka: toTaka(totalAmountPaisa),
    billableCount: billableItems.length,
  }
}

export interface IssueModuleBillsInput {
  buildingId: string
  module: BillType
  period: BillingPeriod
  dueDate: Date
  userId?: string | null
}

/**
 * Issues bills atomically for all billable units in a module.
 * Guaranteed idempotency and financial event logging.
 */
export async function issueModuleBills(input: IssueModuleBillsInput) {
  const { items } = await getBillableUnits(input.buildingId, input.module, input.period)
  const toGenerate = items.filter(i => i.canGenerate)

  if (toGenerate.length === 0) {
    return { createdCount: 0, skippedCount: items.length, bills: [] }
  }

  return prisma.$transaction(async (tx) => {
    const createdBills = []

    for (const item of toGenerate) {
      const bill = await tx.bill.create({
        data: {
          unitId:     item.unitId,
          buildingId: input.buildingId,
          type:       input.module,
          amount:     item.amountTaka,
          month:      input.period.month,
          year:       input.period.year,
          dueDate:    input.dueDate,
          status:     'PENDING',
          note:       item.note ?? null,
        },
      })

      // Log financial event for bill issuance
      await tx.financialEvent.create({
        data: {
          buildingId:      input.buildingId,
          fund:            billTypeToFundType(input.module),
          eventType:       'BILL_ISSUED',
          amountPaisa:     item.amountPaisa,
          direction:       'INFLOW',
          effectiveAt:     new Date(),
          entityType:      'Bill',
          entityId:        bill.id,
          createdByUserId: input.userId ?? null,
          reason:          `Generated ${input.module} bill for Unit ${item.unitNumber}`,
          idempotencyKey:  `BILL_${bill.id}`,
        },
      })

      createdBills.push(bill)
    }

    return {
      createdCount: createdBills.length,
      skippedCount: items.length - createdBills.length,
      bills: createdBills,
    }
  })
}
