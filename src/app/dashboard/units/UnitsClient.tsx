'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, PageHeader, Button, Modal, FormField, inputStyle, selectStyle, EmptyState } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

const FREE_UNIT_LIMIT = 5

type Unit = {
  id: string; number: string; floor: number; area: number | null; monthlyRent: number
  status: 'OCCUPIED' | 'VACANT'; isOwnerOccupied: boolean
  ownerContactName: string | null; ownerPhone: string | null
  tenantContactName: string | null; tenantPhone: string | null; tenantNid: string | null
  ownerId: string | null; tenantId: string | null
  owner: { id: string; name: string } | null
  tenant: { id: string; name: string } | null
}

type User = { id: string; name: string; role: string }

const EMPTY_FORM = { number: '', floor: '1', area: '', monthlyRent: '', ownerId: '', tenantId: '' }

const EMPTY_EDIT = {
  status: 'OCCUPIED' as 'OCCUPIED' | 'VACANT',
  isOwnerOccupied: false,
  monthlyRent: '', floor: '', area: '',
  ownerId: '', tenantId: '',
  ownerContactName: '', ownerPhone: '',
  tenantContactName: '', tenantPhone: '', tenantNid: '',
}

function StatusPill({ status }: { status: 'OCCUPIED' | 'VACANT' }) {
  const occupied = status === 'OCCUPIED'
  return (
    <span style={{
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: '3px 9px', borderRadius: '20px',
      background: occupied ? '#DCFCE7' : '#F1F5F9',
      color: occupied ? '#14532D' : '#475569',
      border: `1px solid ${occupied ? '#BBF7D0' : '#C8D8D4'}`,
    }}>
      {occupied ? 'Occupied' : 'Vacant'}
    </span>
  )
}

