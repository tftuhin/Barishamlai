'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPw, setShowPw] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/profile/reset/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    })
    const data = await res.json()
    if (res.ok) {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2500)
    } else {
      setError(data.error || 'Something went wrong.')
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #C8D8D4',
    fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box',
  }

  if (!token) return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#EF4444', marginBottom: '1rem' }}>Invalid or missing reset token.</p>
      <Link href="/login" style={{ color: '#1D9E75', textDecoration: 'none', fontWeight: 600 }}>Back to Login</Link>
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.25)', fontSize: '13.5px', marginBottom: '1rem' }}>
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)', fontSize: '13.5px', marginBottom: '1rem', textAlign: 'center' }}>
            Password reset! Redirecting to login…
          </motion.div>
        )}
      </AnimatePresence>

      {!success && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '44px' }}
                value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                onFocus={e => (e.target.style.borderColor = '#1D9E75')}
                onBlur={e => (e.target.style.borderColor = '#C8D8D4')} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  {showPw
                    ? <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    : <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  }
                </svg>
              </button>
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Confirm Password</label>
            <input type={showPw ? 'text' : 'password'} style={{ ...inputStyle, borderColor: confirmPassword && confirmPassword !== newPassword ? '#EF4444' : '#C8D8D4' }}
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
              onFocus={e => (e.target.style.borderColor = '#1D9E75')}
              onBlur={e => (e.target.style.borderColor = confirmPassword !== newPassword ? '#EF4444' : '#C8D8D4')} />
          </div>
          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ width: '100%', padding: '13px', borderRadius: '10px', background: '#1D9E75', color: '#fff', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Resetting…' : 'Set New Password'}
          </motion.button>
        </>
      )}
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '1rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem', maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #1D9E75, #085041)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C9.24 2 7 4.24 7 7v2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2V7c0-2.76-2.24-5-5-5zm0 2c1.65 0 3 1.35 3 3v2H9V7c0-1.65 1.35-3 3-3zm0 9a2 2 0 110 4 2 2 0 010-4z" fill="white"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A2E2A', marginBottom: '6px' }}>Set New Password</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Enter a new password for your account.</p>
        </div>
        <Suspense fallback={<div style={{ textAlign: 'center', color: '#94A3B8' }}>Loading…</div>}>
          <ResetForm />
        </Suspense>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/login" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>← Back to Login</Link>
        </div>
      </motion.div>
    </div>
  )
}
