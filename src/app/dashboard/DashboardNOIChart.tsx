'use client'
import { Card } from '@/components/ui'
import { formatCurrency, getMonthName } from '@/lib/utils'

type NOIData = {
  monthName: string
  income: number
  expenses: number
  noi: number
}

export function DashboardNOIChart({ data }: { data: NOIData[] }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expenses)), 1000)

  return (
    <Card style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--brand)', margin: 0 }}>Net Operating Income</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Last 6 months cash flow</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: '#15803d' }} /> Income
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: '#dc2626' }} /> Expenses
          </div>
        </div>
      </div>

      <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '8px', paddingTop: '1rem' }}>
        {data.map((d, i) => {
          const incPct = (d.income / maxVal) * 100
          const expPct = (d.expenses / maxVal) * 100
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
              {/* Tooltip placeholder, but for now we just show heights */}
              <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4px', height: '100%', position: 'relative' }}>
                <div 
                  title={`Income: ${formatCurrency(d.income)}`}
                  style={{ width: '35%', maxWidth: '30px', height: `${incPct}%`, background: '#15803d', borderRadius: '4px 4px 0 0', minHeight: incPct > 0 ? '4px' : '0', transition: 'height 0.5s' }} 
                />
                <div 
                  title={`Expenses: ${formatCurrency(d.expenses)}`}
                  style={{ width: '35%', maxWidth: '30px', height: `${expPct}%`, background: '#dc2626', borderRadius: '4px 4px 0 0', minHeight: expPct > 0 ? '4px' : '0', transition: 'height 0.5s' }} 
                />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                {d.monthName}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