export function UnitsClient({
  units: initialUnits, users, role, currentUserId, isPremium, premiumUntil,
}: {
  units: Unit[]; users: User[]; role: string; currentUserId: string; isPremium: boolean; premiumUntil: string | null
}) {
  const router = useRouter()
  const [units, setUnits] = useState(initialUnits)
  const [showUpgradeWall, setShowUpgradeWall] = useState(false)

  // Add modal
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState(EMPTY_FORM)
  const [addSaving, setAddSaving] = useState(false)
  const [addError, setAddError] = useState('')

  // Edit modal
  const [editUnit, setEditUnit] = useState<Unit | null>(null)
  const [editForm, setEditForm] = useState(EMPTY_EDIT)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const owners   = users.filter(u => u.role === 'OWNER')
  const tenants  = users.filter(u => u.role === 'TENANT')

  const canEdit = (unit: Unit) =>
    role === 'ADMIN' || (role === 'OWNER' && unit.ownerId === currentUserId)

  function openEdit(unit: Unit) {
    setEditUnit(unit)
    setEditForm({
      status: unit.status,
      isOwnerOccupied: unit.isOwnerOccupied,
      monthlyRent: String(unit.monthlyRent),
      floor: String(unit.floor),
      area: unit.area ? String(unit.area) : '',
      ownerId: unit.ownerId ?? '',
      tenantId: unit.tenantId ?? '',
      ownerContactName: unit.ownerContactName ?? '',
      ownerPhone: unit.ownerPhone ?? '',
      tenantContactName: unit.tenantContactName ?? '',
      tenantPhone: unit.tenantPhone ?? '',
      tenantNid: unit.tenantNid ?? '',
    })
    setEditError('')
  }

  async function submitAdd() {
    setAddError(''); setAddSaving(true)
    const res = await fetch('/api/units', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...addForm, floor: Number(addForm.floor),
        area: addForm.area ? Number(addForm.area) : null,
        monthlyRent: Number(addForm.monthlyRent),
        ownerId: addForm.ownerId || null, tenantId: addForm.tenantId || null,
      }),
    })
    if (res.ok) { setShowAdd(false); setAddForm(EMPTY_FORM); router.refresh() }
    else {
      const d = await res.json()
      if (d.error === 'UNIT_LIMIT_REACHED') { setShowAdd(false); setShowUpgradeWall(true) }
      else setAddError(d.error || 'Failed')
    }
    setAddSaving(false)
  }

  async function submitEdit() {
    if (!editUnit) return
    setEditError(''); setEditSaving(true)

    const payload: Record<string, unknown> = {
      ownerContactName:  editForm.ownerContactName  || null,
      ownerPhone:        editForm.ownerPhone         || null,
      tenantContactName: editForm.tenantContactName  || null,
      tenantPhone:       editForm.tenantPhone        || null,
      tenantNid:         editForm.tenantNid          || null,
    }
    if (role === 'ADMIN') {
      payload.status          = editForm.status
      payload.isOwnerOccupied = editForm.isOwnerOccupied
      payload.monthlyRent     = Number(editForm.monthlyRent)
      payload.floor           = Number(editForm.floor)
      payload.area            = editForm.area ? Number(editForm.area) : null
      payload.ownerId         = editForm.ownerId  || null
      payload.tenantId        = editForm.isOwnerOccupied ? null : (editForm.tenantId || null)
    }

    const res = await fetch(`/api/units/${editUnit.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const updated: Unit = await res.json()
      setUnits(prev => prev.map(u => u.id === updated.id ? updated : u))
      setEditUnit(null)
      router.refresh()
    } else {
      const d = await res.json(); setEditError(d.error || 'Failed to save')
    }
    setEditSaving(false)
  }

  async function toggleStatus(unit: Unit) {
    const next = unit.status === 'OCCUPIED' ? 'VACANT' : 'OCCUPIED'
    setUnits(prev => prev.map(u => u.id === unit.id ? { ...u, status: next } : u))
    await fetch(`/api/units/${unit.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    router.refresh()
  }

  const visibleUnits = role === 'OWNER'
    ? units.filter(u => u.ownerId === currentUserId)
    : units

  // For add modal: only show unassigned users
  const unassignedOwners  = owners.filter(u => !units.some(un => un.ownerId  === u.id))
  const unassignedTenants = tenants.filter(u => !units.some(un => un.tenantId === u.id))

  const inputSection = (label: string) => (
    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px', marginTop: '18px', paddingBottom: '6px', borderBottom: '1px solid var(--border)' }}>
      {label}
    </div>
  )

  const atLimit = !isPremium && units.length >= FREE_UNIT_LIMIT
  const nearLimit = !isPremium && units.length === FREE_UNIT_LIMIT - 1

  return (
    <div style={{ padding: '2rem 2.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      <PageHeader
        title="Units"
        subtitle={`${visibleUnits.length} unit${visibleUnits.length !== 1 ? 's' : ''}`}
        action={role === 'ADMIN' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Plan badge */}
            {isPremium ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: 'linear-gradient(135deg,rgba(29,158,117,0.12),rgba(29,158,117,0.08))', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.25)' }}>
                ⭐ Premium
                {premiumUntil && <span style={{ opacity: 0.65 }}>· until {new Date(premiumUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: 'var(--surface-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {units.length}/{FREE_UNIT_LIMIT} units · Free
              </span>
            )}
            <Button onClick={() => atLimit ? setShowUpgradeWall(true) : setShowAdd(true)}>+ Add Unit</Button>
          </div>
        ) : undefined}
      />

      {/* Free-tier warning banner */}
      <AnimatePresence>
        {(atLimit || nearLimit) && !isPremium && role === 'ADMIN' && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            style={{ background: atLimit ? 'linear-gradient(135deg,#fef3c7,#fef9c3)' : 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: `1px solid ${atLimit ? '#fde68a' : '#bfdbfe'}`, borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>{atLimit ? '🔒' : '⚠️'}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: atLimit ? '#92400e' : '#1d4ed8' }}>
                  {atLimit ? 'Unit limit reached — Free plan allows 5 units' : `1 unit slot remaining on Free plan`}
                </div>
                <div style={{ fontSize: '12px', color: atLimit ? '#b45309' : '#3b82f6', marginTop: '2px' }}>
                  {atLimit ? 'Contact the developer to upgrade to Premium for unlimited units.' : 'Upgrade to Premium before you need more units.'}
                </div>
              </div>
            </div>
            {atLimit && (
              <button onClick={() => setShowUpgradeWall(true)} style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', background: '#d97706', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Learn More
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {visibleUnits.length === 0 ? (
        <EmptyState title="No units found" description={role === 'OWNER' ? 'No unit is assigned to your account.' : 'Add the first unit to get started.'} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1rem' }}>
          {visibleUnits.map(unit => (
            <Card key={unit.id} style={{ padding: '1.25rem' }}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand)', margin: 0 }}>{unit.number}</h3>
                  <StatusPill status={unit.status} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {/* Status toggle — admin only */}
                  {role === 'ADMIN' && (
                    <button
                      onClick={() => toggleStatus(unit)}
                      title={`Mark as ${unit.status === 'OCCUPIED' ? 'Vacant' : 'Occupied'}`}
                      style={{
                        background: 'none', border: '1px solid var(--border)', borderRadius: '6px',
                        padding: '4px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: 500,
                        color: 'var(--text-muted)', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
                    >
                      {unit.status === 'OCCUPIED' ? '→ Vacant' : '→ Occupied'}
                    </button>
                  )}
                  {/* Edit button */}
                  {canEdit(unit) && (
                    <button
                      onClick={() => openEdit(unit)}
                      title="Edit unit"
                      style={{
                        background: 'none', border: '1px solid var(--border)', borderRadius: '6px',
                        padding: '5px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Owner-occupied badge */}
              {unit.isOwnerOccupied && (
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: '20px', background: '#E1F5EE', color: '#0F6E56', border: '1px solid #9FE1CB' }}>
                    Owner Occupied — No Rent
                  </span>
                </div>
              )}

              {/* Rent + meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Floor {unit.floor}{unit.area ? ` · ${unit.area} sqft` : ''}</span>
                {unit.isOwnerOccupied
                  ? <span style={{ fontSize: '12px', color: '#0F6E56', fontWeight: 500 }}>No rent (owner resident)</span>
                  : <span style={{ fontWeight: 600, color: '#15803d', fontSize: '14px' }}>{formatCurrency(unit.monthlyRent)}<span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></span>
                }
              </div>

              {/* People */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {unit.owner ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', background: '#EFF6FF', color: '#085041', padding: '1px 6px', borderRadius: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Owner</span>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{unit.owner.name}</span>
                    </div>
                    {(unit.ownerContactName || unit.ownerPhone) && (
                      <div style={{ paddingLeft: '52px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {[unit.ownerContactName, unit.ownerPhone].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No owner assigned</div>
                )}

                {unit.tenant ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', background: '#FEFCE8', color: '#A16207', padding: '1px 6px', borderRadius: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tenant</span>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{unit.tenant.name}</span>
                    </div>
                    {(unit.tenantContactName || unit.tenantPhone || unit.tenantNid) && (
                      <div style={{ paddingLeft: '52px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {[unit.tenantContactName, unit.tenantPhone, unit.tenantNid ? `NID: ${unit.tenantNid}` : null].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Vacant — no tenant</div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Upgrade Wall Modal ── */}
      <AnimatePresence>
        {showUpgradeWall && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={e => { if (e.target === e.currentTarget) setShowUpgradeWall(false) }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowUpgradeWall(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              style={{ position: 'relative', background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '480px', padding: '2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', textAlign: 'center' }}
            >
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }} style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔒</motion.div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--brand)', marginBottom: '0.5rem' }}>
                Upgrade to Premium
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                Your building has reached the <strong>{FREE_UNIT_LIMIT}-unit limit</strong> on the Free plan.
                Upgrade to Premium to add unlimited units and unlock all advanced features.
              </p>
              <div style={{ background: 'var(--surface-subtle)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid var(--border)', textAlign: 'left' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Premium includes</p>
                {[
                  'Unlimited units',
                  'Full billing & receipts history',
                  'Gas & service charge matrix',
                  'Advanced reports & exports',
                  'Priority support',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px', color: 'var(--text-primary)' }}>
                    <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Contact your developer/account manager to request Premium access.
              </p>
              <Button onClick={() => setShowUpgradeWall(false)} variant="secondary" style={{ width: '100%', justifyContent: 'center' }}>Close</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add Unit Modal (admin only) ── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Unit">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="Unit Number"><input value={addForm.number} onChange={e => setAddForm({ ...addForm, number: e.target.value })} style={inputStyle} placeholder="e.g. 2B" /></FormField>
          <FormField label="Floor"><input type="number" value={addForm.floor} onChange={e => setAddForm({ ...addForm, floor: e.target.value })} style={inputStyle} min="1" /></FormField>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="Area (sqft)"><input type="number" value={addForm.area} onChange={e => setAddForm({ ...addForm, area: e.target.value })} style={inputStyle} placeholder="Optional" /></FormField>
          <FormField label="Monthly Rent (৳)"><input type="number" value={addForm.monthlyRent} onChange={e => setAddForm({ ...addForm, monthlyRent: e.target.value })} style={inputStyle} /></FormField>
        </div>
        <FormField label="Assign Owner">
          <select value={addForm.ownerId} onChange={e => setAddForm({ ...addForm, ownerId: e.target.value })} style={selectStyle}>
            <option value="">No owner yet</option>
            {unassignedOwners.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </FormField>
        <FormField label="Assign Tenant">
          <select value={addForm.tenantId} onChange={e => setAddForm({ ...addForm, tenantId: e.target.value })} style={selectStyle}>
            <option value="">Vacant</option>
            {unassignedTenants.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </FormField>
        {addError && <p style={{ color: '#dc2626', fontSize: '13px' }}>{addError}</p>}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button onClick={submitAdd} disabled={addSaving || !addForm.number || !addForm.monthlyRent}>{addSaving ? 'Saving...' : 'Create Unit'}</Button>
        </div>
      </Modal>

      {/* ── Edit Unit Modal ── */}
      <Modal open={!!editUnit} onClose={() => setEditUnit(null)} title={`Edit Flat ${editUnit?.number}`}>
        {editUnit && (
          <>
            {/* Admin-only: unit settings */}
            {role === 'ADMIN' && (
              <>
                {inputSection('Unit Settings')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <FormField label="Status">
                    <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as 'OCCUPIED' | 'VACANT' })} style={selectStyle}>
                      <option value="OCCUPIED">Occupied</option>
                      <option value="VACANT">Vacant</option>
                    </select>
                  </FormField>
                  <FormField label="Monthly Rent (৳)">
                    <input type="number" value={editForm.monthlyRent} onChange={e => setEditForm({ ...editForm, monthlyRent: e.target.value })} style={inputStyle} />
                  </FormField>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <FormField label="Floor">
                    <input type="number" value={editForm.floor} onChange={e => setEditForm({ ...editForm, floor: e.target.value })} style={inputStyle} min="1" />
                  </FormField>
                  <FormField label="Area (sqft)">
                    <input type="number" value={editForm.area} onChange={e => setEditForm({ ...editForm, area: e.target.value })} style={inputStyle} placeholder="Optional" />
                  </FormField>
                </div>
                {/* Owner-occupied toggle */}
                <div style={{ padding: '10px 14px', background: '#E1F5EE', borderRadius: '10px', border: '1px solid #9FE1CB', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F6E56' }}>Owner is Resident</div>
                    <div style={{ fontSize: '11px', color: '#a78bfa', marginTop: '1px' }}>No rent charged — owner lives in this flat</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditForm(f => ({ ...f, isOwnerOccupied: !f.isOwnerOccupied, tenantId: !f.isOwnerOccupied ? '' : f.tenantId }))}
                    style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', background: editForm.isOwnerOccupied ? '#0F6E56' : '#C8D8D4', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0, padding: 0 }}
                  >
                    <span style={{ position: 'absolute', top: '3px', left: editForm.isOwnerOccupied ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <FormField label="Owner Account">
                    <select value={editForm.ownerId} onChange={e => setEditForm({ ...editForm, ownerId: e.target.value })} style={selectStyle}>
                      <option value="">No owner</option>
                      {owners.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Tenant Account">
                    <select value={editForm.tenantId} onChange={e => setEditForm({ ...editForm, tenantId: e.target.value })} style={selectStyle} disabled={editForm.isOwnerOccupied}>
                      <option value="">{editForm.isOwnerOccupied ? 'N/A — Owner Occupied' : 'No tenant'}</option>
                      {!editForm.isOwnerOccupied && tenants.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </FormField>
                </div>
              </>
            )}

            {/* Owner contact — both roles */}
            {inputSection('Owner Contact Details')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField label="Contact Name">
                <input value={editForm.ownerContactName} onChange={e => setEditForm({ ...editForm, ownerContactName: e.target.value })} style={inputStyle} placeholder="e.g. Rahman Karim" />
              </FormField>
              <FormField label="Phone">
                <input value={editForm.ownerPhone} onChange={e => setEditForm({ ...editForm, ownerPhone: e.target.value })} style={inputStyle} placeholder="+880-1700-000000" />
              </FormField>
            </div>

            {/* Tenant contact — both roles */}
            {inputSection('Tenant Contact Details')}
            <FormField label="Contact Name">
              <input value={editForm.tenantContactName} onChange={e => setEditForm({ ...editForm, tenantContactName: e.target.value })} style={inputStyle} placeholder="e.g. Rahim Mia" />
            </FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField label="Phone Number">
                <input value={editForm.tenantPhone} onChange={e => setEditForm({ ...editForm, tenantPhone: e.target.value })} style={inputStyle} placeholder="+880-1800-000000" />
              </FormField>
              <FormField label="NID Number">
                <input value={editForm.tenantNid} onChange={e => setEditForm({ ...editForm, tenantNid: e.target.value })} style={inputStyle} placeholder="National ID" />
              </FormField>
            </div>

            {editError && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '8px' }}>{editError}</p>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => setEditUnit(null)}>Cancel</Button>
              <Button onClick={submitEdit} disabled={editSaving}>{editSaving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
