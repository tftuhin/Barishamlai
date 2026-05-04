'use client'
import Link from 'next/link'
import { useLang, LangToggle } from '@/components/layout/LanguageContext'
import { ThemeToggle } from '@/components/layout/ThemeContext'
import { BariShamlaiMark } from '@/components/ui/BariShamlaiLogo'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

export function LandingNavbar() {
  const { t, lang } = useLang()

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        <BariShamlaiMark size={22} />
        <span>{lang === 'bn' ? 'বাড়ি সামলাই' : 'Bari Shamlai'}</span>
      </Link>
      <div className="nav-links">
        <a href="#features">{t('landNavFeatures')}</a>
        <a href="#how">{t('landNavHowItWorks')}</a>
        <a href="#pricing">{t('landNavPricing')}</a>
        <a href="#faq">{t('landNavFAQ')}</a>
      </div>
      <div className="nav-links" style={{ display: 'flex', margin: 0 }}>
        <LangToggle />
        <ThemeToggle />
        <a href={`${APP_URL}/login`} style={{ padding: '8px 14px', color: 'var(--ink-2)', fontWeight: 500 }}>
          {t('landSignIn')}
        </a>
      </div>
      <a href={`${APP_URL}/signup`} className="nav-cta">
        {t('landGetStarted')}
        <span className="arr">→</span>
      </a>
    </nav>
  )
}
