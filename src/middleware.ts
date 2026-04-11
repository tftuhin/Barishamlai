import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Developer role may only access /developer routes
    if (token?.role === 'DEVELOPER' && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/developer', req.url))
    }

    // Non-developer roles cannot access /developer
    if (token?.role !== 'DEVELOPER' && pathname.startsWith('/developer')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Only run this middleware when a token exists (i.e. authenticated)
      authorized: ({ token }) => !!token,
    },
  },
)

export const config = {
  // Protect all dashboard and developer routes at the edge
  matcher: ['/dashboard/:path*', '/developer/:path*'],
}
