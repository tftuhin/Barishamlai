import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { isPremiumBuilding } from '@/lib/utils'
import { PremiumGate } from '@/components/ui/PremiumGate'
import { GasClient } from './GasClient'

const DEFAULT_CONFIG = { gasUnitRate: 0 }
const VIEWER_ROLES = ['ADMIN', 'PRESIDENT', 'SECRETARY', 'MEMBER']

export default async function GasPage() {
  const session = await getServerSession(authOptions)
  if (!session || !VIEWER_ROLES.includes(session.user.role)) redirect('/dashboard')

  const bId = session.user.buildingId ?? 'main'

  const building = await prisma.building.findUnique({
    where: { id: bId },
    select: { plan: true, premiumUntil: true },
  })

  if (!isPremiumBuilding(building)) {
    return <PremiumGate feature="Gas Bills" />
  }

  const [units, gasBills, config, gasExpenses, fundBalance] = await Promise.all([
    prisma.unit.findMany({ where: { buildingId: bId }, orderBy: [{ floor: 'asc' }, { number: 'asc' }] }),
    prisma.bill.findMany({ where: { type: 'GAS', buildingId: bId, year: { gte: new Date().getFullYear() - 1 } }, orderBy: [{ year: 'desc' }, { month: 'desc' }] }),
    prisma.buildingConfig.findUnique({ where: { id: bId } }),
    prisma.expense.findMany({ where: { buildingId: bId, incomeSource: 'GAS', year: { gte: new Date().getFullYear() - 1 } }, orderBy: { date: 'desc' } }),
    prisma.fundBalance.findUnique({ where: { buildingId_fundType: { buildingId: bId, fundType: 'GAS' } } }),
  ])

  const now = new Date()
  const isReadOnly = session.user.role !== 'ADMIN'

  return (
    <GasClient
      units={units}
      gasBills={gasBills}
      gasExpenses={gasExpenses}
      fundBalance={fundBalance}
      gasUnitRate={(config ?? DEFAULT_CONFIG).gasUnitRate}
      currentMonth={now.getMonth() + 1}
      currentYear={now.getFullYear()}
      isReadOnly={isReadOnly}
    />
  )
}
