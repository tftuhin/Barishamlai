'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, PageHeader, Button, Modal, FormField, inputStyle, selectStyle, RoleBadge, EmptyState } from '@/components/ui'
import { formatDate, getInitials } from '@/lib/utils'

type Config = {
  featureRent: boolean; featureElectricity: boolean; featureGas: boolean
  featureLift: boolean; featureSecurityGuard: boolean; featureGarbage: boolean
  featureServiceCharge: boolean; featureWater: boolean; featureCommunitySecurity: boolean
  serviceChargeOccupied: number; serviceChargeVacant: number; gasUnitRate: number
  garbageRate: number; communitySecurityRate: number
}

const FEATURES: { key: keyof Config; label: string; desc: string }[] = [
  { key: 'featureServiceCharge',     label: 'Service Charge',      desc: 'Maintenance fee per flat (occupied / vacant rates)' },
  { key: 'featureRent',              label: 'Rent',                desc: 'Monthly rent billing for tenant-occupied units' },
  { key: 'featureGas',               label: 'Gas',                 desc: 'Gas bill based on meter units & monthly rate' },
  { key: 'featureWater',             label: 'Water',               desc: 'WASA water bill divided equally among occupied flats' },
  { key: 'featureGarbage',           label: 'Garbage Collection',  desc: 'Fixed monthly garbage fee per occupied flat' },
  { key: 'featureCommunitySecurity', label: 'Community Security',  desc: 'Fixed monthly community security fee per occupied flat' },
  { key: 'featureElectricity',       label: 'Electricity',         desc: 'Common-area electricity bill distribution' },
  { key: 'featureLift',              label: 'Lift',                desc: 'Lift maintenance charge' },
  { key: 'featureSecurityGuard',     label: 'Security Guard',      desc: 'Security guard salary distribution' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: '44px', height: '24px', borderRadius: '12px', border: 'none',
      background: checked ? 'var(--brand)' : '#CBD5E1',
      position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0, padding: 0,
    }}>
      <span style={{
        position: 'absolute', top: '3px', left: checked ? '23px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING:  { bg: '#fef9c3', color: '#854d0e' },
  APPROVED: { bg: '#dcfce7', color: '#15803d' },
  REJECTED: { bg: '#fee2e2', color: '#dc2626' },
  ACCEPTED: { bg: '#dcfce7', color: '#15803d' },
  EXPIRED:  { bg: '#f1f5f9', color: '#64748b' },
}

export function SettingsClient({
  users, currentUserId, buildingId, buildingName,
  joinRequests: initialJoinRequests,
  invitations: initialInvitations,
  config: initialConfig = null,
}: {
  users: any[]
  currentUserId: string
  buildingId: string
  buildingName: string
  joinRequests: any[]
  invitations: any[]
  config?: Config | null
}) {
  const router = useRouter()
  const [tab, setTab] = useState<'users' | 'access' | 'config'>('users')

  // ── Users ──
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'TENANT', password: '' })

  // ── Access ──
  const [joinRequests, setJoinRequests] = useState<any[]>(initialJoinRequests)
  const [invitations, setInvitations] = useState<any[]>(initialInvitations)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'TENANT' })
  const [inviteSaving, setInviteSaving] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [copiedBuildingId, setCopiedBuildingId] = useState(false)

  // ── Config ──
  const defaultConfig: Config = {
    featureRent: true, featureElectricity: true, featureGas: true,
    featureLift: false, featureSecurityGuard: false, featureGarbage: false,
    featureServiceCharge: true, featureWater: false, featureCommunitySecurity: false,
    serviceChargeOccupied: 0, serviceChargeVacant: 0, gasUnitRate: 0,
    garbageRate: 0, communitySecurityRate: 0,
  }
  const [config, setConfig] = useState<Config>(initialConfig ?? defaultConfig)
  const [configSaving, setConfigSaving] = useState(false)
  const [configMsg, setConfigMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function submitUser() {
    setError(''); setSaving(true)
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { setShowAdd(false); setForm({ name: '', email: '', phone: '', role: 'TENANT', password: '' }); router.refresh() }
    else { const d = await res.json(); setError(d.error || 'Failed to create user') }
    setSaving(false)
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Failed to delete user')
      return
    }
    router.refresh()
  }

  async function saveConfig() {
    setConfigSaving(true); setConfigMsg(null)
    const res = await fetch('/api/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) })
    if (res.ok) { setConfig(await res.json()); setConfigMsg({ ok: true, text: 'Configuration saved.' }) }
    else { setConfigMsg({ ok: false, text: 'Failed to save. Please try again.' }) }
    setConfigSaving(false)
  }

  async function handleJoinRequest(id: string, status: 'APPROVED' | 'REJECTED') {
    const res = await fetch(`/api/join-requests/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setJoinRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      if (status === 'APPROVED') router.refresh()
    }
  }

  async function sendInvitation() {
    setInviteError(''); setInviteSaving(true)
    const res = await fetch('/api/invitations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inviteForm),
    })
    if (res.ok) {
      const inv = await res.json()
      setInvitations(prev => [inv, ...prev])
      setShowInvite(false); setInviteForm({ email: '', role: 'TENANT' })
    } else { const d = await res.json(); setInviteError(d.error || 'Failed') }
    setInviteSaving(false)
  }

  async function revokeInvitation(id: string) {
    if (!confirm('Revoke this invitation?')) return
    await fetch('/api/invitations', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setInvitations(prev => prev.filter(i => i.id !== id))
  }

  function copyToken(token: string) {
    navigator.clipboard.writeText(token)
    setCopiedToken(token); setTimeout(() => setCopiedToken(null), 2000)
  }
  function copyBuildingId() {
    navigator.clipboard.writeText(buildingId)
    setCopiedBuildingId(true); setTimeout(() => setCopiedBuildingId(false), 2000)
  }

  const byRole = (r: string) => users.filter(u => u.role === r)
  const pendingCount = joinRequests.filter(r => r.status === 'PENDING').length

  const tabStyle = (t: string): React.CSSProperties => ({
    padding: '10px 20px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    border: 'none', background: 'none', fontFamily: 'var(--font-body)',
    borderBottom: tab === t ? '2px solid var(--brand)' : '2px solid transparent',
    color: tab === t ? 'var(--brand)' : 'var(--text-muted)', transition: 'color 0.15s',
    position: 'relative' as const,
  })

  return (
    <div style={{ padding: '2rem 2.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      <PageHeader
        title="Settings"
        subtitle="Manage users, access requests, and building configuration"
        action={
          tab === 'users'  ? <Button onClick={() => setShowAdd(true)}>+ Add User</Button> :
          tab === 'access' ? <Button onClick={() => setShowInvite(true)}>+ Invite by Email</Button> :
          undefined
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.75rem' }}>
        <button style={tabStyle('users')}  onClick={() => setTab('users')}>Users</button>
        <button style={tabStyle('access')} onClick={() => setTab('access')}>
          Access Requests
          {pendingCount > 0 && (
            <span style={{ marginLeft: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: 700 }}>
              {pendingCount}
            </span>
          )}
        </button>
        <button style={tabStyle('config')} onClick={() => setTab('config')}>Configuration</button>
      </div>

      {/* ════ USERS TAB ════ */}
      {tab === 'users' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
            {[
              { label: 'Admins',  count: byRole('ADMIN').length,  color: '#1d4ed8', bg: '#eff6ff' },
              { label: 'Owners',  count: byRole('OWNER').length,  color: '#15803d', bg: '#f0fdf4' },
              { label: 'Tenants', count: byRole('TENANT').length, color: '#a16207', bg: '#fefce8' },
            ].map(s => (
              <Card key={s.label} style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: s.color, flexShrink: 0 }}>{s.count}</div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: 0 }}>{s.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: 500, margin: '2px 0 0', color: s.color }}>Active accounts</p>
                </div>
              </Card>
            ))}
          </div>
          <Card>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--brand)', margin: 0 }}>All Users</h3>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{users.length} accounts</span>
            </div>
            {users.length === 0 ? <EmptyState title="No users yet" /> : (
              <table className="data-table">
                <thead><tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th></th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: u.role === 'ADMIN' ? '#eff6ff' : u.role === 'OWNER' ? '#f0fdf4' : '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: u.role === 'ADMIN' ? '#1d4ed8' : u.role === 'OWNER' ? '#15803d' : '#a16207', flexShrink: 0 }}>
                            {getInitials(u.name)}
                          </div>
                          <span style={{ fontWeight: 500 }}>{u.name}{u.id === currentUserId && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>(you)</span>}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.phone ?? '—'}</td>
                      <td><RoleBadge role={u.role} /></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{formatDate(u.createdAt)}</td>
                      <td>
                        {u.id !== currentUserId && (
                          <button onClick={() => deleteUser(u.id, u.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '4px', display: 'flex' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}

      {/* ════ ACCESS REQUESTS TAB ════ */}
      {tab === 'access' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Building ID banner */}
          <Card style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg,#eff6ff,#f0f9ff)', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1d4ed8', margin: '0 0 4px' }}>Your Building ID</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Share this with owners / tenants so they can request to join <strong>{buildingName}</strong></p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <code style={{ fontSize: '12px', fontFamily: 'monospace', background: '#fff', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '8px', color: '#1e40af' }}>
                  {buildingId}
                </code>
                <button onClick={copyBuildingId} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #bfdbfe', background: copiedBuildingId ? '#dcfce7' : '#fff', color: copiedBuildingId ? '#15803d' : '#1d4ed8', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {copiedBuildingId ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </Card>

          {/* Join requests */}
          <Card>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--brand)', margin: 0 }}>Join Requests</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>People who registered using your Building ID</p>
              </div>
              {pendingCount > 0 && <span style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626', background: '#fee2e2', padding: '3px 10px', borderRadius: '12px' }}>{pendingCount} pending</span>}
            </div>
            {joinRequests.length === 0 ? (
              <EmptyState title="No join requests yet" description="When someone registers with your Building ID, they appear here" />
            ) : (
              <table className="data-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Requested</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {joinRequests.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{r.user.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.user.email}</td>
                      <td><RoleBadge role={r.role} /></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{formatDate(r.createdAt)}</td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: 600, padding: '2px 10px', borderRadius: '12px', ...(STATUS_COLORS[r.status] ?? STATUS_COLORS.PENDING) }}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        {r.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => handleJoinRequest(r.id, 'APPROVED')} style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: '#dcfce7', color: '#15803d', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                            <button onClick={() => handleJoinRequest(r.id, 'REJECTED')} style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          {/* Invitations */}
          <Card>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--brand)', margin: 0 }}>Email Invitations</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Personal tokens — invited person is auto-approved on signup</p>
            </div>
            {invitations.length === 0 ? (
              <EmptyState title="No invitations sent yet" description='Click "+ Invite by Email" above to create one' />
            ) : (
              <table className="data-table">
                <thead><tr><th>Email</th><th>Role</th><th>Expires</th><th>Status</th><th>Token</th><th></th></tr></thead>
                <tbody>
                  {invitations.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 500 }}>{inv.email}</td>
                      <td><RoleBadge role={inv.role} /></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{formatDate(inv.expiresAt)}</td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: 600, padding: '2px 10px', borderRadius: '12px', ...(STATUS_COLORS[inv.status] ?? STATUS_COLORS.PENDING) }}>
                          {inv.status}
                        </span>
                      </td>
                      <td>
                        {inv.status === 'PENDING' && (
                          <button onClick={() => copyToken(inv.token)} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: copiedToken === inv.token ? '#dcfce7' : '#fff', color: copiedToken === inv.token ? '#15803d' : 'var(--brand)', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}>
                            {copiedToken === inv.token ? '✓ Copied' : 'Copy Token'}
                          </button>
                        )}
                      </td>
                      <td>
                        {inv.status === 'PENDING' && (
                          <button onClick={() => revokeInvitation(inv.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '4px', display: 'flex' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {/* ════ CONFIGURATION TAB ════ */}
      {tab === 'config' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--brand)', margin: 0 }}>Billing Features</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Enable or disable bill types. Disabled features are hidden across the app.</p>
            </div>
            <div style={{ padding: '0.5rem 0' }}>
              {FEATURES.map(f => (
                <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{f.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{f.desc}</div>
                  </div>
                  <Toggle checked={config[f.key] as boolean} onChange={v => setConfig({ ...config, [f.key]: v })} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--brand)', margin: 0 }}>Service Charge Rates</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Monthly service charge per flat based on occupancy.</p>
            </div>
            <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField label="Occupied flat rate (৳/month)">
                <input type="number" min="0" value={config.serviceChargeOccupied} onChange={e => setConfig({ ...config, serviceChargeOccupied: Number(e.target.value) })} style={inputStyle} />
              </FormField>
              <FormField label="Vacant flat rate (৳/month)">
                <input type="number" min="0" value={config.serviceChargeVacant} onChange={e => setConfig({ ...config, serviceChargeVacant: Number(e.target.value) })} style={inputStyle} />
              </FormField>
            </div>
          </Card>

          <Card>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--brand)', margin: 0 }}>Gas Unit Rate</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Current rate per gas unit (৳). Update monthly when the rate changes.</p>
            </div>
            <div style={{ padding: '1.25rem 1.5rem', maxWidth: '280px' }}>
              <FormField label="Rate per unit (৳)">
                <input type="number" min="0" step="0.01" value={config.gasUnitRate} onChange={e => setConfig({ ...config, gasUnitRate: Number(e.target.value) })} style={inputStyle} placeholder="e.g. 12.50" />
              </FormField>
            </div>
          </Card>

          <Card>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--brand)', margin: 0 }}>Fixed Monthly Rates</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Per-flat monthly rates for Garbage Collection and Community Security modules.</p>
            </div>
            <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField label="Garbage rate (৳/flat/month)">
                <input type="number" min="0" value={(config as any).garbageRate ?? 0} onChange={e => setConfig({ ...config, garbageRate: Number(e.target.value) } as Config)} style={inputStyle} placeholder="e.g. 200" />
              </FormField>
              <FormField label="Community Security rate (৳/flat/month)">
                <input type="number" min="0" value={(config as any).communitySecurityRate ?? 0} onChange={e => setConfig({ ...config, communitySecurityRate: Number(e.target.value) } as Config)} style={inputStyle} placeholder="e.g. 500" />
              </FormField>
            </div>
          </Card>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Button onClick={saveConfig} disabled={configSaving}>{configSaving ? 'Saving...' : 'Save Configuration'}</Button>
            {configMsg && <span style={{ fontSize: '13px', color: configMsg.ok ? '#15803d' : '#dc2626', fontWeight: 500 }}>{configMsg.ok ? '✓ ' : '✗ '}{configMsg.text}</span>}
          </div>
        </div>
      )}

      {/* ── Add User Modal ── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New User">
        <FormField label="Full Name"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="e.g. Rahman Karim" /></FormField>
        <FormField label="Email Address"><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} placeholder="user@example.com" /></FormField>
        <FormField label="Phone (optional)"><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="+880-1700-000000" /></FormField>
        <FormField label="Role">
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={selectStyle}>
            <option value="TENANT">Tenant</option>
            <option value="OWNER">Flat Owner</option>
            <option value="ADMIN">Admin</option>
          </select>
        </FormField>
        <FormField label="Temporary Password"><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} placeholder="Min 6 characters" /></FormField>
        {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '0.75rem' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button onClick={submitUser} disabled={saving || !form.name || !form.email || !form.password}>{saving ? 'Creating...' : 'Create User'}</Button>
        </div>
      </Modal>

      {/* ── Invite by Email Modal ── */}
      <Modal open={showInvite} onClose={() => { setShowInvite(false); setInviteError('') }} title="Invite by Email">
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          An invitation token will be created. Share it with the person — they enter it during signup to be instantly approved.
        </p>
        <FormField label="Email Address">
          <input type="email" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} style={inputStyle} placeholder="resident@example.com" />
        </FormField>
        <FormField label="Role">
          <select value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })} style={selectStyle}>
            <option value="TENANT">Tenant</option>
            <option value="OWNER">Flat Owner</option>
          </select>
        </FormField>
        {inviteError && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '0.75rem' }}>{inviteError}</p>}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setShowInvite(false)}>Cancel</Button>
          <Button onClick={sendInvitation} disabled={inviteSaving || !inviteForm.email}>{inviteSaving ? 'Sending...' : 'Create Invitation'}</Button>
        </div>
      </Modal>
    </div>
  )
}
