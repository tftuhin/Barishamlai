import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { UnitsClient } from './UnitsClient'

export default async function UnitsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (!['ADMIN', 'OWNER'].includes(session.user.role)) redirect('/dashboard')

  const bId = session.user.buildingId ?? undefined
  const [units, users, building] = await Promise.all([
    prisma.unit.findMany({
      where: { buildingId: bId },
      include: { owner: true, tenant: true, mergedWith: { select: { id: true, number: true } } },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
    }),
    prisma.user.findMany({
      where: { role: { in: ['OWNER', 'TENANT'] }, buildingId: bId },
      select: { id: true, name: true, role: true },
      orderBy: { name: 'asc' },
    }),
    bId ? prisma.building.findUnique({ where: { id: bId }, select: { plan: true, premiumUntil: true } }) : null,
  ])

  const isPremium = building?.plan === 'PREMIUM' && building.premiumUntil && building.premiumUntil > new Date()

  const serializedUnits = units.map(u => ({
    ...u,
    tenantMoveInDate: u.tenantMoveInDate ? u.tenantMoveInDate.toISOString() : null,
  }))

  return (
    <UnitsClient
      units={serializedUnits}
      users={users}
      role={session.user.role}
      currentUserId={session.user.id}
      isPremium={!!isPremium}
      premiumUntil={building?.premiumUntil?.toISOString() ?? null}
    />
  )
}
