import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, isPrismaConflict } from '@/lib/api'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'DEVELOPER') return Err.unauthorized()

  const developers = await prisma.user.findMany({
    where: { role: 'DEVELOPER' },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return ok(developers)
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'DEVELOPER') return Err.unauthorized()

    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return Err.badRequest('Name, email, and password are required')
    }

    if (password.length < 8) {
      return Err.badRequest('Password must be at least 8 characters')
    }

    const hashed = await bcrypt.hash(String(password), 10)
    
    const user = await prisma.user.create({
      data: {
        name: String(name),
        email: String(email),
        password: hashed,
        role: 'DEVELOPER',
      },
      select: { id: true, name: true, email: true, createdAt: true },
    })

    return ok(user)
  } catch (e) {
    if (isPrismaConflict(e)) return Err.conflict('Email already registered')
    return Err.internal('Failed to create developer account')
  }
}
