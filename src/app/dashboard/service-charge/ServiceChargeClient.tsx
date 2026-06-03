'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, PageHeader, Button, Modal, FormField, inputStyle, selectStyle } from '@/components/ui'
import { formatCurrency, getMonthName, formatDate } from '@/lib/utils'
import Link from 'next/link'

const SC_EXPENSE_CATEGORIES = [
  { value: 'SECURITY_GUARD_SALARY', label: 'Security Guard Salary' },
  { value: 'CARETAKER_SALARY',      label: 'Caretaker Salary' },
  { value: 'CLEANER_SALARY',        label: 'Cleaner Salary' },
  { value: 'LIFT_SERVICING',        label: 'Lift Servicing' },
  { value: 'COMMON_ELECTRICITY',    label: 'Common Area Electricity' },
  { value: 'GENERATOR',             label: 'Generator Fuel / Service' },
  { value: 'SC_MAINTENANCE',        label: 'Maintenance & Repairs' },
]

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ val: i + 1, label: getMonthName(i + 1) }))

export function ServiceChargeClient({ units, bills, scExpenses, fundBalance, serviceChargeOccupied, serviceChargeVacant, currentMonth, currentYear, isReadOnly }: {
  units: any[]; bills: any[]; scExpenses: any[]; fundBalance: any | null
  serviceChargeOccupied: number; serviceChargeVacant: number
  currentMonth: number; currentYear: number; isReadOnly?: boolean
}) {
  const router = useRouter()

  // Year selector — defaults to current year, shows Jan–Dec of selected year
  const billYears = Array.from(new Set(bills.map((b: any) => b.year as number))).sort()
  const yearOptions = Array.from(new Set([...billYears, currentYear, currentYear + 1])).sort()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, year: selectedYear }))

  const [showAdd, setShowAdd] = useState(false)
  const [addMonth, setAddMonth] = useState(String(currentMonth))
  const [addYear, setAddYear] = useState(String(currentYear))
  const [addDueDate, setAddDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null)

  // SC Expenses
  const [showAddExp, setShowAddExp] = useState(false)
  const [savingExp, setSavingExp] = useState(false)
  const [expError, setExpError] = useState('')
  const now = new Date()
  const [expForm, setExpForm] = useState({ title: '', amount: '', serviceCategory: 'SECURITY_GUARD_SALARY', date: now.toISOString().split('T')[0], description: '' })

  async function submitExpense() {
    setExpError(''); setSavingExp(true)
    const d = new Date(expForm.date)
    const res = await fetch('/api/expenses', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: expForm.title || SC_EXPENSE_CATEGORIES.find(c => c.value === expForm.serviceCategory)?.label,
        amount: Number(expForm.amount),
        category: 'OTHER',
        serviceCategory: expForm.serviceCategory,
        incomeSource: 'SERVICE_CHARGE',
        date: expForm.date,
        description: expForm.description,
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      }),
    })
    if (res.ok) { setShowAddExp(false); router.refresh() }
    else { const d = await res.json(); setExpError(d.error || 'Failed') }
    setSavingExp(false)
  }

  async function deleteExpense(id: string) {
    if (!confirm('Delete this expense?')) return
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  function getBill(unitId: string, month: number, year: number) {
    return bills.find(b => b.unitId === unitId && b.month === month && b.year === year) ?? null
  }

  async function deleteBill(billId: string) {
    if (!confirm('Delete this bill?')) return
    await fetch(`/api/bills/${billId}`, { method: 'DELETE' })
    router.refresh()
  }

  async function revertBill(billId: string) {
    await fetch(`/api/bills/${billId}/pay`, { method: 'DELETE' })
    router.refresh()
  }

  async function markPaid(billId: string) {
    await fetch(`/api/bills/${billId}/pay`, { method: 'PATCH' })
    router.refresh()
  }

  // Preview for the selected month
  // Per-unit custom rate overrides the building-level standard
  const preview = units.map(u => {
    const existing = getBill(u.id, Number(addMonth), Number(addYear))
    const standardRate = u.status === 'VACANT' ? serviceChargeVacant : serviceChargeOccupied
    const rate = u.customServiceCharge != null ? u.customServiceCharge : standardRate
    const isCustom = u.customServiceCharge != null
    return { unit: u, existing, rate, isCustom }
  })

  async function submitBatch() {
    if (!addDueDate) { setError('Please set a due date'); return }
    setSaving(true); setError(''); setResult(null)
    const res = await fetch('/api/bills/initiate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'SERVICE_CHARGE', month: Number(addMonth), year: Number(addYear), dueDate: addDueDate }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return }
    setResult(data)
    setSaving(false)
    if (data.created > 0) { router.refresh(); setShowAdd(false) }
  }

  const totalPaid = bills.filter(b => b.status === 'PAID').reduce((s, b) => s + b.amount, 0)
  const totalDue  = bills.filter(b => b.status !== 'PAID').reduce((s, b) => s + b.amount, 0)
  const totalExpenses = scExpenses.reduce((s, e) => s + e.amount, 0)
  const opening = fundBalance?.amount ?? 0
  const currentBalance = opening + totalPaid - totalExpenses

  return (
    <div className="page-content" style={{ padding: '2rem 2.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      <PageHeader
        title="Service Charges"
        subtitle="Monthly service charge status per unit"
        action={!isReadOnly ? <Button onClick={() => { setShowAdd(true); setResult(null) }}>Initiate Bills for Month</Button> : undefined}
      />

      {/* Summary */}
      <div className="resp-grid-sum" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Fund Balance', val: formatCurrency(currentBalance), color: currentBalance >= 0 ? '#15803d' : '#dc2626' },
          { label: 'Collected (all time)', val: formatCurrency(totalPaid), color: '#15803d' },
          { label: 'Outstanding', val: formatCurrency(totalDue), color: '#dc2626' },
          { label: 'Expenses (all time)', val: formatCurrency(totalExpenses), color: '#d97706' },
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

      {/* Year selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Year:</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {yearOptions.map(y => (
            <button key={y} onClick={() => setSelectedYear(y)} style={{ padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid', background: selectedYear === y ? 'var(--brand)' : 'transparent', color: selectedYear === y ? '#fff' : 'var(--text-secondary)', borderColor: selectedYear === y ? 'var(--brand)' : 'var(--border)' }}>
              {y}
            </button>
          ))}
        </div>
      </div>

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
                    {unit.customServiceCharge != null && (
                      <div style={{ fontSize: '10px', color: '#166534', fontWeight: 500 }}>৳{unit.customServiceCharge} custom</div>
                    )}
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
                          {!isReadOnly && (
                            <>
                              {!isPaid && (
                                <button onClick={() => markPaid(bill.id)} style={{ marginTop: '3px', padding: '1px 5px', fontSize: '9px', fontWeight: 600, borderRadius: 3, border: 'none', background: '#15803d', color: '#fff', cursor: 'pointer', display: 'block', width: '100%' }} title="Mark as paid">✓ Paid</button>
                              )}
                              {isPaid && (
                                <button onClick={() => revertBill(bill.id)} style={{ marginTop: '3px', padding: '1px 5px', fontSize: '9px', fontWeight: 600, borderRadius: 3, border: '1px solid #166534', background: 'transparent', color: '#166534', cursor: 'pointer', display: 'block', width: '100%' }} title="Mark as due">→ Due</button>
                              )}
                              <button onClick={() => deleteBill(bill.id)} style={{ marginTop: '3px', background: 'none', border: 'none', cursor: 'pointer', color: isPaid ? '#166534' : '#991b1b', opacity: 0.5, padding: '0 2px', fontSize: '10px', lineHeight: 1 }} title="Delete bill">✕</button>
                            </>
                          )}
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

      {/* SC Expenses Section */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--brand)', margin: 0 }}>Service Charge Expenses</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>Security, cleaning, lift, electricity, generator & maintenance costs</p>
          </div>
          {!isReadOnly && <Button onClick={() => setShowAddExp(true)}>+ Add Expense</Button>}
        </div>
        <Card>
          {scExpenses.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No service charge expenses logged yet.</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Description</th><th>Category</th><th>Date</th><th>Amount</th>{!isReadOnly && <th></th>}</tr></thead>
              <tbody>
                {scExpenses.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 500 }}>{e.title}</td>
                    <td><span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 12, background: 'rgba(29,158,117,0.12)', color: 'var(--brand)', fontWeight: 500 }}>
                      {SC_EXPENSE_CATEGORIES.find(c => c.value === e.serviceCategory)?.label ?? e.serviceCategory ?? 'Other'}
                    </span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{formatDate(e.date)}</td>
                    <td style={{ fontWeight: 600, color: '#dc2626' }}>{formatCurrency(e.amount)}</td>
                    {!isReadOnly && (
                      <td><button onClick={() => deleteExpense(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: 4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Add SC Expense Modal */}
      <Modal open={showAddExp} onClose={() => setShowAddExp(false)} title="Add Service Charge Expense">
        <FormField label="Category">
          <select value={expForm.serviceCategory} onChange={e => setExpForm({ ...expForm, serviceCategory: e.target.value, title: '' })} style={selectStyle}>
            {SC_EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </FormField>
        <FormField label="Title / Note (optional)">
          <input value={expForm.title} onChange={e => setExpForm({ ...expForm, title: e.target.value })} style={inputStyle} placeholder={SC_EXPENSE_CATEGORIES.find(c => c.value === expForm.serviceCategory)?.label} />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="Amount (৳)"><input type="number" value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} style={inputStyle} placeholder="0" /></FormField>
          <FormField label="Date"><input type="date" value={expForm.date} onChange={e => setExpForm({ ...expForm, date: e.target.value })} style={inputStyle} /></FormField>
        </div>
        <FormField label="Description (optional)"><input value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} style={inputStyle} /></FormField>
        {expError && <p style={{ color: '#dc2626', fontSize: 13 }}>{expError}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setShowAddExp(false)}>Cancel</Button>
          <Button onClick={submitExpense} disabled={savingExp || !expForm.amount}>{savingExp ? 'Saving...' : 'Log Expense'}</Button>
        </div>
      </Modal>

      {/* Add for Month Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Initiate Service Charge Bills">
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
                    <td style={{ padding: '7px 12px', fontSize: '13px', fontWeight: 600, textAlign: 'right', borderTop: '1px solid var(--border)' }}>
                      {formatCurrency(p.rate)}
                      {p.isCustom && <span style={{ display: 'block', fontSize: '10px', fontWeight: 500, color: '#166534' }}>custom rate</span>}
                    </td>
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
