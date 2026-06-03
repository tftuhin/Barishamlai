'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, PageHeader, Button } from '@/components/ui'
import { formatCurrency, getMonthName } from '@/lib/utils'

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ val: i + 1, label: getMonthName(i + 1) }))

type MonthlySetup = {
  waterBillTotal: number | null
  waterOccupied: number | null
  waterBillsGenerated: boolean
}

export function WaterClient({ units, waterBills, waterExpenses, fundBalance, monthlySetup, currentMonth, currentYear, isReadOnly }: {
  units: any[]
  waterBills: any[]
  waterExpenses: any[]
  fundBalance: any | null
  monthlySetup: MonthlySetup | null
  currentMonth: number
  currentYear: number
  isReadOnly?: boolean
}) {
  const router = useRouter()

  const billYears = Array.from(new Set(waterBills.map((b: any) => b.year as number))).sort()
  const yearOptions = Array.from(new Set([...billYears, currentYear, currentYear + 1])).sort()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, year: selectedYear }))

  const occupiedUnits = units.filter(u => u.occupancyType !== 'VACANT' && u.occupancyType !== 'MERGED')

  // Monthly setup popup state
  const [setup, setSetup] = useState<MonthlySetup>(
    monthlySetup ?? { waterBillTotal: null, waterOccupied: null, waterBillsGenerated: false }
  )
  const needsSetup = !isReadOnly && (!setup.waterBillTotal || !setup.waterOccupied)
  const [showSetup, setShowSetup] = useState(needsSetup)
  const [setupForm, setSetupForm] = useState({
    waterBillTotal: setup.waterBillTotal ? String(setup.waterBillTotal) : '',
    waterOccupied: setup.waterOccupied ? String(setup.waterOccupied) : String(occupiedUnits.length),
  })
  const [savingSetup, setSavingSetup] = useState(false)
  const [setupError, setSetupError] = useState('')

  async function saveSetup() {
    if (!setupForm.waterBillTotal || !setupForm.waterOccupied) {
      setSetupError('Both fields are required')
      return
    }
    setSavingSetup(true); setSetupError('')
    const res = await fetch('/api/monthly-setup', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        month: currentMonth,
        year: currentYear,
        waterBillTotal: Number(setupForm.waterBillTotal),
        waterOccupied: Number(setupForm.waterOccupied),
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setSetup(data)
      setShowSetup(false)
    } else {
      setSetupError('Failed to save. Try again.')
    }
    setSavingSetup(false)
  }

  // Bill generation state
  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult] = useState<{ created: number; skipped: number } | null>(null)
  const [genDueDate, setGenDueDate] = useState('')

  async function generateBills() {
    if (!genDueDate) return alert('Please set a due date')
    if (!setup.waterBillTotal || !setup.waterOccupied) return alert('Monthly water setup not complete')
    setGenerating(true); setGenResult(null)

    const perUnit = Math.round(setup.waterBillTotal / setup.waterOccupied)
    const bills = occupiedUnits.map(u => ({
      unitId: u.id,
      type: 'WATER',
      amount: perUnit,
      month: currentMonth,
      year: currentYear,
      dueDate: genDueDate,
    }))

    const res = await fetch('/api/bills/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bills }),
    })
    const data = await res.json()
    setGenResult(data)
    if (data.created > 0) {
      // Mark bills as generated in monthly setup
      await fetch('/api/monthly-setup', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: currentMonth, year: currentYear, waterBillsGenerated: true }),
      })
      setSetup(s => ({ ...s, waterBillsGenerated: true }))
      router.refresh()
    }
    setGenerating(false)
  }

  function getBill(unitId: string, month: number, year: number) {
    return waterBills.find(b => b.unitId === unitId && b.month === month && b.year === year) ?? null
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

  const totalPaid     = waterBills.filter(b => b.status === 'PAID').reduce((s, b) => s + b.amount, 0)
  const totalDue      = waterBills.filter(b => b.status !== 'PAID').reduce((s, b) => s + b.amount, 0)
  const totalExpenses = waterExpenses.reduce((s, e) => s + e.amount, 0)
  const opening       = fundBalance?.amount ?? 0
  const currentBalance = opening + totalPaid - totalExpenses

  // Expense modal
  const [showAddExp, setShowAddExp] = useState(false)
  const [savingExp, setSavingExp]   = useState(false)
  const [expError, setExpError]     = useState('')
  const now = new Date()
  const [expForm, setExpForm] = useState({
    title: '',
    amount: '',
    date: now.toISOString().split('T')[0],
    description: '',
    month: String(currentMonth),
    year: String(currentYear),
  })

  async function submitExpense() {
    setExpError(''); setSavingExp(true)
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: expForm.title || 'WASA Water Bill Payment',
        amount: Number(expForm.amount),
        category: 'UTILITIES',
        serviceCategory: 'WATER_BILL_PAYMENT',
        incomeSource: 'WATER',
        date: expForm.date,
        description: expForm.description,
        month: Number(expForm.month),
        year: Number(expForm.year),
      }),
    })
    if (res.ok) {
      setShowAddExp(false)
      router.refresh()
    } else {
      const d = await res.json()
      setExpError(d.error || 'Failed')
    }
    setSavingExp(false)
  }

  async function deleteExpense(id: string) {
    if (!confirm('Delete this expense?')) return
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }

  const perUnitAmount = setup.waterBillTotal && setup.waterOccupied
    ? Math.round(setup.waterBillTotal / setup.waterOccupied)
    : null

  return (
    <div className="page-content" style={{ padding: '2rem 2.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      <PageHeader
        title="Water Bills"
        subtitle="WASA water bill distributed equally among occupied flats"
        action={!isReadOnly ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => { setSetupForm({ waterBillTotal: setup.waterBillTotal ? String(setup.waterBillTotal) : '', waterOccupied: setup.waterOccupied ? String(setup.waterOccupied) : String(occupiedUnits.length) }); setShowSetup(true) }}>
              {setup.waterBillTotal ? 'Update Setup' : 'Monthly Setup'}
            </Button>
          </div>
        ) : undefined}
      />

      {/* Monthly Setup Info */}
      {!isReadOnly && (
        <div style={{ background: setup.waterBillTotal ? '#f0fdf4' : '#fffbeb', border: `1px solid ${setup.waterBillTotal ? '#86efac' : '#fde68a'}`, borderRadius: 10, padding: '12px 16px', marginBottom: '1.25rem', fontSize: 13, color: setup.waterBillTotal ? '#15803d' : '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{setup.waterBillTotal ? '✓' : 'ℹ'}</span>
            <span>
              {setup.waterBillTotal
                ? <><strong>{getMonthName(currentMonth)} {currentYear}</strong>: Total WASA bill <strong>{formatCurrency(setup.waterBillTotal)}</strong> ÷ <strong>{setup.waterOccupied} occupied flats</strong> = <strong>{formatCurrency(perUnitAmount ?? 0)}/flat</strong>{setup.waterBillsGenerated ? ' — Bills generated ✓' : ''}</>
                : <>Set the monthly WASA bill total and number of occupied flats to generate water bills for <strong>{getMonthName(currentMonth)} {currentYear}</strong>.</>
              }
            </span>
          </div>
          {setup.waterBillTotal && !setup.waterBillsGenerated && !isReadOnly && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <input
                type="date"
                value={genDueDate}
                onChange={e => setGenDueDate(e.target.value)}
                style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13, background: 'transparent', color: 'var(--text)', outline: 'none' }}
                placeholder="Due date"
              />
              <Button onClick={generateBills} disabled={generating}>
                {generating ? 'Generating…' : `Generate Bills (${occupiedUnits.length} flats)`}
              </Button>
            </div>
          )}
        </div>
      )}

      {genResult && (
        <div style={{ background: genResult.created > 0 ? '#f0fdf4' : '#fef9c3', border: `1px solid ${genResult.created > 0 ? '#86efac' : '#fde68a'}`, borderRadius: 8, padding: '10px 16px', marginBottom: '1rem', fontSize: 13, color: genResult.created > 0 ? '#15803d' : '#a16207' }}>
          ✓ Created {genResult.created} bills, skipped {genResult.skipped} (already exist)
        </div>
      )}

      {/* Summary */}
      <div className="resp-grid-sum" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Water Fund Balance', val: formatCurrency(currentBalance), color: currentBalance >= 0 ? '#15803d' : '#dc2626' },
          { label: 'Collected',          val: formatCurrency(totalPaid),      color: '#15803d' },
          { label: 'Outstanding',        val: formatCurrency(totalDue),       color: '#dc2626' },
          { label: 'WASA Payments',      val: formatCurrency(totalExpenses),  color: '#d97706' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '1rem 1.25rem' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 4px' }}>{s.label}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 600, color: s.color, margin: 0 }}>{s.val}</p>
          </Card>
        ))}
      </div>

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

      {/* Matrix View */}
      <div style={{ display: 'flex', gap: 16, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { color: '#dcfce7', border: '#86efac', label: 'Paid' },
          { color: '#fee2e2', border: '#fca5a5', label: 'Due / Overdue' },
          { color: '#f1f5f9', border: '#cbd5e1', label: 'No bill' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: l.color, border: `1px solid ${l.border}` }} />
            {l.label}
          </div>
        ))}
      </div>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr style={{ background: 'var(--surface-subtle)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', position: 'sticky', left: 0, background: 'var(--surface-subtle)', zIndex: 1, minWidth: 80 }}>Unit</th>
                {months.map(({ month, year }) => (
                  <th key={`${year}-${month}`} style={{ padding: '10px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', minWidth: 90, whiteSpace: 'nowrap' }}>
                    {getMonthName(month).slice(0, 3)} {String(year).slice(2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {units.map((unit, i) => (
                <tr key={unit.id} style={{ background: i % 2 === 0 ? '#fff' : 'var(--surface-subtle)' }}>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: 'var(--brand)', borderBottom: '1px solid var(--border)', position: 'sticky', left: 0, background: i % 2 === 0 ? '#fff' : 'var(--surface-subtle)', zIndex: 1, whiteSpace: 'nowrap' }}>
                    {unit.number}
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>Floor {unit.floor}</div>
                    {(unit.occupancyType === 'VACANT' || unit.occupancyType === 'MERGED') && (
                      <div style={{ fontSize: 10, color: '#d97706', fontWeight: 500 }}>{unit.occupancyType}</div>
                    )}
                  </td>
                  {months.map(({ month, year }) => {
                    const bill = getBill(unit.id, month, year)
                    if (!bill) return (
                      <td key={`${year}-${month}`} style={{ padding: 8, textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</div>
                      </td>
                    )
                    const isPaid = bill.status === 'PAID'
                    return (
                      <td key={`${year}-${month}`} style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ borderRadius: 8, padding: '6px 4px', background: isPaid ? '#dcfce7' : '#fee2e2', border: `1px solid ${isPaid ? '#86efac' : '#fca5a5'}` }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: isPaid ? '#15803d' : '#dc2626' }}>{formatCurrency(bill.amount)}</div>
                          <div style={{ fontSize: 10, color: isPaid ? '#166534' : '#991b1b', marginTop: 1, fontWeight: 500 }}>
                            {isPaid ? 'PAID' : bill.status}
                          </div>
                          {!isReadOnly && (
                            <>
                              {!isPaid && (
                                <button onClick={() => markPaid(bill.id)} style={{ marginTop: 3, padding: '1px 5px', fontSize: '9px', fontWeight: 600, borderRadius: 3, border: 'none', background: '#15803d', color: '#fff', cursor: 'pointer', display: 'block', width: '100%' }} title="Mark as paid">✓ Paid</button>
                              )}
                              {isPaid && (
                                <button onClick={() => revertBill(bill.id)} style={{ marginTop: 3, padding: '1px 5px', fontSize: '9px', fontWeight: 600, borderRadius: 3, border: '1px solid #166534', background: 'transparent', color: '#166534', cursor: 'pointer', display: 'block', width: '100%' }} title="Mark as due">→ Due</button>
                              )}
                              <button onClick={() => deleteBill(bill.id)} style={{ marginTop: 3, background: 'none', border: 'none', cursor: 'pointer', color: isPaid ? '#166534' : '#991b1b', opacity: 0.5, padding: '0 2px', fontSize: 10, lineHeight: 1 }} title="Delete bill">✕</button>
                            </>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
              {units.length === 0 && (
                <tr><td colSpan={months.length + 1} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No units found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* WASA Expenses */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--brand)', margin: 0 }}>WASA Payments</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>Expenses deducted from the water fund</p>
          </div>
          {!isReadOnly && <Button onClick={() => setShowAddExp(true)}>+ Add Payment</Button>}
        </div>
        <Card>
          {waterExpenses.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No WASA payments logged yet.</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Description</th><th>Month</th><th>Date</th><th>Amount</th>{!isReadOnly && <th></th>}</tr></thead>
              <tbody>
                {waterExpenses.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 500 }}>{e.title}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{getMonthName(e.month)} {e.year}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ fontWeight: 600, color: '#dc2626' }}>{formatCurrency(e.amount)}</td>
                    {!isReadOnly && (
                      <td>
                        <button onClick={() => deleteExpense(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 4 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Monthly Setup Modal */}
      {showSetup && !isReadOnly && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 440, boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0284c7,#0369a1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="#fff"/></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>Water Bill Setup — {getMonthName(currentMonth)} {currentYear}</h3>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Set the WASA total and occupied flat count to generate bills</p>
              </div>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Total WASA Bill (৳)</label>
                <input
                  type="number"
                  value={setupForm.waterBillTotal}
                  onChange={e => setSetupForm(f => ({ ...f, waterBillTotal: e.target.value }))}
                  style={inputSt}
                  placeholder="e.g. 5000"
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Occupied Flats</label>
                <input
                  type="number"
                  value={setupForm.waterOccupied}
                  onChange={e => setSetupForm(f => ({ ...f, waterOccupied: e.target.value }))}
                  style={inputSt}
                  placeholder={String(occupiedUnits.length)}
                />
              </div>
            </div>
            {setupForm.waterBillTotal && setupForm.waterOccupied && Number(setupForm.waterOccupied) > 0 && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem', fontSize: 13, color: '#15803d' }}>
                Per flat: <strong>{formatCurrency(Math.round(Number(setupForm.waterBillTotal) / Number(setupForm.waterOccupied)))}</strong>
              </div>
            )}
            {setupError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: '1rem' }}>{setupError}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              {setup.waterBillTotal && (
                <button onClick={() => setShowSetup(false)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
              )}
              <button
                onClick={saveSetup}
                disabled={savingSetup || !setupForm.waterBillTotal || !setupForm.waterOccupied}
                style={{ padding: '8px 22px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#0284c7,#0369a1)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (savingSetup || !setupForm.waterBillTotal || !setupForm.waterOccupied) ? 0.6 : 1 }}
              >
                {savingSetup ? 'Saving…' : 'Save Setup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add WASA Expense Modal */}
      {showAddExp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 420, boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>Log WASA Payment</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Title / Note</label>
              <input value={expForm.title} onChange={e => setExpForm({ ...expForm, title: e.target.value })} style={inputSt} placeholder="WASA Water Bill Payment" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Amount (৳)</label>
                <input type="number" value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} style={inputSt} placeholder="0" />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Date</label>
                <input type="date" value={expForm.date} onChange={e => setExpForm({ ...expForm, date: e.target.value })} style={inputSt} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Month</label>
                <select value={expForm.month} onChange={e => setExpForm({ ...expForm, month: e.target.value })} style={{ ...inputSt, padding: '8px 10px' }}>
                  {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Year</label>
                <input type="number" value={expForm.year} onChange={e => setExpForm({ ...expForm, year: e.target.value })} style={inputSt} min="2020" max="2035" />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Description (optional)</label>
              <input value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} style={inputSt} />
            </div>
            {expError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: '1rem' }}>{expError}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddExp(false)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitExpense} disabled={savingExp || !expForm.amount} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#1D9E75,#085041)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (!expForm.amount || savingExp) ? 0.6 : 1 }}>
                {savingExp ? 'Saving…' : 'Log Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
