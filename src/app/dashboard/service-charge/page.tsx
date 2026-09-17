import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ServiceChargeClient } from './ServiceChargeClient'

const DEFAULT_CONFIG = { serviceChargeOccupied: 0, serviceChargeVacant: 0 }
const VIEWER_ROLES = ['ADMIN', 'PRESIDENT', 'SECRETARY', 'MEMBER']

export default async function ServiceChargePage() {
  const session = await getServerSession(authOptions)
  if (!session || !VIEWER_ROLES.includes(session.user.role)) redirect('/dashboard')

  const bId = session.user.buildingId ?? 'main'
  const [units, bills, config, scExpenses, fundBalance] = await Promise.all([
    prisma.unit.findMany({ where: { buildingId: bId }, orderBy: [{ floor: 'asc' }, { number: 'asc' }], select: { id: true, number: true, floor: true, status: true, isOwnerOccupied: true, customServiceCharge: true } }),
    prisma.bill.findMany({ where: { type: 'SERVICE_CHARGE', buildingId: bId, year: { gte: new Date().getFullYear() - 1 } }, orderBy: [{ year: 'desc' }, { month: 'desc' }] }),
    prisma.buildingConfig.findUnique({ where: { id: bId } }),
    prisma.expense.findMany({ where: { buildingId: bId, incomeSource: 'SERVICE_CHARGE', year: { gte: new Date().getFullYear() - 1 } }, orderBy: { date: 'desc' } }),
    prisma.fundBalance.findUnique({ where: { buildingId_fundType: { buildingId: bId, fundType: 'SERVICE_CHARGE' } } }),
  ])

  const now = new Date()
  const cfg = config ?? DEFAULT_CONFIG
  const isReadOnly = session.user.role !== 'ADMIN'

  return (
    <ServiceChargeClient
      units={units}
      bills={bills}
      scExpenses={scExpenses}
      fundBalance={fundBalance}
      serviceChargeOccupied={cfg.serviceChargeOccupied}
      serviceChargeVacant={cfg.serviceChargeVacant}
      currentMonth={now.getMonth() + 1}
      currentYear={now.getFullYear()}
      isReadOnly={isReadOnly}
    />
  )
}
