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
      { label: t('landFooterSignUp'), href: '/signup' },
      { label: t('landFooterSignIn'), href: '/login' },
      { label: 'About Us',            href: '/about' },
      { label: 'Contact Us',          href: '/contact' },
    ]},
    { titleKey: 'landFooterLegal', links: [
      { label: t('landFooterPrivacy'), href: '/privacy' },
      { label: t('landFooterTerms'),   href: '/terms' },
      { label: 'Refund Policy',        href: '/refund' },
      { label: 'Data Security',        href: '/data-security' },
      { label: 'Ad Policy',            href: '/ad-policy' },
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
