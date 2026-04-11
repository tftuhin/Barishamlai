import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, created, Err, isPrismaConflict, requireAuth, requireAdmin } from '@/lib/api'
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

    const typeFilter = type && VALID_BILL_TYPES.has(type) ? (type as BillType) : undefined

    const bills = await prisma.bill.findMany({
      where: {
        ...(bId ? { buildingId: bId } : {}),
        ...(month && year ? { month: Number(month), year: Number(year) } : {}),
        ...(unitId ? { unitId } : {}),
        ...(typeFilter ? { type: typeFilter } : {}),
      },
      include: { unit: { include: { tenant: true, owner: true } } },
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
    })
    return created(bill)
  } catch (e) {
    if (isPrismaConflict(e))
      return Err.conflict('A bill for this unit, type and month already exists.')
    return Err.internal('Failed to create bill')
  }
}
