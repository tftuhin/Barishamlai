import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAuth } from '@/lib/api'

export async function GET() {
  const [session, e] = await requireAuth()
  if (e) return e

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, profileImage: true, role: true, createdAt: true },
    })
    if (!user) return Err.notFound('User not found')
    return ok(user)
  } catch {
    return Err.internal()
  }
}

export async function PATCH(req: NextRequest) {
  const [session, e] = await requireAuth()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { name, phone, profileImage } = body

    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2))
      return Err.badRequest('Name must be at least 2 characters')

    if (profileImage && typeof profileImage === 'string' && profileImage.length > 300_000)
      return Err.badRequest('Image too large. Please use a smaller image.')

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name         !== undefined ? { name:         String(name).trim()          } : {}),
        ...(phone        !== undefined ? { phone:        phone ? String(phone) : null } : {}),
        ...(profileImage !== undefined ? { profileImage: profileImage || null         } : {}),
      },
      select: { id: true, name: true, email: true, phone: true, profileImage: true },
    })
    return ok(updated)
  } catch {
    return Err.internal('Failed to update profile')
  }
}
