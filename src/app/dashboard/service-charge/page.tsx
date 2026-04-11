import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ServiceChargeClient } from './ServiceChargeClient'

const DEFAULT_CONFIG = { serviceChargeOccupied: 0, serviceChargeVacant: 0 }

export default async function ServiceChargePage() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const bId = session.user.buildingId ?? 'main'
  const [units, bills, config] = await Promise.all([
    prisma.unit.findMany({ where: { buildingId: bId }, orderBy: [{ floor: 'asc' }, { number: 'asc' }] }),
    prisma.bill.findMany({ where: { type: 'SERVICE_CHARGE', buildingId: bId }, orderBy: [{ year: 'desc' }, { month: 'desc' }] }),
    prisma.buildingConfig.findUnique({ where: { id: bId } }),
  ])

  const now = new Date()
  const cfg = config ?? DEFAULT_CONFIG
  return (
    <ServiceChargeClient
      units={units}
      bills={bills}
      serviceChargeOccupied={cfg.serviceChargeOccupied}
      serviceChargeVacant={cfg.serviceChargeVacant}
      currentMonth={now.getMonth() + 1}
      currentYear={now.getFullYear()}
    />
  )
}
