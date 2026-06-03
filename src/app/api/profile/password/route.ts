import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAuth } from '@/lib/api'
import bcrypt from 'bcryptjs'

export async function PATCH(req: NextRequest) {
  const [session, e] = await requireAuth()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword)
      return Err.badRequest('Both current and new password are required')

    if (typeof newPassword !== 'string' || newPassword.length < 8)
      return Err.badRequest('New password must be at least 8 characters')

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return Err.notFound('User not found')

    const valid = await bcrypt.compare(String(currentPassword), user.password)
    if (!valid) return Err.badRequest('Current password is incorrect')

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } })

    return ok({ success: true })
  } catch {
    return Err.internal('Failed to update password')
  }
}
