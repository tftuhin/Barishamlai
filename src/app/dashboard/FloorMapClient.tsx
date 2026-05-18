'use client'
import { useState } from 'react'
import { Card, Badge, Modal } from '@/components/ui'
import { formatCurrency, getBillTypeLabel, getMonthName, formatDate } from '@/lib/utils'

type Bill = {
  id: string
  type: string
  amount: number
  month: number
  year: number
  dueDate: string
  status: string
  paidAt: string | null
  note: string | null
}

type UnitData = {
  id: string
  number: string
  floor: number
  area: number | null
  monthlyRent: number
  occupancyType?: string
  mergedWithUnitId?: string | null
  mergedWith?: { id: string; number: string } | null
  owner: { name: string } | null
  tenant: { name: string } | null
  bills: Bill[]
}

export function FloorMapClient({ units }: { units: UnitData[] }) {
  const [selected, setSelected] = useState<UnitData | null>(null)

  const floors = Array.from(new Set(units.map(u => u.floor))).sort((a, b) => a - b)
  const letters = Array.from(new Set(units.map(u => u.number.replace(/^\d+/, '')))).sort()

  const grid: Record<number, Record<string, UnitData>> = {}
  for (const unit of units) {
    const letter = unit.number.replace(/^\d+/, '')
    if (!grid[unit.floor]) grid[unit.floor] = {}
    grid[unit.floor][letter] = unit
  }

  // Build a set of unit IDs that are "absorbed" by an adjacent primary
  // so we can skip their cell and apply colspan to the primary
  const absorbedByAdjacentPrimary = new Set<string>()
  const primaryColspan: Record<string, number> = {} // unitId -> colspan count

  for (const unit of units) {
    if (unit.occupancyType !== 'MERGED' || !unit.mergedWithUnitId) continue
    const primary = units.find(u => u.id === unit.mergedWithUnitId)
    if (!primary || primary.floor !== unit.floor) continue
    const mergedLetter  = unit.number.replace(/^\d+/, '')
    const primaryLetter = primary.number.replace(/^\d+/, '')
    const mi = letters.indexOf(mergedLetter)
    const pi = letters.indexOf(primaryLetter)
    // Adjacent means they're next to each other (either direction)
    if (Math.abs(mi - pi) === 1) {
      absorbedByAdjacentPrimary.add(unit.id)
      primaryColspan[primary.id] = (primaryColspan[primary.id] ?? 1) + 1
    }
  }

  const hasDue = (unit: UnitData) => unit.bills.some(b => b.status === 'PENDING' || b.status === 'OVERDUE')

  return (
    <>
      <Card>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--brand)', margin: 0 }}>Floor Map</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0' }}>Click any flat to view its full transaction history</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10B981', display: 'inline-block', flexShrink: 0 }} />
              All paid
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#EF4444', display: 'inline-block', flexShrink: 0 }} />
              Has dues
            </span>
          </div>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: '6px' }}>
            <thead>
              <tr>
                <th style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left', padding: '4px 10px', letterSpacing: '0.07em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Floor
                </th>
                {letters.map(l => (
                  <th key={l} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', padding: '4px 10px', letterSpacing: '0.07em', textTransform: 'uppercase', minWidth: '76px' }}>
                    Flat {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {floors.map(floor => (
                <tr key={floor}>
                  <td style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', padding: '4px 10px', whiteSpace: 'nowrap' }}>
                    Floor {floor}
                  </td>
                  {letters.map(letter => {
                    const unit = grid[floor]?.[letter]

                    // Skip cells absorbed by an adjacent primary (primary spans their column)
                    if (unit && absorbedByAdjacentPrimary.has(unit.id)) return null

                    if (!unit) {
                      return (
                        <td key={letter} style={{ padding: '4px' }}>
                          <div style={{ height: '40px', borderRadius: '8px', background: 'var(--surface-subtle)', border: '1px dashed var(--border-strong)' }} />
                        </td>
                      )
                    }

                    const isMerged   = unit.occupancyType === 'MERGED'
                    const colspan    = primaryColspan[unit.id] ?? 1
                    const due        = hasDue(unit)

                    // Non-adjacent merged flat: amber cell with "→ X" label
                    if (isMerged && !absorbedByAdjacentPrimary.has(unit.id)) {
                      return (
                        <td key={letter} style={{ padding: '4px' }}>
                          <button
                            onClick={() => setSelected(unit)}
                            style={{
                              width: '100%', height: '40px', borderRadius: '8px', border: '1px dashed #D97706',
                              background: '#FEF9C3', color: '#92400E', fontWeight: 600, fontSize: '11px',
                              cursor: 'pointer', transition: 'filter 0.15s', fontFamily: 'var(--font-body)',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.2,
                            }}
                            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.94)')}
                            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                          >
                            <span>{unit.number}</span>
                            {unit.mergedWith && <span style={{ fontSize: '9px', opacity: 0.8 }}>→ {unit.mergedWith.number}</span>}
                          </button>
                        </td>
                      )
                    }

                    // Primary cell (possibly spanning merged neighbour)
                    return (
                      <td key={letter} colSpan={colspan} style={{ padding: '4px' }}>
                        <button
                          onClick={() => setSelected(unit)}
                          style={{
                            width: '100%', height: '40px', borderRadius: '8px', border: 'none',
                            background: due ? '#EF4444' : '#10B981',
                            color: '#fff', fontWeight: 600, fontSize: '13px', letterSpacing: '0.02em',
                            cursor: 'pointer', transition: 'filter 0.15s', fontFamily: 'var(--font-body)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.88)')}
                          onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                        >
                          {unit.number}
                          {colspan > 1 && <span style={{ fontSize: '10px', opacity: 0.85, fontWeight: 400 }}>+ merged</span>}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Flat ${selected?.number} — Transactions`}
        maxWidth="860px"
      >
        {selected && (
          <div>
            {/* Unit meta */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
              marginBottom: '1.25rem', padding: '12px 14px',
              background: 'var(--surface-subtle)', borderRadius: '8px', border: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '2px' }}>Owner</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{selected.owner?.name ?? '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '2px' }}>Tenant</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{selected.tenant?.name ?? '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '2px' }}>Monthly Rent</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{formatCurrency(selected.monthlyRent)}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '2px' }}>Floor / Area</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>
                  Floor {selected.floor}{selected.area ? ` · ${selected.area} sqft` : ''}
                </div>
              </div>
            </div>

            {/* Bills table */}
            {selected.bills.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '14px' }}>
                No billing records found for this flat.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Paid On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.bills.map(bill => (
                      <tr key={bill.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>{getMonthName(bill.month)} {bill.year}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{getBillTypeLabel(bill.type)}</td>
                        <td style={{ fontWeight: 500 }}>{formatCurrency(bill.amount)}</td>
                        <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(bill.dueDate)}</td>
                        <td><Badge status={bill.status} /></td>
                        <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {bill.paidAt ? formatDate(bill.paidAt) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary totals */}
            {selected.bills.length > 0 && (() => {
              const paid = selected.bills.filter(b => b.status === 'PAID')
              const outstanding = selected.bills.filter(b => b.status !== 'PAID')
              const paidTotal = paid.reduce((s, b) => s + b.amount, 0)
              const dueTotal = outstanding.reduce((s, b) => s + b.amount, 0)
              return (
                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '120px', padding: '10px 14px', borderRadius: '8px', background: '#DCFCE7', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#14532D', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Total Paid</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#14532D' }}>{formatCurrency(paidTotal)}</div>
                    <div style={{ fontSize: '11px', color: '#16A34A', marginTop: '2px' }}>{paid.length} bill{paid.length !== 1 ? 's' : ''}</div>
                  </div>
                  {dueTotal > 0 && (
                    <div style={{ flex: 1, minWidth: '120px', padding: '10px 14px', borderRadius: '8px', background: '#FEE2E2', border: '1px solid #FECACA' }}>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: '#7F1D1D', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Outstanding</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#7F1D1D' }}>{formatCurrency(dueTotal)}</div>
                      <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '2px' }}>{outstanding.length} bill{outstanding.length !== 1 ? 's' : ''} unpaid</div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}
      </Modal>
    </>
  )
}
