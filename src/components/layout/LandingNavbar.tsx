'use client'
import { useState } from 'react'
import { useLang, LangToggle } from '@/components/layout/LanguageContext'
import { ThemeToggle } from '@/components/layout/ThemeContext'
import { BariShamlaiMark } from '@/components/ui/BariShamlaiLogo'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''
const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL ?? ''

export function LandingNavbar() {
  const { t, lang } = useLang()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Main navbar */}
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

        {/* Mobile menu toggle */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>

      {/* Desktop controls — top right */}
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="nav-mobile-menu">
          <div className="nav-mobile-links">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>{t('landNavFeatures')}</a>
            <a href="#how" onClick={() => setMobileMenuOpen(false)}>{t('landNavHowItWorks')}</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>{t('landNavPricing')}</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>{t('landNavFAQ')}</a>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px', marginTop: '12px' }}>
              <a href={`${APP_URL}/login`} onClick={() => setMobileMenuOpen(false)} className="nav-mobile-login">
                {t('landSignIn')}
              </a>
              <a href={`${APP_URL}/signup`} onClick={() => setMobileMenuOpen(false)} className="nav-mobile-cta">
                {t('landGetStarted')}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
