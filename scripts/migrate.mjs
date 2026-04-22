/**
 * Smart Prisma migration runner for Vercel deployments.
 *
 * Handles three scenarios without extra dependencies:
 *  1. Existing DB set up by `prisma db push` (tables exist, no _prisma_migrations)
 *     → `migrate deploy` throws P3005 → we baseline then retry deploy.
 *  2. Fresh DB with no tables
 *     → `migrate deploy` succeeds and creates everything.
 *  3. DB already under migration management
 *     → `migrate deploy` applies any pending migrations normally.
 */

import { execSync, spawnSync } from 'child_process'

const MIGRATION_NAME = '20240422120000_init_full_schema'

function attempt(cmd) {
  return spawnSync(cmd, { shell: true, stdio: ['inherit', 'inherit', 'pipe'] })
}

// First attempt at migrate deploy
const first = attempt('npx prisma migrate deploy')

if (first.status === 0) {
  process.exit(0)
}

const stderr = (first.stderr ?? Buffer.alloc(0)).toString()

if (stderr.includes('P3005') || stderr.includes('not empty')) {
  console.log(
    '\n[migrate] Existing schema with no migration history detected (P3005).' +
    '\n[migrate] Baselining migration as already applied…\n'
  )
  execSync(`npx prisma migrate resolve --applied ${MIGRATION_NAME}`, { stdio: 'inherit' })
  console.log('\n[migrate] Baseline done. Running migrate deploy…\n')
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
} else {
  // Some other error — surface it and fail the build
  process.stderr.write(stderr)
  process.exit(first.status ?? 1)
}
