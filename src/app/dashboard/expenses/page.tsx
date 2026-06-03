import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ExpensesClient } from './ExpensesClient'

const VIEWER_ROLES = ['ADMIN', 'PRESIDENT', 'SECRETARY', 'MEMBER']

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions)
  if (!session || !VIEWER_ROLES.includes(session.user.role)) redirect('/dashboard')
  const bId = session.user.buildingId ?? undefined
  // General expenses only — SC/Gas expenses live on their own pages
  const expenses = await prisma.expense.findMany({
    where: { buildingId: bId, incomeSource: 'GENERAL' },
    orderBy: { date: 'desc' },
  })
  const isReadOnly = session.user.role !== 'ADMIN'
  return <ExpensesClient expenses={expenses} isReadOnly={isReadOnly} />
}
