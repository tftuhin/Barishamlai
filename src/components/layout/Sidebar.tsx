'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getInitials } from '@/lib/utils'
import { useLang, LangToggle } from './LanguageContext'
import { BariShamlaiMark } from '@/components/ui/BariShamlaiLogo'
import type { TranslationKey } from '@/lib/i18n'

const ADMIN_ROLES  = ['ADMIN']
const VIEWER_ROLES = ['ADMIN', 'PRESIDENT', 'SECRETARY']

type NavItem = {
  href: string
  labelKey: TranslationKey
  icon: string
  roles: string[]
  premiumOnly?: boolean
  moduleFlag?: 'featureRent' | 'featureServiceCharge' | 'featureGas'
}

const navItems: NavItem[] = [
  { href: '/dashboard',               labelKey: 'navDashboard',     icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['ADMIN','PRESIDENT','SECRETARY','OWNER','TENANT'] },
  { href: '/dashboard/billing',        labelKey: 'navBilling',       icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', roles: ['ADMIN','PRESIDENT','SECRETARY','OWNER','TENANT'] },
  { href: '/dashboard/rent',           labelKey: 'navRent',          icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['ADMIN','PRESIDENT','SECRETARY','OWNER'], moduleFlag: 'featureRent' },
  { href: '/dashboard/service-charge', labelKey: 'navServiceCharge', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', roles: VIEWER_ROLES, moduleFlag: 'featureServiceCharge' },
  { href: '/dashboard/expenses',       labelKey: 'navExpenses',      icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', roles: VIEWER_ROLES },
  { href: '/dashboard/gas',            labelKey: 'navGasBills',      icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z', roles: VIEWER_ROLES, premiumOnly: true, moduleFlag: 'featureGas' },
  { href: '/dashboard/receipts',       labelKey: 'navReceipts',      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['ADMIN','PRESIDENT','SECRETARY','OWNER','TENANT'], premiumOnly: true },
  { href: '/dashboard/messages',       labelKey: 'navMessages',      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', roles: ['ADMIN','PRESIDENT','SECRETARY','OWNER','TENANT'], premiumOnly: true },
  { href: '/dashboard/units',          labelKey: 'navUnits',         icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', roles: ['ADMIN','PRESIDENT','SECRETARY','OWNER'] },
  { href: '/dashboard/reports',        labelKey: 'navReports',       icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: VIEWER_ROLES },
  { href: '/dashboard/settings',       labelKey: 'navSettings',      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', roles: ADMIN_ROLES },
]

const navContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.1 } },
}
const navItemVariants = {
  hidden: { opacity: 0, x: -14 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
}

type ModuleConfig = {
  featureRent: boolean
  featureServiceCharge: boolean
  featureGas: boolean
}

type Property = { id: string; name: string }

// ── Property Switcher ─────────────────────────────────────────
function PropertySwitcher({ currentBuildingId, currentBuildingName, lang }: {
  currentBuildingId: string | null
  currentBuildingName: string | null
  lang: string
}) {
  const { update }  = useSession()
  const router      = useRouter()
  const [open, setOpen]             = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading]       = useState(false)
  const [switching, setSwitching]   = useState<string | null>(null)

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/properties')
      if (res.ok) {
        const data = await res.json()
        setProperties(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount so we know whether to show the switcher
  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  // Re-fetch when dropdown opens (to pick up newly created properties)
  useEffect(() => {
    if (open) fetchProperties()
  }, [open, fetchProperties])

  async function switchTo(buildingId: string) {
    if (buildingId === currentBuildingId) { setOpen(false); return }
    setSwitching(buildingId)
    await update({ switchBuildingId: buildingId })
    window.location.href = '/dashboard'
  }

  if (properties.length <= 1 && !loading) return null

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left' }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentBuildingName ?? 'Select Property'}
        </span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#0d3d2e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, overflow: 'hidden', zIndex: 100 }}
          >
            {loading ? (
              <div style={{ padding: '10px 12px', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Loading…</div>
            ) : properties.map(p => (
              <button
                key={p.id}
                onClick={() => switchTo(p.id)}
                disabled={switching === p.id}
                style={{ width: '100%', padding: '9px 12px', background: p.id === currentBuildingId ? 'rgba(29,158,117,0.2)' : 'transparent', border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', color: p.id === currentBuildingId ? '#9FE1CB' : 'rgba(255,255,255,0.75)', fontSize: 13, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                {p.id === currentBuildingId && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {switching === p.id ? 'Switching…' : p.name}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Multi-Property Request Modal ──────────────────────────────
function MultiPropertyRequestModal({ onClose }: { onClose: () => void }) {
  const [form, setForm]     = useState({ phone: '', totalProperties: '', totalFlats: '' })
  const [saving, setSaving] = useState(false)
  const [done, setDone]     = useState(false)
  const [error, setError]   = useState('')

  async function submit() {
    if (!form.phone || !form.totalProperties || !form.totalFlats) {
      setError('All fields are required'); return
    }
    setSaving(true); setError('')
    const res = await fetch('/api/properties/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone:           form.phone,
        totalProperties: Number(form.totalProperties),
        totalFlats:      Number(form.totalFlats),
      }),
    })
    if (res.ok) setDone(true)
    else { const d = await res.json(); setError(d.error || 'Failed to submit request') }
    setSaving(false)
  }

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 460, boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
        {done ? (
          <>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: 48, marginBottom: '1rem' }}>✅</div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>Request Submitted!</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
                Your multi-property request has been sent for review. We will contact you within 1–2 business days to complete the setup.
              </p>
              <button onClick={onClose} style={{ padding: '8px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#1D9E75,#085041)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>Add Another Property</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Multi-property management — Premium feature</p>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>

            {/* Pricing info */}
            <div style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pricing</p>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <div>✦ <strong>৳500</strong> one-time setup charge per new property</div>
                <div>✦ Monthly billing as per your flat-count plan</div>
                <div>✦ <strong style={{ color: '#15803d' }}>15% discount</strong> on all additional properties</div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Phone Number *</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputSt} placeholder="+880 1xxx-xxxxxx" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Total Properties Needed *</label>
                <input type="number" value={form.totalProperties} onChange={e => setForm({ ...form, totalProperties: e.target.value })} style={inputSt} placeholder="e.g. 3" min="2" />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Total Flats (all properties) *</label>
                <input type="number" value={form.totalFlats} onChange={e => setForm({ ...form, totalFlats: e.target.value })} style={inputSt} placeholder="e.g. 45" min="1" />
              </div>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Our team will review your request and manually activate multi-property access. You will receive confirmation via email.
            </p>

            {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: '1rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={submit} disabled={saving} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#1D9E75,#085041)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Add Property Button (for approved multi-property admins) ──
function AddPropertyModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const { update } = useSession()
  const [name, setName]     = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  async function create() {
    if (!name.trim()) { setError('Building name is required'); return }
    setSaving(true); setError('')
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      // Switch session to new building
      await update({ switchBuildingId: data.id })
      onCreated(data.id)
    } else {
      const d = await res.json(); setError(d.error || 'Failed to create property')
    }
    setSaving(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 380, boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>New Property</h3>
        <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Building / Property Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && create()}
          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: '1.25rem' }}
          placeholder="e.g. Green Heights, Block B"
          autoFocus
        />
        {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: '1rem' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={create} disabled={saving || !name.trim()} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#1D9E75,#085041)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (saving || !name.trim()) ? 0.6 : 1 }}>
            {saving ? 'Creating…' : 'Create & Switch'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Sidebar ──────────────────────────────────────────────
export function Sidebar({ user, isPremium, moduleConfig, multiPropertyApproved }: {
  user: { name: string; email: string; role: string; buildingId?: string | null; buildingName?: string | null }
  isPremium: boolean
  moduleConfig?: ModuleConfig
  multiPropertyApproved?: boolean
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [signingOut, setSigningOut]   = useState(false)
  const [showRequest, setShowRequest] = useState(false)
  const [showCreate, setShowCreate]   = useState(false)
  const { t, lang } = useLang()

  const cfg = moduleConfig ?? { featureRent: true, featureServiceCharge: true, featureGas: true }

  const filtered = navItems
    .filter(i => i.roles.includes(user.role))
    .filter(i => {
      if (!i.moduleFlag) return true
      return cfg[i.moduleFlag] !== false
    })

  const appName  = lang === 'bn' ? 'বাড়ি সামলাই' : 'Bari Shamlai'
  const isAdmin  = user.role === 'ADMIN'

  function handleAddProperty() {
    if (multiPropertyApproved) setShowCreate(true)
    else setShowRequest(true)
  }

  const logoBlock = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
      <BariShamlaiMark size={64} variant="color" />
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: lang === 'bn' ? "var(--font-hind), var(--font-body)" : 'var(--font-body)',
          fontSize: '1rem', fontWeight: 700, color: '#fff', lineHeight: 1,
          letterSpacing: lang === 'bn' ? '0' : '-0.3px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {appName}
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.buildingName || process.env.NEXT_PUBLIC_BUILDING_NAME || t('navApartmentMgmt')}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-top-bar">
        <motion.button
          onClick={() => setMobileOpen(true)}
          whileTap={{ scale: 0.9 }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px', display: 'flex' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </motion.button>
        {logoBlock}
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sidebar-overlay sidebar-open"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`sidebar-aside ${mobileOpen ? 'sidebar-open' : ''}`} style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '260px',
        background: 'linear-gradient(180deg, #085041 0%, #063a2e 100%)',
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.06)', zIndex: 40,
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1rem 0.875rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {logoBlock}
          <button
            onClick={() => setMobileOpen(false)}
            className="mobile-top-bar"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: '4px', display: 'none', position: 'static', flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Property Switcher (shown only for admin) */}
        {isAdmin && (
          <div style={{ padding: '8px 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <PropertySwitcher
              currentBuildingId={user.buildingId ?? null}
              currentBuildingName={user.buildingName ?? null}
              lang={lang}
            />
          </div>
        )}

        {/* Language toggle */}
        <div style={{ padding: '8px 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <LangToggle forceDark />
        </div>

        {/* Plan badge */}
        {!isPremium && (
          <div style={{ padding: '6px 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 10px', borderRadius: '8px',
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C9.24 2 7 4.24 7 7v2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2V7c0-2.76-2.24-5-5-5z" fill="rgba(245,158,11,0.7)"/>
              </svg>
              <span style={{ fontSize: '11px', color: 'rgba(245,158,11,0.9)', fontWeight: 600 }}>{t('navFreePlan')}</span>
              <Link href="/dashboard/settings" style={{ marginLeft: 'auto', fontSize: '10px', color: '#F59E0B', fontWeight: 700, textDecoration: 'none' }}>
                {t('navUpgrade')}
              </Link>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)', padding: '0.5rem', marginBottom: '4px', textTransform: 'uppercase' }}>
            {t('navSection')}
          </div>
          <motion.div variants={navContainerVariants} initial="hidden" animate="show">
            {filtered.map(item => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              const locked = item.premiumOnly && !isPremium

              return (
                <motion.div key={item.href} variants={navItemVariants}>
                  <Link href={item.href} style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                    <motion.div
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      style={{
                        position: 'relative',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 12px', borderRadius: '8px', marginBottom: '2px',
                        background: active ? 'rgba(29,158,117,0.22)' : 'transparent',
                        border: active ? '1px solid rgba(29,158,117,0.35)' : '1px solid transparent',
                        cursor: 'pointer', overflow: 'hidden',
                        opacity: locked ? 0.6 : 1,
                      }}
                    >
                      {active && (
                        <motion.div
                          layoutId="active-indicator"
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          style={{
                            position: 'absolute', left: 0, top: '20%', bottom: '20%',
                            width: '3px', borderRadius: '0 3px 3px 0',
                            background: 'linear-gradient(180deg, #9FE1CB, #5DCAA5)',
                          }}
                        />
                      )}
                      <motion.svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }} animate={{ opacity: active ? 1 : 0.45 }}>
                        <path d={item.icon} stroke={active ? '#9FE1CB' : 'rgba(255,255,255,0.7)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </motion.svg>
                      <span style={{
                        fontSize: '13.5px', fontWeight: active ? 500 : 400,
                        color: active ? '#E1F5EE' : 'rgba(255,255,255,0.55)', flex: 1,
                        fontFamily: lang === 'bn' ? "var(--font-hind), var(--font-body)" : 'var(--font-body)',
                      }}>
                        {t(item.labelKey)}
                      </span>
                      {locked && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                          <path d="M12 2C9.24 2 7 4.24 7 7v2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2V7c0-2.76-2.24-5-5-5zm0 2c1.65 0 3 1.35 3 3v2H9V7c0-1.65 1.35-3 3-3zm0 9a2 2 0 110 4 2 2 0 010-4z" fill="rgba(245,158,11,0.7)"/>
                        </svg>
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Add Another Property — admin only */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <button
                onClick={handleAddProperty}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px dashed rgba(29,158,117,0.4)', background: 'rgba(29,158,117,0.06)', color: 'rgba(159,225,203,0.8)', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                {t('navAddProperty')}
              </button>
            </motion.div>
          )}
        </nav>

        {/* User footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/dashboard/profile" style={{ textDecoration: 'none' }}>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              whileHover={{ background: 'rgba(255,255,255,0.05)' }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '6px 8px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(29,158,117,0.3)', border: '2px solid rgba(93,202,165,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: '#9FE1CB', flexShrink: 0, overflow: 'hidden' }}
              >
                {getInitials(user.name)}
              </motion.div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>{user.role}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M9 5l7 7-7 7" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </Link>
          <motion.button
            onClick={async () => { setSigningOut(true); await signOut({ callbackUrl: '/login' }) }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={signingOut}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.2s, color 0.2s', fontFamily: 'var(--font-body)' }}
            onHoverStart={e => { (e.target as HTMLButtonElement).style.background = 'rgba(255,80,80,0.12)'; (e.target as HTMLButtonElement).style.color = '#f87171' }}
            onHoverEnd={e => { (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.target as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)' }}
          >
            {signingOut ? (
              <svg className="anim-spin" width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
            {signingOut ? t('navSigningOut') : t('navSignOut')}
          </motion.button>
        </div>
      </aside>

      {/* Multi-property request modal */}
      {showRequest && <MultiPropertyRequestModal onClose={() => setShowRequest(false)} />}

      {/* Create new property modal */}
      {showCreate && (
        <AddPropertyModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { window.location.href = '/dashboard' }}
        />
      )}
    </>
  )
}
