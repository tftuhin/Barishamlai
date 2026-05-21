import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAdmin } from '@/lib/api'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const [session, e] = await requireAdmin()
  if (e) return e
  try {
    const bill = await prisma.bill.findUnique({ where: { id: params.id }, select: { buildingId: true } })
    if (!bill) return Err.notFound('Bill not found')
    if (bill.buildingId !== session.user.buildingId) return Err.forbidden()
    const body = await req.json()
    const updated = await prisma.bill.update({
      where: { id: params.id },
      data: {
        ...(body.month  !== undefined && { month:  Number(body.month)  }),
        ...(body.year   !== undefined && { year:   Number(body.year)   }),
        ...(body.type   !== undefined && { type:   body.type           }),
        ...(body.amount !== undefined && { amount: Number(body.amount) }),
        ...(body.status !== undefined && { status: body.status         }),
      },
    })
    return ok(updated)
  } catch {
    return Err.internal('Failed to update bill')
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const bill = await prisma.bill.findUnique({
      where: { id: params.id },
      select: { buildingId: true },
    })
    if (!bill) return Err.notFound('Bill not found')
    if (bill.buildingId !== session.user.buildingId) return Err.forbidden()

    await prisma.$transaction([
      prisma.receipt.deleteMany({ where: { billId: params.id } }),
      prisma.bill.delete({ where: { id: params.id } }),
    ])
    return ok({ success: true })
  } catch {
    return Err.internal('Failed to delete bill')
  }
}
