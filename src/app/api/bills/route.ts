import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, created, Err, isPrismaConflict, requireAuth, requireAdmin } from '@/lib/api'
import { BILL_SAFE_INCLUDE } from '@/lib/dto'
import type { BillType } from '@prisma/client'

const VALID_BILL_TYPES = new Set<string>(['RENT', 'SERVICE_CHARGE', 'GAS', 'WATER', 'ELECTRICITY', 'OTHER'])

export async function GET(req: NextRequest) {
  const [session, e] = await requireAuth()
  if (e) return e

  try {
    const { searchParams } = new URL(req.url)
    const month  = searchParams.get('month')
    const year   = searchParams.get('year')
    const unitId = searchParams.get('unitId')
    const type   = searchParams.get('type')
    const limit  = searchParams.get('limit')
    const bId    = session.user.buildingId
    const role   = session.user.role

    const typeFilter = type && VALID_BILL_TYPES.has(type) ? (type as BillType) : undefined

    // Role-based scoping:
    // Tenant only sees bills for their assigned unit;
    // Owner sees bills for units they own;
    // Admin / committee members see all bills in the building.
    const unitFilter: Record<string, unknown> = {}
    if (unitId) unitFilter.id = unitId
    if (role === 'TENANT') {
      unitFilter.tenantId = session.user.id
    } else if (role === 'OWNER') {
      unitFilter.ownerId = session.user.id
    }

    const bills = await prisma.bill.findMany({
      where: {
        ...(bId ? { buildingId: bId } : {}),
        ...(month && year ? { month: Number(month), year: Number(year) } : {}),
        ...(Object.keys(unitFilter).length > 0 ? { unit: unitFilter } : {}),
        ...(typeFilter ? { type: typeFilter } : {}),
      },
      include: BILL_SAFE_INCLUDE,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      ...(limit ? { take: Number(limit) } : {}),
    })
    return ok(bills)
  } catch {
    return Err.internal()
  }
}

export async function POST(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { unitId, type, amount, month, year, dueDate, note, meterReading } = body

    if (!unitId || !type || !amount || !month || !year || !dueDate)
      return Err.badRequest('Missing required fields: unitId, type, amount, month, year, dueDate')

    if (!VALID_BILL_TYPES.has(String(type)))
      return Err.badRequest('Invalid bill type')

    // T02: Verify unit belongs to the active building before creating bill
    const unit = await prisma.unit.findUnique({
      where: { id: String(unitId) },
      select: { buildingId: true },
    })
    if (!unit || unit.buildingId !== session.user.buildingId) {
      return Err.badRequest('Unit does not belong to your building')
    }

    const bill = await prisma.bill.create({
      data: {
        unitId:       String(unitId),
        type:         type as BillType,
        amount:       Number(amount),
        month:        Number(month),
        year:         Number(year),
        dueDate:      new Date(String(dueDate)),
        status:       'PENDING',
        note:         note ? String(note) : null,
        meterReading: meterReading != null ? Number(meterReading) : null,
        buildingId:   session.user.buildingId,
      },
      include: BILL_SAFE_INCLUDE,
    })
    return created(bill)
  } catch (e) {
    if (isPrismaConflict(e))
      return Err.conflict('A bill for this unit, type and month already exists.')
    return Err.internal('Failed to create bill')
  }
}
