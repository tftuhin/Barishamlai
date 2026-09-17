import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ReportsClient } from './ReportsClient'

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  const VIEWER_ROLES = ['ADMIN', 'PRESIDENT', 'SECRETARY', 'MEMBER']
  if (!session || !VIEWER_ROLES.includes(session.user.role)) redirect('/dashboard')

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const bId = session.user.buildingId ?? undefined
  const [bills, expenses, units, fundBalances, unitOpeningBalances, building, config] = await Promise.all([
    prisma.bill.findMany({ where: { buildingId: bId, year: { gte: year - 1 } }, include: { unit: { include: { owner: { select: { name: true } }, tenant: { select: { name: true } } } } }, orderBy: [{ year: 'desc' }, { month: 'desc' }] }),
    prisma.expense.findMany({ where: { buildingId: bId, year: { gte: year - 1 } }, orderBy: { date: 'desc' } }),
    prisma.unit.findMany({
      where: { buildingId: bId },
      include: {
        owner:       { select: { name: true } },
        tenant:      { select: { name: true } },
        mergedUnits: { select: { id: true, number: true } },
      },
      orderBy: { number: 'asc' },
    }),
    prisma.fundBalance.findMany({ where: { buildingId: bId } }),
    prisma.unitOpeningBalance.findMany({ where: { unit: { buildingId: bId } } }),
    prisma.building.findUnique({ where: { id: bId }, select: { name: true, address: true } }),
    prisma.buildingConfig.findUnique({ where: { id: bId }, select: { gasUnitRate: true } }),
  ])

  return (
    <ReportsClient
      bills={bills}
      expenses={expenses}
      units={units}
      currentMonth={month}
      currentYear={year}
      fundBalances={fundBalances}
      unitOpeningBalances={unitOpeningBalances}
      buildingName={building?.name ?? null}
      buildingAddress={building?.address ?? null}
      gasUnitRate={config?.gasUnitRate ?? null}
    />
  )
}
