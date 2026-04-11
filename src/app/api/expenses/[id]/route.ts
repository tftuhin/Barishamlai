import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAdmin } from '@/lib/api'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const [, e] = await requireAdmin()
  if (e) return e

  try {
    await prisma.expense.delete({ where: { id: params.id } })
    return ok({ success: true })
  } catch {
    return Err.internal('Failed to delete expense')
  }
}
