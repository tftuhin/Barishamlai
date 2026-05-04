'use client'
import { useState, useEffect, useRef } from 'react'
import { LazyMotion, domAnimation, m, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion'
import Link from 'next/link'
import { useLang, LangToggle } from '@/components/layout/LanguageContext'
import { BariShamlaiMark } from '@/components/ui/BariShamlaiLogo'
import { LandingNavbar } from '@/components/layout/LandingNavbar'
import { LandingFooter } from '@/components/layout/LandingFooter'

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

/* ─── TOKENS ───────────────────────────────────────────────── */
const C = {
  bg:      'var(--land-bg)',
  surface: 'var(--land-surface)',
  card:    'var(--land-card)',
  border:  'var(--land-border)',
  brand:   '#1D9E75',
  brandD:  '#085041',
  brandL:  '#9FE1CB',
  mint:    '#5DCAA5',
  green:   '#16A34A',
  amber:   '#D97706',
  text:    'var(--land-text)',
  muted:   'var(--land-muted)',
  subtle:  'var(--land-subtle)',
  white:   'var(--land-white)',
}
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

const ease = [0.22, 1, 0.36, 1] as [number,number,number,number]
const fadeUp  = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }
const stagger = { visible: { transition: { staggerChildren: 0.09 } } }

/* ─── COUNTER ──────────────────────────────────────────────── */
const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯']
function toBn(n: number) { return String(n).replace(/\d/g, d => bnDigits[+d]) }

function Counter({ to, suffix = '', bn = false }: { to: number; suffix?: string; bn?: boolean }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  useEffect(() => {
    if (!inView) return
    let s = 0; const step = to / 60
    const t = setInterval(() => { s += step; if (s >= to) { setVal(to); clearInterval(t) } else setVal(Math.floor(s)) }, 16)
    return () => clearInterval(t)
  }, [inView, to])
  const display = bn ? toBn(val) : val.toLocaleString()
  return <span ref={ref}>{display}{suffix}</span>
}

function Section({ children, id, style }: { children: React.ReactNode; id?: string; style?: React.CSSProperties }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <m.section id={id} ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} style={style}>
      {children}
    </m.section>
  )
}

/* ─── BUILDING ILLUSTRATION ────────────────────────────────── */
function BuildingIllustration() {
  const [tick, setTick] = useState(0)
  useEffect(() => { const timer = setInterval(() => setTick(n => n + 1), 1600); return () => clearInterval(timer) }, [])
  const lit = (i: number) => ((tick + i) % 5) < 3
  const w = (r: number, c: number): React.CSSProperties => ({
    fill: lit(r * 4 + c) ? '#FEF9C3' : '#0f2744',
    transition: 'fill 0.9s ease',
  })
  const cardFont = 'Inter, sans-serif'
  const collectedLabel = 'Collected'
  const occupancyLabel = 'Occupancy'
  const pendingLabel   = 'Pending'
  const billsLabel     = 'bills'

  return (
    <svg viewBox="-62 0 484 450" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 460, filter: 'drop-shadow(0 40px 80px rgba(29,158,117,0.25))' }}>
      <defs>
        <linearGradient id="bldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#0f2744" />
        </linearGradient>
        <linearGradient id="sideGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0f2744" />
          <stop offset="100%" stopColor="#172848" />
        </linearGradient>
      </defs>
      <ellipse cx="180" cy="435" rx="170" ry="14" fill="rgba(29,158,117,0.12)" />
      <rect x="230" y="190" width="100" height="240" rx="3" fill="url(#sideGrad)" />
      {[0,1,2,3,4].map(r => [0,1].map(c => (
        <rect key={`s${r}${c}`} x={243+c*28} y={204+r*36} width="16" height="22" rx="2" style={w(r+5, c)} />
      )))}
      <rect x="50" y="60" width="180" height="370" rx="4" fill="url(#bldGrad)" />
      <rect x="50" y="48" width="180" height="20" rx="3" fill="#1e40af" />
      <rect x="115" y="28" width="50" height="28" rx="3" fill="#1a3a8f" />
      <rect x="136" y="8" width="8" height="24" rx="2" fill="#1D9E75" />
      {[0,1,2,3,4,5].map(r => [0,1,2,3].map(c => (
        <rect key={`m${r}${c}`} x={66+c*38} y={78+r*50} width="22" height="30" rx="3" style={w(r, c)} />
      )))}
      <rect x="118" y="390" width="44" height="40" rx="3" fill="#0a1a33" />
      <rect x="136" y="404" width="8" height="26" rx="1" fill="#1D9E75" opacity="0.5" />
      <g transform="translate(240, 82)">
        <m.g animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}>
          <rect width="112" height="50" rx="10" fill="#1e293b" stroke="rgba(29,158,117,0.45)" strokeWidth="1"/>
          <rect x="10" y="11" width="18" height="18" rx="5" fill="#10B981" opacity="0.2"/>
          <text x="34" y="22" fill="#94a3b8" fontSize="8" fontFamily={cardFont}>{collectedLabel}</text>
          <text x="34" y="35" fill="#10B981" fontSize="12" fontWeight="700" fontFamily={cardFont}>৳ 48,500</text>
        </m.g>
      </g>
      <g transform="translate(-58, 155)">
        <m.g animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut', delay: 0.6 }}>
          <rect width="108" height="50" rx="10" fill="#1e293b" stroke="rgba(29,158,117,0.45)" strokeWidth="1"/>
          <rect x="10" y="11" width="18" height="18" rx="5" fill="#5DCAA5" opacity="0.2"/>
          <text x="34" y="22" fill="#94a3b8" fontSize="8" fontFamily={cardFont}>{occupancyLabel}</text>
          <text x="34" y="35" fill="#5DCAA5" fontSize="12" fontWeight="700" fontFamily={cardFont}>94%</text>
        </m.g>
      </g>
      <g transform="translate(242, 295)">
        <m.g animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut', delay: 1 }}>
          <rect width="112" height="50" rx="10" fill="#1e293b" stroke="rgba(245,158,11,0.45)" strokeWidth="1"/>
          <rect x="10" y="11" width="18" height="18" rx="5" fill="#F59E0B" opacity="0.2"/>
          <text x="34" y="22" fill="#94a3b8" fontSize="8" fontFamily={cardFont}>{pendingLabel}</text>
          <text x="34" y="35" fill="#F59E0B" fontSize="12" fontWeight="700" fontFamily={cardFont}>3 {billsLabel}</text>
        </m.g>
      </g>
    </svg>
  )
}

