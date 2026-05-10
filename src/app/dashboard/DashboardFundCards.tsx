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

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {/* Month/Year selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fund Summary —</span>
        <select value={month} onChange={e => setMonth(Number(e.target.value))} style={sel}>
          {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
        </select>
        <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} style={{ ...sel, width: 78 }} min={2020} max={2035} />
        {loading && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading…</span>}
      </div>

      {visible.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, background: 'var(--surface-subtle)', borderRadius: 10 }}>
          No modules enabled. Enable modules in Settings.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {visible.map(m => {
          const f: FundSummary = funds?.[m.key] ?? { opening: 0, collection: 0, expenses: 0, closing: 0 }
          return (
            <Card key={m.key} style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: m.color, margin: 0 }}>{m.label}</p>
                <a href={m.href} style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none' }}>View →</a>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'Opening Balance', val: f.opening,    color: '#1d4ed8' },
                  { label: 'Collection',       val: f.collection, color: '#15803d' },
                  { label: 'Expenses',         val: f.expenses,   color: '#dc2626' },
                  { label: 'Closing Balance',  val: f.closing,    color: f.closing >= 0 ? '#15803d' : '#dc2626' },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: 2, fontWeight: 500 }}>{row.label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: row.color }}>{formatCurrency(row.val)}</div>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
