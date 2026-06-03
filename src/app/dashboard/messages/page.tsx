import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isPremiumBuilding } from '@/lib/utils'
import { PremiumGate } from '@/components/ui/PremiumGate'
import { MessagesClient } from './MessagesClient'

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const bId = session.user.buildingId ?? undefined

  const building = await prisma.building.findUnique({
    where: { id: bId },
    select: { plan: true, premiumUntil: true },
  })

  if (!isPremiumBuilding(building)) {
    return <PremiumGate feature="Messages" />
  }

  let messages: any[] = []
  let residents: any[] = []

  if (session.user.role === 'ADMIN') {
    messages = await prisma.message.findMany({
      where: { buildingId: bId },
      include: { sender: true, recipients: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    })
    residents = await prisma.user.findMany({
      where: { role: { in: ['OWNER', 'TENANT'] }, buildingId: bId },
      orderBy: { name: 'asc' },
    })
  } else {
    messages = await prisma.messageRecipient.findMany({
      where: { userId: session.user.id },
      include: { message: { include: { sender: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  return <MessagesClient messages={messages} residents={residents} role={session.user.role} userId={session.user.id} />
}
