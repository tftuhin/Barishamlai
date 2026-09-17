'use client'
import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang, LangToggle } from '@/components/layout/LanguageContext'
import { BariShamlaiMark } from '@/components/ui/BariShamlaiLogo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const { t, lang } = useLang()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) {
      setError(t('loginError'))
      setLoading(false)
    } else {
      const session = await getSession()
      if ((session?.user as any)?.role === 'DEVELOPER') {
        window.location.href = '/developer' // Use window.location to force a full hard reload
      } else {
        router.push('/dashboard')
      }
    }
  }

  const fieldStyle = (name: string): React.CSSProperties => ({
    width: '100%', padding: '11px 14px', borderRadius: '10px', boxSizing: 'border-box',
    border: `1.5px solid ${focusedField === name ? 'var(--brand)' : 'var(--border-strong)'}`,
    fontSize: '14px', background: '#fff', outline: 'none',
    boxShadow: focusedField === name ? '0 0 0 3px rgba(29,158,117,0.1)' : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: lang === 'bn' ? "var(--font-hind), var(--font-body)" : 'var(--font-body)',
  })

  const appName = lang === 'bn' ? 'বাড়ি সামলাই' : 'Bari Shamlai'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #040E0A 0%, #085041 50%, #1D9E75 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      {/* Animated background orbs */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '-15%', right: '-8%', width: '520px', height: '520px', borderRadius: '50%', background: 'rgba(29,158,117,0.12)' }}
        />
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 1 }}
          style={{ position: 'absolute', top: '-8%', right: '-3%', width: '360px', height: '360px', borderRadius: '50%', background: 'rgba(96,165,250,0.07)' }}
        />
        <motion.div
          animate={{ y: [0, -10, 0], x: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut', delay: 2 }}
          style={{ position: 'absolute', bottom: '-18%', left: '-8%', width: '420px', height: '420px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          style={{ position: 'absolute', bottom: '10%', right: '5%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(29,158,117,0.06)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '420px' }}
      >
        {/* Logo / Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        >
          {/* Language toggle at top */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <LangToggle />
          </div>

          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              style={{ marginBottom: '1rem', display: 'inline-block' }}
            >
              <BariShamlaiMark size={100} animated={false} variant="color" />
            </motion.div>
          </Link>
          <br />
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{
              fontFamily: lang === 'bn' ? "var(--font-hind), var(--font-body)" : 'var(--font-body)',
              fontWeight: 700, fontSize: '2rem', color: '#fff',
              margin: 0, marginBottom: '0.25rem',
              letterSpacing: lang === 'bn' ? '0' : '-0.5px',
            }}>
              {appName}
            </h1>
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '14px', fontFamily: lang === 'bn' ? "var(--font-hind), var(--font-body)" : 'var(--font-body)' }}>
            {process.env.NEXT_PUBLIC_BUILDING_NAME || t('appTagline')}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
          style={{
            background: 'rgba(255,255,255,0.97)',
            borderRadius: '20px', padding: '2rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          }}
        >
          <h2 style={{
            fontFamily: lang === 'bn' ? "var(--font-hind), var(--font-display)" : 'var(--font-display)',
            fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--brand)',
          }}>
            {t('loginWelcome')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.75rem', fontFamily: lang === 'bn' ? "var(--font-hind), var(--font-body)" : 'var(--font-body)' }}>
            {t('loginSubtitle')}
          </p>

          <form onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              style={{ marginBottom: '1rem' }}
            >
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', fontFamily: lang === 'bn' ? "var(--font-hind), var(--font-body)" : 'var(--font-body)' }}>
                {t('loginEmail')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={fieldStyle('email')}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.27, duration: 0.3 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', fontFamily: lang === 'bn' ? "var(--font-hind), var(--font-body)" : 'var(--font-body)' }}>
                  {t('loginPassword')}
                </label>
                <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>
                  {lang === 'bn' ? 'পাসওয়ার্ড ভুলেছেন?' : 'Forgot password?'}
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={fieldStyle('password')}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', overflow: 'hidden', fontFamily: lang === 'bn' ? "var(--font-hind), var(--font-body)" : 'var(--font-body)' }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.015, boxShadow: '0 6px 20px rgba(29,158,117,0.35)' } : undefined}
              whileTap={!loading ? { scale: 0.97 } : undefined}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1D9E75 0%, #085041 100%)',
                color: '#fff', fontSize: '15px', fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background 0.2s',
                fontFamily: lang === 'bn' ? "var(--font-hind), var(--font-body)" : 'var(--font-body)',
              }}
            >
              {loading && (
                <motion.svg
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </motion.svg>
              )}
              {loading ? t('loginSigning') : t('loginSubmit')}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '1.25rem', marginBottom: '1rem', fontFamily: lang === 'bn' ? "var(--font-hind), var(--font-body)" : 'var(--font-body)' }}>
            {t('loginNewUser')}{' '}
            <a href="/signup" style={{ color: 'var(--brand)', fontWeight: 500, textDecoration: 'none' }}>{t('loginCreateAcc')}</a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
