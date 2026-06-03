import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, created, Err, requireAuth, requirePremium } from '@/lib/api'

export async function GET() {
  const [session, e] = await requireAuth()
  if (e) return e

  try {
    const bId = session.user.buildingId

    if (session.user.role === 'ADMIN') {
      const messages = await prisma.message.findMany({
        where: { buildingId: bId ?? undefined },
        include: { sender: true, recipients: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      })
      return ok(messages)
    }

    const messages = await prisma.messageRecipient.findMany({
      where: { userId: session.user.id },
      include: { message: { include: { sender: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return ok(messages)
  } catch {
    return Err.internal()
  }
}

export async function POST(req: NextRequest) {
  const [session, e] = await requirePremium()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { subject, body: msgBody, isGlobal, recipientIds } = body

    if (!subject || !msgBody)
      return Err.badRequest('subject and body are required')

    const bId = session.user.buildingId!
    let targetIds: string[] = []

    if (isGlobal) {
      const residents = await prisma.user.findMany({
        where: { role: { in: ['OWNER', 'TENANT'] }, buildingId: bId },
        select: { id: true },
      })
      targetIds = residents.map(r => r.id)
    } else {
      if (!Array.isArray(recipientIds) || recipientIds.length === 0)
        return Err.badRequest('recipientIds must be a non-empty array when isGlobal is false')
      const candidateIds = (recipientIds as unknown[]).filter((id): id is string => typeof id === 'string')
      // Verify all recipients actually belong to this building
      const validRecipients = await prisma.user.findMany({
        where: { id: { in: candidateIds }, buildingId: bId },
        select: { id: true },
      })
      targetIds = validRecipients.map(r => r.id)
      if (targetIds.length === 0)
        return Err.badRequest('No valid recipients found in your building')
    }

    const message = await prisma.message.create({
      data: {
        senderId:   session.user.id,
        subject:    String(subject),
        body:       String(msgBody),
        isGlobal:   Boolean(isGlobal),
        buildingId: bId,
        recipients: { create: targetIds.map(userId => ({ userId })) },
      },
      include: { recipients: true },
    })
    return created(message)
  } catch {
    return Err.internal('Failed to send message')
  }
}