/* ─── NAVBAR — now a shared component ──────────────────────── */

/* ─── HERO ─────────────────────────────────────────────────── */
function Hero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 80])
  const width = useWindowWidth()
  const isMobile = width < 768
  const isTablet = width < 1024
  const { t, lang } = useLang()
  const bn = lang === 'bn'
  const appName = bn ? 'বাড়ি সামলাই' : 'Bari Shamlai'

  const heroText = t('landHeroH1')
  const words = heroText.split(' ')

  /* mouse-tracking parallax */
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: 50, damping: 20 })
  const springY = useSpring(rawY, { stiffness: 50, damping: 20 })

  /* blob offsets — each at a different depth */
  const b1x = useTransform(springX, v => v * -0.04)
  const b1y = useTransform(springY, v => v * -0.04)
  const b2x = useTransform(springX, v => v * 0.03)
  const b2y = useTransform(springY, v => v * 0.03)

  /* cursor glow follows mouse directly */
  const glowX = useTransform(springX, v => v - 180)
  const glowY = useTransform(springY, v => v - 180)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    rawX.set(e.clientX - r.left - r.width / 2)
    rawY.set(e.clientY - r.top - r.height / 2)
  }
  const handleMouseLeave = () => { rawX.set(0); rawY.set(0) }

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative',
        overflow: 'hidden', padding: isMobile ? '6rem 1.25rem 3rem' : '7rem 2rem 4rem',
        background: `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(29,158,117,0.18) 0%, transparent 60%), ${C.bg}`,
        cursor: 'default',
      }}>
      {/* grid */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(29,158,117,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(29,158,117,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* blob 1 — blue, moves opposite to cursor */}
      <m.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        style={{ position: 'absolute', left: '15%', top: '25%', width: 600, height: 600,
          borderRadius: '50%', background: 'rgba(29,158,117,0.13)', filter: 'blur(80px)',
          translateX: '-50%', translateY: '-50%', zIndex: 0, x: b1x, y: b1y }} />

      {/* blob 2 — violet, moves with cursor */}
      <m.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        style={{ position: 'absolute', left: '75%', top: '60%', width: 500, height: 500,
          borderRadius: '50%', background: 'rgba(29,158,117,0.1)', filter: 'blur(80px)',
          translateX: '-50%', translateY: '-50%', zIndex: 0, x: b2x, y: b2y }} />

      {/* cursor-following glow — subtle brand orb */}
      {!isMobile && (
        <m.div
          style={{ position: 'absolute', left: '50%', top: '50%', width: 360, height: 360,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,158,117,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
            translateX: '-50%', translateY: '-50%', x: glowX, y: glowY }} />
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1,
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1.1fr 0.9fr' : '1fr 1fr',
        gap: isMobile ? '2.5rem' : '3rem', alignItems: 'center' }}>
        <div>
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100,
              background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.25)',
              fontSize: isMobile ? 10 : 12, fontWeight: 700, color: C.brand, letterSpacing: bn ? '0' : '0.06em',
              marginBottom: 28, fontFamily: bn ? "var(--font-bn)" : 'inherit',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.brand, display: 'inline-block' }} />
              {t('landHeroBadge')}
            </span>
          </m.div>

          <h1 style={{ margin: '0 0 24px', lineHeight: bn ? 1.35 : 1.07, display: 'flex', flexWrap: 'wrap', gap: bn ? '0.15em' : '0.25em',
            fontFamily: bn ? "var(--font-bn)" : 'var(--font-display)',
          }}>
            {words.map((w, i) => (
              <m.span key={i} initial={{ opacity: 0, y: 20, rotateX: -20 }} animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease }}
                style={{ display: 'inline-block', fontSize: isMobile ? '2rem' : 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 900, color: C.white, letterSpacing: bn ? '0' : '-1.5px' }}>
                {w}
              </m.span>
            ))}
          </h1>

          <m.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}
            style={{ fontSize: isMobile ? 15 : 17, color: C.subtle, lineHeight: bn ? 1.8 : 1.7, marginBottom: 36, maxWidth: 480,
              fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
            {t('landHeroSub')}
          </m.p>

          <m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.4 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
            <m.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ width: isMobile ? '100%' : 'auto' }}>
              <Link href={`${APP_URL}/signup`} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 12, width: isMobile ? '100%' : 'auto',
                background: 'linear-gradient(135deg, #1D9E75 0%, #085041 100%)',
                color: '#fff', fontWeight: 700, fontSize: isMobile ? 15 : 16, textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(29,158,117,0.4)',
                fontFamily: bn ? "var(--font-bn)" : 'inherit',
              }}>
                {t('landStartFree')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </m.div>
            <m.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ width: isMobile ? '100%' : 'auto' }}>
              <a href="#how-it-works" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 24px', borderRadius: 12, width: isMobile ? '100%' : 'auto',
                border: '1px solid rgba(255,255,255,0.12)', color: C.subtle, fontWeight: 600, fontSize: 15, textDecoration: 'none',
                background: 'rgba(255,255,255,0.04)',
                fontFamily: bn ? "var(--font-bn)" : 'inherit',
              }}>
                {t('landSeeHow')}
              </a>
            </m.div>
          </m.div>

          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.5 }}
            style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { icon: '🔒', text: t('landTrustCard') },
              { icon: '⚡', text: t('landTrustSetup') },
              { icon: '🇧🇩', text: t('landTrustBD') },
            ].map(b => (
              <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: C.muted, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
                <span>{b.icon}</span><span>{b.text}</span>
              </div>
            ))}
          </m.div>
        </div>

        {!isMobile && (
          <m.div style={{ y, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease }}>
            <BuildingIllustration />
          </m.div>
        )}
      </div>
    </section>
  )
}

