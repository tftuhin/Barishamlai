import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

const MAIN_HOST = 'barishamlai.com'
const APP_HOST  = 'app.barishamlai.com'
const DEV_HOST  = 'dev.barishamlai.com'

// Paths that should only be served from app.barishamlai.com
const APP_ONLY_PREFIXES = [
  '/login', '/signup', '/forgot-password', '/reset-password',
  '/pending-approval', '/dashboard', '/developer',
]

// Paths that should only be served from barishamlai.com (marketing)
const MARKETING_ONLY_PREFIXES = [
  '/about', '/blog', '/contact', '/privacy', '/terms',
  '/refund', '/ad-policy', '/data-security',
]

function getHostType(req: Request): 'main' | 'app' | 'dev' | 'local' {
  const host = (req.headers.get('host') ?? '').split(':')[0].toLowerCase()
  if (host === MAIN_HOST || host === `www.${MAIN_HOST}`) return 'main'
  if (host === APP_HOST) return 'app'
  if (host === DEV_HOST) return 'dev'
  return 'local'
}

function isAppOnlyPath(pathname: string): boolean {
  return APP_ONLY_PREFIXES.some(
    p => pathname === p || pathname.startsWith(p + '/')
  )
}

function isMarketingOnlyPath(pathname: string): boolean {
  if (pathname === '/') return true
  return MARKETING_ONLY_PREFIXES.some(
    p => pathname === p || pathname.startsWith(p + '/')
  )
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token    = req.nextauth.token
    const hostType = getHostType(req)

    // ── Subdomain routing (production only, skip localhost) ──────────────────
    if (hostType !== 'local') {
      // Dev dashboard: redirect root to login, everything else to app
      if (hostType === 'dev') {
        if (pathname === '/') {
          return NextResponse.redirect(new URL('/login', req.url))
        }
        // Non-login paths on dev subdomain go to app subdomain
        if (!pathname.startsWith('/login') && !pathname.startsWith('/signup') && !pathname.startsWith('/forgot-password') && !pathname.startsWith('/reset-password')) {
          const dest = `https://${APP_HOST}${pathname}${req.nextUrl.search}`
          return NextResponse.redirect(dest, 301)
        }
      }
      if (hostType === 'main' && isAppOnlyPath(pathname)) {
        const dest = `https://${APP_HOST}${pathname}${req.nextUrl.search}`
        return NextResponse.redirect(dest, 301)
      }
      if (hostType === 'app' && isMarketingOnlyPath(pathname)) {
        const dest = `https://${MAIN_HOST}${pathname}${req.nextUrl.search}`
        return NextResponse.redirect(dest, 301)
      }
    }

    // ── Auth role routing ────────────────────────────────────────────────────
    if (token?.role === 'DEVELOPER' && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/developer', req.url))
    }
    if (token?.role !== 'DEVELOPER' && pathname.startsWith('/developer')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Require auth only for dashboard and developer; allow everything else through
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/developer')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  // Run on all paths except Next.js internals, static assets, and image files
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
