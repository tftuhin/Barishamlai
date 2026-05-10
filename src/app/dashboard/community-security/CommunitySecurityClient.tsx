'use client'
import { useState } from 'react'
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

export function CommunitySecurityClient({ units, csBills, csExpenses, fundBalance, csRate, currentMonth, currentYear, isReadOnly }: {
  units: any[]
  csBills: any[]
  csExpenses: any[]
  fundBalance: any | null
  csRate: number
  currentMonth: number
  currentYear: number
  isReadOnly?: boolean
}) {
  const router = useRouter()
  const months = getLastMonths(12)

  const occupiedUnits = units.filter(u => u.occupancyType !== 'VACANT' && u.occupancyType !== 'MERGED')

  function getBill(unitId: string, month: number, year: number) {
    return csBills.find(b => b.unitId === unitId && b.month === month && b.year === year) ?? null
  }

  // Bill generation
  const [genMonth, setGenMonth]     = useState(String(currentMonth))
  const [genYear, setGenYear]       = useState(String(currentYear))
  const [genDueDate, setGenDueDate] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult]   = useState<{ created: number; skipped: number } | null>(null)
  const [showGen, setShowGen]       = useState(false)

  async function generateBills() {
    if (!genDueDate) return alert('Please set a due date')
    if (csRate <= 0) return alert('Community security rate is not configured. Set it in Settings first.')
    setGenerating(true); setGenResult(null)

    const bills = occupiedUnits.map(u => ({
      unitId: u.id,
      type: 'COMMUNITY_SECURITY',
      amount: csRate,
      month: Number(genMonth),
      year: Number(genYear),
      dueDate: genDueDate,
    }))

    const res = await fetch('/api/bills/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bills }),
    })
    const data = await res.json()
    setGenResult(data)
    if (data.created > 0) router.refresh()
    setGenerating(false)
  }

  const totalPaid     = csBills.filter(b => b.status === 'PAID').reduce((s, b) => s + b.amount, 0)
  const totalDue      = csBills.filter(b => b.status !== 'PAID').reduce((s, b) => s + b.amount, 0)
  const totalExpenses = csExpenses.reduce((s, e) => s + e.amount, 0)
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
        title: expForm.title || 'Community Security Payment',
        amount: Number(expForm.amount),
        category: 'SECURITY',
        serviceCategory: 'COMMUNITY_SECURITY_PAYMENT',
        incomeSource: 'COMMUNITY_SECURITY',
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

  return (
    <div className="page-content" style={{ padding: '2rem 2.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      <PageHeader
        title="Community Security"
        subtitle={`Fixed rate of ${formatCurrency(csRate)}/flat per month for occupied units`}
        action={!isReadOnly ? (
          <Button onClick={() => { setShowGen(true); setGenResult(null) }}>Generate Bills</Button>
        ) : undefined}
      />

      {/* Rate warning */}
      {csRate <= 0 && !isReadOnly && (
        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', marginBottom: '1.25rem', fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>⚠</span>
          <span>Community security rate is not configured. <a href="/dashboard/settings" style={{ color: '#dc2626', fontWeight: 600 }}>Set it in Settings →</a></span>
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
          { label: 'CS Fund Balance',     val: formatCurrency(currentBalance), color: currentBalance >= 0 ? '#15803d' : '#dc2626' },
          { label: 'Collected',           val: formatCurrency(totalPaid),      color: '#15803d' },
          { label: 'Outstanding',         val: formatCurrency(totalDue),       color: '#dc2626' },
          { label: 'Security Payments',   val: formatCurrency(totalExpenses),  color: '#d97706' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '1rem 1.25rem' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 4px' }}>{s.label}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 600, color: s.color, margin: 0 }}>{s.val}</p>
          </Card>
        ))}
      </div>

      {/* Matrix */}
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

      {/* Expenses */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--brand)', margin: 0 }}>Security Payments</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>Expenses deducted from the community security fund</p>
          </div>
          {!isReadOnly && <Button onClick={() => setShowAddExp(true)}>+ Add Payment</Button>}
        </div>
        <Card>
          {csExpenses.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No security payments logged yet.</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Description</th><th>Month</th><th>Date</th><th>Amount</th>{!isReadOnly && <th></th>}</tr></thead>
              <tbody>
                {csExpenses.map(e => (
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

      {/* Generate Bills Modal */}
      {showGen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 400, boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>Generate Community Security Bills</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 1.25rem' }}>
              Rate: <strong>{formatCurrency(csRate)}/flat</strong> × <strong>{occupiedUnits.length} occupied flats</strong>
              {csRate > 0 && <span style={{ display: 'block', marginTop: 4, color: '#15803d', fontWeight: 600 }}>Total collection: {formatCurrency(csRate * occupiedUnits.length)}</span>}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Month</label>
                <select value={genMonth} onChange={e => setGenMonth(e.target.value)} style={{ ...inputSt, padding: '8px 10px' }}>
                  {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Year</label>
                <input type="number" value={genYear} onChange={e => setGenYear(e.target.value)} style={inputSt} min="2020" max="2035" />
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Due Date</label>
              <input type="date" value={genDueDate} onChange={e => setGenDueDate(e.target.value)} style={inputSt} />
            </div>
            {genResult && (
              <div style={{ background: genResult.created > 0 ? '#f0fdf4' : '#fef9c3', border: `1px solid ${genResult.created > 0 ? '#86efac' : '#fde68a'}`, borderRadius: 8, padding: '8px 12px', marginBottom: '1rem', fontSize: 13, color: genResult.created > 0 ? '#15803d' : '#a16207' }}>
                ✓ Created {genResult.created}, skipped {genResult.skipped}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowGen(false)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 14, cursor: 'pointer' }}>Close</button>
              <button onClick={generateBills} disabled={generating} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#9333ea,#7c3aed)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: generating ? 0.6 : 1 }}>
                {generating ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 420, boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>Log Security Payment</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Title / Note</label>
              <input value={expForm.title} onChange={e => setExpForm({ ...expForm, title: e.target.value })} style={inputSt} placeholder="Community Security Payment" />
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
