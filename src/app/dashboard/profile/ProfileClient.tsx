'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getInitials } from '@/lib/utils'

type UserProfile = {
  id: string
  name: string
  email: string
  phone: string | null
  profileImage: string | null
  role: string
  createdAt: string | Date
}

const S = {
  card: {
    background: '#fff', borderRadius: '16px', padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.06)', marginBottom: '1.5rem',
  } as React.CSSProperties,
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' } as React.CSSProperties,
  input: {
    width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #C8D8D4',
    fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s',
  } as React.CSSProperties,
  btn: (variant: 'primary' | 'ghost') => ({
    padding: '10px 24px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
    border: 'none', transition: 'all 0.15s',
    ...(variant === 'primary'
      ? { background: '#1D9E75', color: '#fff' }
      : { background: '#F1F5F9', color: '#374151' }),
  } as React.CSSProperties),
}

function Alert({ type, msg }: { type: 'success' | 'error'; msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 500, marginBottom: '1rem',
        background: type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        color: type === 'success' ? '#059669' : '#DC2626',
        border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
      }}
    >
      {msg}
    </motion.div>
  )
}

export function ProfileClient({ user: initial }: { user: UserProfile }) {
  const [user, setUser] = useState(initial)

  // Profile form state
  const [name, setName] = useState(initial.name)
  const [phone, setPhone] = useState(initial.phone ?? '')
  const [profileImage, setProfileImage] = useState(initial.profileImage ?? '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [showPw, setShowPw] = useState(false)

  // Reset password state
  const [resetSending, setResetSending] = useState(false)
  const [resetMsg, setResetMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) {
      setProfileMsg({ type: 'error', msg: 'Image must be under 500KB. Please compress it first.' })
      return
    }
    const reader = new FileReader()
    reader.onload = ev => {
      const result = ev.target?.result as string
      setProfileImage(result)
      setProfileMsg(null)
    }
    reader.readAsDataURL(file)
  }

  async function saveProfile() {
    setProfileSaving(true); setProfileMsg(null)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null, profileImage: profileImage || null }),
    })
    const data = await res.json()
    if (res.ok) {
      setUser(prev => ({ ...prev, name: data.name, phone: data.phone, profileImage: data.profileImage }))
      setProfileMsg({ type: 'success', msg: 'Profile updated successfully.' })
    } else {
      setProfileMsg({ type: 'error', msg: data.error || 'Failed to update profile.' })
    }
    setProfileSaving(false)
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', msg: 'New passwords do not match.' }); return
    }
    if (newPassword.length < 8) {
      setPwMsg({ type: 'error', msg: 'Password must be at least 8 characters.' }); return
    }
    setPwSaving(true); setPwMsg(null)
    const res = await fetch('/api/profile/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await res.json()
    if (res.ok) {
      setPwMsg({ type: 'success', msg: 'Password changed successfully.' })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } else {
      setPwMsg({ type: 'error', msg: data.error || 'Failed to change password.' })
    }
    setPwSaving(false)
  }

  async function requestReset() {
    setResetSending(true); setResetMsg(null)
    const res = await fetch('/api/profile/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    })
    if (res.ok) {
      setResetMsg({ type: 'success', msg: 'Password reset link sent to your email. Check your inbox.' })
    } else {
      setResetMsg({ type: 'error', msg: 'Failed to send reset email. Try again later.' })
    }
    setResetSending(false)
  }

  const joined = new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: '2rem', maxWidth: '680px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <Link href="/dashboard" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '13px' }}>← Dashboard</Link>
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1A2E2A', margin: 0 }}>My Profile</h1>
        <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0' }}>Manage your account information and security settings.</p>
      </motion.div>

      {/* Avatar + basic info card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={S.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #F1F5F9' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <motion.div
              whileHover={{ scale: 1.04 }}
              style={{
                width: '80px', height: '80px', borderRadius: '50%',
                border: '3px solid #1D9E75', overflow: 'hidden',
                background: profileImage ? 'transparent' : 'linear-gradient(135deg, #1D9E75, #085041)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: 700, color: '#fff', cursor: 'pointer', flexShrink: 0,
              }}
              onClick={() => fileRef.current?.click()}
            >
              {profileImage ? (
                <img src={profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                getInitials(user.name)
              )}
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px',
                borderRadius: '50%', background: '#1D9E75', border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1A2E2A' }}>{user.name}</div>
            <div style={{ fontSize: '13px', color: '#64748B' }}>{user.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '20px', background: 'rgba(29,158,117,0.1)', color: '#1D9E75', fontSize: '11px', fontWeight: 700 }}>
                {user.role}
              </span>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>Joined {joined}</span>
            </div>
          </div>
        </div>

        <AnimatePresence>{profileMsg && <Alert {...profileMsg} />}</AnimatePresence>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={S.label}>Full Name</label>
            <input style={S.input} value={name} onChange={e => setName(e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#1D9E75')}
              onBlur={e => (e.target.style.borderColor = '#C8D8D4')} />
          </div>
          <div>
            <label style={S.label}>Phone Number</label>
            <input style={S.input} value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+880 1XX XXXX XXXX"
              onFocus={e => (e.target.style.borderColor = '#1D9E75')}
              onBlur={e => (e.target.style.borderColor = '#C8D8D4')} />
          </div>
        </div>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={S.label}>Email Address</label>
          <input style={{ ...S.input, background: '#F8FAFC', color: '#94A3B8', cursor: 'not-allowed' }} value={user.email} disabled />
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0' }}>Email cannot be changed.</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={saveProfile} disabled={profileSaving} style={S.btn('primary')}>
            {profileSaving ? 'Saving…' : 'Save Changes'}
          </motion.button>
        </div>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={S.card}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A2E2A', marginBottom: '4px' }}>Change Password</h2>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '1.25rem' }}>Choose a strong password with at least 8 characters.</p>

        <AnimatePresence>{pwMsg && <Alert {...pwMsg} />}</AnimatePresence>

        <div style={{ marginBottom: '1rem' }}>
          <label style={S.label}>Current Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPw ? 'text' : 'password'} style={{ ...S.input, paddingRight: '44px' }}
              value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={S.label}>New Password</label>
            <input type={showPw ? 'text' : 'password'} style={S.input}
              value={newPassword} onChange={e => setNewPassword(e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#1D9E75')}
              onBlur={e => (e.target.style.borderColor = '#C8D8D4')} />
          </div>
          <div>
            <label style={S.label}>Confirm New Password</label>
            <input type={showPw ? 'text' : 'password'} style={{
              ...S.input,
              borderColor: confirmPassword && confirmPassword !== newPassword ? '#EF4444' : '#C8D8D4',
            }}
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              onFocus={e => (e.target.style.borderColor = confirmPassword !== newPassword ? '#EF4444' : '#1D9E75')}
              onBlur={e => (e.target.style.borderColor = confirmPassword !== newPassword ? '#EF4444' : '#C8D8D4')} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={changePassword} disabled={pwSaving} style={S.btn('primary')}>
            {pwSaving ? 'Changing…' : 'Change Password'}
          </motion.button>
        </div>
      </motion.div>

      {/* Password Reset */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ ...S.card, background: '#F8FAFC' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A2E2A', marginBottom: '4px' }}>Forgot Your Password?</h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              We'll send a password reset link to <strong>{user.email}</strong>.
            </p>
            <AnimatePresence>{resetMsg && <div style={{ marginTop: '10px' }}><Alert {...resetMsg} /></div>}</AnimatePresence>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={requestReset} disabled={resetSending}
            style={{ ...S.btn('ghost'), whiteSpace: 'nowrap', flexShrink: 0 }}>
            {resetSending ? 'Sending…' : 'Send Reset Link'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
