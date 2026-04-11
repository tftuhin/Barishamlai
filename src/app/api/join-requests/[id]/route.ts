import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAdmin } from '@/lib/api'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { status } = body

    if (!['APPROVED', 'REJECTED'].includes(String(status)))
      return Err.badRequest('status must be APPROVED or REJECTED')

    const joinRequest = await prisma.joinRequest.findUnique({ where: { id: params.id } })
    if (!joinRequest) return Err.notFound()
    if (joinRequest.buildingId !== session.user.buildingId) return Err.forbidden()

    if (status === 'APPROVED') {
      await prisma.$transaction([
        prisma.joinRequest.update({ where: { id: params.id }, data: { status: 'APPROVED' } }),
        prisma.user.update({
          where: { id: joinRequest.userId },
          data:  { buildingId: joinRequest.buildingId, role: joinRequest.role },
        }),
      ])
    } else {
      await prisma.joinRequest.update({ where: { id: params.id }, data: { status: 'REJECTED' } })
    }

    return ok({ success: true })
  } catch {
    return Err.internal('Failed to process join request')
  }
}
