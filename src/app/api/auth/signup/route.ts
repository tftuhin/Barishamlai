import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, created, Err, isPrismaConflict } from '@/lib/api'
import bcrypt from 'bcryptjs'
import type { Role } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>
    const {
      name, email, password, phone, role,
      buildingName, joinMethod, buildingId, invitationToken,
    } = body

    if (!name || !email || !password)
      return Err.badRequest('Name, email and password are required')

    if (typeof password !== 'string' || password.length < 8)
      return Err.badRequest('Password must be at least 8 characters')

    const isAdmin = role === 'ADMIN'

    // ── Admin: create new isolated building workspace ─────────────────────────
    if (isAdmin) {
      if (!buildingName || !String(buildingName).trim())
        return Err.badRequest('Building name is required for admin accounts')

      const hashed = await bcrypt.hash(String(password), 10)
      const result = await prisma.$transaction(async tx => {
        const building = await tx.building.create({
          data: { name: String(buildingName).trim() },
        })
        const user = await tx.user.create({
          data: {
            name:       String(name),
            email:      String(email),
            phone:      phone ? String(phone) : null,
            role:       'ADMIN',
            password:   hashed,
            buildingId: building.id,
          },
          select: { id: true, name: true, email: true, role: true, buildingId: true },
        })
        await tx.buildingConfig.create({ data: { id: building.id } })
        return { user, building }
      })
      return created({ user: result.user, buildingName: result.building.name })
    }

    const allowedRoles: Role[] = ['TENANT', 'OWNER']
    const userRole: Role = allowedRoles.includes(String(role) as Role) ? (String(role) as Role) : 'TENANT'

    // ── Invitation token path ─────────────────────────────────────────────────
    if (joinMethod === 'invitation' || invitationToken) {
      if (!invitationToken)
        return Err.badRequest('Invitation token is required')

      const invitation = await prisma.invitation.findUnique({
        where: { token: String(invitationToken) },
      })
      if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt < new Date())
        return Err.notFound('Invalid or expired invitation token')

      const hashed = await bcrypt.hash(String(password), 10)
      const result = await prisma.$transaction(async tx => {
        const user = await tx.user.create({
          data: {
            name:       String(name),
            email:      String(email),
            phone:      phone ? String(phone) : null,
            role:       invitation.role,
            password:   hashed,
            buildingId: invitation.buildingId,
          },
          select: { id: true, name: true, email: true, role: true, buildingId: true },
        })
        await tx.invitation.update({
          where: { id: invitation.id },
          data:  { status: 'ACCEPTED' },
        })
        return user
      })
      return created({ user: result, status: 'approved' })
    }

    // ── Join-request path (needs admin approval) ──────────────────────────────
    if (joinMethod === 'request' || buildingId) {
      if (!buildingId || !String(buildingId).trim())
        return Err.badRequest('Building ID is required')

      const building = await prisma.building.findUnique({
        where: { id: String(buildingId).trim() },
      })
      if (!building) return Err.notFound('Building not found. Please check the Building ID.')

      const hashed = await bcrypt.hash(String(password), 10)
      const result = await prisma.$transaction(async tx => {
        const user = await tx.user.create({
          data: {
            name:  String(name),
            email: String(email),
            phone: phone ? String(phone) : null,
            role:  userRole,
            password: hashed,
          },
          select: { id: true, name: true, email: true, role: true },
        })
        const joinRequest = await tx.joinRequest.create({
          data: { userId: user.id, buildingId: building.id, role: userRole },
        })
        return { user, buildingName: building.name, joinRequest }
      })
      return created({ user: result.user, buildingName: result.buildingName, status: 'pending' })
    }

    // Fallback: create user with no building assignment
    const hashed = await bcrypt.hash(String(password), 10)
    const user = await prisma.user.create({
      data: {
        name:  String(name),
        email: String(email),
        phone: phone ? String(phone) : null,
        role:  userRole,
        password: hashed,
      },
      select: { id: true, name: true, email: true, role: true },
    })
    return created(user)
  } catch (e) {
    if (isPrismaConflict(e)) return Err.conflict('Email already registered')
    return Err.internal('Failed to create account')
  }
}
