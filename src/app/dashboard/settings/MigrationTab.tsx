'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, FormField, inputStyle, selectStyle } from '@/components/ui'
import { formatCurrency, getMonthName } from '@/lib/utils'

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ val: i + 1, label: getMonthName(i + 1) }))

const BILL_TYPES = [
  { value: 'SERVICE_CHARGE',    label: 'Service Charge' },
  { value: 'RENT',              label: 'Rent' },
  { value: 'GAS',               label: 'Gas' },
  { value: 'WATER',             label: 'Water' },
  { value: 'GARBAGE',           label: 'Garbage' },
  { value: 'COMMUNITY_SECURITY',label: 'Community Security' },
]

const BILL_TYPE_LABELS: Record<string, string> = Object.fromEntries(BILL_TYPES.map(b => [b.value, b.label]))

type ModuleInfo = { key: string; label: string; fundType: string; color: string }

const ALL_MODULES: ModuleInfo[] = [
  { key: 'featureServiceCharge',    label: 'Service Charge',    fundType: 'SERVICE_CHARGE',    color: '#1d4ed8' },
  { key: 'featureRent',             label: 'Rent',              fundType: 'RENT',              color: '#dc2626' },
  { key: 'featureGas',              label: 'Gas',               fundType: 'GAS',               color: '#d97706' },
  { key: 'featureWater',            label: 'Water',             fundType: 'WATER',             color: '#0284c7' },
  { key: 'featureGarbage',          label: 'Garbage',           fundType: 'GARBAGE',           color: '#16a34a' },
  { key: 'featureCommunitySecurity',label: 'Community Security',fundType: 'COMMUNITY_SECURITY',color: '#9333ea' },
]

type BillRow = {
  _id: string
  month: string; year: string; billType: string; amount: string; status: 'PENDING' | 'PAID'
  openingUnit: string; closingUnit: string; perUnitRate: string
}
type ExistingBill = { id: string; month: number; year: number; type: string; amount: number; status: string }
type EditForm = { month: string; year: string; billType: string; amount: string; status: string }

const now = new Date()
const THIS_YEAR = String(now.getFullYear())

function newRow(): BillRow {
  return {
    _id: Math.random().toString(36).slice(2),
    month: String(now.getMonth() + 1), year: THIS_YEAR,
    billType: 'SERVICE_CHARGE', amount: '', status: 'PENDING',
    openingUnit: '', closingUnit: '', perUnitRate: '',
  }
}

function calcGasAmount(opening: string, closing: string, rate: string): number {
  const o = parseFloat(opening), c = parseFloat(closing), r = parseFloat(rate)
  if (isNaN(o) || isNaN(c) || isNaN(r) || c <= o) return 0
  return Math.round((c - o) * r)
}

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  PENDING: { bg: '#FFF7ED', color: '#9A3412', border: '#FED7AA' },
  PAID:    { bg: '#F0FDF4', color: '#14532D', border: '#BBF7D0' },
  OVERDUE: { bg: '#FEF2F2', color: '#7F1D1D', border: '#FECACA' },
}

