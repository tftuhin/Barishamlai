'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '@/components/layout/LanguageContext'
import { BariShamlaiMark } from '@/components/ui/BariShamlaiLogo'

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

/** staticPage=true: section anchor links get a leading "/" so they work from any route */
export function LandingFooter({ staticPage = false }: { staticPage?: boolean }) {
  const width = useWindowWidth()
  const isMobile = width < 640
  const isTablet = width < 1024
  const { t, lang } = useLang()
  const bn = lang === 'bn'
  const appName = bn ? 'বাড়ি সামলাই' : 'Bari Shamlai'
  const p = staticPage ? '/' : ''

  const cols = [
    { titleKey: 'landFooterProduct', links: [
      { label: t('landFooterFeatures'),   href: `${p}#features` },
      { label: t('landFooterPricing'),    href: `${p}#pricing` },
      { label: t('landFooterHowItWorks'), href: `${p}#how-it-works` },
      { label: t('landFooterFAQ'),        href: `${p}#faq` },
    ]},
    { titleKey: 'landFooterAccount', links: [
      { label: t('landFooterSignUp'),  href: '/signup' },
      { label: t('landFooterSignIn'),  href: '/login' },
      { label: t('landFooterAbout'),   href: '/about' },
      { label: t('landFooterContact'), href: '/contact' },
      { label: t('landFooterBlog'),    href: '/blog' },
    ]},
    { titleKey: 'landFooterLegal', links: [
      { label: t('landFooterPrivacy'),        href: '/privacy' },
      { label: t('landFooterTerms'),          href: '/terms' },
      { label: t('landFooterRefund'),         href: '/refund' },
      { label: t('landFooterDataSecurity'),   href: '/data-security' },
      { label: t('landFooterAdPolicy'),       href: '/ad-policy' },
    ]},
  ]

  return (
    <footer style={{ background: 'var(--land-bg)', borderTop: '1px solid var(--land-border)', padding: '3rem 1.25rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? '1fr 1fr 1fr' : '2fr 1fr 1fr 1fr', gap: isMobile ? '2rem' : '3rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <BariShamlaiMark size={56} variant="color" />
              <span style={{ fontWeight: 800, color: 'var(--land-white)', fontSize: '1rem', fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{appName}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--land-muted)', lineHeight: 1.7, maxWidth: 260, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
              {t('landFooterDesc')}
            </p>
          </div>
          {cols.map(col => (
            <div key={col.titleKey}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--land-muted)', marginBottom: 14, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
                {t(col.titleKey as Parameters<typeof t>[0])}
              </div>
              {col.links.map(l => (
                <div key={l.label} style={{ marginBottom: 8 }}>
                  <Link href={l.href}
                    style={{ fontSize: 13, color: 'var(--land-muted)', textDecoration: 'none', transition: 'color 0.15s', fontFamily: bn ? "var(--font-bn)" : 'inherit' }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--land-subtle)')}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--land-muted)')}>
                    {l.label}
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Social media icons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: '1.5rem' }}>
          {[
            { href: 'https://www.facebook.com/profile.php?id=61572096240616', label: 'Facebook', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
            { href: 'https://x.com', label: 'X (Twitter)', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
            { href: 'https://youtube.com', label: 'YouTube', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
            { href: 'https://instagram.com', label: 'Instagram', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
          ].map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--land-border)', color: 'var(--land-muted)', textDecoration: 'none', transition: 'color 0.15s, border-color 0.15s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#1D9E75'; el.style.borderColor = '#1D9E75' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--land-muted)'; el.style.borderColor = 'var(--land-border)' }}>
              {s.svg}
            </a>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--land-border)', paddingTop: '1.5rem', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--land-muted)', margin: 0, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
            {t('landFooterCopyright').replace('{year}', String(new Date().getFullYear()))}
          </p>
          <p style={{ fontSize: 12, color: 'var(--land-muted)', margin: 0, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
            {t('landFooterMade')}
          </p>
        </div>
      </div>
    </footer>
  )
}