/* ─── STATS ─────────────────────────────────────────────────── */
function StatsStrip() {
  const width = useWindowWidth()
  const isMobile = width < 640
  const { t, lang } = useLang()
  const bn = lang === 'bn'
  const stats = [
    { label: t('landStatBuildings'), value: 500, suffix: '+' },
    { label: t('landStatHours'),     value: 12,  suffix: bn ? ' ঘণ্টা' : 'h' },
    { label: t('landStatPayment'),   value: 90,  suffix: '%' },
    { label: t('landStatMinutes'),   value: 5,   suffix: bn ? ' মিনিট' : ' min' },
  ]
  return (
    <Section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '0', background: C.surface }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)' }}>
        {stats.map((s, i) => (
          <m.div key={s.label} variants={fadeUp}
            style={{
              textAlign: 'center', padding: isMobile ? '1.75rem 0.75rem' : '2.5rem 1rem',
              borderRight: isMobile ? (i % 2 === 0 ? `1px solid ${C.border}` : 'none') : (i < 3 ? `1px solid ${C.border}` : 'none'),
              borderBottom: isMobile && i < 2 ? `1px solid ${C.border}` : 'none',
            }}>
            <div style={{ fontSize: bn ? 'clamp(1.5rem,3.5vw,2.5rem)' : 'clamp(1.75rem,4vw,3rem)', fontWeight: 900, color: C.white, lineHeight: 1, marginBottom: 8, letterSpacing: '-1px', fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
              <Counter to={s.value} suffix={s.suffix} bn={bn} />
            </div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{s.label}</div>
          </m.div>
        ))}
      </div>
    </Section>
  )
}

