import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, created, Err, requireAdmin, requireViewer } from '@/lib/api'
import type { ExpenseCategory, ExpenseSource, ServiceExpenseCategory } from '@prisma/client'

export async function GET(req: NextRequest) {
  const [session, e] = await requireViewer()
  if (e) return e

  const { searchParams } = new URL(req.url)
  const incomeSource = searchParams.get('incomeSource') as ExpenseSource | null

  try {
    const expenses = await prisma.expense.findMany({
      where: {
        buildingId:  session.user.buildingId!,
        ...(incomeSource ? { incomeSource } : {}),
      },
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
    const { title, amount, category, serviceCategory, incomeSource, date, description, month, year } = body

    if (!title || !amount || !category || !date || month == null || year == null)
      return Err.badRequest('Missing required fields: title, amount, category, date, month, year')

    const expense = await prisma.expense.create({
      data: {
        title:           String(title),
        amount:          Number(amount),
        category:        String(category) as ExpenseCategory,
        serviceCategory: serviceCategory ? String(serviceCategory) as ServiceExpenseCategory : null,
        incomeSource:    (incomeSource ? String(incomeSource) : 'GENERAL') as ExpenseSource,
        date:            new Date(String(date)),
        description:     description ? String(description) : null,
        month:           Number(month),
        year:            Number(year),
        buildingId:      session.user.buildingId,
      },
    })
    return created(expense)
  } catch {
    return Err.internal('Failed to create expense')
  }
}
