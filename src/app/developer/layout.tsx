import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

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
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#fff', letterSpacing: '-0.3px' }}>FlatDesk</span>
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
