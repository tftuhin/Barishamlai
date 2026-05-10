import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { isPremiumBuilding } from '@/lib/utils'
import { PremiumGate } from '@/components/ui/PremiumGate'
import { WaterClient } from './WaterClient'

const VIEWER_ROLES = ['ADMIN', 'PRESIDENT', 'SECRETARY']

export default async function WaterPage() {
  const session = await getServerSession(authOptions)
  if (!session || !VIEWER_ROLES.includes(session.user.role)) redirect('/dashboard')

  const bId = session.user.buildingId ?? 'main'

  const building = await prisma.building.findUnique({
    where: { id: bId },
    select: { plan: true, premiumUntil: true },
  })

  if (!isPremiumBuilding(building)) {
    return <PremiumGate feature="Water Bills" />
  }

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const [units, waterBills, waterExpenses, fundBalance, monthlySetup] = await Promise.all([
    prisma.unit.findMany({
      where: { buildingId: bId },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
      select: { id: true, number: true, floor: true, status: true, occupancyType: true },
    }),
    prisma.bill.findMany({
      where: { type: 'WATER', buildingId: bId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    }),
    prisma.expense.findMany({
      where: { buildingId: bId, incomeSource: 'WATER' },
      orderBy: { date: 'desc' },
    }),
    prisma.fundBalance.findUnique({
      where: { buildingId_fundType: { buildingId: bId, fundType: 'WATER' } },
    }),
    prisma.monthlySetup.findUnique({
      where: { buildingId_month_year: { buildingId: bId, month: currentMonth, year: currentYear } },
    }),
  ])

  const isReadOnly = session.user.role !== 'ADMIN'

  return (
    <WaterClient
      units={units}
      waterBills={waterBills}
      waterExpenses={waterExpenses}
      fundBalance={fundBalance}
      monthlySetup={monthlySetup}
      currentMonth={currentMonth}
      currentYear={currentYear}
      isReadOnly={isReadOnly}
    />
  )
}
