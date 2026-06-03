import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireDeveloper } from '@/lib/api'
import type { BuildingTier } from '@prisma/client'

const VALID_TIERS = new Set<string>(['BASIC', 'STANDARD', 'PRO', 'ENTERPRISE'])

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const [, e] = await requireDeveloper()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { plan, tier, months } = body

    if (!['FREE', 'PREMIUM'].includes(String(plan)))
      return Err.badRequest('Invalid plan')

    let premiumUntil: Date | null = null
    let tierValue: BuildingTier | null = null

    if (plan === 'PREMIUM') {
      if (!tier || !VALID_TIERS.has(String(tier)))
        return Err.badRequest('A valid tier (BASIC, STANDARD, PRO, ENTERPRISE) is required for premium')

      tierValue = tier as BuildingTier

      const m = Number(months)
      if (!m || m < 1 || m > 24)
        return Err.badRequest('months must be 1–24')

      const existing = await prisma.building.findUnique({
        where: { id: params.id },
        select: { premiumUntil: true },
      })
      const base =
        existing?.premiumUntil && existing.premiumUntil > new Date()
          ? existing.premiumUntil
          : new Date()
      premiumUntil = new Date(base)
      premiumUntil.setMonth(premiumUntil.getMonth() + m)
    }

    const updated = await prisma.building.update({
      where: { id: params.id },
      data:  { plan: plan as 'FREE' | 'PREMIUM', tier: tierValue, premiumUntil },
      select: { id: true, name: true, plan: true, tier: true, premiumUntil: true },
    })

    return ok({
      ...updated,
      premiumUntil: updated.premiumUntil?.toISOString() ?? null,
    })
  } catch {
    return Err.internal('Failed to update plan')
  }
}
