'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, PageHeader, Button, Modal, FormField, inputStyle, selectStyle, EmptyState } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

const FREE_UNIT_LIMIT = 5

type OccupancyType = 'OWNER_OCCUPIED' | 'TENANT_OCCUPIED' | 'VACANT' | 'MERGED'
type ServiceChargeType = 'STANDARD' | 'SPECIAL'

type Unit = {
  id: string; number: string; floor: number; area: number | null; monthlyRent: number
  status: 'OCCUPIED' | 'VACANT'; isOwnerOccupied: boolean
  customServiceCharge: number | null
  ownerContactName: string | null; ownerPhone: string | null; ownerEmail: string | null
  tenantContactName: string | null; tenantPhone: string | null; tenantNid: string | null; tenantEmail: string | null; tenantMoveInDate: string | null
  occupancyType: OccupancyType; serviceChargeType: ServiceChargeType; skipRentModule: boolean
  ownerId: string | null; tenantId: string | null
  owner: { id: string; name: string } | null
  tenant: { id: string; name: string } | null
}

type User = { id: string; name: string; role: string }
type OpeningDue = { type: 'RENT' | 'SERVICE_CHARGE' | 'GAS'; month: number; year: number; amount: string }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const BILL_TYPES: OpeningDue['type'][] = ['RENT', 'SERVICE_CHARGE', 'GAS']
const BILL_LABELS: Record<OpeningDue['type'], string> = { RENT: 'Rent', SERVICE_CHARGE: 'Service Charge', GAS: 'Gas' }

const now = new Date()
const EMPTY_DUE: OpeningDue = { type: 'RENT', month: now.getMonth() + 1, year: now.getFullYear(), amount: '' }

const EMPTY_FORM = { number: '', floor: '1', area: '', monthlyRent: '', ownerId: '', tenantId: '' }

