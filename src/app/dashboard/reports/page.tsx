import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ReportsClient } from './ReportsClient'

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard')

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const bId = session.user.buildingId ?? undefined
  const [bills, expenses, units] = await Promise.all([
    prisma.bill.findMany({ where: { buildingId: bId }, include: { unit: true }, orderBy: [{ year: 'desc' }, { month: 'desc' }] }),
    prisma.expense.findMany({ where: { buildingId: bId }, orderBy: [{ year: 'desc' }, { month: 'desc' }] }),
    prisma.unit.count({ where: { buildingId: bId } }),
  ])

  return <ReportsClient bills={bills} expenses={expenses} totalUnits={units} currentMonth={month} currentYear={year} />
}
