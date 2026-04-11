import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ExpensesClient } from './ExpensesClient'

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard')
  const expenses = await prisma.expense.findMany({ where: { buildingId: session.user.buildingId ?? undefined }, orderBy: { date: 'desc' } })
  return <ExpensesClient expenses={expenses} />
}
