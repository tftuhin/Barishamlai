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
  if (['ADMIN', 'PRESIDENT', 'SECRETARY', 'MEMBER'].includes(session.user.role)) {
    bills = await prisma.bill.findMany({
      where: { buildingId: bId, year: { gte: now.getFullYear() - 1 } },
      include: { unit: { include: { tenant: true, owner: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
    })
    units = await prisma.unit.findMany({ where: { buildingId: bId }, include: { tenant: true, owner: true }, orderBy: { number: 'asc' } })
  } else if (session.user.role === 'OWNER') {
    const ownerUnits = await prisma.unit.findMany({ where: { ownerId: session.user.id, buildingId: bId } })
    if (ownerUnits.length > 0) {
      const unitIds = ownerUnits.map(u => u.id)
      bills = await prisma.bill.findMany({
        where: { unitId: { in: unitIds } },
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
