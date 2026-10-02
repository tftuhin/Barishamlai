/**
 * Safe DTO selectors and mappers to prevent sensitive field leakage.
 * BAN raw `include: { owner: true }`, `tenant: true`, `user: true` in API routes.
 */

export const USER_PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  profileImage: true,
} as const

export const USER_MINIMAL_SELECT = {
  id: true,
  name: true,
  email: true,
} as const

export const RESIDENT_SUMMARY_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
} as const

export const UNIT_SAFE_INCLUDE = {
  owner: {
    select: USER_PUBLIC_SELECT,
  },
  tenant: {
    select: USER_PUBLIC_SELECT,
  },
} as const

export const BILL_SAFE_INCLUDE = {
  unit: {
    include: {
      tenant: { select: USER_PUBLIC_SELECT },
      owner: { select: USER_PUBLIC_SELECT },
    },
  },
} as const

export const RECEIPT_SAFE_INCLUDE = {
  bill: true,
  unit: true,
  issuedBy: { select: USER_PUBLIC_SELECT },
  recipient: { select: USER_PUBLIC_SELECT },
} as const

export const MESSAGE_SAFE_INCLUDE = {
  sender: { select: USER_PUBLIC_SELECT },
  recipients: {
    include: {
      user: { select: USER_PUBLIC_SELECT },
    },
  },
} as const

/**
 * Strips sensitive authentication fields from any user object.
 */
export function sanitizeUser<T extends Record<string, unknown>>(user: T | null | undefined): Omit<T, 'password' | 'passwordResetToken' | 'passwordResetExpiry'> | null {
  if (!user) return null
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, passwordResetToken, passwordResetExpiry, ...safe } = user
  return safe as Omit<T, 'password' | 'passwordResetToken' | 'passwordResetExpiry'>
}
