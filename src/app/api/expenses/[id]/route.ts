import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAdmin } from '@/lib/api'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const expense = await prisma.expense.findUnique({ where: { id: params.id }, select: { buildingId: true } })
    if (!expense) return Err.notFound('Expense not found')
    if (expense.buildingId !== session.user.buildingId) return Err.forbidden()

    await prisma.expense.delete({ where: { id: params.id } })
    return ok({ success: true })
  } catch {
    return Err.internal('Failed to delete expense')
  }
}
