'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang, LangToggle } from '@/components/layout/LanguageContext'
import { BariShamlaiMark } from '@/components/ui/BariShamlaiLogo'

type JoinMethod = 'invitation' | 'request'

export default function SignupPage() {
  const router = useRouter()
  const { t, lang } = useLang()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', phone: '',
    role: 'ADMIN', buildingName: '',
    joinMethod: 'invitation' as JoinMethod,
    buildingId: '', invitationToken: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ pending: boolean; buildingName?: string } | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const isAdmin = form.role === 'ADMIN'
  const isResident = form.role === 'OWNER' || form.role === 'TENANT'
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const ff = (name: string): React.CSSProperties => ({
    width: '100%', padding: '10px 14px', borderRadius: '10px', boxSizing: 'border-box',
    border: `1.5px solid ${focusedField === name ? '#1D9E75' : '#C8D8D4'}`,
    fontSize: '14px', background: '#fff', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: focusedField === name ? '0 0 0 3px rgba(29,158,117,0.1)' : 'none',
    fontFamily: lang === 'bn' ? "var(--font-hind), var(--font-body)" : 'var(--font-body)',
  })

  const bn = lang === 'bn'
  const fontStyle: React.CSSProperties = { fontFamily: bn ? "var(--font-hind), var(--font-body)" : 'var(--font-body)' }

  const roles = [
    { val: 'ADMIN',  label: t('roleAdmin'),  sub: t('roleAdminSub'),  icon: '🏢' },
    { val: 'OWNER',  label: t('roleOwner'),  sub: t('roleOwnerSub'),  icon: '🔑' },
    { val: 'TENANT', label: t('roleTenant'), sub: t('roleTenantSub'), icon: '🏠' },
  ]
  const joinMethods = [
    { val: 'invitation', label: t('joinInvitation'), icon: '✉️', sub: t('joinInvitationSub') },
    { val: 'request',    label: t('joinRequest'),    icon: '🔍', sub: t('joinRequestSub') },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError(t('errPasswordMatch')); return }
    if (isAdmin && !form.buildingName.trim()) { setError(t('errBuildingRequired')); return }
    if (isResident && form.joinMethod === 'invitation' && !form.invitationToken.trim()) {
      setError(t('errEnterToken')); return
    }
    if (isResident && form.joinMethod === 'request' && !form.buildingId.trim()) {
      setError(t('errEnterBuildingId')); return
    }
    setLoading(true)
    const res = await fetch('/api/auth/signup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || t('errSignupFailed')); setLoading(false); return }
    if (data.status === 'pending') {
      setSuccess({ pending: true, buildingName: data.buildingName })
    } else {
      router.push('/login?signup=success')
    }
    setLoading(false)
  }

  const appName = bn ? 'বাড়ি সামলাই' : 'Bari Shamlai'

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #040E0A 0%, #085041 50%, #1D9E75 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{ background: 'rgba(255,255,255,0.97)', borderRadius: '20px', padding: '2.5rem', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{ fontSize: '3.5rem', marginBottom: '1rem' }}
          >
            ⏳
          </motion.div>
          <h2 style={{ ...fontStyle, fontFamily: bn ? "var(--font-hind), var(--font-display)" : 'var(--font-display)', fontSize: '1.5rem', color: 'var(--brand)', marginBottom: '0.75rem' }}>
            {t('pendingTitle')}
          </h2>
          <p style={{ ...fontStyle, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {t('pendingBody').replace('{building}', success.buildingName || '')}
          </p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block', marginTop: '1.5rem' }}>
            <Link href="/login" style={{ ...fontStyle, display: 'inline-block', padding: '11px 32px', borderRadius: '10px', background: '#1D9E75', color: '#fff', fontSize: '14px', fontWeight: 500, textDecoration: 'none', boxShadow: '0 4px 14px rgba(29,158,117,0.35)' }}>
              {t('backToLogin')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #040E0A 0%, #085041 50%, #1D9E75 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      {/* Animated background orbs */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div
          animate={{ y: [0, -16, 0], rotate: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.08)', background: 'rgba(29,158,117,0.06)' }}
        />
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 11, ease: 'easeInOut', delay: 1.5 }}
          style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '480px' }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
            <LangToggle />
          </div>
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            style={{ display: 'inline-block', marginBottom: '1rem' }}
          >
            <BariShamlaiMark size={100} variant="color" />
          </motion.div>
          <br />
          <h1 style={{ ...fontStyle, fontSize: '2rem', color: '#fff', margin: 0, marginBottom: '0.25rem', fontWeight: 700, letterSpacing: bn ? '0' : '-0.3px' }}>
            {appName}
          </h1>
          <p style={{ ...fontStyle, color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '14px' }}>{t('signupPlatform')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
          style={{ background: 'rgba(255,255,255,0.97)', borderRadius: '20px', padding: '2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
        >
          <h2 style={{ ...fontStyle, fontFamily: bn ? "var(--font-hind), var(--font-display)" : 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--brand)' }}>{t('signupTitle')}</h2>
          <p style={{ ...fontStyle, fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t('signupSubtitle')}</p>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '1.25rem' }}>
            {roles.map((r, i) => (
              <motion.button
                key={r.val}
                type="button"
                onClick={() => set('role', r.val)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.25 }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '10px 8px', borderRadius: '10px',
                  border: `2px solid ${form.role === r.val ? '#1D9E75' : '#C8D8D4'}`,
                  background: form.role === r.val ? '#eff6ff' : '#fff',
                  cursor: 'pointer', textAlign: 'center', transition: 'background 0.15s, border-color 0.15s',
                  boxShadow: form.role === r.val ? '0 0 0 3px rgba(29,158,117,0.1)' : 'none',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '2px' }}>{r.icon}</div>
                <div style={{ ...fontStyle, fontSize: '13px', fontWeight: 600, color: form.role === r.val ? '#1D9E75' : '#1A2E2A' }}>{r.label}</div>
                <div style={{ ...fontStyle, fontSize: '10px', color: '#64748b', marginTop: '1px' }}>{r.sub}</div>
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Admin: building name */}
            <AnimatePresence>
              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden', padding: '12px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}
                >
                  <label style={{ ...fontStyle, display: 'block', fontSize: '12px', fontWeight: 600, color: '#1d4ed8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🏢 {t('buildingName')}</label>
                  <input type="text" required={isAdmin} value={form.buildingName} onChange={e => set('buildingName', e.target.value)}
                    style={ff('buildingName')} placeholder={t('buildingPlaceholder')}
                    onFocus={() => setFocusedField('buildingName')} onBlur={() => setFocusedField(null)} />
                  <p style={{ ...fontStyle, fontSize: '11px', color: '#3b82f6', margin: '4px 0 0' }}>{t('buildingWorkspace')}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Owner / Tenant: join method */}
            <AnimatePresence>
              {isResident && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <p style={{ ...fontStyle, fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('joinHow')}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    {joinMethods.map(m => (
                      <motion.button key={m.val} type="button" onClick={() => set('joinMethod', m.val)}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        style={{
                          padding: '10px', borderRadius: '10px',
                          border: `2px solid ${form.joinMethod === m.val ? '#1D9E75' : '#C8D8D4'}`,
                          background: form.joinMethod === m.val ? '#eff6ff' : '#fff',
                          cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s, border-color 0.15s',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{m.icon}</span>
                        <div style={{ ...fontStyle, fontSize: '12px', fontWeight: 600, color: form.joinMethod === m.val ? '#1D9E75' : '#1A2E2A', marginTop: '4px' }}>{m.label}</div>
                        <div style={{ ...fontStyle, fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{m.sub}</div>
                      </motion.button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {form.joinMethod === 'invitation' ? (
                      <motion.div key="invitation"
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        style={{ padding: '10px 12px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}
                      >
                        <label style={{ ...fontStyle, display: 'block', fontSize: '12px', fontWeight: 600, color: '#15803d', marginBottom: '6px' }}>{t('invitationToken')}</label>
                        <input type="text" value={form.invitationToken} onChange={e => set('invitationToken', e.target.value)}
                          style={{ ...ff('invitationToken'), borderColor: '#bbf7d0' }} placeholder={t('invitationPaste')}
                          onFocus={() => setFocusedField('invitationToken')} onBlur={() => setFocusedField(null)} />
                        <p style={{ ...fontStyle, fontSize: '11px', color: '#16a34a', margin: '4px 0 0' }}>{t('invitationInstant')}</p>
                      </motion.div>
                    ) : (
                      <motion.div key="request"
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{ padding: '10px 12px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}
                      >
                        <label style={{ ...fontStyle, display: 'block', fontSize: '12px', fontWeight: 600, color: '#92400e', marginBottom: '6px' }}>{t('fieldBuildingId')}</label>
                        <input type="text" value={form.buildingId} onChange={e => set('buildingId', e.target.value)}
                          style={{ ...ff('buildingId'), borderColor: '#fde68a' }} placeholder={t('buildingIdPlaceholder')}
                          onFocus={() => setFocusedField('buildingId')} onBlur={() => setFocusedField(null)} />
                        <p style={{ ...fontStyle, fontSize: '11px', color: '#b45309', margin: '4px 0 0' }}>{t('requestApproval')}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Personal info fields */}
            {[
              { key: 'name',  label: t('fieldFullName'),  type: 'text',  placeholder: bn ? 'আপনার পুরো নাম' : 'Your full name', required: true },
              { key: 'email', label: t('fieldEmail'),     type: 'email', placeholder: 'you@example.com', required: true },
              { key: 'phone', label: t('fieldPhone'),     type: 'tel',   placeholder: '+880…', required: false },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '1rem' }}>
                <label style={{ ...fontStyle, display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>{f.label}</label>
                <input type={f.type} required={f.required} value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                  style={ff(f.key)} placeholder={f.placeholder}
                  onFocus={() => setFocusedField(f.key)} onBlur={() => setFocusedField(null)} />
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ ...fontStyle, display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('fieldPassword')}</label>
                <input type="password" required value={form.password} onChange={e => set('password', e.target.value)}
                  style={ff('password')} placeholder={t('fieldMinChars')}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} />
              </div>
              <div>
                <label style={{ ...fontStyle, display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('fieldConfirm')}</label>
                <input type="password" required value={form.confirm} onChange={e => set('confirm', e.target.value)}
                  style={ff('confirm')} placeholder={t('fieldRepeat')}
                  onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)} />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  style={{ ...fontStyle, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', overflow: 'hidden' }}
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
              style={{
                ...fontStyle,
                width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1D9E75 0%, #085041 100%)',
                color: '#fff', fontSize: '15px', fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background 0.2s',
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
              {loading
                ? t('signupCreating')
                : isAdmin
                ? `🏢 ${t('signupCreateBuilding')}`
                : form.joinMethod === 'invitation'
                ? `✓ ${t('signupJoin')}`
                : `📩 ${t('signupSendRequest')}`
              }
            </motion.button>
          </form>

          <p style={{ ...fontStyle, textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '1.25rem', marginBottom: 0 }}>
            {t('signupHaveAccount')}{' '}
            <Link href="/login" style={{ color: '#1D9E75', fontWeight: 500, textDecoration: 'none' }}>{t('signupSignIn')}</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
