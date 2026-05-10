import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { isPremiumBuilding } from '@/lib/utils'
import { PremiumGate } from '@/components/ui/PremiumGate'
import { GarbageClient } from './GarbageClient'

const VIEWER_ROLES = ['ADMIN', 'PRESIDENT', 'SECRETARY']

export default async function GarbagePage() {
  const session = await getServerSession(authOptions)
  if (!session || !VIEWER_ROLES.includes(session.user.role)) redirect('/dashboard')

  const bId = session.user.buildingId ?? 'main'

  const building = await prisma.building.findUnique({
    where: { id: bId },
    select: { plan: true, premiumUntil: true },
  })

  if (!isPremiumBuilding(building)) {
    return <PremiumGate feature="Garbage Collection" />
  }

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const [units, garbageBills, garbageExpenses, fundBalance, config] = await Promise.all([
    prisma.unit.findMany({
      where: { buildingId: bId },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
      select: { id: true, number: true, floor: true, status: true, occupancyType: true },
    }),
    prisma.bill.findMany({
      where: { type: 'GARBAGE', buildingId: bId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    }),
    prisma.expense.findMany({
      where: { buildingId: bId, incomeSource: 'GARBAGE' },
      orderBy: { date: 'desc' },
    }),
    prisma.fundBalance.findUnique({
      where: { buildingId_fundType: { buildingId: bId, fundType: 'GARBAGE' } },
    }),
    prisma.buildingConfig.findUnique({ where: { id: bId } }),
  ])

  const isReadOnly = session.user.role !== 'ADMIN'

  return (
    <GarbageClient
      units={units}
      garbageBills={garbageBills}
      garbageExpenses={garbageExpenses}
      fundBalance={fundBalance}
      garbageRate={(config as any)?.garbageRate ?? 0}
      currentMonth={currentMonth}
      currentYear={currentYear}
      isReadOnly={isReadOnly}
    />
  )
}
