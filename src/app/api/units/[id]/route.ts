import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAuth, requireAdmin } from '@/lib/api'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const [session, e] = await requireAuth()
  if (e) return e

  const role = session.user.role
  if (!['ADMIN', 'OWNER'].includes(role)) return Err.forbidden()

  try {
    const unit = await prisma.unit.findUnique({ where: { id: params.id } })
    if (!unit) return Err.notFound('Unit not found')

    // Enforce building isolation for all roles
    if (unit.buildingId !== session.user.buildingId) return Err.forbidden()

    if (role === 'OWNER' && unit.ownerId !== session.user.id) return Err.forbidden()

    const body = await req.json() as Record<string, unknown>
    const data: Record<string, unknown> = {}

    if (body.ownerContactName  !== undefined) data.ownerContactName  = body.ownerContactName  ?? null
    if (body.ownerPhone        !== undefined) data.ownerPhone        = body.ownerPhone        ?? null
    if (body.tenantContactName !== undefined) data.tenantContactName = body.tenantContactName ?? null
    if (body.tenantPhone       !== undefined) data.tenantPhone       = body.tenantPhone       ?? null
    if (body.tenantNid         !== undefined) data.tenantNid         = body.tenantNid         ?? null

    if (body.ownerEmail        !== undefined) data.ownerEmail        = body.ownerEmail        ?? null
    if (body.tenantEmail       !== undefined) data.tenantEmail       = body.tenantEmail       ?? null

    if (role === 'ADMIN') {
      if (body.status             !== undefined) data.status             = body.status
      if (body.monthlyRent        !== undefined) data.monthlyRent        = Number(body.monthlyRent)
      if (body.floor              !== undefined) data.floor              = Number(body.floor)
      if (body.area               !== undefined) data.area               = body.area ? Number(body.area) : null
      if (body.ownerId            !== undefined) data.ownerId            = body.ownerId  || null
      if (body.tenantId           !== undefined) data.tenantId           = body.tenantId || null
      if (body.isOwnerOccupied    !== undefined) data.isOwnerOccupied    = Boolean(body.isOwnerOccupied)
      if (body.occupancyType      !== undefined) data.occupancyType      = body.occupancyType
      if (body.serviceChargeType  !== undefined) data.serviceChargeType  = body.serviceChargeType
      if (body.skipRentModule     !== undefined) data.skipRentModule     = Boolean(body.skipRentModule)
      if (body.tenantMoveInDate   !== undefined) data.tenantMoveInDate   = body.tenantMoveInDate ? new Date(body.tenantMoveInDate as string) : null
      if (body.mergedWithUnitId   !== undefined) data.mergedWithUnitId   = body.mergedWithUnitId || null
      if (body.isOwnerOccupied) {
        data.tenantId = null
        data.status   = 'OCCUPIED'
      }
      if (body.customServiceCharge !== undefined)
        data.customServiceCharge = body.customServiceCharge !== null && body.customServiceCharge !== '' ? Number(body.customServiceCharge) : null
    }

    const updated = await prisma.unit.update({
      where: { id: params.id },
      data,
      include: { owner: true, tenant: true, mergedWith: { select: { id: true, number: true } } },
    })
    return ok(updated)
  } catch {
    return Err.internal('Failed to update unit')
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const unit = await prisma.unit.findUnique({ where: { id: params.id }, select: { buildingId: true } })
    if (!unit) return Err.notFound('Unit not found')
    if (unit.buildingId !== session.user.buildingId) return Err.forbidden()

    await prisma.$transaction([
      // Remove child records before removing the unit
      prisma.unitOpeningBalance.deleteMany({ where: { unitId: params.id } }),
      prisma.receipt.deleteMany({           where: { unitId: params.id } }),
      prisma.bill.deleteMany({              where: { unitId: params.id } }),
      prisma.unit.delete({                  where: { id:     params.id } }),
    ])
    return ok({ success: true })
  } catch {
    return Err.internal('Failed to delete unit')
  }
}
