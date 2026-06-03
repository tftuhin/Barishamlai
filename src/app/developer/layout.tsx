import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { BariShamlaiMark } from '@/components/ui/BariShamlaiLogo'

export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'DEVELOPER') redirect('/login')

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A' }}>
      {/* Top bar */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '56px', zIndex: 50,
        background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', padding: '0 2rem', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BariShamlaiMark size={42} />
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#fff', letterSpacing: '-0.3px' }}>Bari Shamlai</span>
          <span style={{ fontSize: '11px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '20px', fontWeight: 600, border: '1px solid rgba(99,102,241,0.3)' }}>Developer Console</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
          Signed in as <span style={{ color: '#a5b4fc', fontWeight: 500 }}>Developer</span>
        </div>
      </header>
      <main style={{ paddingTop: '56px' }}>
        {children}
      </main>
    </div>
  )
}
