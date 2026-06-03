import type { Role } from '@prisma/client'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, created, Err, isPrismaConflict, requireAdmin } from '@/lib/api'
import bcrypt from 'bcryptjs'

const ALLOWED_ROLES = new Set(['ADMIN', 'OWNER', 'TENANT'])

export async function GET() {
  const [session, e] = await requireAdmin()
  if (e) return e

  const bId = session.user.buildingId!
  const adminId = session.user.id

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          // All users whose primary building is the active building
          { buildingId: bId },
          // The admin themselves, when managing this building via UserBuilding
          // (i.e. their primary buildingId differs — they created this as an extra property)
          {
            id: adminId,
            userBuildings: { some: { buildingId: bId } },
          },
        ],
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { name: 'asc' },
    })
    return ok(users)
  } catch {
    return Err.internal()
  }
}

export async function POST(req: NextRequest) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const body = await req.json() as Record<string, unknown>
    const { name, email, phone, role, password } = body

    if (!name || !email || !role || !password)
      return Err.badRequest('name, email, role and password are required')

    if (!ALLOWED_ROLES.has(String(role)))
      return Err.badRequest('Invalid role')

    const hashed = await bcrypt.hash(String(password), 10)
    const user = await prisma.user.create({
      data: {
        name:       String(name),
        email:      String(email),
        phone:      phone ? String(phone) : null,
        role:       String(role) as Role,
        password:   hashed,
        buildingId: session.user.buildingId,
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    })
    return created(user)
  } catch (e) {
    if (isPrismaConflict(e)) return Err.conflict('Email already exists')
    return Err.internal('Failed to create user')
  }
}