/* ─── PAIN POINTS ───────────────────────────────────────────── */
function PainPoints() {
  const width = useWindowWidth()
  const cols = width < 640 ? '1fr' : width < 1024 ? 'repeat(2,1fr)' : 'repeat(3,1fr)'
  const { t, lang } = useLang()
  const bn = lang === 'bn'
  const pains = [
    { icon: '📓', title: t('landPain1Title'), desc: t('landPain1Desc') },
    { icon: '💬', title: t('landPain2Title'), desc: t('landPain2Desc') },
    { icon: '📊', title: t('landPain3Title'), desc: t('landPain3Desc') },
    { icon: '🧾', title: t('landPain4Title'), desc: t('landPain4Desc') },
    { icon: '💸', title: t('landPain5Title'), desc: t('landPain5Desc') },
    { icon: '🔕', title: t('landPain6Title'), desc: t('landPain6Desc') },
  ]
  return (
    <Section style={{ background: C.bg, padding: 'clamp(60px,8vw,100px) 1.25rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <m.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#EF4444', display: 'block', marginBottom: 12, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
            {t('landPainHeader')}
          </span>
          <h2 style={{ fontFamily: bn ? "var(--font-hind), var(--font-display)" : 'var(--font-display)', fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 800, color: C.white, margin: 0 }}>
            {t('landPainTitle')}
          </h2>
        </m.div>
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '1.25rem' }}>
          {pains.map((p, i) => (
            <m.div key={i} variants={fadeUp}
              whileHover={{ y: -4, borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)' }}
              style={{ padding: '1.75rem', borderRadius: 16, border: `1px solid ${C.border}`, background: C.surface, transition: 'all 0.25s', cursor: 'default' }}>
              <span style={{ fontSize: 28, display: 'block', marginBottom: 12 }}>{p.icon}</span>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{p.title}</div>
              <div style={{ fontSize: 13.5, color: C.muted, lineHeight: bn ? 1.8 : 1.65, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{p.desc}</div>
            </m.div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ─── FEATURES ──────────────────────────────────────────────── */
const FeatureIcons: Record<string, JSX.Element> = {
  units: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  billing: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M2 10h20" stroke="currentColor" strokeWidth="1.8"/></svg>,
  receipts: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  gas: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.5 2 6 5 6 8c0 3.5 2.5 5 3.5 7 .5 1 .5 2 .5 3h4c0-1 0-2 .5-3 1-2 3.5-3.5 3.5-7 0-3-2.5-6-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  messages: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  reports: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
}

function Features() {
  const width = useWindowWidth()
  const cols = width < 640 ? '1fr' : width < 1024 ? 'repeat(2,1fr)' : 'repeat(3,1fr)'
  const { t, lang } = useLang()
  const bn = lang === 'bn'
  const features = [
    { key: 'units',    color: C.brand,   title: t('landFeat1Title'), desc: t('landFeat1Desc') },
    { key: 'billing',  color: C.green,   title: t('landFeat2Title'), desc: t('landFeat2Desc') },
    { key: 'receipts', color: C.mint,  title: t('landFeat3Title'), desc: t('landFeat3Desc') },
    { key: 'gas',      color: C.amber,   title: t('landFeat4Title'), desc: t('landFeat4Desc') },
    { key: 'messages', color: '#EC4899', title: t('landFeat5Title'), desc: t('landFeat5Desc') },
    { key: 'reports',  color: '#14B8A6', title: t('landFeat6Title'), desc: t('landFeat6Desc') },
  ]
  return (
    <Section id="features" style={{ background: C.surface, padding: 'clamp(60px,8vw,100px) 1.25rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <m.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.brand, display: 'block', marginBottom: 12, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
            {t('landFeatHeader')}
          </span>
          <h2 style={{ fontFamily: bn ? "var(--font-hind), var(--font-display)" : 'var(--font-display)', fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 800, color: C.white, margin: 0 }}>
            {t('landFeatTitle')}
          </h2>
        </m.div>
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '1.25rem' }}>
          {features.map(f => (
            <m.div key={f.key} variants={fadeUp}
              whileHover={{ y: -6, boxShadow: `0 20px 60px ${f.color}22` }}
              style={{ padding: '1.75rem', borderRadius: 16, border: `1px solid ${C.border}`, background: C.card, transition: 'all 0.3s', cursor: 'default' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 16 }}>
                {FeatureIcons[f.key]}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{f.title}</div>
              <div style={{ fontSize: 13.5, color: C.muted, lineHeight: bn ? 1.8 : 1.65, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{f.desc}</div>
            </m.div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ─── HOW IT WORKS ──────────────────────────────────────────── */
function HowItWorks() {
  const width = useWindowWidth()
  const isMobile = width < 768
  const { t, lang } = useLang()
  const bn = lang === 'bn'
  const steps = [
    { n: '০১', nEn: '01', title: t('landStep1Title'), desc: t('landStep1Desc'), color: C.brand },
    { n: '০২', nEn: '02', title: t('landStep2Title'), desc: t('landStep2Desc'), color: C.mint },
    { n: '০৩', nEn: '03', title: t('landStep3Title'), desc: t('landStep3Desc'), color: C.green },
  ]
  return (
    <Section id="how-it-works" style={{ background: C.bg, padding: 'clamp(60px,8vw,100px) 1.25rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <m.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.brand, display: 'block', marginBottom: 12, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
            {t('landHowHeader')}
          </span>
          <h2 style={{ fontFamily: bn ? "var(--font-hind), var(--font-display)" : 'var(--font-display)', fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 800, color: C.white, margin: 0 }}>
            {t('landHowTitle')}
          </h2>
        </m.div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '2rem', position: 'relative' }}>
          {!isMobile && <div style={{ position: 'absolute', top: 32, left: '16%', right: '16%', height: 1, background: `linear-gradient(90deg, ${C.brand}, ${C.mint}, ${C.green})`, opacity: 0.25, zIndex: 0 }} />}
          {steps.map((s, i) => (
            <m.div key={s.n} variants={fadeUp} style={{ textAlign: isMobile ? 'left' : 'center', position: 'relative', zIndex: 1, display: isMobile ? 'flex' : 'block', alignItems: 'flex-start', gap: isMobile ? 16 : 0 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: `${s.color}18`,
                border: `2px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: isMobile ? '0' : '0 auto 24px', fontSize: 18, fontWeight: 900, color: s.color,
                flexShrink: 0, fontFamily: bn ? "var(--font-bn)" : 'inherit',
              }}>{bn ? s.n : s.nEn}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 10, marginTop: isMobile ? 12 : 0, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{s.title}</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: bn ? 1.8 : 1.65, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{s.desc}</div>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ─── PRICING ───────────────────────────────────────────────── */
function Pricing() {
  const width = useWindowWidth()
  const isMobile = width < 640
  const isTablet = width < 1024
  const { t, lang } = useLang()
  const bn = lang === 'bn'

  const paidPlans = [
    { name: 'Basic',      nameKey: 'Basic',      price: 200, units: bn ? '১০টি ফ্ল্যাট' : '10 units', color: C.brand,
      features: [t('landPF_basic1'), t('landPF_basic2'), t('landPF_basic3'), t('landPF_basic4'), t('landPF_basic5')] },
    { name: 'Standard',   nameKey: 'Standard',   price: 300, units: bn ? '২০টি ফ্ল্যাট' : '20 units', color: C.mint, popular: true,
      features: [t('landPF_std1'), t('landPF_std2'), t('landPF_std3'), t('landPF_std4'), t('landPF_std5')] },
    { name: 'Pro',        nameKey: 'Pro',        price: 400, units: bn ? '৩০টি ফ্ল্যাট' : '30 units', color: C.green,
      features: [t('landPF_pro1'), t('landPF_pro2'), t('landPF_pro3'), t('landPF_pro4'), t('landPF_pro5')] },
    { name: 'Enterprise', nameKey: 'Enterprise', price: 500, units: bn ? '৩০+ ফ্ল্যাট (∞)' : '30+ units (∞)', color: C.amber,
      features: [t('landPF_ent1'), t('landPF_ent2'), t('landPF_ent3'), t('landPF_ent4'), t('landPF_ent5')] },
  ]

  const Check = ({ color }: { color: string }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill={`${color}20`}/>
      <path d="M8 12l3 3 5-5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  const Lock = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M12 2C9.24 2 7 4.24 7 7v2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2V7c0-2.76-2.24-5-5-5z" fill="rgba(100,116,139,0.35)"/>
    </svg>
  )

  const starterFeatures = [t('landSF1'), t('landSF2'), t('landSF3'), t('landSF4')]

  return (
    <Section id="pricing" style={{ background: C.bg, padding: 'clamp(60px,8vw,100px) 1.25rem' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <m.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.brand, display: 'block', marginBottom: 12, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
            {t('landPricingHeader')}
          </span>
          <h2 style={{ fontFamily: bn ? "var(--font-hind), var(--font-display)" : 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, color: C.white, margin: '0 0 16px', letterSpacing: bn ? '0' : '-1px' }}>
            {t('landPricingTitle')}
          </h2>
          <p style={{ fontSize: 17, color: C.muted, maxWidth: 520, margin: '0 auto', fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
            {t('landPricingSub')}
          </p>
        </m.div>

        {/* Free starter */}
        <m.div variants={fadeUp}
          style={{
            display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', gap: '1.5rem',
            padding: isMobile ? '1.5rem' : '2rem 2.5rem', borderRadius: 20, marginBottom: '1.5rem',
            background: C.surface, border: `1px solid ${C.border}`,
          }}>
          <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '2rem', width: '100%' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 6, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{t('landStarterName')}</div>
              <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 900, color: C.white, lineHeight: 1, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{t('landStarterFree')}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{t('landStarterNote')}</div>
            </div>
            {!isMobile && <div style={{ width: 1, height: 60, background: C.border, flexShrink: 0 }} />}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: isMobile ? '0.6rem' : '0.75rem 2rem' }}>
              {starterFeatures.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: C.subtle, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
                  <Check color={C.green} />{f}
                </div>
              ))}
            </div>
          </div>
          <m.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ flexShrink: 0 }}>
            <Link href={`${APP_URL}/signup`} style={{
              display: 'inline-block', padding: '12px 28px', borderRadius: 12,
              border: `1.5px solid rgba(255,255,255,0.15)`, color: C.white,
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
              background: 'rgba(255,255,255,0.06)',
              fontFamily: bn ? "var(--font-bn)" : 'inherit',
            }}>
              {t('landStarterCTA')}
            </Link>
          </m.div>
        </m.div>

        {/* Paid tiers */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '1.25rem', marginBottom: 40 }}>
          {paidPlans.map(plan => (
            <m.div key={plan.name} variants={fadeUp}
              whileHover={{ y: -8, boxShadow: `0 24px 72px ${plan.color}28` }}
              style={{
                borderRadius: 20, padding: '2rem 1.75rem', position: 'relative', transition: 'all 0.3s',
                background: (plan as any).popular ? `linear-gradient(160deg, ${plan.color}18, ${plan.color}08)` : C.surface,
                border: (plan as any).popular ? `1.5px solid ${plan.color}55` : `1px solid ${C.border}`,
              }}>
              {(plan as any).popular && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: `linear-gradient(135deg, ${plan.color}, ${C.brand})`,
                  color: '#fff', fontSize: 10, fontWeight: 800, padding: '5px 16px',
                  borderRadius: 100, whiteSpace: 'nowrap', letterSpacing: '0.08em',
                  boxShadow: `0 4px 14px ${plan.color}60`,
                  fontFamily: bn ? "var(--font-bn)" : 'inherit',
                }}>
                  {t('landPopular')}
                </div>
              )}
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: plan.color, marginBottom: 14 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 15, color: plan.color, fontWeight: 700 }}>৳</span>
                <span style={{ fontSize: '2.8rem', fontWeight: 900, color: C.white, lineHeight: 1, letterSpacing: '-1.5px' }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: C.muted, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{t('landPerMonth')}</span>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                borderRadius: 100, background: `${plan.color}18`, border: `1px solid ${plan.color}35`,
                fontSize: 12, fontWeight: 700, color: plan.color, marginBottom: 24,
                fontFamily: bn ? "var(--font-bn)" : 'inherit',
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {plan.units}
              </div>
              <div style={{ height: 1, background: C.border, marginBottom: 20 }} />
              <div style={{ marginBottom: 28 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 11, fontSize: 13, color: C.subtle, lineHeight: 1.4, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
                    <div style={{ marginTop: 1 }}><Check color={plan.color} /></div>
                    {f}
                  </div>
                ))}
              </div>
              <m.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href={`${APP_URL}/signup`} style={{
                  display: 'block', textAlign: 'center', padding: '12px', borderRadius: 12,
                  background: (plan as any).popular ? `linear-gradient(135deg, ${plan.color}, ${C.brand})` : 'rgba(255,255,255,0.07)',
                  border: (plan as any).popular ? 'none' : `1px solid ${C.border}`,
                  color: (plan as any).popular ? '#fff' : C.subtle,
                  fontWeight: 700, fontSize: 14, textDecoration: 'none',
                  boxShadow: (plan as any).popular ? `0 4px 20px ${plan.color}40` : 'none',
                  fontFamily: 'inherit',
                }}>
                  Get {plan.name}
                </Link>
              </m.div>
            </m.div>
          ))}
        </div>

        <m.div variants={fadeUp}
          style={{ padding: '1.25rem 1.5rem', borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '0.75rem' : '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock />
            <span style={{ fontSize: 13, color: C.muted, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{t('landLockNote')}</span>
          </div>
          {!isMobile && <div style={{ width: 1, height: 18, background: C.border }} />}
          <span style={{ fontSize: 13, color: C.muted, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{t('landPremiumNote')}</span>
          <m.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ marginLeft: isMobile ? 0 : 'auto' }}>
            <Link href={`${APP_URL}/signup`} style={{ fontSize: 13, fontWeight: 700, color: C.brand, textDecoration: 'none', fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
              {t('landUpgradeLater')}
            </Link>
          </m.div>
        </m.div>
      </div>
    </Section>
  )
}

/* ─── TESTIMONIALS ──────────────────────────────────────────── */
function Testimonials() {
  const width = useWindowWidth()
  const cols = width < 768 ? '1fr' : 'repeat(3,1fr)'
  const { t, lang } = useLang()
  const bn = lang === 'bn'
  const testimonials = [
    { initials: 'রই', color: C.brand,  name: 'রফিকুল ইসলাম', role: t('landTest1Role'), location: t('landTest1Loc'), quote: t('landTest1Quote') },
    { initials: 'ফস', color: C.mint, name: 'ফরিদা সুলতানা',  role: t('landTest2Role'), location: t('landTest2Loc'), quote: t('landTest2Quote') },
    { initials: 'আহ', color: C.green,  name: 'আরিফ হোসেন',    role: t('landTest3Role'), location: t('landTest3Loc'), quote: t('landTest3Quote') },
  ]
  const testimonialsEn = [
    { initials: 'RI', color: C.brand,  name: 'Rafiqul Islam',  role: t('landTest1Role'), location: t('landTest1Loc'), quote: t('landTest1Quote') },
    { initials: 'FS', color: C.mint, name: 'Farida Sultana', role: t('landTest2Role'), location: t('landTest2Loc'), quote: t('landTest2Quote') },
    { initials: 'AH', color: C.green,  name: 'Arif Hossain',   role: t('landTest3Role'), location: t('landTest3Loc'), quote: t('landTest3Quote') },
  ]
  const list = bn ? testimonials : testimonialsEn

  return (
    <Section style={{ background: C.bg, padding: 'clamp(60px,8vw,100px) 1.25rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <m.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.brand, display: 'block', marginBottom: 12, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
            {t('landTestHeader')}
          </span>
          <h2 style={{ fontFamily: bn ? "var(--font-hind), var(--font-display)" : 'var(--font-display)', fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 800, color: C.white, margin: 0 }}>
            {t('landTestTitle')}
          </h2>
        </m.div>
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '1.5rem' }}>
          {list.map(tt => (
            <m.div key={tt.name} variants={fadeUp}
              whileHover={{ y: -4, borderColor: `${tt.color}40` }}
              style={{ padding: '2rem', borderRadius: 20, border: `1px solid ${C.border}`, background: C.surface, transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 18 }}>
                {[1,2,3,4,5].map(i => <svg key={i} width="14" height="14" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={tt.color}/></svg>)}
              </div>
              <p style={{ fontSize: 14, color: C.subtle, lineHeight: bn ? 1.8 : 1.75, marginBottom: 20, fontStyle: 'italic', fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>"{tt.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${tt.color}25`, border: `1.5px solid ${tt.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: tt.color, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
                  {tt.initials}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{tt.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{tt.role} · {tt.location}</div>
                </div>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ─── FAQ ───────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const { t, lang } = useLang()
  const bn = lang === 'bn'
  const faqs = [
    { q: t('landFaq1Q'), a: t('landFaq1A') },
    { q: t('landFaq2Q'), a: t('landFaq2A') },
    { q: t('landFaq3Q'), a: t('landFaq3A') },
    { q: t('landFaq4Q'), a: t('landFaq4A') },
    { q: t('landFaq5Q'), a: t('landFaq5A') },
    { q: t('landFaq6Q'), a: t('landFaq6A') },
  ]
  return (
    <Section id="faq" style={{ background: C.surface, padding: 'clamp(60px,8vw,100px) 1.25rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <m.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.brand, display: 'block', marginBottom: 12 }}>{t('landFaqHeader')}</span>
          <h2 style={{ fontFamily: bn ? "var(--font-hind), var(--font-display)" : 'var(--font-display)', fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 800, color: C.white, margin: 0 }}>
            {t('landFaqTitle')}
          </h2>
        </m.div>
        <div>
          {faqs.map((f, i) => (
            <m.div key={i} variants={fadeUp} style={{ borderBottom: `1px solid ${C.border}` }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', textAlign: 'left' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: open === i ? C.brand : C.text, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{f.q}</span>
                <m.span animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.2 }}
                  style={{ fontSize: 20, color: open === i ? C.brand : C.muted, flexShrink: 0, lineHeight: 1 }}>+</m.span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}>
                    <p style={{ padding: '0 0 20px', fontSize: 14, color: C.muted, lineHeight: bn ? 1.85 : 1.75, margin: 0, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{f.a}</p>
                  </m.div>
                )}
              </AnimatePresence>
            </m.div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ─── FINAL CTA ─────────────────────────────────────────────── */
function FinalCTA() {
  const { t, lang } = useLang()
  const bn = lang === 'bn'
  return (
    <Section style={{ background: C.bg, padding: 'clamp(60px,8vw,100px) 1.25rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(29,158,117,0.12), transparent)', borderRadius: '50%', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <m.div variants={fadeUp}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.brand, display: 'block', marginBottom: 16, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>{t('landCtaHeader')}</span>
            <h2 style={{ fontFamily: bn ? "var(--font-hind), var(--font-display)" : 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, color: C.white, margin: '0 0 20px', lineHeight: bn ? 1.4 : 1.1 }}>
              {t('landCtaTitle').split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h2>
            <p style={{ fontSize: 18, color: C.muted, marginBottom: 40, lineHeight: bn ? 1.9 : 1.65, fontFamily: bn ? "var(--font-bn)" : 'inherit' }}>
              {t('landCtaSub').split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <m.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href={`${APP_URL}/signup`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 32px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #1D9E75, #085041)',
                  color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none',
                  boxShadow: '0 8px 32px rgba(29,158,117,0.45)',
                  fontFamily: bn ? "var(--font-bn)" : 'inherit',
                }}>
                  {t('landCtaCreate')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </m.div>
              <m.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href={`${APP_URL}/login`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 28px', borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.12)', color: C.subtle, fontWeight: 600, fontSize: 15, textDecoration: 'none',
                  background: 'rgba(255,255,255,0.04)',
                  fontFamily: bn ? "var(--font-bn)" : 'inherit',
                }}>
                  {t('landCtaExisting')}
                </Link>
              </m.div>
            </div>
          </m.div>
        </div>
      </div>
    </Section>
  )
}

/* ─── FOOTER — now a shared component ──────────────────────── */

/* ─── ROOT ──────────────────────────────────────────────────── */
export function LandingPage() {
  return (
    <LazyMotion features={domAnimation}>
      <div style={{ background: C.bg, fontFamily: 'var(--font-body)', color: C.text, overflowX: 'hidden' }}>
        <LandingNavbar />
        <Hero />
        <StatsStrip />
        <PainPoints />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
        <LandingFooter />
      </div>
    </LazyMotion>
  )
}