const EMPTY_EDIT = {
  occupancyType: 'TENANT_OCCUPIED' as OccupancyType,
  serviceChargeType: 'STANDARD' as ServiceChargeType,
  skipRentModule: false,
  monthlyRent: '', floor: '', area: '',
  customServiceCharge: '',
  ownerId: '', tenantId: '',
  ownerContactName: '', ownerPhone: '', ownerEmail: '',
  tenantContactName: '', tenantPhone: '', tenantNid: '', tenantEmail: '', tenantMoveInDate: '',
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
  const [openingDues, setOpeningDues] = useState<OpeningDue[]>([])
  const [dueForm, setDueForm] = useState<OpeningDue>(EMPTY_DUE)
  const [showDueForm, setShowDueForm] = useState(false)

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
      occupancyType: unit.occupancyType ?? 'TENANT_OCCUPIED',
      serviceChargeType: unit.serviceChargeType ?? 'STANDARD',
      skipRentModule: unit.skipRentModule ?? false,
      monthlyRent: String(unit.monthlyRent),
      floor: String(unit.floor),
      area: unit.area ? String(unit.area) : '',
      customServiceCharge: unit.customServiceCharge != null ? String(unit.customServiceCharge) : '',
      ownerId: unit.ownerId ?? '',
      tenantId: unit.tenantId ?? '',
      ownerContactName: unit.ownerContactName ?? '',
      ownerPhone: unit.ownerPhone ?? '',
      ownerEmail: unit.ownerEmail ?? '',
      tenantContactName: unit.tenantContactName ?? '',
      tenantPhone: unit.tenantPhone ?? '',
      tenantNid: unit.tenantNid ?? '',
      tenantEmail: unit.tenantEmail ?? '',
      tenantMoveInDate: unit.tenantMoveInDate ? unit.tenantMoveInDate.slice(0, 10) : '',
    })
    setEditError('')
  }

  function addDueEntry() {
    if (!dueForm.amount || Number(dueForm.amount) <= 0) return
    setOpeningDues(prev => [...prev, { ...dueForm }])
    setDueForm(EMPTY_DUE)
    setShowDueForm(false)
  }

  function removeDue(i: number) {
    setOpeningDues(prev => prev.filter((_, idx) => idx !== i))
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
        openingDues: openingDues.map(d => ({ ...d, amount: Number(d.amount) })),
      }),
    })
    if (res.ok) {
      setShowAdd(false); setAddForm(EMPTY_FORM); setOpeningDues([]); setShowDueForm(false)
      router.refresh()
    } else {
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
      ownerEmail:        editForm.ownerEmail         || null,
      tenantContactName: editForm.tenantContactName  || null,
      tenantPhone:       editForm.tenantPhone        || null,
      tenantNid:         editForm.tenantNid          || null,
      tenantEmail:       editForm.tenantEmail        || null,
    }
    if (role === 'ADMIN') {
      const isOwner = editForm.occupancyType === 'OWNER_OCCUPIED'
      const isVacant = editForm.occupancyType === 'VACANT' || editForm.occupancyType === 'MERGED'
      payload.occupancyType      = editForm.occupancyType
      payload.isOwnerOccupied    = isOwner
      payload.status             = isVacant ? 'VACANT' : 'OCCUPIED'
      payload.serviceChargeType  = editForm.serviceChargeType
      payload.skipRentModule     = editForm.skipRentModule
      payload.monthlyRent        = Number(editForm.monthlyRent)
      payload.floor              = Number(editForm.floor)
      payload.area               = editForm.area ? Number(editForm.area) : null
      payload.ownerId            = editForm.ownerId  || null
      payload.tenantId           = isOwner ? null : (editForm.tenantId || null)
      payload.customServiceCharge = editForm.customServiceCharge !== '' ? Number(editForm.customServiceCharge) : null
      payload.tenantMoveInDate   = editForm.tenantMoveInDate || null
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

  async function deleteUnit(unit: Unit) {
    const confirmed = window.confirm(
      `Delete Flat ${unit.number}?\n\nThis will permanently remove the unit and all associated bills, receipts, and balances. This cannot be undone.`
    )
    if (!confirmed) return
    setUnits(prev => prev.filter(u => u.id !== unit.id))
    const res = await fetch(`/api/units/${unit.id}`, { method: 'DELETE' })
    if (!res.ok) {
      // Restore on failure
      setUnits(prev => [...prev, unit].sort((a, b) => a.floor - b.floor || a.number.localeCompare(b.number)))
    }
    router.refresh()
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
                  {/* Delete button — admin only */}
                  {role === 'ADMIN' && (
                    <button
                      onClick={() => deleteUnit(unit)}
                      title="Delete unit"
                      style={{
                        background: 'none', border: '1px solid var(--border)', borderRadius: '6px',
                        padding: '5px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#dc2626'; (e.currentTarget as HTMLButtonElement).style.color = '#dc2626' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Occupancy / SC type badges */}
              {(unit.occupancyType !== 'TENANT_OCCUPIED' || unit.serviceChargeType === 'SPECIAL') && (
                <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {unit.occupancyType === 'OWNER_OCCUPIED' && (
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: '20px', background: '#E1F5EE', color: '#0F6E56', border: '1px solid #9FE1CB' }}>Owner Occupied</span>
                  )}
                  {unit.occupancyType === 'VACANT' && (
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: '20px', background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' }}>Vacant</span>
                  )}
                  {unit.occupancyType === 'MERGED' && (
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: '20px', background: '#FEF9C3', color: '#A16207', border: '1px solid #FDE68A' }}>Merged</span>
                  )}
                  {unit.serviceChargeType === 'SPECIAL' && (
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: '20px', background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}>Special SC</span>
                  )}
                </div>
              )}

              {/* Rent + meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Floor {unit.floor}{unit.area ? ` · ${unit.area} sqft` : ''}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  {unit.occupancyType === 'OWNER_OCCUPIED'
                    ? <span style={{ fontSize: '12px', color: '#0F6E56', fontWeight: 500 }}>No rent (owner resident)</span>
                    : unit.occupancyType === 'VACANT' || unit.occupancyType === 'MERGED'
                      ? <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>—</span>
                      : <span style={{ fontWeight: 600, color: '#15803d', fontSize: '14px' }}>{formatCurrency(unit.monthlyRent)}<span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></span>
                  }
                  {unit.customServiceCharge != null && (
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '10px', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>
                      SC: ৳{unit.customServiceCharge}/mo (custom)
                    </span>
                  )}
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', ...(unit.skipRentModule ? { background: '#FFF7ED', color: '#9A3412', border: '1px solid #FED7AA' } : { background: '#DCFCE7', color: '#14532D', border: '1px solid #BBF7D0' }) }}>
                    Rent: {unit.skipRentModule ? 'Skipped' : 'Active'}
                  </span>
                </div>
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
        {/* Opening Due Balances */}
        <div style={{ marginTop: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--border)' }}>
            Opening Due Balances <span style={{ fontWeight: 400, fontSize: '10px', textTransform: 'none', letterSpacing: 0 }}>(optional — enter unpaid dues from before joining)</span>
          </div>

          {openingDues.length > 0 && (
            <div style={{ marginBottom: '10px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-subtle)' }}>
                    {['Type','Month','Year','Amount (৳)',''].map(h => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {openingDues.map((d, i) => (
                    <tr key={i} style={{ borderBottom: i < openingDues.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '6px 10px', fontWeight: 500 }}>{BILL_LABELS[d.type]}</td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{MONTHS[d.month - 1]}</td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{d.year}</td>
                      <td style={{ padding: '6px 10px', fontWeight: 600, color: '#15803d' }}>৳{Number(d.amount).toLocaleString()}</td>
                      <td style={{ padding: '6px 6px', textAlign: 'right' }}>
                        <button onClick={() => removeDue(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '13px', padding: '2px 6px' }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showDueForm ? (
            <div style={{ padding: '12px', background: 'var(--surface-subtle)', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 1fr', gap: '8px', alignItems: 'end' }}>
                <FormField label="Bill Type">
                  <select value={dueForm.type} onChange={e => setDueForm({ ...dueForm, type: e.target.value as OpeningDue['type'] })} style={{ ...selectStyle, fontSize: '13px', padding: '6px 8px' }}>
                    {BILL_TYPES.map(t => <option key={t} value={t}>{BILL_LABELS[t]}</option>)}
                  </select>
                </FormField>
                <FormField label="Month">
                  <select value={dueForm.month} onChange={e => setDueForm({ ...dueForm, month: Number(e.target.value) })} style={{ ...selectStyle, fontSize: '13px', padding: '6px 8px' }}>
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </FormField>
                <FormField label="Year">
                  <input type="number" value={dueForm.year} onChange={e => setDueForm({ ...dueForm, year: Number(e.target.value) })} style={{ ...inputStyle, fontSize: '13px', padding: '6px 8px' }} min="2000" max="2100" />
                </FormField>
                <FormField label="Amount (৳)">
                  <input type="number" value={dueForm.amount} onChange={e => setDueForm({ ...dueForm, amount: e.target.value })} style={{ ...inputStyle, fontSize: '13px', padding: '6px 8px' }} placeholder="0" min="1" />
                </FormField>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={addDueEntry} disabled={!dueForm.amount || Number(dueForm.amount) <= 0} style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', background: 'var(--brand)', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  Add Entry
                </button>
                <button onClick={() => { setShowDueForm(false); setDueForm(EMPTY_DUE) }} style={{ padding: '6px 14px', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowDueForm(true)} style={{ fontSize: '12px', color: 'var(--brand)', background: 'none', border: '1px dashed var(--brand)', borderRadius: '7px', padding: '5px 14px', cursor: 'pointer', fontWeight: 500, opacity: 0.8 }}>
              + Add Due Entry
            </button>
          )}
        </div>

        {addError && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '10px' }}>{addError}</p>}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
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
                  <FormField label="Monthly Rent (৳)">
                    <input type="number" value={editForm.monthlyRent} onChange={e => setEditForm({ ...editForm, monthlyRent: e.target.value })} style={inputStyle} />
                  </FormField>
                  <FormField label="Floor">
                    <input type="number" value={editForm.floor} onChange={e => setEditForm({ ...editForm, floor: e.target.value })} style={inputStyle} min="1" />
                  </FormField>
                </div>
                <FormField label="Area (sqft)">
                  <input type="number" value={editForm.area} onChange={e => setEditForm({ ...editForm, area: e.target.value })} style={inputStyle} placeholder="Optional" />
                </FormField>
                {/* Custom service charge */}
                <div style={{ padding: '10px 14px', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0', marginBottom: '4px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>Custom Service Charge Rate</div>
                  <div style={{ fontSize: '11px', color: '#15803d', marginBottom: '8px' }}>Leave blank to use the building default. Set a value to override for this flat only.</div>
                  <FormField label="Custom Rate (৳/month) — optional">
                    <input type="number" value={editForm.customServiceCharge} onChange={e => setEditForm({ ...editForm, customServiceCharge: e.target.value })} style={inputStyle} placeholder="e.g. 1500 — leave blank for default" min="0" />
                  </FormField>
                  {editForm.customServiceCharge !== '' && (
                    <button type="button" onClick={() => setEditForm({ ...editForm, customServiceCharge: '' })}
                      style={{ fontSize: '11px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', marginTop: '2px' }}>
                      ✕ Remove custom rate — revert to default
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <FormField label="Owner Account">
                    <select value={editForm.ownerId} onChange={e => setEditForm({ ...editForm, ownerId: e.target.value })} style={selectStyle}>
                      <option value="">No owner</option>
                      {owners.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Tenant Account">
                    <select value={editForm.tenantId} onChange={e => setEditForm({ ...editForm, tenantId: e.target.value })} style={selectStyle} disabled={editForm.occupancyType === 'OWNER_OCCUPIED'}>
                      <option value="">{editForm.occupancyType === 'OWNER_OCCUPIED' ? 'N/A — Owner Occupied' : 'No tenant'}</option>
                      {editForm.occupancyType !== 'OWNER_OCCUPIED' && tenants.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </FormField>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <FormField label="Occupancy Type">
                    <select value={editForm.occupancyType} onChange={e => setEditForm({ ...editForm, occupancyType: e.target.value as OccupancyType })} style={selectStyle}>
                      <option value="TENANT_OCCUPIED">Tenant Occupied</option>
                      <option value="OWNER_OCCUPIED">Owner Occupied</option>
                      <option value="VACANT">Vacant</option>
                      <option value="MERGED">Merged</option>
                    </select>
                  </FormField>
                  <FormField label="Service Charge Type">
                    <select value={editForm.serviceChargeType} onChange={e => setEditForm({ ...editForm, serviceChargeType: e.target.value as ServiceChargeType })} style={selectStyle}>
                      <option value="STANDARD">Standard</option>
                      <option value="SPECIAL">Special</option>
                    </select>
                  </FormField>
                </div>
                <div style={{ padding: '10px 14px', background: '#FFF7ED', borderRadius: '10px', border: '1px solid #FED7AA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#9A3412' }}>Skip Rent Module</div>
                    <div style={{ fontSize: '11px', color: '#C2410C', marginTop: '1px' }}>Exclude this unit from rent billing entirely</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditForm(f => ({ ...f, skipRentModule: !f.skipRentModule }))}
                    style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', background: editForm.skipRentModule ? '#EA580C' : '#C8D8D4', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0, padding: 0 }}
                  >
                    <span style={{ position: 'absolute', top: '3px', left: editForm.skipRentModule ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </button>
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
            <FormField label="Owner Email">
              <input type="email" value={editForm.ownerEmail} onChange={e => setEditForm({ ...editForm, ownerEmail: e.target.value })} style={inputStyle} placeholder="owner@example.com" />
            </FormField>

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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField label="Tenant Email">
                <input type="email" value={editForm.tenantEmail} onChange={e => setEditForm({ ...editForm, tenantEmail: e.target.value })} style={inputStyle} placeholder="tenant@example.com" />
              </FormField>
              <FormField label="Move-in Date">
                <input type="date" value={editForm.tenantMoveInDate} onChange={e => setEditForm({ ...editForm, tenantMoveInDate: e.target.value })} style={inputStyle} />
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
