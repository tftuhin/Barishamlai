'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, PageHeader, Button, Badge, Modal, FormField, inputStyle, selectStyle, EmptyState } from '@/components/ui'
import { formatCurrency, formatDate, getBillTypeLabel, getMonthName } from '@/lib/utils'

const BILL_TYPES = ['RENT','SERVICE_CHARGE','GAS','WATER','ELECTRICITY']
const MONTHS = Array.from({length:12},(_,i)=>({val:i+1,label:getMonthName(i+1)}))

export function BillingClient({ bills, units, role, userId, currentMonth, currentYear }: {
  bills: any[]; units: any[]; role: string; userId?: string; currentMonth: number; currentYear: number
}) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState<'ALL'|'PENDING'|'PAID'|'OVERDUE'>('ALL')
  const [loading, setLoading] = useState<string|null>(null)
  const [form, setForm] = useState({ unitId:'', type:'RENT', amount:'', month: String(currentMonth), year: String(currentYear), dueDate:'', note:'' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Gas meter reading state
  const [currentReading, setCurrentReading] = useState('')
  const [prevReading, setPrevReading] = useState<number|null>(null)
  const [gasUnitRate, setGasUnitRate] = useState<number>(0)
  const [loadingGas, setLoadingGas] = useState(false)

  const filtered = bills.filter(b => filter === 'ALL' || b.status === filter)
  const isGas = form.type === 'GAS'

  // Fetch gas config + previous reading when type=GAS and unit selected
  useEffect(() => {
    if (!isGas || !form.unitId) { setPrevReading(null); return }
    setLoadingGas(true)
    Promise.all([
      fetch('/api/config').then(r => r.json()),
      fetch(`/api/bills?unitId=${form.unitId}&type=GAS&limit=1`).then(r => r.json()),
    ]).then(([config, prevBills]) => {
      setGasUnitRate(config.gasUnitRate ?? 0)
      setPrevReading(prevBills[0]?.meterReading ?? null)
    }).finally(() => setLoadingGas(false))
  }, [isGas, form.unitId])

  // Auto-calculate gas amount
  useEffect(() => {
    if (!isGas || !currentReading || prevReading === null) return
    const usage = Number(currentReading) - prevReading
    if (usage > 0 && gasUnitRate > 0) {
      setForm(f => ({ ...f, amount: String(Math.round(usage * gasUnitRate)) }))
    }
  }, [currentReading, prevReading, gasUnitRate, isGas])

  async function markPaid(billId: string) {
    setLoading(billId)
    await fetch(`/api/bills/${billId}/pay`, { method: 'PATCH' })
    router.refresh()
    setLoading(null)
  }

  async function submitBill() {
    setError(''); setSaving(true)
    const res = await fetch('/api/bills', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
        month: Number(form.month),
        year: Number(form.year),
        meterReading: isGas && currentReading ? Number(currentReading) : null,
      }),
    })
    if (res.ok) {
      setShowAdd(false)
      setCurrentReading('')
      setPrevReading(null)
      router.refresh()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to create bill')
    }
    setSaving(false)
  }

  function handleClose() {
    setShowAdd(false)
    setCurrentReading('')
    setPrevReading(null)
    setError('')
  }

  const totals = {
    paid: bills.filter(b=>b.status==='PAID').reduce((s,b)=>s+b.amount,0),
    pending: bills.filter(b=>b.status==='PENDING').reduce((s,b)=>s+b.amount,0),
    overdue: bills.filter(b=>b.status==='OVERDUE').reduce((s,b)=>s+b.amount,0),
  }

  function canMarkPaid(bill: any) {
    if (bill.status === 'PAID') return false
    if (role === 'ADMIN') return true
    if (role === 'OWNER' && bill.type === 'RENT' && bill.unit?.ownerId === userId) return true
    return false
  }

  return (
    <div className="page-content" style={{ padding: '2rem 2.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      <PageHeader
        title="Billing"
        subtitle="Manage rent, service charges and utility bills"
        action={role === 'ADMIN' && <Button onClick={() => setShowAdd(true)}>+ Add Bill</Button>}
      />

      {/* Summary bar */}
      <div className="resp-grid-sum" style={{ marginBottom: '1.5rem' }}>
        {[{label:'Collected',val:totals.paid,color:'#15803d'},{label:'Pending',val:totals.pending,color:'#d97706'},{label:'Overdue',val:totals.overdue,color:'#dc2626'}].map(s=>(
          <Card key={s.label} style={{ padding: '1rem 1.25rem' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 4px' }}>{s.label}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 600, color: s.color, margin: 0 }}>{formatCurrency(s.val)}</p>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {(['ALL','PENDING','PAID','OVERDUE'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: '1px solid',
            background: filter === f ? 'var(--brand)' : '#fff',
            color: filter === f ? '#fff' : 'var(--text-secondary)',
            borderColor: filter === f ? 'var(--brand)' : 'var(--border)',
          }}>{f}</button>
        ))}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState title="No bills found" description="No bills match the current filter." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {role === 'ADMIN' && <th>Unit</th>}
                  <th>Type</th><th>Month / Year</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Paid At</th>
                  {(role === 'ADMIN' || role === 'OWNER') && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((bill: any) => (
                  <tr key={bill.id}>
                    {role === 'ADMIN' && <td><span style={{ fontWeight: 600, color: 'var(--brand)' }}>{bill.unit.number}</span><br/><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bill.unit.tenant?.name ?? 'Vacant'}</span></td>}
                    <td style={{ fontWeight: 500 }}>{getBillTypeLabel(bill.type)}</td>
                    <td>{getMonthName(bill.month)} {bill.year}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(bill.amount)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(bill.dueDate)}</td>
                    <td><Badge status={bill.status} /></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{bill.paidAt ? formatDate(bill.paidAt) : '—'}</td>
                    {(role === 'ADMIN' || role === 'OWNER') && (
                      <td>
                        {canMarkPaid(bill) && (
                          <Button size="sm" onClick={() => markPaid(bill.id)} disabled={loading === bill.id}>
                            {loading === bill.id ? '...' : 'Mark Paid'}
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Bill Modal */}
      <Modal open={showAdd} onClose={handleClose} title="Add New Bill">
        <FormField label="Unit">
          <select value={form.unitId} onChange={e => setForm({...form, unitId:e.target.value})} style={selectStyle}>
            <option value="">Select unit...</option>
            {units.map((u: any) => <option key={u.id} value={u.id}>{u.number} — {u.tenant?.name ?? 'Vacant'}</option>)}
          </select>
        </FormField>
        <FormField label="Bill Type">
          <select value={form.type} onChange={e => setForm({...form, type:e.target.value, amount:''})} style={selectStyle}>
            {BILL_TYPES.map(t => <option key={t} value={t}>{getBillTypeLabel(t)}</option>)}
          </select>
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="Month">
            <select value={form.month} onChange={e => setForm({...form, month:e.target.value})} style={selectStyle}>
              {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
          </FormField>
          <FormField label="Year">
            <input type="number" value={form.year} onChange={e => setForm({...form, year:e.target.value})} style={inputStyle} min="2020" max="2030" />
          </FormField>
        </div>

        {/* Gas meter reading section */}
        {isGas && form.unitId && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
              ⛽ Gas Meter Readings
            </p>
            {loadingGas ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading previous reading...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Previous Reading</label>
                  <input
                    type="number"
                    value={prevReading ?? ''}
                    readOnly
                    style={{ ...inputStyle, background: '#e9ecef', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                    placeholder="No previous reading"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Current Reading</label>
                  <input
                    type="number"
                    value={currentReading}
                    onChange={e => setCurrentReading(e.target.value)}
                    style={inputStyle}
                    placeholder="Enter current reading"
                  />
                </div>
              </div>
            )}
            {currentReading && prevReading !== null && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#15803d' }}>
                Usage: {Math.max(0, Number(currentReading) - prevReading).toFixed(1)} units × ৳{gasUnitRate}/unit
                {gasUnitRate === 0 && <span style={{ color: '#d97706' }}> (Set gas unit rate in Settings)</span>}
              </div>
            )}
            {currentReading && prevReading === null && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#d97706' }}>
                No previous reading found. Enter amount manually below.
              </div>
            )}
          </div>
        )}

        <FormField label={isGas ? 'Amount (৳) — auto-calculated' : 'Amount (৳)'}>
          <input type="number" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} style={inputStyle} placeholder="e.g. 2500" />
        </FormField>
        <FormField label="Due Date">
          <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate:e.target.value})} style={inputStyle} />
        </FormField>
        <FormField label="Note (optional)">
          <input type="text" value={form.note} onChange={e => setForm({...form, note:e.target.value})} style={inputStyle} placeholder="Any note..." />
        </FormField>
        {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '1rem' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={submitBill} disabled={saving}>{saving ? 'Saving...' : 'Create Bill'}</Button>
        </div>
      </Modal>
    </div>
  )
}
