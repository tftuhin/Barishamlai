import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAuth } from '@/lib/api'

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const [session, e] = await requireAuth()
  if (e) return e

  try {
    const bill = await prisma.bill.findUnique({
      where: { id: params.id },
      include: { unit: true },
    })
    if (!bill) return Err.notFound('Bill not found')

    const isAdmin =
      session.user.role === 'ADMIN' && bill.buildingId === session.user.buildingId
    const isOwnerPayingRent =
      session.user.role === 'OWNER' &&
      bill.type === 'RENT' &&
      bill.unit.ownerId === session.user.id

    if (!isAdmin && !isOwnerPayingRent) return Err.forbidden()

    const updated = await prisma.bill.update({
      where: { id: params.id },
      data: { status: 'PAID', paidAt: new Date() },
    })
    return ok(updated)
  } catch {
    return Err.internal('Failed to update bill')
  }
}
