'use client'
import { useState } from 'react'
import { Card, PageHeader, Button, StatCard } from '@/components/ui'
import { formatCurrency, getMonthName, getBillTypeLabel } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#1e3a5f','#c9a84c','#10b981','#f59e0b','#3b82f6','#8b5cf6']

function FundCard({ label, collected, expenses, color }: { label: string; collected: number; expenses: number; color: string }) {
  const net = collected - expenses
  return (
    <Card style={{ padding: '1.25rem 1.5rem' }}>
      <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 10px' }}>{label}</p>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '10px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Collected</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803d' }}>{formatCurrency(collected)}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Expenses</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626' }}>{formatCurrency(expenses)}</div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Net</span>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: net >= 0 ? '#15803d' : '#dc2626' }}>
          {net >= 0 ? '+' : ''}{formatCurrency(net)}
        </span>
      </div>
    </Card>
  )
}

export function ReportsClient({ bills, expenses, totalUnits, currentMonth, currentYear, fundBalances, unitOpeningBalances }: {
  bills: any[]; expenses: any[]; totalUnits: number; currentMonth: number; currentYear: number; fundBalances: any[]; unitOpeningBalances: any[]
}) {
  const [reportType, setReportType] = useState<'summary' | 'monthly' | 'annual'>('summary')
  const [selMonth, setSelMonth] = useState(currentMonth)
  const [selYear, setSelYear] = useState(currentYear)
  const [selFund, setSelFund] = useState<'SERVICE_CHARGE' | 'GAS'>('SERVICE_CHARGE')
  const [generating, setGenerating] = useState(false)

  const monthBills    = bills.filter(b => b.month === selMonth && b.year === selYear)
  const monthExpenses = expenses.filter(e => e.month === selMonth && e.year === selYear)

  // ── Per-fund calculations ──────────────────────────────────
  // Rent: separate from building income, tracked per unit/owner
  const rentBills    = monthBills.filter(b => b.type === 'RENT')
  const rentCollected = rentBills.filter(b => b.status === 'PAID').reduce((s,b) => s+b.amount, 0)
  const rentDue       = rentBills.reduce((s,b) => s+b.amount, 0)

  // Service charge fund
  const scBills      = monthBills.filter(b => b.type === 'SERVICE_CHARGE')
  const scCollected  = scBills.filter(b => b.status === 'PAID').reduce((s,b) => s+b.amount, 0)
  const scExpenses   = monthExpenses.filter(e => e.incomeSource === 'SERVICE_CHARGE').reduce((s,e) => s+e.amount, 0)

  // Gas fund
  const gasBills     = monthBills.filter(b => b.type === 'GAS')
  const gasCollected = gasBills.filter(b => b.status === 'PAID').reduce((s,b) => s+b.amount, 0)
  const gasExpenses  = monthExpenses.filter(e => e.incomeSource === 'GAS').reduce((s,e) => s+e.amount, 0)

  // Other bills (water, electricity…)
  const otherBills     = monthBills.filter(b => !['RENT','SERVICE_CHARGE','GAS'].includes(b.type))
  const otherCollected = otherBills.filter(b => b.status === 'PAID').reduce((s,b) => s+b.amount, 0)
  const generalExpenses = monthExpenses.filter(e => e.incomeSource === 'GENERAL').reduce((s,e) => s+e.amount, 0)

  // Building fund totals (excluding rent)
  const buildingCollected = scCollected + gasCollected + otherCollected
  const buildingExpenses  = scExpenses + gasExpenses + generalExpenses
  const buildingNet       = buildingCollected - buildingExpenses

  // 6-month chart (building fund only, no rent)
  const chartData = Array.from({length:6}).map((_,i) => {
    let m = currentMonth - i; let y = currentYear
    if (m <= 0) { m += 12; y -= 1 }
    const mb = bills.filter(b => b.month===m && b.year===y && b.type !== 'RENT')
    const me = expenses.filter(e => e.month===m && e.year===y)
    return {
      name: getMonthName(m).slice(0,3),
      collected: mb.filter(b=>b.status==='PAID').reduce((s,b)=>s+b.amount,0),
      expenses:  me.reduce((s,e)=>s+e.amount,0),
    }
  }).reverse()

  // Pie: collected bills by type (this month, paid, excluding rent)
  const billTypes = ['SERVICE_CHARGE','GAS','WATER','ELECTRICITY']
  const pieData = billTypes.map(t => ({
    name: getBillTypeLabel(t),
    value: monthBills.filter(b=>b.type===t && b.status==='PAID').reduce((s,b)=>s+b.amount,0),
  })).filter(d=>d.value>0)

  // Rent per owner table
  const rentByUnit = rentBills.map(b => ({
    unit: b.unit?.number ?? '—',
    owner: b.unit?.owner?.name ?? '—',
    amount: b.amount,
    status: b.status,
    paidAt: b.paidAt,
  }))

  async function downloadPDF() {
    setGenerating(true)
    window.open(`/api/reports/monthly?month=${selMonth}&year=${selYear}`, '_blank')
    setTimeout(() => setGenerating(false), 2000)
  }

  const years  = [currentYear, currentYear-1, currentYear-2]
  const months = Array.from({length:12},(_,i)=>i+1)

  return (
    <div style={{ padding: '2rem 2.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      <PageHeader
        title="Reports"
        subtitle="Financial summary — building funds, rent, and expenses"
        action={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {reportType !== 'annual' && (
              <select value={selMonth} onChange={e=>setSelMonth(Number(e.target.value))} style={{ padding:'8px 12px', borderRadius:'8px', border:'1px solid var(--border)', fontSize:'13px', background:'#fff', cursor:'pointer' }}>
                {months.map(m=><option key={m} value={m}>{getMonthName(m)}</option>)}
              </select>
            )}
            <select value={selYear} onChange={e=>setSelYear(Number(e.target.value))} style={{ padding:'8px 12px', borderRadius:'8px', border:'1px solid var(--border)', fontSize:'13px', background:'#fff', cursor:'pointer' }}>
              {years.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            {(reportType === 'summary' || reportType === 'monthly') && (
              <Button onClick={downloadPDF} disabled={generating}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {generating ? 'Generating...' : 'Download PDF'}
              </Button>
            )}
          </div>
        }
      />

      {/* Report type tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {[
          { key: 'summary', label: 'Summary' },
          { key: 'monthly', label: 'Monthly Report' },
          { key: 'annual', label: 'Annual Report' },
        ].map(t => (
          <button key={t.key} onClick={() => setReportType(t.key as any)} style={{
            padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: 'transparent',
            color: reportType === t.key ? 'var(--brand)' : 'var(--text-secondary)',
            borderBottom: `2px solid ${reportType === t.key ? 'var(--brand)' : 'transparent'}`,
            transition: 'all 0.15s',
            marginBottom: -1,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SUMMARY REPORT ── */}
      {reportType === 'summary' && (
        <>
      <p style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', margin: '0 0 1.25rem' }}>
        {getMonthName(selMonth)} {selYear}
      </p>

      {/* ── Building Fund Summary ── */}
      <div style={{ marginBottom: '6px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 10px' }}>Building Fund (excludes rent)</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Building Collected" value={formatCurrency(buildingCollected)} color="#15803d" />
        <StatCard label="Building Expenses" value={formatCurrency(buildingExpenses)} color="#dc2626" />
        <StatCard label="Building Net" value={formatCurrency(buildingNet)} color={buildingNet >= 0 ? '#15803d' : '#dc2626'} />
        <StatCard label="Total Units" value={totalUnits} />
      </div>

      {/* ── Per-fund cards ── */}
      <div style={{ marginBottom: '6px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 10px' }}>Fund Breakdown</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        <FundCard label="Service Charge Fund" collected={scCollected} expenses={scExpenses} color="#1d4ed8" />
        <FundCard label="Gas Fund" collected={gasCollected} expenses={gasExpenses} color="#854d0e" />
        <Card style={{ padding: '1.25rem 1.5rem' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 10px' }}>Rent (Owner Income)</p>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Collected</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803d' }}>{formatCurrency(rentCollected)}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Outstanding</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#d97706' }}>{formatCurrency(rentDue - rentCollected)}</div>
            </div>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>Rent goes to flat owners — not building income</p>
        </Card>
      </div>

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Card style={{ padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--brand)', margin: '0 0 1rem' }}>6-Month Building Fund</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top:0, right:0, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize:12, fill:'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Bar dataKey="collected" fill="#1e3a5f" radius={[4,4,0,0]} name="Collected" />
              <Bar dataKey="expenses"  fill="#c9a84c" radius={[4,4,0,0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card style={{ padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--brand)', margin: '0 0 1rem' }}>Collection by Type</h3>
          {pieData.length === 0 ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px', color:'var(--text-muted)', fontSize:'14px' }}>No paid bills this month</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_:any, i:number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── Rent per owner ── */}
      {rentByUnit.length > 0 && (
        <Card style={{ marginBottom: '1.5rem' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--brand)', margin: 0 }}>Rent — Per Owner</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Tracked separately — not included in building fund</p>
          </div>
          <table className="data-table">
            <thead><tr><th>Unit</th><th>Owner</th><th>Rent Amount</th><th>Status</th><th>Paid At</th></tr></thead>
            <tbody>
              {rentByUnit.map((r,i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{r.unit}</td>
                  <td>{r.owner}</td>
                  <td>{formatCurrency(r.amount)}</td>
                  <td><span style={{ fontSize:'12px', padding:'2px 8px', borderRadius:'10px', fontWeight:500, background: r.status==='PAID'?'#f0fdf4':r.status==='OVERDUE'?'#fef2f2':'#fefce8', color: r.status==='PAID'?'#15803d':r.status==='OVERDUE'?'#dc2626':'#a16207' }}>{r.status}</span></td>
                  <td style={{ color:'var(--text-secondary)', fontSize:'13px' }}>{r.paidAt ? new Date(r.paidAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* ── All bills table ── */}
      <Card>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--brand)', margin: 0 }}>All Bills This Month</h3>
        </div>
        <table className="data-table">
          <thead><tr><th>Unit</th><th>Type</th><th>Amount</th><th>Status</th><th>Paid At</th></tr></thead>
          <tbody>
            {monthBills.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-muted)', padding:'2rem' }}>No bills for this month</td></tr>
            ) : monthBills.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight:600 }}>{b.unit?.number}</td>
                <td>{getBillTypeLabel(b.type)}</td>
                <td>{formatCurrency(b.amount)}</td>
                <td><span style={{ fontSize:'12px', padding:'2px 8px', borderRadius:'10px', fontWeight:500, background: b.status==='PAID'?'#f0fdf4':b.status==='OVERDUE'?'#fef2f2':'#fefce8', color: b.status==='PAID'?'#15803d':b.status==='OVERDUE'?'#dc2626':'#a16207' }}>{b.status}</span></td>
                <td style={{ color:'var(--text-secondary)', fontSize:'13px' }}>{b.paidAt ? new Date(b.paidAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
        </>
      )}

      {/* ── MONTHLY REPORT ── */}
      {reportType === 'monthly' && (() => {
        const scBillsForMonth = bills.filter(b => b.month === selMonth && b.year === selYear && b.type === 'SERVICE_CHARGE')
        const gasBillsForMonth = bills.filter(b => b.month === selMonth && b.year === selYear && b.type === 'GAS')
        const billsForMonth = selFund === 'SERVICE_CHARGE' ? scBillsForMonth : gasBillsForMonth
        const expensesForMonth = expenses.filter(e => e.month === selMonth && e.year === selYear && e.incomeSource === selFund)

        // Opening balance = fundBalance + all prior collected - all prior expenses
        const fundBal = fundBalances.find(f => f.fundType === selFund)
        const allCollectedBefore = bills.filter(b => b.type === selFund && b.status === 'PAID' && (b.year < selYear || (b.year === selYear && b.month < selMonth))).reduce((s,b) => s + b.amount, 0)
        const allExpensesBefore = expenses.filter(e => e.incomeSource === selFund && (e.year < selYear || (e.year === selYear && e.month < selMonth))).reduce((s,e) => s + e.amount, 0)
        const openingBalance = (fundBal?.amount || 0) + allCollectedBefore - allExpensesBefore

        const thisMonthCollected = billsForMonth.filter(b => b.status === 'PAID').reduce((s,b) => s + b.amount, 0)
        const thisMonthExpenses = expensesForMonth.reduce((s,e) => s + e.amount, 0)
        const closingBalance = openingBalance + thisMonthCollected - thisMonthExpenses

        // Per-unit breakdown
        const unitBreakdown = billsForMonth.map(b => {
          const unitOb = unitOpeningBalances.find(ob => ob.unitId === b.unitId && ob.billType === selFund)
          const allUnpaidForUnit = bills.filter(bl => bl.unitId === b.unitId && bl.type === selFund && bl.status !== 'PAID' && (bl.year < selYear || (bl.year === selYear && bl.month <= selMonth))).reduce((s,bl) => s + bl.amount, 0)
          const accumulatedDue = (unitOb?.amount || 0) + allUnpaidForUnit
          return {
            unitNumber: b.unit?.number || '—',
            resident: (b.unit?.tenant?.name || b.unit?.owner?.name || '—'),
            billAmount: b.amount,
            paid: b.status === 'PAID' ? b.amount : 0,
            due: b.status === 'PAID' ? 0 : b.amount,
            accumulatedDue,
          }
        })

        return (
          <>
          <p style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', margin: '0 0 1.25rem' }}>
            {getMonthName(selMonth)} {selYear} — {selFund === 'SERVICE_CHARGE' ? 'Service Charge' : 'Gas'} Fund
          </p>

          {/* Fund selector */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '10px' }}>
            {['SERVICE_CHARGE', 'GAS'].map(f => (
              <button key={f} onClick={() => setSelFund(f as any)} style={{
                padding: '8px 16px', borderRadius: '20px', border: `2px solid ${selFund === f ? 'var(--brand)' : 'var(--border)'}`,
                background: selFund === f ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: selFund === f ? 'var(--brand)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                {f === 'SERVICE_CHARGE' ? 'Service Charge' : 'Gas'}
              </button>
            ))}
          </div>

          {/* Monthly summary */}
          <Card style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Opening Balance</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatCurrency(openingBalance)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>This Month Collection</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803d' }}>{formatCurrency(thisMonthCollected)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>This Month Expenses</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626' }}>{formatCurrency(thisMonthExpenses)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Closing Balance</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: closingBalance >= 0 ? '#15803d' : '#dc2626' }}>{formatCurrency(closingBalance)}</div>
              </div>
            </div>
          </Card>

          {/* Per-unit collection table */}
          {unitBreakdown.length > 0 && (
            <Card style={{ marginBottom: '1.5rem' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--brand)', margin: 0 }}>Collection by Unit</h3>
              </div>
              <table className="data-table">
                <thead><tr><th>Flat</th><th>Resident</th><th>Bill Amount</th><th>Paid</th><th>Due</th><th>Accumulated Due</th></tr></thead>
                <tbody>
                  {unitBreakdown.map((row,i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{row.unitNumber}</td>
                      <td>{row.resident}</td>
                      <td>{formatCurrency(row.billAmount)}</td>
                      <td style={{ color: '#15803d', fontWeight: 600 }}>{formatCurrency(row.paid)}</td>
                      <td style={{ color: '#dc2626', fontWeight: 600 }}>{formatCurrency(row.due)}</td>
                      <td style={{ color: '#d97706', fontWeight: 600 }}>{formatCurrency(row.accumulatedDue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* Expenses */}
          {expensesForMonth.length > 0 && (
            <Card>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--brand)', margin: 0 }}>Expenses</h3>
              </div>
              <table className="data-table">
                <thead><tr><th>Title</th><th>Category</th><th>Amount</th></tr></thead>
                <tbody>
                  {expensesForMonth.map((e,i) => (
                    <tr key={i}>
                      <td>{e.title}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{e.category}</td>
                      <td>{formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
          </>
        )
      })()}

      {/* ── ANNUAL REPORT ── */}
      {reportType === 'annual' && (() => {
        const annualData = Array.from({length:12}).map((_,i) => {
          const m = i + 1
          const billsForMonth = bills.filter(b => b.month === m && b.year === selYear && b.type === selFund)
          const expensesForMonth = expenses.filter(e => e.month === m && e.year === selYear && e.incomeSource === selFund)

          const fundBal = fundBalances.find(f => f.fundType === selFund)
          const allCollectedBefore = bills.filter(b => b.type === selFund && b.status === 'PAID' && (b.year < selYear || (b.year === selYear && b.month < m))).reduce((s,b) => s + b.amount, 0)
          const allExpensesBefore = expenses.filter(e => e.incomeSource === selFund && (e.year < selYear || (e.year === selYear && e.month < m))).reduce((s,e) => s + e.amount, 0)
          const opening = (fundBal?.amount || 0) + allCollectedBefore - allExpensesBefore

          const collected = billsForMonth.filter(b => b.status === 'PAID').reduce((s,b) => s + b.amount, 0)
          const expensed = expensesForMonth.reduce((s,e) => s + e.amount, 0)
          const net = collected - expensed
          const closing = opening + net

          return { month: m, opening, collected, expensed, net, closing }
        })

        const totalCollected = annualData.reduce((s,d) => s + d.collected, 0)
        const totalExpensed = annualData.reduce((s,d) => s + d.expensed, 0)
        const totalNet = totalCollected - totalExpensed
        const totals = { collected: totalCollected, expensed: totalExpensed, net: totalNet }

        return (
          <>
          <p style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', margin: '0 0 1.25rem' }}>
            {selYear} — {selFund === 'SERVICE_CHARGE' ? 'Service Charge' : 'Gas'} Fund
          </p>

          {/* Fund selector */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '10px' }}>
            {['SERVICE_CHARGE', 'GAS'].map(f => (
              <button key={f} onClick={() => setSelFund(f as any)} style={{
                padding: '8px 16px', borderRadius: '20px', border: `2px solid ${selFund === f ? 'var(--brand)' : 'var(--border)'}`,
                background: selFund === f ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: selFund === f ? 'var(--brand)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                {f === 'SERVICE_CHARGE' ? 'Service Charge' : 'Gas'}
              </button>
            ))}
          </div>

          {/* Annual breakdown table */}
          <Card>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--brand)', margin: 0 }}>Monthly Breakdown</h3>
            </div>
            <table className="data-table">
              <thead><tr><th>Month</th><th>Opening Balance</th><th>Collection</th><th>Expenses</th><th>Net</th><th>Closing Balance</th></tr></thead>
              <tbody>
                {annualData.map((d,i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{getMonthName(d.month)}</td>
                    <td>{formatCurrency(d.opening)}</td>
                    <td style={{ color: '#15803d', fontWeight: 600 }}>{formatCurrency(d.collected)}</td>
                    <td style={{ color: '#dc2626', fontWeight: 600 }}>{formatCurrency(d.expensed)}</td>
                    <td style={{ fontWeight: 600, color: d.net >= 0 ? '#15803d' : '#dc2626' }}>{d.net >= 0 ? '+' : ''}{formatCurrency(d.net)}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(d.closing)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 700, borderTop: '2px solid var(--border)', background: 'var(--surface-subtle)' }}>
                  <td>Annual Totals</td>
                  <td>—</td>
                  <td style={{ color: '#15803d' }}>{formatCurrency(totals.collected)}</td>
                  <td style={{ color: '#dc2626' }}>{formatCurrency(totals.expensed)}</td>
                  <td style={{ color: totals.net >= 0 ? '#15803d' : '#dc2626' }}>{totals.net >= 0 ? '+' : ''}{formatCurrency(totals.net)}</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </Card>
          </>
        )
      })()}
    </div>
  )
}
