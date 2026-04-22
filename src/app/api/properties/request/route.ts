/**
 * POST /api/properties/request
 * Submit a multi-property activation request (admin only).
 * Developer reviews and approves manually.
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAdmin } from '@/lib/api'

export async function POST(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { phone, totalProperties, totalFlats } = body

    if (!phone || !totalProperties || !totalFlats)
      return Err.badRequest('phone, totalProperties, and totalFlats are required')

    const tp = Number(totalProperties)
    const tf = Number(totalFlats)
    if (tp < 2) return Err.badRequest('totalProperties must be at least 2')
    if (tf < 1) return Err.badRequest('totalFlats must be at least 1')

    // Check for existing pending request
    const existing = await prisma.multiPropertyRequest.findFirst({
      where: { userId: session.user.id, status: 'PENDING' },
    })
    if (existing) {
      return Err.conflict('You already have a pending multi-property request.')
    }

    const request = await prisma.multiPropertyRequest.create({
      data: {
        userId:          session.user.id,
        buildingId:      session.user.buildingId!,
        phone:           String(phone),
        totalProperties: tp,
        totalFlats:      tf,
        status:          'PENDING',
      },
    })

    return ok({ id: request.id, status: request.status })
  } catch {
    return Err.internal('Failed to submit request')
  }
}
