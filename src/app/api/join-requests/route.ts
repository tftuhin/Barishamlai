import { prisma } from '@/lib/prisma'
import { ok, Err, requireAdmin } from '@/lib/api'

export async function GET() {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const requests = await prisma.joinRequest.findMany({
      where: { buildingId: session.user.buildingId! },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return ok(requests)
  } catch {
    return Err.internal()
  }
}
