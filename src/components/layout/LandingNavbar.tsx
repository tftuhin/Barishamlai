'use client'
import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useLang, LangToggle } from '@/components/layout/LanguageContext'
import { ThemeToggle } from '@/components/layout/ThemeContext'
import { BariShamlaiMark } from '@/components/ui/BariShamlaiLogo'

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

function useWindowWidth() {
  const [width, setWidth] = useState(375)
  useEffect(() => {
    setWidth(window.innerWidth)
    const fn = () => setWidth(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return width
}

/** staticPage=true: nav section links get a leading "/" so they work from any route */
export function LandingNavbar({ staticPage = false }: { staticPage?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const width = useWindowWidth()
  const isMobile = width < 768
  const { t, lang } = useLang()
  const bn = lang === 'bn'
  const appName = bn ? 'বাড়ি সামলাই' : 'Bari Shamlai'
  const p = staticPage ? '/' : ''

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { label: t('landNavFeatures'),   href: `${p}#features` },
    { label: t('landNavPricing'),    href: `${p}#pricing` },
    { label: t('landNavHowItWorks'), href: `${p}#how-it-works` },
    { label: t('landNavFAQ'),        href: `${p}#faq` },
  ]

  return (
    <m.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled || menuOpen ? 'var(--land-nav-bg)' : 'transparent',
        backdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'none',
        borderBottom: scrolled || menuOpen ? '1px solid var(--land-nav-border)' : 'none',
        transition: 'background 0.3s, backdrop-filter 0.3s, border-bottom 0.3s',
        padding: '0 1.25rem',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <BariShamlaiMark size={isMobile ? 48 : 60} variant="color" />
          {!isMobile && (
            <span style={{
              fontSize: '1.1rem', fontWeight: 800, color: 'var(--land-white)',
              fontFamily: bn ? "var(--font-bn)" : 'inherit',
              letterSpacing: bn ? '0' : '-0.3px',
            }}>{appName}</span>
          )}
        </Link>

        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {links.map(l => (
              <a key={l.href} href={l.href}
                style={{ fontSize: 14, color: 'var(--land-subtle)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s', fontFamily: bn ? "var(--font-bn)" : 'inherit' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--land-white)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--land-subtle)')}>
                {l.label}
              </a>
            ))}
          </nav>
        )}

        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LangToggle />
            <ThemeToggle />
            <Link href="/login"
              style={{ fontSize: 14, fontWeight: 600, color: 'var(--land-subtle)', textDecoration: 'none', transition: 'color 0.15s', fontFamily: bn ? "var(--font-bn)" : 'inherit' }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--land-white)')}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--land-subtle)')}>
              {t('landSignIn')}
            </Link>
            <m.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/signup" style={{
                padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #1D9E75, #085041)',
                color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(29,158,117,0.35)',
                fontFamily: bn ? "var(--font-bn)" : 'inherit',
              }}>
                {t('landGetStarted')}
              </Link>
            </m.div>
          </div>
        )}

        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LangToggle />
            <ThemeToggle />
            <Link href="/signup" style={{
              padding: '8px 14px', borderRadius: 10, background: 'linear-gradient(135deg, #1D9E75, #085041)',
              color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none',
              whiteSpace: 'nowrap', flexShrink: 0,
              fontFamily: bn ? "var(--font-bn)" : 'inherit',
            }}>
              {t('landGetStartedMob')}
            </Link>
            <button onClick={() => setMenuOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ display: 'block', width: 22, height: 2, background: 'var(--land-white)', borderRadius: 2, transition: 'transform 0.2s', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
              <span style={{ display: 'block', width: 22, height: 2, background: 'var(--land-white)', borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
              <span style={{ display: 'block', width: 22, height: 2, background: 'var(--land-white)', borderRadius: 2, transition: 'transform 0.2s', transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isMobile && menuOpen && (
          <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', borderTop: '1px solid var(--land-mob-border)', background: 'var(--land-nav-bg)' }}>
            <div style={{ padding: '1rem 1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {links.map(l => (
                <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                  style={{ fontSize: 15, color: 'var(--land-subtle)', textDecoration: 'none', fontWeight: 500, padding: '10px 0', borderBottom: '1px solid var(--land-mob-border)', fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
                  {l.label}
                </a>
              ))}
              <Link href="/login" onClick={() => setMenuOpen(false)}
                style={{ fontSize: 15, color: 'var(--land-subtle)', textDecoration: 'none', fontWeight: 500, padding: '10px 0', marginTop: 4, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
                {t('landSignIn')}
              </Link>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.header>
  )
}
