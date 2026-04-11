import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function PendingApprovalPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  // If already assigned to a building, go to dashboard
  if (session.user.buildingId) redirect('/dashboard')

  // Look up their pending join request
  const joinRequest = await prisma.joinRequest.findFirst({
    where: { userId: session.user.id, status: 'PENDING' },
    include: { building: { select: { name: true } } },
  })

  const rejected = await prisma.joinRequest.findFirst({
    where: { userId: session.user.id, status: 'REJECTED' },
    include: { building: { select: { name: true } } },
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A2E2A 0%, #085041 50%, #085041 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.97)', borderRadius: '20px', padding: '2.5rem',
        maxWidth: '460px', width: '100%', textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
      }}>
        {rejected ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#dc2626', marginBottom: '0.75rem' }}>
              Request Rejected
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Your request to join <strong>{rejected.building.name}</strong> was rejected by the admin.
              Please contact the building admin directly or try joining with a valid invitation token.
            </p>
            <Link href="/signup" style={{ display: 'inline-block', padding: '10px 28px', borderRadius: '10px', background: '#1D9E75', color: '#fff', fontSize: '14px', fontWeight: 500, textDecoration: 'none', marginRight: '8px' }}>
              Try Again
            </Link>
            <Link href="/login" style={{ display: 'inline-block', padding: '10px 28px', borderRadius: '10px', background: '#f1f5f9', color: '#475569', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
              Sign Out
            </Link>
          </>
        ) : joinRequest ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--brand)', marginBottom: '0.75rem' }}>
              Awaiting Approval
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              Your request to join <strong>{joinRequest.building.name}</strong> as{' '}
              <strong>{joinRequest.role === 'OWNER' ? 'an Owner' : 'a Tenant'}</strong> is pending.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              The building admin will review your request. Please refresh this page or log in again after approval.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <a href="/pending-approval" style={{ display: 'inline-block', padding: '10px 28px', borderRadius: '10px', background: '#1D9E75', color: '#fff', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
                Refresh Status
              </a>
              <Link href="/api/auth/signout" style={{ display: 'inline-block', padding: '10px 28px', borderRadius: '10px', background: '#f1f5f9', color: '#475569', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
                Sign Out
              </Link>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--brand)', marginBottom: '0.75rem' }}>
              No Building Assigned
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Your account is not linked to any building yet. Please use an invitation link or request to join a building.
            </p>
            <Link href="/signup" style={{ display: 'inline-block', padding: '10px 28px', borderRadius: '10px', background: '#1D9E75', color: '#fff', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
              Join a Building
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
