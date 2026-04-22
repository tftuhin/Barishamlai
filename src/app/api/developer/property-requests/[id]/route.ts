/**
 * PATCH /api/developer/property-requests/[id]
 * Approve or reject a multi-property activation request.
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireDeveloper } from '@/lib/api'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const [, e] = await requireDeveloper()
  if (e) return e

  try {
    const body   = await req.json() as Record<string, unknown>
    const status = String(body.status ?? '')
    const note   = body.note ? String(body.note) : null

    if (!['APPROVED', 'REJECTED'].includes(status))
      return Err.badRequest('status must be APPROVED or REJECTED')

    const request = await prisma.multiPropertyRequest.findUnique({ where: { id: params.id } })
    if (!request) return Err.notFound('Request not found')

    const updated = await prisma.multiPropertyRequest.update({
      where: { id: params.id },
      data:  { status, note },
    })

    return ok({ id: updated.id, status: updated.status, note: updated.note })
  } catch {
    return Err.internal('Failed to update request')
  }
}
