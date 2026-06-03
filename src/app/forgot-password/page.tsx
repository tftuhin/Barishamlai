'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { BariShamlaiMark } from '@/components/ui/BariShamlaiLogo'

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/profile/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    // Always show success to prevent email enumeration
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #040E0A 0%, #085041 50%, #1D9E75 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '-15%', right: '-8%', width: '520px', height: '520px', borderRadius: '50%', background: 'rgba(29,158,117,0.12)' }}
        />
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 1 }}
          style={{ position: 'absolute', bottom: '-18%', left: '-8%', width: '420px', height: '420px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '420px' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
          <h1 style={{ fontWeight: 700, fontSize: '2rem', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
            Bari Shamlai
          </h1>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
          style={{
            background: 'rgba(255,255,255,0.97)',
            borderRadius: '20px', padding: '2rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          }}
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '1rem 0' }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.12)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A2E2A', marginBottom: '0.5rem' }}>
                  Check your email
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link. Check your inbox (and spam folder).
                </p>
                <Link href="/login" style={{ color: '#1D9E75', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                  ← Back to Login
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.25rem' }}>
                  Forgot password?
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '1.75rem' }}>
                  Enter your email and we&apos;ll send you a reset link.
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      style={{
                        width: '100%', padding: '11px 14px', borderRadius: '10px', boxSizing: 'border-box',
                        border: `1.5px solid ${focused ? 'var(--brand, #1D9E75)' : '#C8D8D4'}`,
                        fontSize: '14px', outline: 'none',
                        boxShadow: focused ? '0 0 0 3px rgba(29,158,117,0.1)' : 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.015 } : undefined}
                    whileTap={!loading ? { scale: 0.97 } : undefined}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                      background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1D9E75 0%, #085041 100%)',
                      color: '#fff', fontSize: '15px', fontWeight: 500,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
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
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </motion.button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '13px', color: '#94A3B8', marginTop: '1.25rem' }}>
                  Remember your password?{' '}
                  <Link href="/login" style={{ color: '#1D9E75', fontWeight: 500, textDecoration: 'none' }}>
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}
