import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/Sidebar'
import { AuthProvider } from '@/components/layout/AuthProvider'
import { isPremiumBuilding } from '@/lib/utils'

const STATUS_CONFIG = {
  LOCKED: {
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
    icon: '🔒',
    title: 'Account Locked',
    message: 'Your property account has been temporarily locked. Some actions may be restricted. Please contact support.',
  },
  BLOCKED: {
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    icon: '🚫',
    title: 'Account Blocked',
    message: 'Access to this property has been blocked pending review. Please contact support to resolve this.',
  },
  BANNED: {
    color: '#dc2626',
    bg: 'rgba(220,38,38,0.08)',
    border: 'rgba(220,38,38,0.25)',
    icon: '⛔',
    title: 'Account Banned',
    message: 'This property account has been permanently banned due to a policy violation.',
  },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role === 'DEVELOPER') redirect('/developer')
  if (!session.user.buildingId) redirect('/pending-approval')

  const bId = session.user.buildingId

  const userId = session.user.id

  const [building, config, multiPropertyApproved] = await Promise.all([
    bId ? prisma.building.findUnique({
      where:  { id: bId },
      select: { plan: true, premiumUntil: true, status: true, statusNote: true },
    }) : null,
    bId ? prisma.buildingConfig.findUnique({
      where:  { id: bId },
      select: { featureRent: true, featureServiceCharge: true, featureGas: true, onboardingComplete: true },
    }) : null,
    // Check if admin has an approved multi-property request
    userId ? prisma.multiPropertyRequest.findFirst({
      where: { userId, status: 'APPROVED' },
      select: { id: true },
    }) : null,
  ])

  const isPremium = isPremiumBuilding(building)
  const status = building?.status ?? 'ACTIVE'

  // onboardingComplete is passed down; individual pages redirect if needed

  // BLOCKED and BANNED: full access denial
  if (status === 'BLOCKED' || status === 'BANNED') {
    const cfg = STATUS_CONFIG[status]
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: '1.5rem' }}>{cfg.icon}</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>{cfg.title}</h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {cfg.message}
          </p>
          {building?.statusNote && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}`, marginBottom: '1.5rem' }}>
              <p style={{ fontSize: 13, color: cfg.color, margin: 0 }}>
                <strong>Note:</strong> {building.statusNote}
              </p>
            </div>
          )}
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            If you believe this is a mistake, please contact support.
          </p>
        </div>
      </div>
    )
  }

  const moduleConfig = {
    featureRent:          config?.featureRent          ?? true,
    featureServiceCharge: config?.featureServiceCharge ?? true,
    featureGas:           config?.featureGas           ?? true,
  }

  return (
    <AuthProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
        <Sidebar user={session.user} isPremium={isPremium} moduleConfig={moduleConfig} multiPropertyApproved={!!multiPropertyApproved} />
        <main className="main-content" style={{ flex: 1, marginLeft: '260px', minHeight: '100vh', overflow: 'auto' }}>
          {/* LOCKED: show warning banner but allow access */}
          {status === 'LOCKED' && (
            <div style={{ padding: '12px 24px', background: 'rgba(245,158,11,0.12)', borderBottom: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <p style={{ margin: 0, fontSize: 13, color: '#f59e0b', fontWeight: 500 }}>
                {STATUS_CONFIG.LOCKED.message}
                {building?.statusNote && <span style={{ opacity: 0.75 }}> — {building.statusNote}</span>}
              </p>
            </div>
          )}
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}
