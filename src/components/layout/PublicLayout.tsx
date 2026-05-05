'use client'
import { LazyMotion, domAnimation } from 'framer-motion'
import { LandingNavbar } from '@/components/layout/LandingNavbar'
import { LandingFooter } from '@/components/layout/LandingFooter'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <div className="lp" style={{ background: 'var(--bg, var(--surface))', minHeight: '100vh', color: 'var(--ink, var(--text-primary))', fontFamily: 'var(--sans, var(--font-body))', display: 'flex', flexDirection: 'column' }}>
        <LandingNavbar />
        <main style={{ flex: 1, paddingTop: 72 }}>
          {children}
        </main>
        <LandingFooter />
      </div>
    </LazyMotion>
  )
}
