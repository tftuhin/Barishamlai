import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { isPremiumBuilding } from '@/lib/utils'
import { PremiumGate } from '@/components/ui/PremiumGate'
import { CommunitySecurityClient } from './CommunitySecurityClient'

const VIEWER_ROLES = ['ADMIN', 'PRESIDENT', 'SECRETARY', 'MEMBER']

export default async function CommunitySecurityPage() {
  const session = await getServerSession(authOptions)
  if (!session || !VIEWER_ROLES.includes(session.user.role)) redirect('/dashboard')

  const bId = session.user.buildingId ?? 'main'

  const building = await prisma.building.findUnique({
    where: { id: bId },
    select: { plan: true, premiumUntil: true },
  })

  if (!isPremiumBuilding(building)) {
    return <PremiumGate feature="Community Security" />
  }

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const [units, csBills, csExpenses, fundBalance, config] = await Promise.all([
    prisma.unit.findMany({
      where: { buildingId: bId },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
      select: { id: true, number: true, floor: true, status: true, occupancyType: true },
    }),
    prisma.bill.findMany({
      where: { type: 'COMMUNITY_SECURITY', buildingId: bId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    }),
    prisma.expense.findMany({
      where: { buildingId: bId, incomeSource: 'COMMUNITY_SECURITY' },
      orderBy: { date: 'desc' },
    }),
    prisma.fundBalance.findUnique({
      where: { buildingId_fundType: { buildingId: bId, fundType: 'COMMUNITY_SECURITY' } },
    }),
    prisma.buildingConfig.findUnique({ where: { id: bId } }),
  ])

  const isReadOnly = session.user.role !== 'ADMIN'

  return (
    <CommunitySecurityClient
      units={units}
      csBills={csBills}
      csExpenses={csExpenses}
      fundBalance={fundBalance}
      csRate={(config as any)?.communitySecurityRate ?? 0}
      currentMonth={currentMonth}
      currentYear={currentYear}
      isReadOnly={isReadOnly}
    />
  )
}
