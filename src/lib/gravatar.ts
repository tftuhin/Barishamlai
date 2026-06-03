import { createHash } from 'node:crypto'

export function gravatarUrl(email: string, size = 40): string {
  const hash = createHash('md5').update(email.trim().toLowerCase()).digest('hex')
  return `https://www.gravatar.com/avatar/${hash}?s=${size * 2}&d=mp&r=g`
}
