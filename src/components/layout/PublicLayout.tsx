'use client'
import { LazyMotion, domAnimation } from 'framer-motion'
import { LandingNavbar } from '@/components/layout/LandingNavbar'
import { LandingFooter } from '@/components/layout/LandingFooter'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <div style={{ background: 'var(--land-bg)', minHeight: '100vh', color: 'var(--land-text)', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column' }}>
        <LandingNavbar staticPage />
        <main style={{ flex: 1, paddingTop: 64 /* offset fixed navbar */ }}>
          {children}
        </main>
        <LandingFooter staticPage />
      </div>
    </LazyMotion>
  )
}
