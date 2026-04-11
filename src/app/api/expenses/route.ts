import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, created, Err, requireAdmin } from '@/lib/api'
import type { ExpenseCategory, ExpenseSource } from '@prisma/client'

export async function GET() {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const expenses = await prisma.expense.findMany({
      where: { buildingId: session.user.buildingId! },
      orderBy: { date: 'desc' },
    })
    return ok(expenses)
  } catch {
    return Err.internal()
  }
}

export async function POST(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { title, amount, category, incomeSource, date, description, month, year } = body

    if (!title || !amount || !category || !date || month == null || year == null)
      return Err.badRequest('Missing required fields: title, amount, category, date, month, year')

    const expense = await prisma.expense.create({
      data: {
        title:        String(title),
        amount:       Number(amount),
        category:     String(category) as ExpenseCategory,
        incomeSource: (incomeSource ? String(incomeSource) : 'GENERAL') as ExpenseSource,
        date:         new Date(String(date)),
        description:  description ? String(description) : null,
        month:        Number(month),
        year:         Number(year),
        buildingId:   session.user.buildingId,
      },
    })
    return created(expense)
  } catch {
    return Err.internal('Failed to create expense')
  }
}
