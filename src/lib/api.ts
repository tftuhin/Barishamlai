/**
 * Shared API utilities — auth guards, consistent responses, type-safe helpers.
 * Every route handler should use these instead of calling getServerSession directly.
 */
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Session } from 'next-auth'

// ── Response helpers ──────────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store, private' },
  })
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 })
}

export function err(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export const Err = {
  unauthorized:    () => err('Unauthorized', 401),
  forbidden:       () => err('Forbidden', 403),
  paymentRequired: (msg = 'Premium plan required') => err(msg, 402),
  badRequest:      (msg = 'Bad request') => err(msg, 400),
  notFound:        (msg = 'Not found') => err(msg, 404),
  conflict:        (msg = 'Conflict') => err(msg, 409),
  gone:            (msg = 'Gone') => err(msg, 410),
  internal:        (msg = 'Internal server error') => err(msg, 500),
}

// ── Prisma error codes ────────────────────────────────────────────────────────

export function isPrismaConflict(e: unknown): boolean {
  return typeof e === 'object' && e !== null && (e as Record<string, unknown>).code === 'P2002'
}

export function isPrismaNotFound(e: unknown): boolean {
  return typeof e === 'object' && e !== null && (e as Record<string, unknown>).code === 'P2025'
}

// ── Session guards ────────────────────────────────────────────────────────────

export type AuthSession = Session & {
  user: {
    id: string
    name: string
    email: string
    role: string
    buildingId: string | null
    buildingName: string | null
  }
}

/** Returns the session or null. Does NOT throw. */
export async function getSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions)
  return session as AuthSession | null
}

/** Requires any authenticated session. Returns [session, null] or [null, errorResponse]. */
export async function requireAuth(): Promise<[AuthSession, null] | [null, NextResponse]> {
  const session = await getSession()
  if (!session) return [null, Err.unauthorized()]
  return [session, null]
}

/** Admin-tier roles — can perform write operations */
export const ADMIN_ROLES = ['ADMIN'] as const

/** Viewer-tier roles — read-only access to admin data */
export const VIEWER_ROLES = ['ADMIN', 'PRESIDENT', 'SECRETARY', 'MEMBER'] as const

/** Requires ADMIN role with a valid buildingId (write operations). */
export async function requireAdmin(): Promise<[AuthSession, null] | [null, NextResponse]> {
  const [session, e] = await requireAuth()
  if (e) return [null, e]
  if (!session.user.id) return [null, Err.unauthorized()]
  if (session.user.role !== 'ADMIN') return [null, Err.forbidden()]
  if (!session.user.buildingId) return [null, Err.badRequest('No building assigned')]
  return [session, null]
}

/**
 * Requires ADMIN, PRESIDENT, or SECRETARY role with a valid buildingId.
 * Use for GET (read-only) endpoints that admins and viewers can access.
 */
export async function requireViewer(): Promise<[AuthSession, null] | [null, NextResponse]> {
  const [session, e] = await requireAuth()
  if (e) return [null, e]
  if (!(VIEWER_ROLES as readonly string[]).includes(session.user.role)) return [null, Err.forbidden()]
  if (!session.user.buildingId) return [null, Err.badRequest('No building assigned')]
  return [session, null]
}

/** Requires DEVELOPER role. */
export async function requireDeveloper(): Promise<[AuthSession, null] | [null, NextResponse]> {
  const [session, e] = await requireAuth()
  if (e) return [null, e]
  if (session.user.role !== 'DEVELOPER') return [null, Err.forbidden()]
  return [session, null]
}

/** Returns a buildingId that is guaranteed non-null, or throws an error response. */
export function requireBuildingId(session: AuthSession): [string, null] | [null, NextResponse] {
  if (!session.user.buildingId) return [null, Err.badRequest('No building assigned')]
  return [session.user.buildingId, null]
}

/**
 * Requires ADMIN role + active PREMIUM plan.
 * Checks building.plan === 'PREMIUM' && premiumUntil > now().
 */
export async function requirePremium(): Promise<[AuthSession, null] | [null, NextResponse]> {
  const [session, e] = await requireAdmin()
  if (e) return [null, e]

  const building = await prisma.building.findUnique({
    where: { id: session.user.buildingId! },
    select: { plan: true, premiumUntil: true },
  })

  const isActive =
    building?.plan === 'PREMIUM' &&
    building.premiumUntil != null &&
    building.premiumUntil > new Date()

  if (!isActive)
    return [null, Err.paymentRequired('This feature requires an active Premium plan')]

  return [session, null]
}
