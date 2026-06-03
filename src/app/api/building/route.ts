import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAdmin } from '@/lib/api'

export async function PATCH(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e

  const bId = session.user.buildingId
  if (!bId) return Err.badRequest('No building associated with this account')

  try {
    const body = await req.json() as Record<string, unknown>
    const data: Record<string, unknown> = {}

    if (body.name !== undefined) {
      const name = String(body.name).trim()
      if (!name) return Err.badRequest('Building name cannot be empty')
      data.name = name
    }
    if (body.address !== undefined) {
      data.address = body.address ? String(body.address).trim() : null
    }

    const building = await prisma.building.update({
      where: { id: bId },
      data,
      select: { id: true, name: true, address: true },
    })
    return ok(building)
  } catch {
    return Err.internal('Failed to update building')
  }
}