export function MigrationTab({
  units,
  fundBalances: initialFundBalances,
  enabledModules,
}: {
  units: { id: string; number: string; floor: number }[]
  fundBalances: { fundType: string; amount: number }[]
  enabledModules: Record<string, boolean>
}) {
  const activeModules = ALL_MODULES.filter(m => enabledModules[m.key] !== false)
  const [activeModule, setActiveModule] = useState<ModuleInfo>(activeModules[0] ?? ALL_MODULES[0])

  // ── Fund balance ──────────────────────────────────────────────────────────
  const [fundBalances, setFundBalances] = useState<Record<string, number>>(
    Object.fromEntries(initialFundBalances.map(b => [b.fundType, b.amount]))
  )
  const [editingFund, setEditingFund] = useState(false)
  const [fundInput, setFundInput]     = useState('')
  const [savingFund, setSavingFund]   = useState(false)
  const [fundMsg, setFundMsg]         = useState<{ ok: boolean; text: string } | null>(null)

  function openFundEdit(m: ModuleInfo) {
    setFundInput(String(fundBalances[m.fundType] ?? 0))
    setEditingFund(true); setFundMsg(null)
  }
  async function saveFundBalance(m: ModuleInfo) {
    setSavingFund(true); setFundMsg(null)
    const res = await fetch('/api/fund-balance', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fundType: m.fundType, amount: Number(fundInput) }),
    })
    if (res.ok) { setFundBalances(p => ({ ...p, [m.fundType]: Number(fundInput) })); setEditingFund(false); setFundMsg({ ok: true, text: 'Fund balance updated.' }) }
    else setFundMsg({ ok: false, text: 'Failed to save.' })
    setSavingFund(false)
  }

  function switchModule(m: ModuleInfo) { setActiveModule(m); setEditingFund(false); setFundMsg(null) }

  // ── Bills section ─────────────────────────────────────────────────────────
  const [selectedUnitId, setSelectedUnitId] = useState(units[0]?.id ?? '')
  const [existingBills, setExistingBills]   = useState<ExistingBill[]>([])
  const [loadingBills, setLoadingBills]     = useState(false)
  const [deletingId, setDeletingId]         = useState<string | null>(null)
  const [editingId, setEditingId]           = useState<string | null>(null)
  const [editForm, setEditForm]             = useState<EditForm>({ month: '', year: '', billType: '', amount: '', status: '' })
  const [savingEdit, setSavingEdit]         = useState(false)

  const [rows, setRows]           = useState<BillRow[]>([newRow()])
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg]   = useState<{ ok: boolean; text: string } | null>(null)

  const fetchBills = useCallback(async (unitId: string) => {
    if (!unitId) return
    setLoadingBills(true)
    try {
      const res = await fetch(`/api/bills?unitId=${unitId}`)
      if (res.ok) setExistingBills(await res.json())
    } finally {
      setLoadingBills(false)
    }
  }, [])

  useEffect(() => { fetchBills(selectedUnitId) }, [selectedUnitId, fetchBills])

  async function deleteBill(billId: string) {
    if (!confirm('Delete this bill? This cannot be undone.')) return
    setDeletingId(billId)
    const res = await fetch(`/api/bills/${billId}`, { method: 'DELETE' })
    if (res.ok) setExistingBills(p => p.filter(b => b.id !== billId))
    setDeletingId(null)
  }

  function startEdit(b: ExistingBill) {
    setEditingId(b.id)
    setEditForm({ month: String(b.month), year: String(b.year), billType: b.type, amount: String(b.amount), status: b.status })
  }

  async function saveEdit(billId: string) {
    setSavingEdit(true)
    const res = await fetch(`/api/bills/${billId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: Number(editForm.month), year: Number(editForm.year), type: editForm.billType, amount: Number(editForm.amount), status: editForm.status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setExistingBills(p => p.map(b => b.id === billId ? { ...b, month: updated.month, year: updated.year, type: updated.type, amount: updated.amount, status: updated.status } : b))
      setEditingId(null)
    }
    setSavingEdit(false)
  }

  function updateRow(id: string, field: keyof BillRow, value: string) {
    setRows(p => p.map(r => {
      if (r._id !== id) return r
      const updated = { ...r, [field]: value }
      // auto-compute amount for gas rows
      if (updated.billType === 'GAS') {
        const computed = calcGasAmount(updated.openingUnit, updated.closingUnit, updated.perUnitRate)
        updated.amount = computed > 0 ? String(computed) : ''
      }
      return updated
    }))
  }
  function addRow() { setRows(p => [...p, newRow()]) }
  function removeRow(id: string) { setRows(p => p.filter(r => r._id !== id)) }

  async function submitBills() {
    const valid = rows.filter(r => r.amount && Number(r.amount) > 0)
    if (!selectedUnitId || valid.length === 0) {
      setSubmitMsg({ ok: false, text: 'Select a flat and fill in at least one row with an amount.' }); return
    }
    setSubmitting(true); setSubmitMsg(null)
    const bills = valid.map(r => {
      const month = Number(r.month); const year = Number(r.year)
      const dueDate = new Date(year, month, 0).toISOString().split('T')[0]
      const extra = r.billType === 'GAS' && r.closingUnit
        ? { meterReading: Number(r.closingUnit), openingMeterReading: r.openingUnit ? Number(r.openingUnit) : null }
        : {}
      return { unitId: selectedUnitId, type: r.billType, amount: Number(r.amount), month, year, dueDate, status: r.status, ...extra }
    })
    const res  = await fetch('/api/bills/batch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bills }) })
    const data = await res.json()
    if (res.ok) {
      setSubmitMsg({ ok: true, text: `${data.created} bill${data.created !== 1 ? 's' : ''} added${data.skipped > 0 ? `, ${data.skipped} skipped (already exist)` : ''}.` })
      setRows([newRow()])
      fetchBills(selectedUnitId)
    } else {
      setSubmitMsg({ ok: false, text: data.error || 'Failed to submit.' })
    }
    setSubmitting(false)
  }

  const currentFund = fundBalances[activeModule.fundType] ?? 0
  const modTabSt = (m: ModuleInfo, active: ModuleInfo): React.CSSProperties => ({
    padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
    borderRadius: 8, transition: 'all 0.15s',
    background: active.key === m.key ? m.color : 'var(--surface-subtle)',
    color: active.key === m.key ? '#fff' : 'var(--text-secondary)',
  })

  const selectedUnit = units.find(u => u.id === selectedUnitId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Info banner */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#1e40af' }}>
        <strong>Data Migration</strong> — Import historical records from your previous manual or Excel system.
        Set each fund&apos;s opening balance, then add historical bills for each flat.
      </div>

      {/* ── Fund Opening Balance ── */}
      <Card>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Fund Opening Balances</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>The cash balance of each fund before your first transaction in this app.</p>
        </div>
        <div style={{ padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid var(--border)' }}>
          {activeModules.map(m => <button key={m.key} style={modTabSt(m, activeModule)} onClick={() => switchModule(m)}>{m.label}</button>)}
        </div>
        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: activeModule.color }}>{activeModule.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: currentFund >= 0 ? '#15803d' : '#dc2626', marginTop: 2 }}>{formatCurrency(currentFund)}</div>
          </div>
          {!editingFund && (
            <button onClick={() => openFundEdit(activeModule)} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>Edit</button>
          )}
        </div>
        {editingFund && (
          <div style={{ padding: '0 1.5rem 1rem', display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 200px' }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Opening Balance (৳)</label>
              <input type="number" value={fundInput} onChange={e => setFundInput(e.target.value)} style={inputStyle} placeholder="e.g. 50000" autoFocus />
            </div>
            <button onClick={() => saveFundBalance(activeModule)} disabled={savingFund} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: activeModule.color, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: savingFund ? 0.6 : 1 }}>
              {savingFund ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => { setEditingFund(false); setFundMsg(null) }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        )}
        {fundMsg && (
          <div style={{ padding: '6px 1.5rem 10px', fontSize: 13, color: fundMsg.ok ? '#15803d' : '#dc2626' }}>
            {fundMsg.ok ? '✓ ' : '✗ '}{fundMsg.text}
          </div>
        )}
      </Card>

      {/* ── Historical Bills ── */}
      <Card>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Historical Bills</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>Add past bills for any flat. Choose a flat, fill in the rows, then press Submit.</p>
        </div>

        {/* Flat selector */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <FormField label="Select Flat">
            <select
              value={selectedUnitId}
              onChange={e => { setSelectedUnitId(e.target.value); setSubmitMsg(null) }}
              style={{ ...selectStyle, maxWidth: 280 }}
            >
              {units.map(u => <option key={u.id} value={u.id}>Flat {u.number} (Floor {u.floor})</option>)}
            </select>
          </FormField>
        </div>

        {/* Existing bills for selected flat */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            Existing Bills — Flat {selectedUnit?.number}
          </div>
          {loadingBills ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>Loading…</div>
          ) : existingBills.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '4px 0' }}>No bills recorded for this flat.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-subtle)' }}>
                    {['Month / Year', 'Bill Type', 'Amount', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {existingBills.map((b, i) => {
                    const sc = STATUS_COLORS[b.status] ?? STATUS_COLORS.PENDING
                    const isEditing = editingId === b.id
                    return (
                      <tr key={b.id} style={{ background: isEditing ? '#fffbeb' : i % 2 === 0 ? '#fff' : 'var(--surface-subtle)' }}>
                        {isEditing ? (
                          <>
                            <td style={{ padding: '6px 6px' }}>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <select value={editForm.month} onChange={e => setEditForm(f => ({ ...f, month: e.target.value }))} style={{ ...selectStyle, fontSize: 12, padding: '4px 6px', minWidth: 80 }}>
                                  {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                                </select>
                                <input type="number" value={editForm.year} onChange={e => setEditForm(f => ({ ...f, year: e.target.value }))} style={{ ...inputStyle, fontSize: 12, padding: '4px 6px', width: 64 }} min="2000" max="2100" />
                              </div>
                            </td>
                            <td style={{ padding: '6px 6px' }}>
                              <select value={editForm.billType} onChange={e => setEditForm(f => ({ ...f, billType: e.target.value }))} style={{ ...selectStyle, fontSize: 12, padding: '4px 6px', minWidth: 140 }}>
                                {BILL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </select>
                            </td>
                            <td style={{ padding: '6px 6px' }}>
                              <input type="number" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} style={{ ...inputStyle, fontSize: 12, padding: '4px 6px', width: 90 }} min="1" />
                            </td>
                            <td style={{ padding: '6px 6px' }}>
                              <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} style={{ ...selectStyle, fontSize: 12, padding: '4px 6px', minWidth: 90 }}>
                                <option value="PENDING">Due</option>
                                <option value="PAID">Paid</option>
                                <option value="OVERDUE">Overdue</option>
                              </select>
                            </td>
                            <td style={{ padding: '6px 6px', whiteSpace: 'nowrap' }}>
                              <button onClick={() => saveEdit(b.id)} disabled={savingEdit} style={{ padding: '3px 10px', borderRadius: 6, border: 'none', background: '#15803d', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 600, marginRight: 4, opacity: savingEdit ? 0.6 : 1 }}>
                                {savingEdit ? '…' : 'Save'}
                              </button>
                              <button onClick={() => setEditingId(null)} style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', fontSize: 12, cursor: 'pointer' }}>
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: '7px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{getMonthName(b.month)} {b.year}</td>
                            <td style={{ padding: '7px 12px', fontWeight: 500 }}>{BILL_TYPE_LABELS[b.type] ?? b.type}</td>
                            <td style={{ padding: '7px 12px', fontWeight: 600 }}>{formatCurrency(b.amount)}</td>
                            <td style={{ padding: '7px 12px' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                                {b.status}
                              </span>
                            </td>
                            <td style={{ padding: '7px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <button
                                onClick={() => startEdit(b)}
                                style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontSize: 12, cursor: 'pointer', fontWeight: 500, marginRight: 4 }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteBill(b.id)}
                                disabled={deletingId === b.id}
                                style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #FECACA', background: '#FEF2F2', color: '#dc2626', fontSize: 12, cursor: 'pointer', fontWeight: 500, opacity: deletingId === b.id ? 0.5 : 1 }}
                              >
                                {deletingId === b.id ? '…' : 'Delete'}
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add new bills — multi-row form */}
        <div style={{ padding: '1rem 1.5rem' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            Add Bills for Flat {selectedUnit?.number}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--surface-subtle)' }}>
                  {['Month', 'Year', 'Bill Type', 'Amount / Gas Units', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row._id} style={{ background: i % 2 === 0 ? '#fff' : 'var(--surface-subtle)' }}>
                    <td style={{ padding: '6px 6px' }}>
                      <select value={row.month} onChange={e => updateRow(row._id, 'month', e.target.value)} style={{ ...selectStyle, fontSize: 12, padding: '6px 8px', minWidth: 90 }}>
                        {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '6px 6px' }}>
                      <input type="number" value={row.year} onChange={e => updateRow(row._id, 'year', e.target.value)} style={{ ...inputStyle, fontSize: 12, padding: '6px 8px', width: 72 }} min="2000" max="2100" />
                    </td>
                    <td style={{ padding: '6px 6px' }}>
                      <select value={row.billType} onChange={e => updateRow(row._id, 'billType', e.target.value)} style={{ ...selectStyle, fontSize: 12, padding: '6px 8px', minWidth: 150 }}>
                        {BILL_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '6px 6px' }}>
                      {row.billType === 'GAS' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 260 }}>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Opening Unit</div>
                              <input
                                type="number" value={row.openingUnit}
                                onChange={e => updateRow(row._id, 'openingUnit', e.target.value)}
                                style={{ ...inputStyle, fontSize: 12, padding: '5px 7px', width: '100%' }}
                                placeholder="e.g. 1200" min="0"
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Closing Unit</div>
                              <input
                                type="number" value={row.closingUnit}
                                onChange={e => updateRow(row._id, 'closingUnit', e.target.value)}
                                style={{ ...inputStyle, fontSize: 12, padding: '5px 7px', width: '100%' }}
                                placeholder="e.g. 1250" min="0"
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Rate (৳/unit)</div>
                              <input
                                type="number" value={row.perUnitRate}
                                onChange={e => updateRow(row._id, 'perUnitRate', e.target.value)}
                                style={{ ...inputStyle, fontSize: 12, padding: '5px 7px', width: '100%' }}
                                placeholder="e.g. 11.50" min="0" step="0.01"
                              />
                            </div>
                          </div>
                          {row.amount ? (
                            <div style={{ fontSize: 12, color: '#15803d', fontWeight: 600, paddingLeft: 2 }}>
                              = {formatCurrency(Number(row.amount))}
                              <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                                ({parseFloat(row.closingUnit || '0') - parseFloat(row.openingUnit || '0')} units)
                              </span>
                            </div>
                          ) : (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 2 }}>Enter all three values to calculate</div>
                          )}
                        </div>
                      ) : (
                        <input type="number" value={row.amount} onChange={e => updateRow(row._id, 'amount', e.target.value)} style={{ ...inputStyle, fontSize: 12, padding: '6px 8px', width: 100 }} placeholder="0" min="1" />
                      )}
                    </td>
                    <td style={{ padding: '6px 6px' }}>
                      <select value={row.status} onChange={e => updateRow(row._id, 'status', e.target.value as 'PENDING' | 'PAID')} style={{ ...selectStyle, fontSize: 12, padding: '6px 8px', minWidth: 100 }}>
                        <option value="PENDING">Due</option>
                        <option value="PAID">Paid</option>
                      </select>
                    </td>
                    <td style={{ padding: '6px 6px', textAlign: 'center' }}>
                      {rows.length > 1 && (
                        <button onClick={() => removeRow(row._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16, padding: '2px 6px', lineHeight: 1 }}>✕</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 10 }}>
            <button onClick={addRow} style={{ padding: '7px 16px', borderRadius: 8, border: '1px dashed var(--border)', background: 'transparent', fontSize: 13, color: 'var(--brand)', cursor: 'pointer', fontWeight: 500 }}>
              + Add Row
            </button>
            <button
              onClick={submitBills}
              disabled={submitting || rows.every(r => !r.amount)}
              style={{ padding: '8px 22px', borderRadius: 8, border: 'none', background: 'var(--brand)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Submitting…' : 'Submit Bills'}
            </button>
          </div>

          {submitMsg && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: submitMsg.ok ? '#f0fdf4' : '#fef2f2', border: `1px solid ${submitMsg.ok ? '#86efac' : '#fca5a5'}`, fontSize: 13, color: submitMsg.ok ? '#15803d' : '#dc2626' }}>
              {submitMsg.ok ? '✓ ' : '✗ '}{submitMsg.text}
            </div>
          )}
        </div>
      </Card>

    </div>
  )
}
