import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireDeveloper } from '@/lib/api'
import type { BuildingStatus } from '@prisma/client'

const VALID_STATUSES = new Set<string>(['ACTIVE', 'LOCKED', 'BLOCKED', 'BANNED'])

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const [, e] = await requireDeveloper()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { status, statusNote } = body

    if (!status || !VALID_STATUSES.has(String(status)))
      return Err.badRequest('status must be ACTIVE, LOCKED, BLOCKED, or BANNED')

    const building = await prisma.building.findUnique({ where: { id: params.id } })
    if (!building) return Err.notFound('Building not found')

    const updated = await prisma.building.update({
      where: { id: params.id },
      data: {
        status:          String(status) as BuildingStatus,
        statusNote:      statusNote ? String(statusNote).trim() : null,
        statusUpdatedAt: new Date(),
      },
      select: { id: true, name: true, status: true, statusNote: true, statusUpdatedAt: true },
    })

    return ok({
      ...updated,
      statusUpdatedAt: updated.statusUpdatedAt?.toISOString() ?? null,
    })
  } catch {
    return Err.internal('Failed to update building status')
  }
}
