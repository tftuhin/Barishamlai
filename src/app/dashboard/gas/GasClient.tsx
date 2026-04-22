'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, PageHeader, Button } from '@/components/ui'
import { formatCurrency, getMonthName } from '@/lib/utils'

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

type BatchRow = {
  unitId: string
  unitNumber: string
  floor: number
  prevReading: string
  currentReading: string
  amount: string
  skip: boolean
}

export function GasClient({ units, gasBills, gasExpenses, fundBalance, gasUnitRate, currentMonth, currentYear, isReadOnly }: {
  units: any[]; gasBills: any[]; gasExpenses: any[]; fundBalance: any | null
  gasUnitRate: number; currentMonth: number; currentYear: number; isReadOnly?: boolean
}) {
  const router = useRouter()
  const months = getLastMonths(12)

  // Matrix view state
  const [view, setView] = useState<'matrix' | 'batch'>('matrix')

  // Batch state
  const [batchMonth, setBatchMonth] = useState(String(currentMonth))
  const [batchYear, setBatchYear] = useState(String(currentYear))
  const [batchDueDate, setBatchDueDate] = useState('')
  const [batchRows, setBatchRows] = useState<BatchRow[]>([])
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null)

  function getBill(unitId: string, month: number, year: number) {
    return gasBills.find(b => b.unitId === unitId && b.month === month && b.year === year) ?? null
  }

  // Find most recent gas bill before target month for a unit
  function getPrevReading(unitId: string, targetMonth: number, targetYear: number): number | null {
    const prev = gasBills
      .filter(b => b.unitId === unitId && (b.year < targetYear || (b.year === targetYear && b.month < targetMonth)) && b.meterReading != null)
      .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)
    return prev[0]?.meterReading ?? null
  }

  const initBatchRows = useCallback((month: number, year: number) => {
    setBatchRows(units.map(u => {
      const pr = getPrevReading(u.id, month, year)
      return {
        unitId: u.id,
        unitNumber: u.number,
        floor: u.floor,
        prevReading: pr !== null ? String(pr) : '',
        currentReading: '',
        amount: '',
        skip: false,
      }
    }))
  }, [units, gasBills])

  // When batch view opens or month/year changes, reinit rows
  useEffect(() => {
    if (view === 'batch') initBatchRows(Number(batchMonth), Number(batchYear))
  }, [view, batchMonth, batchYear])

  function updateRow(idx: number, field: keyof BatchRow, value: string | boolean) {
    setBatchRows(rows => {
      const next = [...rows]
      next[idx] = { ...next[idx], [field]: value }
      // Auto-calc amount when readings change
      if (field === 'currentReading' || field === 'prevReading') {
        const row = next[idx]
        const prev = parseFloat(field === 'prevReading' ? value as string : row.prevReading)
        const curr = parseFloat(field === 'currentReading' ? value as string : row.currentReading)
        if (!isNaN(prev) && !isNaN(curr) && curr > prev && gasUnitRate > 0) {
          next[idx].amount = String(Math.round((curr - prev) * gasUnitRate))
        }
      }
      return next
    })
  }

  async function submitBatch() {
    if (!batchDueDate) return alert('Please set a due date')
    setSaving(true); setResult(null)
    const bills = batchRows
      .filter(r => !r.skip && r.currentReading && r.amount)
      .map(r => ({
        unitId: r.unitId,
        type: 'GAS',
        amount: Number(r.amount),
        month: Number(batchMonth),
        year: Number(batchYear),
        dueDate: batchDueDate,
        meterReading: Number(r.currentReading),
      }))
    const res = await fetch('/api/bills/batch', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bills }),
    })
    const data = await res.json()
    setResult(data)
    setSaving(false)
    if (data.created > 0) router.refresh()
  }

  const totalPaid = gasBills.filter(b => b.status === 'PAID').reduce((s, b) => s + b.amount, 0)
  const totalDue  = gasBills.filter(b => b.status !== 'PAID').reduce((s, b) => s + b.amount, 0)
  const totalGasExpenses = gasExpenses.reduce((s, e) => s + e.amount, 0)
  const opening = fundBalance?.amount ?? 0
  const currentBalance = opening + totalPaid - totalGasExpenses

  const [showAddExp, setShowAddExp] = useState(false)
  const [savingExp, setSavingExp] = useState(false)
  const [expError, setExpError] = useState('')
  const expNow = new Date()
  const [expForm, setExpForm] = useState({ title: '', amount: '', date: expNow.toISOString().split('T')[0], description: '', month: String(currentMonth), year: String(currentYear) })

  async function submitGasExpense() {
    setExpError(''); setSavingExp(true)
    const res = await fetch('/api/expenses', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: expForm.title || 'Gas Cylinder Purchase',
        amount: Number(expForm.amount),
        category: 'OTHER',
        serviceCategory: 'GAS_CYLINDER',
        incomeSource: 'GAS',
        date: expForm.date,
        description: expForm.description,
        month: Number(expForm.month),
        year: Number(expForm.year),
      }),
    })
    if (res.ok) { setShowAddExp(false); router.refresh() }
    else { const d = await res.json(); setExpError(d.error || 'Failed') }
    setSavingExp(false)
  }

  async function deleteGasExpense(id: string) {
    if (!confirm('Delete this expense?')) return
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const inputSt: React.CSSProperties = { width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1.5px solid var(--border)', fontSize: '13px', background: '#fff', outline: 'none', boxSizing: 'border-box' }
  const readonlySt: React.CSSProperties = { ...inputSt, background: '#f1f5f9', color: 'var(--text-muted)', cursor: 'not-allowed' }

  return (
    <div className="page-content" style={{ padding: '2rem 2.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      <PageHeader
        title="Gas Bills"
        subtitle="Monthly gas meter readings and payment status per unit"
        action={!isReadOnly ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            {view === 'batch' && <Button variant="secondary" onClick={() => setView('matrix')}>← Back to Matrix</Button>}
            {view === 'matrix' && <Button onClick={() => setView('batch')}>Initiate Gas Bills</Button>}
          </div>
        ) : undefined}
      />

      {/* Info banner for gas bill initiation requirement */}
      {view === 'matrix' && !isReadOnly && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', marginBottom: '1.25rem', fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ</span>
          <span>
            To generate gas bills, click <strong>Initiate Bills</strong> and enter each unit&apos;s closing meter reading.
            Gas bill amounts are auto-calculated as: <strong>(current reading − previous reading) × ৳{gasUnitRate}/unit</strong>.
            {gasUnitRate === 0 && <span style={{ color: '#dc2626', marginLeft: 6 }}> ⚠ Gas unit rate is not configured. <a href="/dashboard/settings" style={{ color: '#dc2626', fontWeight: 600 }}>Set it in Settings →</a></span>}
          </span>
        </div>
      )}

      {/* Summary */}
      <div className="resp-grid-sum" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Gas Fund Balance', val: formatCurrency(currentBalance), color: currentBalance >= 0 ? '#15803d' : '#dc2626' },
          { label: 'Collected', val: formatCurrency(totalPaid), color: '#15803d' },
          { label: 'Outstanding', val: formatCurrency(totalDue), color: '#dc2626' },
          { label: 'Cylinder Purchases', val: formatCurrency(totalGasExpenses), color: '#d97706' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '1rem 1.25rem' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 4px' }}>{s.label}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 600, color: s.color, margin: 0 }}>{s.val}</p>
          </Card>
        ))}
      </div>

      {/* ── BATCH ENTRY VIEW ── */}
      {view === 'batch' && (
        <Card>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brand)', margin: 0 }}>Initiate Gas Bills — Meter Readings</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                Enter current meter reading for each unit. Previous (closing) reading is auto-filled. Rate: ৳{gasUnitRate}/unit
                {gasUnitRate === 0 && <span style={{ color: '#d97706', marginLeft: '8px' }}>⚠ Set gas rate in Settings first</span>}
              </p>
            </div>
            {/* Month/Year + Due Date selectors */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select value={batchMonth} onChange={e => setBatchMonth(e.target.value)} style={{ ...inputSt, width: 'auto' }}>
                {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
              </select>
              <input type="number" value={batchYear} onChange={e => setBatchYear(e.target.value)} style={{ ...inputSt, width: '80px' }} min="2020" max="2035" />
              <input type="date" value={batchDueDate} onChange={e => setBatchDueDate(e.target.value)} style={{ ...inputSt, width: 'auto' }} placeholder="Due date" />
            </div>
          </div>

          {result && (
            <div style={{ padding: '10px 1.5rem', background: result.created > 0 ? '#f0fdf4' : '#fef9c3', borderBottom: '1px solid var(--border)', fontSize: '13px', color: result.created > 0 ? '#15803d' : '#a16207' }}>
              ✓ Created {result.created} bills, skipped {result.skipped} (already exist)
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'var(--surface-subtle)' }}>
                  {['Unit', 'Prev Reading', 'Current Reading', 'Usage', 'Amount (৳)', 'Skip'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batchRows.map((row, i) => {
                  const existing = getBill(row.unitId, Number(batchMonth), Number(batchYear))
                  const usage = row.prevReading && row.currentReading
                    ? Math.max(0, Number(row.currentReading) - Number(row.prevReading))
                    : null
                  return (
                    <tr key={row.unitId} style={{ background: row.skip || existing ? '#f8fafc' : i % 2 === 0 ? '#fff' : 'var(--surface-subtle)', opacity: row.skip ? 0.45 : 1 }}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--brand)', fontSize: '13px' }}>{row.unitNumber}</span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Floor {row.floor}</div>
                        {existing && <div style={{ fontSize: '10px', color: '#d97706', marginTop: '2px' }}>⚠ Bill exists</div>}
                      </td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                        <input
                          type="number"
                          value={row.prevReading}
                          onChange={e => updateRow(i, 'prevReading', e.target.value)}
                          style={inputSt}
                          placeholder="—"
                          disabled={row.skip || !!existing}
                        />
                      </td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                        <input
                          type="number"
                          value={row.currentReading}
                          onChange={e => updateRow(i, 'currentReading', e.target.value)}
                          style={row.skip || existing ? readonlySt : inputSt}
                          placeholder="Enter reading"
                          disabled={row.skip || !!existing}
                        />
                      </td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {usage !== null ? `${usage.toFixed(1)} units` : '—'}
                      </td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                        <input
                          type="number"
                          value={row.amount}
                          onChange={e => updateRow(i, 'amount', e.target.value)}
                          style={row.skip || existing ? readonlySt : inputSt}
                          placeholder="0"
                          disabled={row.skip || !!existing}
                        />
                      </td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                        {!existing && (
                          <input type="checkbox" checked={row.skip} onChange={e => updateRow(i, 'skip', e.target.checked)} />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border)' }}>
            <Button variant="secondary" onClick={() => { setView('matrix'); setResult(null) }}>← Back to Matrix</Button>
            <Button onClick={submitBatch} disabled={saving}>
              {saving ? 'Saving...' : `Submit Batch (${batchRows.filter(r => !r.skip && r.currentReading && r.amount).length} units)`}
            </Button>
          </div>
        </Card>
      )}

      {/* ── MATRIX VIEW ── */}
      {view === 'matrix' && (
        <>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[
              { color: '#dcfce7', border: '#86efac', label: 'Paid' },
              { color: '#fee2e2', border: '#fca5a5', label: 'Due / Overdue' },
              { color: '#f1f5f9', border: '#cbd5e1', label: 'No bill' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: l.color, border: `1px solid ${l.border}` }} />
                {l.label}
              </div>
            ))}
          </div>

          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-subtle)' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', position: 'sticky', left: 0, background: 'var(--surface-subtle)', zIndex: 1, minWidth: '80px' }}>Unit</th>
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
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>Floor {unit.floor}</div>
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
                              {bill.meterReading != null && (
                                <div style={{ fontSize: '10px', color: isPaid ? '#15803d' : '#dc2626', opacity: 0.75, marginTop: '2px' }}>📟 {bill.meterReading}</div>
                              )}
                              <div style={{ fontSize: '10px', color: isPaid ? '#166534' : '#991b1b', marginTop: '1px', fontWeight: 500 }}>
                                {isPaid ? 'PAID' : bill.status}
                              </div>
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
        </>
      )}

      {/* Gas Cylinder Expenses */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--brand)', margin: 0 }}>Gas Cylinder Purchases</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>Expenses deducted from the gas fund</p>
          </div>
          {!isReadOnly && <Button onClick={() => setShowAddExp(true)}>+ Add Purchase</Button>}
        </div>
        <Card>
          {gasExpenses.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No gas cylinder purchases logged yet.</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Description</th><th>Date</th><th>Amount</th>{!isReadOnly && <th></th>}</tr></thead>
              <tbody>
                {gasExpenses.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 500 }}>{e.title}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ fontWeight: 600, color: '#dc2626' }}>{formatCurrency(e.amount)}</td>
                    {!isReadOnly && (
                      <td><button onClick={() => deleteGasExpense(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: 4 }}>
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

      {/* Add Gas Expense Modal */}
      {showAddExp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 420, boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>Log Gas Cylinder Purchase</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Title / Note</label>
              <input value={expForm.title} onChange={e => setExpForm({ ...expForm, title: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} placeholder="Gas Cylinder Purchase" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Amount (৳)</label>
                <input type="number" value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} placeholder="0" />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Date</label>
                <input type="date" value={expForm.date} onChange={e => setExpForm({ ...expForm, date: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Description (optional)</label>
              <input value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {expError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: '1rem' }}>{expError}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddExp(false)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitGasExpense} disabled={savingExp || !expForm.amount} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#1D9E75,#085041)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (!expForm.amount || savingExp) ? 0.6 : 1 }}>
                {savingExp ? 'Saving...' : 'Log Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
