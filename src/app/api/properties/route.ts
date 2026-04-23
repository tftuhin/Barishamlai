/**
 * GET  /api/properties — list all buildings the current admin has access to
 * POST /api/properties — create a new building (requires approved multi-property request)
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, created, Err, err, requireAdmin } from '@/lib/api'

export async function GET() {
  const [session, e] = await requireAdmin()
  if (e) return e

  const userId = session.user.id

  try {
    // Get user's actual primary building from DB (not from session, since session switches)
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { buildingId: true },
    })
    const truePrimaryId = dbUser?.buildingId ?? null

    // Get primary building
    const primary = truePrimaryId
      ? await prisma.building.findUnique({ where: { id: truePrimaryId }, select: { id: true, name: true } })
      : null

    // Get additional buildings via UserBuilding
    const extras = await prisma.userBuilding.findMany({
      where: { userId },
      include: { building: { select: { id: true, name: true } } },
    })

    const properties: { id: string; name: string }[] = []
    if (primary) properties.push(primary)
    for (const ub of extras) {
      if (ub.buildingId !== truePrimaryId) {
        properties.push({ id: ub.buildingId, name: ub.building.name })
      }
    }

    // Get approved multi-property request for limit/canAdd
    const approved = await prisma.multiPropertyRequest.findFirst({
      where: { userId, status: 'APPROVED' },
      select: { approvedProperties: true },
    })

    const limit = approved?.approvedProperties ?? null
    const canAdd = limit === null ? false : properties.length < limit

    return ok({ properties, limit, canAdd })
  } catch {
    return Err.internal()
  }
}

export async function POST(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e

  const userId = session.user.id

  try {
    // Verify user has an approved multi-property request
    const approved = await prisma.multiPropertyRequest.findFirst({
      where: { userId, status: 'APPROVED' },
    })
    if (!approved) {
      return Err.paymentRequired('Multi-property access not approved. Please submit a request first.')
    }

    // Check if user has reached their property limit
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { buildingId: true },
    })
    const hasPrimary = dbUser?.buildingId !== null ? 1 : 0
    const additionalCount = await prisma.userBuilding.count({ where: { userId } })
    const currentCount = hasPrimary + additionalCount

    if (approved.approvedProperties !== null && currentCount >= approved.approvedProperties) {
      return err(`Property limit reached (${currentCount}/${approved.approvedProperties})`, 403)
    }

    const body = await req.json() as Record<string, unknown>
    const name  = body.name ? String(body.name).trim() : ''
    if (!name) return Err.badRequest('Building name is required')

    // Create new building + config + UserBuilding link
    const building = await prisma.$transaction(async tx => {
      const b = await tx.building.create({
        data: { name, plan: 'FREE' },
      })
      await tx.buildingConfig.create({
        data: { id: b.id },
      })
      await tx.userBuilding.create({
        data: { userId, buildingId: b.id },
      })
      return b
    })

    return ok({ id: building.id, name: building.name }, 201)
  } catch {
    return Err.internal('Failed to create property')
  }
}
