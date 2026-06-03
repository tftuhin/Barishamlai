'use client'
import { LazyMotion, domAnimation } from 'framer-motion'
import { LandingNavbar } from '@/components/layout/LandingNavbar'
import { LandingFooter } from '@/components/layout/LandingFooter'
import { useLang } from '@/components/layout/LanguageContext'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLang()
  return (
    <LazyMotion features={domAnimation}>
      <div className={`lp${lang === 'bn' ? ' lang-bn' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
        <LandingNavbar />
        <main style={{ flex: 1, paddingTop: 72 }}>
          {children}
        </main>
        <LandingFooter />
      </div>
    </LazyMotion>
  )
}
