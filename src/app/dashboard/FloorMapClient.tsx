'use client'
import { useState, useEffect } from 'react'
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
  mergedUnits?: { id: string; number: string }[]
  owner: { name: string } | null
  tenant: { name: string } | null
  bills: Bill[]
}

type EnabledModules = Record<string, boolean>

// All possible bill-type tabs in display order
const BILL_TABS = [
  { type: 'SERVICE_CHARGE',     label: 'Service Charge', moduleKey: 'featureServiceCharge',     color: '#1d4ed8' },
  { type: 'RENT',               label: 'Rent',           moduleKey: 'featureRent',              color: '#dc2626' },
  { type: 'GAS',                label: 'Gas',            moduleKey: 'featureGas',               color: '#d97706' },
  { type: 'WATER',              label: 'Water',          moduleKey: 'featureWater',             color: '#0284c7' },
  { type: 'GARBAGE',            label: 'Garbage',        moduleKey: 'featureGarbage',           color: '#16a34a' },
  { type: 'COMMUNITY_SECURITY', label: 'Community Sec.', moduleKey: 'featureCommunitySecurity', color: '#9333ea' },
]

export function FloorMapClient({
  units,
  enabledModules = {},
}: {
  units: UnitData[]
  enabledModules?: EnabledModules
}) {
  const [selected, setSelected]   = useState<UnitData | null>(null)
  const [activeTab, setActiveTab] = useState<string>('ALL')

  // Reset tab to ALL whenever the selected unit changes
  useEffect(() => { setActiveTab('ALL') }, [selected?.id])

  const floors  = Array.from(new Set(units.map(u => u.floor))).sort((a, b) => a - b)
  const letters = Array.from(new Set(units.map(u => u.number.replace(/^\d+/, '')))).sort()

  const grid: Record<number, Record<string, UnitData>> = {}
  for (const unit of units) {
    const letter = unit.number.replace(/^\d+/, '')
    if (!grid[unit.floor]) grid[unit.floor] = {}
    grid[unit.floor][letter] = unit
  }

  const hasDue = (unit: UnitData) =>
    unit.bills.some(b => b.status === 'PENDING' || b.status === 'OVERDUE')

  // Build visible tabs for the selected unit
  function getVisibleTabs(unit: UnitData) {
    const tabs: { type: string; label: string; color: string; count: number }[] = []
    for (const tab of BILL_TABS) {
      // Skip if module is explicitly disabled
      if (enabledModules[tab.moduleKey] === false) continue
      const bills = unit.bills.filter(b => b.type === tab.type)
      if (bills.length === 0) continue
      tabs.push({ ...tab, count: bills.length })
    }
    return tabs
  }

  const visibleTabs = selected ? getVisibleTabs(selected) : []
  const showTabs    = visibleTabs.length > 1

  const filteredBills = selected
    ? (activeTab === 'ALL' ? selected.bills : selected.bills.filter(b => b.type === activeTab))
    : []

  const activeTabMeta = visibleTabs.find(t => t.type === activeTab)

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
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#F59E0B', display: 'inline-block', flexShrink: 0 }} />
              Merged
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

                    if (!unit) {
                      return (
                        <td key={letter} style={{ padding: '4px' }}>
                          <div style={{ height: '44px', borderRadius: '8px', background: 'var(--surface-subtle)', border: '1px dashed var(--border-strong)' }} />
                        </td>
                      )
                    }

                    const isMerged    = unit.occupancyType === 'MERGED'
                    const hasMergedIn = (unit.mergedUnits?.length ?? 0) > 0
                    const due         = hasDue(unit)

                    if (isMerged) {
                      return (
                        <td key={letter} style={{ padding: '4px' }}>
                          <button
                            onClick={() => setSelected(unit)}
                            style={{
                              width: '100%', height: '44px', borderRadius: '8px',
                              border: '2px dashed #D97706',
                              background: '#FEF9C3', color: '#92400E',
                              fontWeight: 600, fontSize: '11px',
                              cursor: 'pointer', transition: 'filter 0.15s',
                              fontFamily: 'var(--font-body)',
                              display: 'flex', flexDirection: 'column',
                              alignItems: 'center', justifyContent: 'center', lineHeight: 1.3,
                            }}
                            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.94)')}
                            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                          >
                            <span>{unit.number}</span>
                            {unit.mergedWith && (
                              <span style={{ fontSize: '9px', opacity: 0.75 }}>→ {unit.mergedWith.number}</span>
                            )}
                          </button>
                        </td>
                      )
                    }

                    return (
                      <td key={letter} style={{ padding: '4px' }}>
                        <button
                          onClick={() => setSelected(unit)}
                          style={{
                            width: '100%', height: '44px', borderRadius: '8px', border: 'none',
                            background: due ? '#EF4444' : '#10B981',
                            color: '#fff', fontWeight: 600, fontSize: '12px', letterSpacing: '0.02em',
                            cursor: 'pointer', transition: 'filter 0.15s', fontFamily: 'var(--font-body)',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', lineHeight: 1.3,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.88)')}
                          onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                        >
                          <span>{unit.number}</span>
                          {hasMergedIn && (
                            <span style={{ fontSize: '9px', opacity: 0.8, fontWeight: 400 }}>
                              +{unit.mergedUnits!.map(m => m.number).join(', ')}
                            </span>
                          )}
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
            {/* Merge notices */}
            {selected.occupancyType === 'MERGED' && selected.mergedWith && (
              <div style={{ marginBottom: '1rem', padding: '10px 14px', borderRadius: '8px', background: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: '#D97706' }}>
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: '13px', color: '#92400E' }}>
                  This flat is merged with <strong>Flat {selected.mergedWith.number}</strong>. Bills and records are managed under Flat {selected.mergedWith.number}.
                </span>
              </div>
            )}
            {(selected.mergedUnits?.length ?? 0) > 0 && (
              <div style={{ marginBottom: '1rem', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: '#15803D' }}>
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: '13px', color: '#14532D' }}>
                  {selected.mergedUnits!.map(m => <strong key={m.id}>Flat {m.number}</strong>).reduce<React.ReactNode[]>((acc, el, i) => i === 0 ? [el] : [...acc, ', ', el], [])}{' '}
                  {selected.mergedUnits!.length === 1 ? 'is' : 'are'} merged with this flat.
                </span>
              </div>
            )}

            {/* Unit meta */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.25rem', padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: '8px', border: '1px solid var(--border)' }}>
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

            {/* Tabs */}
            {selected.bills.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '14px' }}>
                No billing records found for this flat.
              </p>
            ) : (
              <>
                {showTabs && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 0, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
                    {/* All tab */}
                    <button
                      onClick={() => setActiveTab('ALL')}
                      style={{
                        padding: '8px 14px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        background: 'transparent',
                        color: activeTab === 'ALL' ? 'var(--brand)' : 'var(--text-secondary)',
                        borderBottom: `2px solid ${activeTab === 'ALL' ? 'var(--brand)' : 'transparent'}`,
                        marginBottom: -1, borderRadius: 0, transition: 'all 0.15s',
                      }}
                    >
                      All
                      <span style={{ marginLeft: 5, fontSize: 11, fontWeight: 500, background: activeTab === 'ALL' ? 'rgba(99,102,241,0.1)' : 'var(--surface-subtle)', color: activeTab === 'ALL' ? 'var(--brand)' : 'var(--text-muted)', padding: '1px 6px', borderRadius: 10 }}>
                        {selected.bills.length}
                      </span>
                    </button>

                    {/* Per-module tabs */}
                    {visibleTabs.map(tab => (
                      <button
                        key={tab.type}
                        onClick={() => setActiveTab(tab.type)}
                        style={{
                          padding: '8px 14px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                          background: 'transparent',
                          color: activeTab === tab.type ? tab.color : 'var(--text-secondary)',
                          borderBottom: `2px solid ${activeTab === tab.type ? tab.color : 'transparent'}`,
                          marginBottom: -1, borderRadius: 0, transition: 'all 0.15s',
                        }}
                      >
                        {tab.label}
                        <span style={{ marginLeft: 5, fontSize: 11, fontWeight: 500, background: activeTab === tab.type ? `${tab.color}18` : 'var(--surface-subtle)', color: activeTab === tab.type ? tab.color : 'var(--text-muted)', padding: '1px 6px', borderRadius: 10 }}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Bills table */}
                <div style={{ overflowX: 'auto', marginTop: showTabs ? 0 : 0 }}>
                  {filteredBills.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '14px' }}>
                      No {activeTabMeta?.label ?? ''} records for this flat.
                    </p>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          {activeTab === 'ALL' && <th>Type</th>}
                          <th>Amount</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th>Paid On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBills
                          .slice()
                          .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)
                          .map(bill => (
                            <tr key={bill.id}>
                              <td style={{ whiteSpace: 'nowrap' }}>{getMonthName(bill.month)} {bill.year}</td>
                              {activeTab === 'ALL' && (
                                <td style={{ color: 'var(--text-secondary)' }}>{getBillTypeLabel(bill.type)}</td>
                              )}
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
                  )}
                </div>

                {/* Summary totals */}
                {(() => {
                  const paid        = filteredBills.filter(b => b.status === 'PAID')
                  const outstanding = filteredBills.filter(b => b.status !== 'PAID')
                  const paidTotal   = paid.reduce((s, b) => s + b.amount, 0)
                  const dueTotal    = outstanding.reduce((s, b) => s + b.amount, 0)
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
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
