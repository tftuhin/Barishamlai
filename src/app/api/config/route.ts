import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAuth, requireAdmin } from '@/lib/api'

const DEFAULT_CONFIG = {
  featureRent:           true,
  featureElectricity:    true,
  featureGas:            true,
  featureLift:           false,
  featureSecurityGuard:  false,
  featureGarbage:        false,
  featureServiceCharge:  true,
  serviceChargeOccupied: 0,
  serviceChargeVacant:   0,
  gasUnitRate:           0,
}

export async function GET() {
  const [session, e] = await requireAuth()
  if (e) return e

  try {
    const bId = session.user.buildingId
    if (!bId) return ok({ id: 'none', ...DEFAULT_CONFIG })

    const config = await prisma.buildingConfig.findUnique({ where: { id: bId } })
    return ok(config ?? { id: bId, ...DEFAULT_CONFIG })
  } catch {
    return Err.internal()
  }
}

export async function PUT(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const bId  = session.user.buildingId!

    const data = {
      featureRent:           Boolean(body.featureRent),
      featureElectricity:    Boolean(body.featureElectricity),
      featureGas:            Boolean(body.featureGas),
      featureLift:           Boolean(body.featureLift),
      featureSecurityGuard:  Boolean(body.featureSecurityGuard),
      featureGarbage:        Boolean(body.featureGarbage),
      featureServiceCharge:  Boolean(body.featureServiceCharge),
      serviceChargeOccupied: Math.max(0, Number(body.serviceChargeOccupied) || 0),
      serviceChargeVacant:   Math.max(0, Number(body.serviceChargeVacant)   || 0),
      gasUnitRate:           Math.max(0, Number(body.gasUnitRate)           || 0),
    }

    const config = await prisma.buildingConfig.upsert({
      where:  { id: bId },
      update: data,
      create: { id: bId, ...data },
    })
    return ok(config)
  } catch {
    return Err.internal('Failed to update config')
  }
}
