import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { isPremiumBuilding } from '@/lib/utils'
import { PremiumGate } from '@/components/ui/PremiumGate'
import { GasClient } from './GasClient'

const DEFAULT_CONFIG = { gasUnitRate: 0 }

export default async function GasPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const bId = session.user.buildingId ?? 'main'

  const building = await prisma.building.findUnique({
    where: { id: bId },
    select: { plan: true, premiumUntil: true },
  })

  if (!isPremiumBuilding(building)) {
    return <PremiumGate feature="Gas Bills" />
  }

  const [units, gasBills, config] = await Promise.all([
    prisma.unit.findMany({ where: { buildingId: bId }, orderBy: [{ floor: 'asc' }, { number: 'asc' }] }),
    prisma.bill.findMany({ where: { type: 'GAS', buildingId: bId }, orderBy: [{ year: 'desc' }, { month: 'desc' }] }),
    prisma.buildingConfig.findUnique({ where: { id: bId } }),
  ])

  const now = new Date()
  return (
    <GasClient
      units={units}
      gasBills={gasBills}
      gasUnitRate={(config ?? DEFAULT_CONFIG).gasUnitRate}
      currentMonth={now.getMonth() + 1}
      currentYear={now.getFullYear()}
    />
  )
}
