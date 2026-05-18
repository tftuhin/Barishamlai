import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard')

  const bId = session.user.buildingId ?? undefined

  const building = await prisma.building.findUnique({ where: { id: bId ?? '' }, select: { name: true, address: true } })

  const [users, joinRequests, invitations, config, units, fundBalances] = await Promise.all([
    prisma.user.findMany({
      where: { buildingId: bId },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.joinRequest.findMany({
      where: { buildingId: bId ?? '' },
      include: { user: { select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invitation.findMany({
      where: { buildingId: bId ?? '' },
      orderBy: { createdAt: 'desc' },
    }),
    (async () => {
      try { return await (prisma as any).buildingConfig.findUnique({ where: { id: bId ?? 'main' } }) }
      catch { return null }
    })(),
    prisma.unit.findMany({
      where: { buildingId: bId },
      select: { id: true, number: true, floor: true },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
    }),
    prisma.fundBalance.findMany({ where: { buildingId: bId ?? '' } }),
  ])

  return (
    <SettingsClient
      users={users}
      currentUserId={session.user.id}
      buildingId={bId ?? ''}
      buildingName={building?.name ?? session.user.buildingName ?? ''}
      buildingAddress={building?.address ?? ''}
      joinRequests={joinRequests}
      invitations={invitations}
      config={config}
      units={units}
      fundBalances={fundBalances.map(b => ({ fundType: b.fundType, amount: Number(b.amount) }))}
    />
  )
}
