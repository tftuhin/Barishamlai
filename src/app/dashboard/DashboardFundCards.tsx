'use client'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui'
import { formatCurrency, getMonthName } from '@/lib/utils'

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ val: i + 1, label: getMonthName(i + 1) }))

type FundSummary = { opening: number; collection: number; expenses: number; closing: number }
type AllFunds = Record<string, FundSummary>

const MODULE_CONFIG: Array<{ key: string; label: string; color: string; href: string }> = [
  { key: 'sc',      label: 'Service Charge',      color: '#1d4ed8', href: '/dashboard/service-charge' },
  { key: 'gas',     label: 'Gas',                  color: '#d97706', href: '/dashboard/gas' },
  { key: 'water',   label: 'Water',                color: '#0284c7', href: '/dashboard/water' },
  { key: 'garbage', label: 'Garbage',              color: '#16a34a', href: '/dashboard/garbage' },
  { key: 'cs',      label: 'Community Security',   color: '#9333ea', href: '/dashboard/community-security' },
  { key: 'rent',    label: 'Rent',                 color: '#dc2626', href: '/dashboard/rent' },
]

const ENABLED_MAP: Record<string, string> = {
  sc:      'featureServiceCharge',
  gas:     'featureGas',
  water:   'featureWater',
  garbage: 'featureGarbage',
  cs:      'featureCommunitySecurity',
  rent:    'featureRent',
}

const sel: React.CSSProperties = { padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 13, outline: 'none' }

export function DashboardFundCards({ initialMonth, initialYear, enabledModules }: {
  initialMonth: number
  initialYear: number
  enabledModules: Record<string, boolean>
}) {
  const [month, setMonth] = useState(initialMonth)
  const [year,  setYear]  = useState(initialYear)
  const [funds, setFunds] = useState<AllFunds | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/dashboard/fund-data?month=${month}&year=${year}`)
      .then(r => r.json())
      .then(d => { setFunds(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [month, year])

  const visible = MODULE_CONFIG.filter(m => {
    const flag = ENABLED_MAP[m.key]
    return flag ? enabledModules[flag] : true
  })

  const operatingVisible = visible.filter(m => m.key !== 'rent')

  const totals = operatingVisible.reduce((acc, m) => {
    const f: FundSummary = funds?.[m.key] ?? { opening: 0, collection: 0, expenses: 0, closing: 0 }
    acc.opening += f.opening
    acc.collection += f.collection
    acc.expenses += f.expenses
    acc.closing += f.closing
    return acc
  }, { opening: 0, collection: 0, expenses: 0, closing: 0 })

  return (
    <Card style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
      {/* Header & Controls */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brand)', margin: 0 }}>Consolidated Operating Funds</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={sel}>
            {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
          </select>
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} style={{ ...sel, width: 78 }} min={2020} max={2035} />
          {loading && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>...</span>}
        </div>
      </div>

      {visible.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          No modules enabled. Enable modules in Settings.
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* Total Summary Left Side */}
          <div style={{ flex: '1 1 300px', padding: '1.5rem', borderRight: '1px solid var(--border)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px', marginTop: 0 }}>Operating Cash Balance</p>
            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: totals.closing >= 0 ? '#15803d' : '#dc2626', margin: '0 0 1.5rem 0', lineHeight: 1 }}>
              {formatCurrency(totals.closing)}
            </h2>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 2px' }}>Operating Inflow</p>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#15803d' }}>{formatCurrency(totals.collection)}</div>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 2px' }}>Total Expenses</p>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#dc2626' }}>{formatCurrency(totals.expenses)}</div>
              </div>
            </div>
          </div>

          {/* Individual Breakdown Right Side */}
          <div style={{ flex: '2 1 400px', padding: '1.5rem' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px' }}>Fund Breakdown</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {visible.map(m => {
                const f: FundSummary = funds?.[m.key] ?? { opening: 0, collection: 0, expenses: 0, closing: 0 }
                const isRent = m.key === 'rent'
                return (
                  <div key={m.key} style={{ padding: '12px', borderRadius: '8px', background: isRent ? 'rgba(79, 70, 229, 0.05)' : 'var(--surface-subtle)', border: isRent ? '1px solid rgba(79, 70, 229, 0.25)' : '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: m.color, margin: 0 }}>{m.label}</p>
                        {isRent && <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#4f46e5' }}>Fiduciary</span>}
                      </div>
                      <a href={m.href} style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none' }}>→</a>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: f.closing >= 0 ? 'var(--text)' : '#dc2626' }}>
                      {formatCurrency(f.closing)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
