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

export function RentClient({ units, rentBills, featureRent, currentMonth, currentYear, role, userId }: {
  units: any[]
  rentBills: any[]
  featureRent: boolean
  currentMonth: number
  currentYear: number
  role: string
  userId: string
}) {
  const router  = useRouter()
  const months  = getLastMonths(12)
  const isAdmin = role === 'ADMIN'
  const canPay  = role === 'ADMIN' || role === 'OWNER'

  const [loading, setLoading]           = useState<string | null>(null)
  const [showInitiate, setShowInitiate] = useState(false)
  const [initMonth, setInitMonth]       = useState(String(currentMonth))
  const [initYear, setInitYear]         = useState(String(currentYear))
  const [initDueDate, setInitDueDate]   = useState('')
  const [initiating, setInitiating]     = useState(false)
  const [initResult, setInitResult]     = useState<{ created: number; skipped: number } | null>(null)
  const [initError, setInitError]       = useState('')

  function getBill(unitId: string, month: number, year: number) {
    return rentBills.find(b => b.unitId === unitId && b.month === month && b.year === year) ?? null
  }

  // Billable units (occupied, not owner-occupied, with monthlyRent > 0)
  const billableUnits = units.filter(u => u.status === 'OCCUPIED' && !u.isOwnerOccupied && u.monthlyRent > 0)

  const totalCollected  = rentBills.filter(b => b.status === 'PAID').reduce((s, b) => s + b.amount, 0)
  const totalOutstanding = rentBills.filter(b => b.status !== 'PAID').reduce((s, b) => s + b.amount, 0)
  const totalUnits      = billableUnits.length

  // Bills for the current month
  const thisMonthBills = rentBills.filter(b => b.month === currentMonth && b.year === currentYear)
  const thisMonthPaid  = thisMonthBills.filter(b => b.status === 'PAID').length

  async function markPaid(billId: string) {
    setLoading(billId)
    await fetch(`/api/bills/${billId}/pay`, { method: 'PATCH' })
    router.refresh()
    setLoading(null)
  }

  async function initiateRentBills() {
    if (!initDueDate) { setInitError('Please select a due date'); return }
    setInitiating(true); setInitError(''); setInitResult(null)
    const res = await fetch('/api/bills/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'RENT', month: Number(initMonth), year: Number(initYear), dueDate: initDueDate }),
    })
    const data = await res.json()
    if (res.ok) {
      setInitResult(data)
      if (data.created > 0) router.refresh()
    } else {
      setInitError(data.error || 'Failed to initiate bills')
    }
    setInitiating(false)
  }

  const inputSt: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--text)', fontSize: 14, outline: 'none',
    width: '100%', boxSizing: 'border-box',
  }

  if (!featureRent) {
    return (
      <div className="page-content" style={{ padding: '2rem 2.5rem' }}>
        <PageHeader title="Rent" subtitle="Monthly rent billing" />
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          Rent feature is disabled. Enable it in Settings.
        </div>
      </div>
    )
  }

  return (
    <div className="page-content" style={{ padding: '2rem 2.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      <PageHeader
        title="Rent"
        subtitle="Monthly rent status per unit — auto-generated on the 1st of each month"
        action={isAdmin ? (
          <Button onClick={() => { setShowInitiate(true); setInitResult(null); setInitError('') }}>
            Initiate Rent Bills
          </Button>
        ) : undefined}
      />

      {/* Summary cards */}
      <div className="resp-grid-sum" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Billable Units',          val: String(totalUnits),             color: 'var(--brand)' },
          { label: 'This Month Paid',          val: `${thisMonthPaid} / ${thisMonthBills.length}`, color: '#15803d' },
          { label: 'Total Collected (all time)', val: formatCurrency(totalCollected),  color: '#15803d' },
          { label: 'Total Outstanding',        val: formatCurrency(totalOutstanding), color: '#dc2626' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '1rem 1.25rem' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 4px' }}>{s.label}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 600, color: s.color, margin: 0 }}>{s.val}</p>
          </Card>
        ))}
      </div>

      {/* Legend */}
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

      {/* Matrix */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr style={{ background: 'var(--surface-subtle)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', position: 'sticky', left: 0, background: 'var(--surface-subtle)', zIndex: 1, minWidth: 120 }}>Unit</th>
                {months.map(({ month, year }) => (
                  <th key={`${year}-${month}`} style={{ padding: '10px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', minWidth: 90, whiteSpace: 'nowrap' }}>
                    {getMonthName(month).slice(0, 3)} {String(year).slice(2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {units.map((unit, i) => {
                // OWNER: can only pay their own unit's rent
                const canPayThis = isAdmin || (role === 'OWNER' && unit.ownerId === userId)
                const isRentable = unit.status === 'OCCUPIED' && !unit.isOwnerOccupied && unit.monthlyRent > 0

                return (
                  <tr key={unit.id} style={{ background: i % 2 === 0 ? '#fff' : 'var(--surface-subtle)' }}>
                    <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: 'var(--brand)', borderBottom: '1px solid var(--border)', position: 'sticky', left: 0, background: i % 2 === 0 ? '#fff' : 'var(--surface-subtle)', zIndex: 1, whiteSpace: 'nowrap' }}>
                      {unit.number}
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>Floor {unit.floor}</div>
                      <div style={{ fontSize: 10, color: '#15803d', fontWeight: 500 }}>৳{unit.monthlyRent}/mo</div>
                      {unit.tenant && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{unit.tenant.name}</div>}
                    </td>
                    {months.map(({ month, year }) => {
                      const bill = getBill(unit.id, month, year)

                      if (!isRentable) {
                        return (
                          <td key={`${year}-${month}`} style={{ padding: 8, textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                              {unit.isOwnerOccupied ? 'owner' : unit.status === 'VACANT' ? 'vacant' : '—'}
                            </div>
                          </td>
                        )
                      }

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
                            {!isPaid && canPayThis && (
                              <button
                                onClick={() => markPaid(bill.id)}
                                disabled={loading === bill.id}
                                style={{ marginTop: 4, padding: '2px 8px', fontSize: 10, fontWeight: 600, borderRadius: 4, border: 'none', background: '#15803d', color: '#fff', cursor: 'pointer', opacity: loading === bill.id ? 0.6 : 1 }}
                              >
                                {loading === bill.id ? '…' : 'Mark Paid'}
                              </button>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
              {units.length === 0 && (
                <tr><td colSpan={months.length + 1} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No units found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Initiate Bills Modal */}
      {showInitiate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 440, boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>Initiate Rent Bills</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 1.25rem' }}>
              Creates rent bills for all occupied units ({billableUnits.length} units) for the selected month.
              Rent bills are also auto-generated on the 1st of each month.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Month</label>
                <select value={initMonth} onChange={e => setInitMonth(e.target.value)} style={inputSt}>
                  {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Year</label>
                <input type="number" value={initYear} onChange={e => setInitYear(e.target.value)} style={inputSt} min="2020" max="2035" />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Due Date</label>
              <input type="date" value={initDueDate} onChange={e => setInitDueDate(e.target.value)} style={inputSt} />
            </div>

            {/* Preview */}
            <div style={{ background: 'var(--surface-subtle)', borderRadius: 8, padding: '10px 14px', marginBottom: '1.25rem', fontSize: 13 }}>
              <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Preview</div>
              {billableUnits.slice(0, 5).map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: 'var(--text-secondary)' }}>
                  <span>Unit {u.number}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{formatCurrency(u.monthlyRent)}</span>
                </div>
              ))}
              {billableUnits.length > 5 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>…and {billableUnits.length - 5} more units</div>
              )}
            </div>

            {initError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: '1rem' }}>{initError}</p>}
            {initResult && (
              <p style={{ color: '#15803d', fontSize: 13, marginBottom: '1rem' }}>
                ✓ Created {initResult.created} bills, skipped {initResult.skipped} (already exist)
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowInitiate(false)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={initiateRentBills}
                disabled={initiating}
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#1D9E75,#085041)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: initiating ? 0.6 : 1 }}
              >
                {initiating ? 'Creating…' : `Initiate ${billableUnits.length} Bills`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
