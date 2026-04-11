import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ok, created, Err, requirePremium } from '@/lib/api'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Err.unauthorized()

  let receipts
  const bId = session.user.buildingId ?? undefined

  try {
    if (session.user.role === 'ADMIN') {
      receipts = await prisma.receipt.findMany({
        where: { unit: { buildingId: bId } },
        include: { bill: true, unit: true, issuedBy: true, recipient: true },
        orderBy: { createdAt: 'desc' },
      })
    } else if (session.user.role === 'OWNER') {
      const unit = await prisma.unit.findFirst({ where: { ownerId: session.user.id, buildingId: bId } })
      receipts = unit
        ? await prisma.receipt.findMany({
            where: { unitId: unit.id },
            include: { bill: true, unit: true, issuedBy: true, recipient: true },
            orderBy: { createdAt: 'desc' },
          })
        : []
    } else {
      receipts = await prisma.receipt.findMany({
        where: { recipientId: session.user.id },
        include: { bill: true, unit: true, issuedBy: true, recipient: true },
        orderBy: { createdAt: 'desc' },
      })
    }
    return ok(receipts)
  } catch {
    return Err.internal()
  }
}

export async function POST(req: NextRequest) {
  const [session, e] = await requirePremium()
  if (e) return e

  try {
    const { billId } = await req.json()
    if (!billId) return Err.badRequest('billId is required')

    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { unit: { include: { tenant: true } } },
    })

    if (!bill) return Err.notFound('Bill not found')
    if (bill.status !== 'PAID') return Err.badRequest('Cannot issue receipt for unpaid bill')

    // Enforce building isolation
    if (bill.buildingId !== session.user.buildingId) return Err.forbidden()

    const existingReceipt = await prisma.receipt.findUnique({ where: { billId } })
    if (existingReceipt) return Err.conflict('Receipt already issued for this bill')

    if (!bill.unit.tenantId) return Err.badRequest('No tenant assigned to this unit')

    const receipt = await prisma.receipt.create({
      data: {
        billId,
        unitId:      bill.unitId,
        issuedById:  session.user.id,
        recipientId: bill.unit.tenantId,
        amount:      bill.amount,
      },
      include: { bill: true, unit: true, issuedBy: true, recipient: true },
    })

    return created(receipt)
  } catch {
    return Err.internal('Failed to create receipt')
  }
}
