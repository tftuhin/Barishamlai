'use client'
import Link from 'next/link'
import { useLang, LangToggle } from '@/components/layout/LanguageContext'
import { ThemeToggle } from '@/components/layout/ThemeContext'
import { BariShamlaiMark } from '@/components/ui/BariShamlaiLogo'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''
const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL ?? ''

export function LandingNavbar() {
  const { t, lang } = useLang()

  return (
    <>
      <nav className="nav">
        <a href={`${MAIN_URL}/`} className="nav-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BariShamlaiMark size={22} />
          <span>{lang === 'bn' ? 'বাড়ি সামলাই' : 'Bari Shamlai'}</span>
        </a>
        <div className="nav-links">
          <a href="#features">{t('landNavFeatures')}</a>
          <a href="#how">{t('landNavHowItWorks')}</a>
          <a href="#pricing">{t('landNavPricing')}</a>
          <a href="#faq">{t('landNavFAQ')}</a>
        </div>
      </nav>

      <div className="nav-controls">
        <LangToggle />
        <ThemeToggle />
        <a href={`${APP_URL}/login`} className="nav-controls-login">
          {t('landSignIn')}
        </a>
        <a href={`${APP_URL}/signup`} className="nav-controls-cta">
          {t('landGetStarted')}
          <span className="arr">→</span>
        </a>
      </div>
    </>
  )
}
