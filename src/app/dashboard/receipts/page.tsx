import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isPremiumBuilding } from '@/lib/utils'
import { PremiumGate } from '@/components/ui/PremiumGate'
import { ReceiptsClient } from './ReceiptsClient'

export default async function ReceiptsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const bId = session.user.buildingId ?? undefined

  const building = await prisma.building.findUnique({
    where: { id: bId },
    select: { plan: true, premiumUntil: true },
  })

  if (!isPremiumBuilding(building)) {
    return <PremiumGate feature="Receipts" />
  }

  let receipts: any[] = []
  let paidBills: any[] = []

  if (session.user.role === 'ADMIN') {
    receipts = await prisma.receipt.findMany({
      where: { unit: { buildingId: bId } },
      include: { bill: true, unit: true, issuedBy: true, recipient: true },
      orderBy: { createdAt: 'desc' },
    })
    paidBills = await prisma.bill.findMany({
      where: { status: 'PAID', receipt: null, buildingId: bId },
      include: { unit: { include: { tenant: true, owner: true } } },
      orderBy: { createdAt: 'desc' },
    })
  } else if (session.user.role === 'OWNER') {
    const unit = await prisma.unit.findFirst({ where: { ownerId: session.user.id, buildingId: bId } })
    if (unit) {
      receipts = await prisma.receipt.findMany({
        where: { unitId: unit.id },
        include: { bill: true, unit: true, issuedBy: true, recipient: true },
        orderBy: { createdAt: 'desc' },
      })
      paidBills = await prisma.bill.findMany({
        where: { unitId: unit.id, status: 'PAID', receipt: null },
        include: { unit: { include: { tenant: true, owner: true } } },
      })
    }
  } else {
    receipts = await prisma.receipt.findMany({
      where: { recipientId: session.user.id },
      include: { bill: true, unit: true, issuedBy: true, recipient: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  return <ReceiptsClient receipts={receipts} paidBills={paidBills} role={session.user.role} />
}
