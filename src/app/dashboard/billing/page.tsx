import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BillingClient } from './BillingClient'

export default async function BillingPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const now = new Date()
  let bills: any[] = []
  let units: any[] = []

  const bId = session.user.buildingId ?? undefined
  if (session.user.role === 'ADMIN') {
    bills = await prisma.bill.findMany({
      where: { buildingId: bId },
      include: { unit: { include: { tenant: true, owner: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
    })
    units = await prisma.unit.findMany({ where: { buildingId: bId }, include: { tenant: true, owner: true }, orderBy: { number: 'asc' } })
  } else if (session.user.role === 'OWNER') {
    const unit = await prisma.unit.findFirst({ where: { ownerId: session.user.id, buildingId: bId } })
    if (unit) {
      bills = await prisma.bill.findMany({
        where: { unitId: unit.id },
        include: { unit: { include: { tenant: true, owner: true } } },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      })
    }
  } else {
    const unit = await prisma.unit.findFirst({ where: { tenantId: session.user.id, buildingId: bId } })
    if (unit) {
      bills = await prisma.bill.findMany({
        where: { unitId: unit.id },
        include: { unit: { include: { tenant: true, owner: true } } },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      })
    }
  }

  return <BillingClient bills={bills} units={units} role={session.user.role} userId={session.user.id} currentMonth={now.getMonth() + 1} currentYear={now.getFullYear()} />
}
