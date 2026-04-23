'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from 'next-auth/react'

type Tier = 'BASIC' | 'STANDARD' | 'PRO' | 'ENTERPRISE'

type BuildingStatus = 'ACTIVE' | 'LOCKED' | 'BLOCKED' | 'BANNED'

type PropertyRequest = {
  id: string
  status: string
  phone: string
  totalProperties: number
  totalFlats: number
  note: string | null
  createdAt: string
  user: { id: string; name: string; email: string }
  building: { id: string; name: string; plan: string; tier: string | null }
}

type Building = {
  id: string
  name: string
  plan: 'FREE' | 'PREMIUM'
  tier: Tier | null
  premiumUntil: string | null
  effectivePlan: 'FREE' | 'PREMIUM'
  status: BuildingStatus
  statusNote: string | null
  unitCount: number
  userCount: number
  admin: { id: string; name: string; email: string; createdAt: string } | null
  createdAt: string
}

const STATUS_META: Record<BuildingStatus, { label: string; color: string; bg: string; border: string }> = {
  ACTIVE:  { label: 'Active',   color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)' },
  LOCKED:  { label: 'Locked',   color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)' },
  BLOCKED: { label: 'Blocked',  color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.3)' },
  BANNED:  { label: 'Banned',   color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
}

const TIERS: { key: Tier; name: string; price: number; units: string; unitLimit: number; color: string; desc: string }[] = [
  { key: 'BASIC',      name: 'Basic',      price: 200, units: 'Up to 10 units', unitLimit: 10,       color: '#1D9E75', desc: '৳200/month' },
  { key: 'STANDARD',   name: 'Standard',   price: 300, units: 'Up to 20 units', unitLimit: 20,       color: '#085041', desc: '৳300/month' },
  { key: 'PRO',        name: 'Pro',        price: 400, units: 'Up to 30 units', unitLimit: 30,       color: '#10B981', desc: '৳400/month' },
  { key: 'ENTERPRISE', name: 'Enterprise', price: 500, units: 'Unlimited units', unitLimit: Infinity, color: '#F59E0B', desc: '৳500/month' },
]

const MONTH_OPTIONS = [1, 2, 3, 6, 12, 24]

function tierLabel(tier: Tier | null) {
  return TIERS.find(t => t.key === tier)?.name ?? '—'
}
function tierColor(tier: Tier | null) {
  return TIERS.find(t => t.key === tier)?.color ?? '#94a3b8'
}

function PlanBadge({ plan, tier, premiumUntil }: { plan: 'FREE' | 'PREMIUM'; tier: Tier | null; premiumUntil: string | null }) {
  const expired = plan === 'PREMIUM' && premiumUntil && new Date(premiumUntil) < new Date()
  if (expired) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
      Expired
    </span>
  )
  if (plan === 'PREMIUM' && tier) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${tierColor(tier)}22`, color: tierColor(tier), border: `1px solid ${tierColor(tier)}44` }}>
      ⭐ {tierLabel(tier)}
    </span>
  )
  if (plan === 'PREMIUM') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
      ⭐ Premium
    </span>
  )
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
      Free
    </span>
  )
}

function daysLeft(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DeveloperPage() {
  const [tab, setTab] = useState<'buildings' | 'requests'>('buildings')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'FREE' | 'PREMIUM' | 'EXPIRED'>('ALL')

  const [propRequests, setPropRequests]         = useState<PropertyRequest[]>([])
  const [requestsLoading, setRequestsLoading]   = useState(false)
  const [requestAction, setRequestAction]       = useState<PropertyRequest | null>(null)
  const [requestStatus, setRequestStatus]       = useState<'APPROVED' | 'REJECTED'>('APPROVED')
  const [requestNote, setRequestNote]           = useState('')
  const [requestSaving, setRequestSaving]       = useState(false)
  const [requestError, setRequestError]         = useState('')

  const [modal, setModal] = useState<{ building: Building; action: 'grant' | 'revoke' } | null>(null)
  const [selectedTier, setSelectedTier] = useState<Tier>('STANDARD')
  const [months, setMonths] = useState(1)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [statusModal, setStatusModal] = useState<Building | null>(null)
  const [statusAction, setStatusAction] = useState<BuildingStatus>('ACTIVE')
  const [statusNote, setStatusNote] = useState('')
  const [statusSaving, setStatusSaving] = useState(false)
  const [statusError, setStatusError] = useState('')

  const [editModal, setEditModal] = useState<Building | null>(null)
  const [editForm, setEditForm] = useState({ buildingName: '', adminName: '', adminEmail: '', adminPhone: '', adminPassword: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const [deleteModal, setDeleteModal] = useState<Building | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteSaving, setDeleteSaving] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => { fetchBuildings() }, [])
  useEffect(() => { if (tab === 'requests') fetchPropertyRequests() }, [tab])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchPropertyRequests() {
    setRequestsLoading(true)
    const res = await fetch('/api/developer/property-requests')
    if (res.ok) setPropRequests(await res.json())
    setRequestsLoading(false)
  }

  async function handleRequestAction() {
    if (!requestAction) return
    setRequestSaving(true); setRequestError('')
    const res = await fetch(`/api/developer/property-requests/${requestAction.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: requestStatus, note: requestNote.trim() || null }),
    })
    if (res.ok) {
      const updated = await res.json()
      setPropRequests(prev => prev.map(r => r.id === updated.id ? { ...r, status: updated.status, note: updated.note } : r))
      setRequestAction(null)
    } else {
      const d = await res.json(); setRequestError(d.error || 'Failed')
    }
    setRequestSaving(false)
  }

  async function fetchBuildings() {
    setLoading(true)
    const res = await fetch('/api/developer/buildings')
    if (res.ok) setBuildings(await res.json())
    setLoading(false)
  }

  async function handleStatusUpdate() {
    if (!statusModal) return
    setStatusSaving(true); setStatusError('')
    const res = await fetch(`/api/developer/buildings/${statusModal.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: statusAction, statusNote: statusNote.trim() || null }),
    })
    if (res.ok) {
      const updated = await res.json()
      setBuildings(prev => prev.map(b => b.id === updated.id
        ? { ...b, status: updated.status, statusNote: updated.statusNote }
        : b))
      setStatusModal(null)
    } else {
      const d = await res.json()
      setStatusError(d.error || 'Failed')
    }
    setStatusSaving(false)
  }

  function openEditModal(b: Building) {
    setEditForm({
      buildingName:  b.name,
      adminName:     b.admin?.name  ?? '',
      adminEmail:    b.admin?.email ?? '',
      adminPhone:    '',
      adminPassword: '',
    })
    setEditError('')
    setEditModal(b)
  }

  async function handleEdit() {
    if (!editModal) return
    setEditSaving(true); setEditError('')
    const res = await fetch(`/api/developer/buildings/${editModal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      const updated = await res.json()
      setBuildings(prev => prev.map(b => b.id === updated.id ? updated : b))
      setEditModal(null)
    } else {
      const d = await res.json()
      setEditError(d.error || 'Failed to save changes')
    }
    setEditSaving(false)
  }

  async function handleDelete() {
    if (!deleteModal) return
    if (deleteConfirm !== deleteModal.name) {
      setDeleteError('Property name does not match'); return
    }
    setDeleteSaving(true); setDeleteError('')
    const res = await fetch(`/api/developer/buildings/${deleteModal.id}`, { method: 'DELETE' })
    if (res.ok) {
      setBuildings(prev => prev.filter(b => b.id !== deleteModal.id))
      setDeleteModal(null)
      setDeleteConfirm('')
    } else {
      const d = await res.json()
      setDeleteError(d.error || 'Failed to delete property')
    }
    setDeleteSaving(false)
  }

  async function handlePlanUpdate() {
    if (!modal) return
    setSaving(true); setSaveError('')
    const isRevoke = modal.action === 'revoke'
    const res = await fetch(`/api/developer/buildings/${modal.building.id}/plan`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isRevoke
        ? { plan: 'FREE', months: 0 }
        : { plan: 'PREMIUM', tier: selectedTier, months }),
    })
    if (res.ok) {
      const updated = await res.json()
      setBuildings(prev => prev.map(b => b.id === updated.id
        ? { ...b, plan: updated.plan, tier: updated.tier ?? null, premiumUntil: updated.premiumUntil, effectivePlan: updated.plan }
        : b))
      setModal(null)
    } else {
      const d = await res.json()
      setSaveError(d.error || 'Failed')
    }
    setSaving(false)
  }

  const filtered = buildings.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.admin?.name.toLowerCase().includes(search.toLowerCase()) ||
      b.admin?.email.toLowerCase().includes(search.toLowerCase())
    const expired = b.plan === 'PREMIUM' && b.premiumUntil && new Date(b.premiumUntil) < new Date()
    const matchFilter = filter === 'ALL' ? true : filter === 'EXPIRED' ? expired :
      filter === 'PREMIUM' ? (b.plan === 'PREMIUM' && !expired) : b.plan === 'FREE'
    return matchSearch && matchFilter
  })

  const stats = {
    total: buildings.length,
    premium: buildings.filter(b => b.plan === 'PREMIUM' && !(b.premiumUntil && new Date(b.premiumUntil) < new Date())).length,
    free: buildings.filter(b => b.plan === 'FREE').length,
    expired: buildings.filter(b => b.plan === 'PREMIUM' && b.premiumUntil && new Date(b.premiumUntil) < new Date()).length,
    totalUnits: buildings.reduce((s, b) => s + b.unitCount, 0),
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>বাড়ি সামলাই — Developer Dashboard</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>Manage all registered properties, plans, and multi-property requests</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Sign out
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 0 }}>
        {[
          { key: 'buildings', label: `Properties (${buildings.length})` },
          { key: 'requests',  label: `Property Requests${propRequests.filter(r => r.status === 'PENDING').length > 0 ? ` (${propRequests.filter(r => r.status === 'PENDING').length})` : ''}` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'buildings' | 'requests')}
            style={{
              padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: 'transparent',
              color: tab === t.key ? '#a5b4fc' : 'rgba(255,255,255,0.35)',
              borderBottom: `2px solid ${tab === t.key ? '#a5b4fc' : 'transparent'}`,
              transition: 'all 0.15s',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Property Requests Tab */}
      {tab === 'requests' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {requestsLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
          ) : propRequests.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No multi-property requests yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {propRequests.map(r => {
                const statusColor = r.status === 'APPROVED' ? '#34d399' : r.status === 'REJECTED' ? '#f87171' : '#fbbf24'
                return (
                  <div key={r.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{r.user.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{r.user.email}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{r.phone}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{r.building.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Requested {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{r.totalProperties} properties</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{r.totalFlats} total flats</div>
                    </div>
                    <div>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${statusColor}1a`, color: statusColor, border: `1px solid ${statusColor}44` }}>
                        {r.status}
                      </span>
                      {r.note && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{r.note}</div>}
                    </div>
                    {r.status === 'PENDING' && (
                      <button
                        onClick={() => { setRequestAction(r); setRequestStatus('APPROVED'); setRequestNote(''); setRequestError('') }}
                        style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Review
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Request Review Modal */}
      <AnimatePresence>
        {requestAction && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
              onClick={() => setRequestAction(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }} transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              style={{ position: 'relative', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 480, padding: '2rem', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px' }}>Review Multi-Property Request</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 1.5rem' }}>{requestAction.user.name} · {requestAction.building.name}</p>

              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', marginBottom: '1.5rem', fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,0.6)' }}>
                <div><strong style={{ color: '#fff' }}>Phone:</strong> {requestAction.phone}</div>
                <div><strong style={{ color: '#fff' }}>Total Properties:</strong> {requestAction.totalProperties}</div>
                <div><strong style={{ color: '#fff' }}>Total Flats:</strong> {requestAction.totalFlats}</div>
                <div><strong style={{ color: '#fff' }}>Pricing:</strong> ৳500 one-time + monthly plan × {requestAction.totalProperties - 1} extra propert{requestAction.totalProperties - 1 !== 1 ? 'ies' : 'y'} at 15% off</div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
                {(['APPROVED', 'REJECTED'] as const).map(s => (
                  <button key={s} onClick={() => setRequestStatus(s)} style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${requestStatus === s ? (s === 'APPROVED' ? '#34d399' : '#f87171') : 'rgba(255,255,255,0.1)'}`,
                    background: requestStatus === s ? (s === 'APPROVED' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)') : 'rgba(255,255,255,0.03)',
                    color: requestStatus === s ? (s === 'APPROVED' ? '#34d399' : '#f87171') : 'rgba(255,255,255,0.4)',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>
                    {s === 'APPROVED' ? '✓ Approve' : '✗ Reject'}
                  </button>
                ))}
              </div>

              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '0.5rem' }}>Note (optional)</label>
              <textarea value={requestNote} onChange={e => setRequestNote(e.target.value)} rows={2} placeholder="E.g. Payment confirmed, WhatsApp: 01xxx…"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'var(--font-body)', marginBottom: '1.25rem' }} />

              {requestError && <p style={{ color: '#f87171', fontSize: 13, marginBottom: '1rem' }}>{requestError}</p>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setRequestAction(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleRequestAction} disabled={requestSaving}
                  style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: requestStatus === 'APPROVED' ? '#059669' : '#dc2626', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: requestSaving ? 0.7 : 1 }}>
                  {requestSaving ? 'Saving…' : requestStatus === 'APPROVED' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {tab === 'buildings' && (<>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Properties', value: stats.total,      color: '#fff' },
          { label: 'Premium Active',   value: stats.premium,    color: '#a5b4fc' },
          { label: 'Free Tier',        value: stats.free,       color: '#94a3b8' },
          { label: 'Expired Premium',  value: stats.expired,    color: '#f87171' },
          { label: 'Total Units',      value: stats.totalUnits, color: '#34d399' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.1rem 1.25rem' }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '0 0 8px' }}>{s.label}</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ display: 'flex', gap: 12, marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 360 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or admin…"
            style={{ width: '100%', padding: '9px 12px 9px 38px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['ALL','PREMIUM','FREE','EXPIRED'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 16px', borderRadius: 20,
              border: `1px solid ${filter === f ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
              background: filter === f ? 'rgba(99,102,241,0.2)' : 'transparent',
              color: filter === f ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {f === 'ALL' ? `All (${stats.total})` : f === 'PREMIUM' ? `Premium (${stats.premium})` : f === 'FREE' ? `Free (${stats.free})` : `Expired (${stats.expired})`}
            </button>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={fetchBuildings}
          style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Refresh
        </motion.button>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.8fr 110px 70px 120px 160px 120px 60px', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          {['Property','Admin','Units','Users','Plan','Premium Until','Status','Actions'].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '0 8px' }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Loading properties…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No properties found</div>
        ) : (
          <AnimatePresence>
            {filtered.map((b, i) => {
              const expired = b.plan === 'PREMIUM' && b.premiumUntil && new Date(b.premiumUntil) < new Date()
              const days = b.premiumUntil && !expired ? daysLeft(b.premiumUntil) : null
              const isPremiumActive = b.plan === 'PREMIUM' && !expired
              const tierInfo = TIERS.find(t => t.key === b.tier)
              const unitLimit = isPremiumActive && tierInfo ? (tierInfo.unitLimit === Infinity ? '∞' : tierInfo.unitLimit) : 5

              return (
                <motion.div key={b.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1.8fr 110px 70px 120px 160px 120px 60px', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', transition: 'background 0.15s' }}>

                  {/* Property */}
                  <div style={{ padding: '0 8px' }}>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: 14, marginBottom: 2 }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Since {formatDate(b.createdAt)}</div>
                  </div>
                  {/* Admin */}
                  <div style={{ padding: '0 8px' }}>
                    {b.admin ? (
                      <>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{b.admin.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>{b.admin.email}</div>
                      </>
                    ) : <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>No admin</span>}
                  </div>
                  {/* Units */}
                  <div style={{ padding: '0 8px' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{b.unitCount}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}> / {unitLimit}</span>
                  </div>
                  {/* Users */}
                  <div style={{ padding: '0 8px', fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{b.userCount}</div>
                  {/* Plan */}
                  <div style={{ padding: '0 8px' }}>
                    <PlanBadge plan={b.plan} tier={b.tier} premiumUntil={b.premiumUntil} />
                  </div>
                  {/* Premium until */}
                  <div style={{ padding: '0 8px' }}>
                    {isPremiumActive && b.premiumUntil ? (
                      <div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{formatDate(b.premiumUntil)}</div>
                        <div style={{ fontSize: 11, color: days && days <= 14 ? '#fbbf24' : '#34d399', marginTop: 1 }}>
                          {days} day{days !== 1 ? 's' : ''} left
                        </div>
                      </div>
                    ) : expired && b.premiumUntil ? (
                      <div style={{ fontSize: 11, color: '#f87171' }}>Expired {formatDate(b.premiumUntil)}</div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>—</span>
                    )}
                  </div>
                  {/* Status */}
                  <div style={{ padding: '0 8px' }}>
                    {(() => {
                      const sm = STATUS_META[b.status]
                      return (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: sm.bg, color: sm.color, border: `1px solid ${sm.border}` }}>
                          {b.status === 'ACTIVE' ? '●' : b.status === 'LOCKED' ? '🔒' : b.status === 'BLOCKED' ? '🚫' : '⛔'}
                          {sm.label}
                        </span>
                      )
                    })()}
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '0 8px', position: 'relative' }} ref={b.id === openMenu ? menuRef : undefined}>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === b.id ? null : b.id) }}
                      style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ⋮
                    </motion.button>
                    <AnimatePresence>
                      {openMenu === b.id && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }}
                          style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: '#0d3d2e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, overflow: 'hidden', minWidth: 140, zIndex: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}>
                          <button onClick={() => { setSelectedTier(b.tier ?? 'STANDARD'); setMonths(1); setSaveError(''); setModal({ building: b, action: 'grant' }); setOpenMenu(null) }}
                            style={{ width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#a5b4fc', fontSize: 12, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.15)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                            {isPremiumActive ? '+ Extend' : 'Grant'}
                          </button>
                          {isPremiumActive && (
                            <button onClick={() => { setSaveError(''); setModal({ building: b, action: 'revoke' }); setOpenMenu(null) }}
                              style={{ width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#f87171', fontSize: 12, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.15)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                              Revoke
                            </button>
                          )}
                          <button onClick={() => { setStatusAction(b.status); setStatusNote(b.statusNote ?? ''); setStatusError(''); setStatusModal(b); setOpenMenu(null) }}
                            style={{ width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                            Status
                          </button>
                          <button onClick={() => { openEditModal(b); setOpenMenu(null) }}
                            style={{ width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#34d399', fontSize: 12, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(52,211,153,0.15)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                            Edit
                          </button>
                          <button onClick={() => { setDeleteConfirm(''); setDeleteError(''); setDeleteModal(b); setOpenMenu(null) }}
                            style={{ width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#f87171', fontSize: 12, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.15)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </motion.div>

      </>)}

      {/* Status Modal */}
      <AnimatePresence>
        {statusModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={e => { if (e.target === e.currentTarget) setStatusModal(null) }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
              onClick={() => setStatusModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              style={{ position: 'relative', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 480, padding: '2rem', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  🏢
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Change Property Status</h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '2px 0 0' }}>{statusModal.name}</p>
                </div>
              </div>

              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>Select Status</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: '1.5rem' }}>
                {(['ACTIVE', 'LOCKED', 'BLOCKED', 'BANNED'] as BuildingStatus[]).map(s => {
                  const sm = STATUS_META[s]
                  const icons: Record<BuildingStatus, string> = { ACTIVE: '✓ Active', LOCKED: '🔒 Lock', BLOCKED: '🚫 Block', BANNED: '⛔ Ban' }
                  const descs: Record<BuildingStatus, string> = {
                    ACTIVE:  'Normal operation',
                    LOCKED:  'Read-only warning banner',
                    BLOCKED: 'Access denied — pending review',
                    BANNED:  'Permanent account ban',
                  }
                  return (
                    <motion.button key={s} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setStatusAction(s)}
                      style={{
                        padding: '14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                        border: `2px solid ${statusAction === s ? sm.border : 'rgba(255,255,255,0.08)'}`,
                        background: statusAction === s ? sm.bg : 'rgba(255,255,255,0.03)',
                        transition: 'all 0.15s',
                      }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: statusAction === s ? sm.color : '#fff', marginBottom: 3 }}>{icons[s]}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>{descs[s]}</div>
                    </motion.button>
                  )
                })}
              </div>

              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>Note <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(shown to admin)</span></p>
              <textarea
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                placeholder="Optional reason for this status change…"
                rows={3}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'var(--font-body)', marginBottom: '1.5rem' }}
              />

              {statusError && <p style={{ color: '#f87171', fontSize: 13, marginBottom: '1rem' }}>{statusError}</p>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setStatusModal(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleStatusUpdate} disabled={statusSaving}
                  style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: STATUS_META[statusAction].color, color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: statusSaving ? 0.7 : 1 }}>
                  {statusSaving ? 'Saving…' : `Set ${STATUS_META[statusAction].label}`}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grant / Revoke Modal */}
      <AnimatePresence>
        {modal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={e => { if (e.target === e.currentTarget) setModal(null) }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
              onClick={() => setModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              style={{ position: 'relative', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: modal.action === 'grant' ? 560 : 460, padding: '2rem', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>

              {modal.action === 'revoke' ? (
                /* ── Revoke ── */
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Revoke Premium Access</h3>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '2px 0 0' }}>{modal.building.name}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    This will immediately downgrade <strong style={{ color: '#fff' }}>{modal.building.name}</strong> to the Free plan (5 units). Units over the limit will be read-only.
                  </p>
                  {saveError && <p style={{ color: '#f87171', fontSize: 13, marginBottom: '1rem' }}>{saveError}</p>}
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button onClick={() => setModal(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handlePlanUpdate} disabled={saving}
                      style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                      {saving ? 'Revoking…' : 'Revoke Premium'}
                    </motion.button>
                  </div>
                </>
              ) : (
                /* ── Grant / Extend ── */
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                        {modal.building.plan === 'PREMIUM' ? 'Extend / Change Plan' : 'Grant Premium Access'}
                      </h3>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '2px 0 0' }}>{modal.building.name}</p>
                    </div>
                  </div>

                  {/* Current status */}
                  {modal.building.plan === 'PREMIUM' && modal.building.premiumUntil && new Date(modal.building.premiumUntil) > new Date() && (
                    <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, marginBottom: '1.5rem', fontSize: 13, color: '#a5b4fc' }}>
                      Currently on <strong>{tierLabel(modal.building.tier)}</strong> · Expires <strong>{formatDate(modal.building.premiumUntil)}</strong>
                      {' · '}Duration adds on top.
                    </div>
                  )}

                  {/* Tier selection */}
                  <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>Select Plan Tier</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: '1.5rem' }}>
                    {TIERS.map(t => (
                      <motion.button key={t.key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedTier(t.key)}
                        style={{
                          padding: '14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                          border: `2px solid ${selectedTier === t.key ? t.color + '80' : 'rgba(255,255,255,0.08)'}`,
                          background: selectedTier === t.key ? `${t.color}15` : 'rgba(255,255,255,0.03)',
                          transition: 'all 0.15s',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: selectedTier === t.key ? t.color : '#fff' }}>{t.name}</span>
                          {selectedTier === t.key && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={t.color} opacity="0.2"/><path d="M8 12l3 3 5-5" stroke={t.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: t.color, fontWeight: 600 }}>{t.desc}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{t.units}</div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Duration */}
                  <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>Select Duration</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8, marginBottom: '1.5rem' }}>
                    {MONTH_OPTIONS.map(m => (
                      <motion.button key={m} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => setMonths(m)}
                        style={{
                          padding: '10px 6px', borderRadius: 10, textAlign: 'center',
                          border: `2px solid ${months === m ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`,
                          background: months === m ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                          color: months === m ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: months === m ? '#e0e7ff' : '#fff' }}>{m}</div>
                        <div style={{ fontSize: 10, marginTop: 2 }}>{m === 1 ? 'mo' : 'mos'}</div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Summary */}
                  {(() => {
                    const tier = TIERS.find(t => t.key === selectedTier)!
                    const total = tier.price * months
                    return (
                      <div style={{ padding: '12px 16px', background: `${tier.color}0d`, border: `1px solid ${tier.color}30`, borderRadius: 10, marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                          {tier.name} × {months} month{months !== 1 ? 's' : ''} · {tier.units}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: tier.color }}>৳{total.toLocaleString()}</div>
                      </div>
                    )
                  })()}

                  {saveError && <p style={{ color: '#f87171', fontSize: 13, marginBottom: '1rem' }}>{saveError}</p>}
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button onClick={() => setModal(null)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handlePlanUpdate} disabled={saving}
                      style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${TIERS.find(t=>t.key===selectedTier)?.color}, #6366f1)`, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {saving && <svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
                      {saving ? 'Saving…' : `Grant ${tierLabel(selectedTier)} · ${months}mo`}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Property Modal */}
      <AnimatePresence>
        {editModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
              onClick={() => setEditModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }} transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              style={{ position: 'relative', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 500, padding: '2rem', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.75rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Edit Property</h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '2px 0 0' }}>{editModal.name}</p>
                </div>
              </div>

              {/* Building details */}
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.75rem' }}>Property</p>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5 }}>Building Name</label>
                <input
                  value={editForm.buildingName}
                  onChange={e => setEditForm(f => ({ ...f, buildingName: e.target.value }))}
                  style={{ width: '100%', padding: '9px 13px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)' }}
                />
              </div>

              {/* Admin details */}
              {(<>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.75rem' }}>
                  Admin User{!editModal.admin && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'rgba(255,255,255,0.2)' }}> — no admin yet, fields will be ignored</span>}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5 }}>Name</label>
                    <input
                      value={editForm.adminName}
                      onChange={e => setEditForm(f => ({ ...f, adminName: e.target.value }))}
                      style={{ width: '100%', padding: '9px 13px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5 }}>Email</label>
                    <input
                      type="email"
                      value={editForm.adminEmail}
                      onChange={e => setEditForm(f => ({ ...f, adminEmail: e.target.value }))}
                      style={{ width: '100%', padding: '9px 13px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5 }}>Phone</label>
                    <input
                      value={editForm.adminPhone}
                      onChange={e => setEditForm(f => ({ ...f, adminPhone: e.target.value }))}
                      placeholder="Leave blank to keep current"
                      style={{ width: '100%', padding: '9px 13px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5 }}>New Password <span style={{ opacity: 0.5 }}>(optional)</span></label>
                    <input
                      type="password"
                      value={editForm.adminPassword}
                      onChange={e => setEditForm(f => ({ ...f, adminPassword: e.target.value }))}
                      placeholder="Leave blank to keep"
                      style={{ width: '100%', padding: '9px 13px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)' }}
                    />
                  </div>
                </div>
              </>)}

              {editError && <p style={{ color: '#f87171', fontSize: 13, marginBottom: '1rem' }}>{editError}</p>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setEditModal(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleEdit} disabled={editSaving}
                  style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#34d399,#059669)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: editSaving ? 0.7 : 1 }}>
                  {editSaving ? 'Saving…' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Property Modal */}
      <AnimatePresence>
        {deleteModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
              onClick={() => setDeleteModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }} transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              style={{ position: 'relative', background: '#1e293b', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 20, width: '100%', maxWidth: 460, padding: '2rem', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Delete Property</h3>
                  <p style={{ color: '#f87171', fontSize: 13, margin: '2px 0 0' }}>This action cannot be undone</p>
                </div>
              </div>

              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, marginBottom: '1.5rem', fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                Permanently deletes <strong style={{ color: '#fff' }}>{deleteModal.name}</strong> and all its data — units, bills, expenses, messages, receipts, and all member accounts. This cannot be recovered.
              </div>

              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>
                Type <strong style={{ color: '#fff' }}>{deleteModal.name}</strong> to confirm
              </label>
              <input
                value={deleteConfirm}
                onChange={e => { setDeleteConfirm(e.target.value); setDeleteError('') }}
                placeholder={deleteModal.name}
                style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: `1px solid ${deleteConfirm === deleteModal.name ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`, background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)', marginBottom: '1.5rem' }}
              />

              {deleteError && <p style={{ color: '#f87171', fontSize: 13, marginBottom: '1rem' }}>{deleteError}</p>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setDeleteModal(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                <motion.button whileHover={{ scale: deleteConfirm === deleteModal.name ? 1.02 : 1 }} whileTap={{ scale: 0.97 }}
                  onClick={handleDelete} disabled={deleteSaving || deleteConfirm !== deleteModal.name}
                  style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 700, cursor: deleteConfirm === deleteModal.name ? 'pointer' : 'not-allowed', opacity: (deleteSaving || deleteConfirm !== deleteModal.name) ? 0.5 : 1 }}>
                  {deleteSaving ? 'Deleting…' : 'Delete Property'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
