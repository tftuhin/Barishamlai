'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, PageHeader, Button, Modal, FormField, inputStyle, selectStyle } from '@/components/ui'
import { formatCurrency, getMonthName } from '@/lib/utils'
import Link from 'next/link'

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ val: i + 1, label: getMonthName(i + 1) }))

function getLastMonths(n = 12) {
  const out = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push({ month: d.getMonth() + 1, year: d.getFullYear() })
  }
  return out
}

export function ServiceChargeClient({ units, bills, serviceChargeOccupied, serviceChargeVacant, currentMonth, currentYear }: {
  units: any[]; bills: any[]; serviceChargeOccupied: number; serviceChargeVacant: number
  currentMonth: number; currentYear: number
}) {
  const router = useRouter()
  const months = getLastMonths(12)

  const [showAdd, setShowAdd] = useState(false)
  const [addMonth, setAddMonth] = useState(String(currentMonth))
  const [addYear, setAddYear] = useState(String(currentYear))
  const [addDueDate, setAddDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null)

  function getBill(unitId: string, month: number, year: number) {
    return bills.find(b => b.unitId === unitId && b.month === month && b.year === year) ?? null
  }

  // Preview for the selected month
  const preview = units.map(u => {
    const existing = getBill(u.id, Number(addMonth), Number(addYear))
    const rate = u.status === 'VACANT' ? serviceChargeVacant : serviceChargeOccupied
    return { unit: u, existing, rate }
  })

  async function submitBatch() {
    if (!addDueDate) { setError('Please set a due date'); return }
    setSaving(true); setError(''); setResult(null)
    const billsToCreate = preview
      .filter(p => !p.existing && p.rate > 0)
      .map(p => ({
        unitId: p.unit.id,
        type: 'SERVICE_CHARGE',
        amount: p.rate,
        month: Number(addMonth),
        year: Number(addYear),
        dueDate: addDueDate,
      }))
    const res = await fetch('/api/bills/batch', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bills: billsToCreate }),
    })
    const data = await res.json()
    setResult(data)
    setSaving(false)
    if (data.created > 0) { router.refresh(); setShowAdd(false) }
  }

  const totalPaid = bills.filter(b => b.status === 'PAID').reduce((s, b) => s + b.amount, 0)
  const totalDue  = bills.filter(b => b.status !== 'PAID').reduce((s, b) => s + b.amount, 0)

  return (
    <div className="page-content" style={{ padding: '2rem 2.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      <PageHeader
        title="Service Charges"
        subtitle="Monthly service charge status per unit"
        action={<Button onClick={() => { setShowAdd(true); setResult(null) }}>+ Add for Month</Button>}
      />

      {/* Summary */}
      <div className="resp-grid-sum" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Collected', val: formatCurrency(totalPaid), color: '#15803d' },
          { label: 'Outstanding', val: formatCurrency(totalDue), color: '#dc2626' },
          { label: 'Rates', val: `Occupied: ৳${serviceChargeOccupied} / Vacant: ৳${serviceChargeVacant}`, color: 'var(--brand)' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '1rem 1.25rem' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 4px' }}>{s.label}</p>
            <p style={{ fontSize: s.label === 'Rates' ? '13px' : '1.4rem', fontWeight: 600, color: s.color, margin: 0 }}>{s.val}</p>
          </Card>
        ))}
      </div>

      {serviceChargeOccupied === 0 && serviceChargeVacant === 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.5rem', fontSize: '13px', color: '#92400e' }}>
          ⚠ Service charge rates are not configured. <Link href="/dashboard/settings" style={{ color: 'var(--brand)', fontWeight: 500 }}>Go to Settings →</Link>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[{ color: '#dcfce7', border: '#86efac', label: 'Paid' }, { color: '#fee2e2', border: '#fca5a5', label: 'Due / Overdue' }, { color: '#f1f5f9', border: '#cbd5e1', label: 'No bill' }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: l.color, border: `1px solid ${l.border}` }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Matrix */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'var(--surface-subtle)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', position: 'sticky', left: 0, background: 'var(--surface-subtle)', zIndex: 1, minWidth: '100px' }}>Unit</th>
                {months.map(({ month, year }) => (
                  <th key={`${year}-${month}`} style={{ padding: '10px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', minWidth: '90px', whiteSpace: 'nowrap' }}>
                    {getMonthName(month).slice(0, 3)} {String(year).slice(2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {units.map((unit, i) => (
                <tr key={unit.id} style={{ background: i % 2 === 0 ? '#fff' : 'var(--surface-subtle)' }}>
                  <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--brand)', borderBottom: '1px solid var(--border)', position: 'sticky', left: 0, background: i % 2 === 0 ? '#fff' : 'var(--surface-subtle)', zIndex: 1, whiteSpace: 'nowrap' }}>
                    {unit.number}
                    <div style={{ fontSize: '10px', color: unit.status === 'VACANT' ? '#d97706' : '#15803d', fontWeight: 500 }}>{unit.status}</div>
                  </td>
                  {months.map(({ month, year }) => {
                    const bill = getBill(unit.id, month, year)
                    if (!bill) return (
                      <td key={`${year}-${month}`} style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</div>
                      </td>
                    )
                    const isPaid = bill.status === 'PAID'
                    return (
                      <td key={`${year}-${month}`} style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ borderRadius: '8px', padding: '6px 4px', background: isPaid ? '#dcfce7' : '#fee2e2', border: `1px solid ${isPaid ? '#86efac' : '#fca5a5'}` }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: isPaid ? '#15803d' : '#dc2626' }}>{formatCurrency(bill.amount)}</div>
                          <div style={{ fontSize: '10px', color: isPaid ? '#166534' : '#991b1b', marginTop: '1px', fontWeight: 500 }}>{isPaid ? 'PAID' : bill.status}</div>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
              {units.length === 0 && (
                <tr><td colSpan={months.length + 1} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No units found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add for Month Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Service Charges for Month">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="Month">
            <select value={addMonth} onChange={e => setAddMonth(e.target.value)} style={selectStyle}>
              {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
          </FormField>
          <FormField label="Year">
            <input type="number" value={addYear} onChange={e => setAddYear(e.target.value)} style={inputStyle} min="2020" max="2035" />
          </FormField>
        </div>
        <FormField label="Due Date">
          <input type="date" value={addDueDate} onChange={e => setAddDueDate(e.target.value)} style={inputStyle} />
        </FormField>

        {/* Preview */}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Preview</p>
          <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-subtle)', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unit</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {preview.map(p => (
                  <tr key={p.unit.id} style={{ opacity: p.existing ? 0.45 : 1 }}>
                    <td style={{ padding: '7px 12px', fontSize: '13px', fontWeight: 500, borderTop: '1px solid var(--border)' }}>
                      {p.unit.number}
                      {p.existing && <span style={{ fontSize: '10px', color: '#d97706', marginLeft: '6px' }}>exists</span>}
                    </td>
                    <td style={{ padding: '7px 12px', fontSize: '12px', color: p.unit.status === 'VACANT' ? '#d97706' : '#15803d', borderTop: '1px solid var(--border)' }}>{p.unit.status}</td>
                    <td style={{ padding: '7px 12px', fontSize: '13px', fontWeight: 600, textAlign: 'right', borderTop: '1px solid var(--border)' }}>{formatCurrency(p.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
            {preview.filter(p => !p.existing).length} new bills will be created, {preview.filter(p => p.existing).length} skipped (already exist)
          </p>
        </div>

        {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '1rem' }}>{error}</p>}
        {result && <p style={{ color: '#15803d', fontSize: '13px', marginBottom: '1rem' }}>✓ Created {result.created} bills, skipped {result.skipped}</p>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button onClick={submitBatch} disabled={saving || preview.filter(p => !p.existing).length === 0}>
            {saving ? 'Creating...' : `Create ${preview.filter(p => !p.existing).length} Bills`}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
