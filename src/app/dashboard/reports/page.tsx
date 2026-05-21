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
  const [bills, expenses, units, fundBalances, unitOpeningBalances] = await Promise.all([
    prisma.bill.findMany({ where: { buildingId: bId }, include: { unit: { include: { owner: { select: { name: true } }, tenant: { select: { name: true } } } } }, orderBy: [{ year: 'desc' }, { month: 'desc' }] }),
    prisma.expense.findMany({ where: { buildingId: bId }, orderBy: { date: 'desc' } }),
    prisma.unit.count({ where: { buildingId: bId } }),
    prisma.fundBalance.findMany({ where: { buildingId: bId } }),
    prisma.unitOpeningBalance.findMany({ where: { unit: { buildingId: bId } } }),
  ])

  return <ReportsClient bills={bills} expenses={expenses} totalUnits={units} currentMonth={month} currentYear={year} fundBalances={fundBalances} unitOpeningBalances={unitOpeningBalances} />
}
