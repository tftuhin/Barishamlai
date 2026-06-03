'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, PageHeader, Button, Modal, FormField, inputStyle, selectStyle, EmptyState, StatCard } from '@/components/ui'
import { formatCurrency, formatDate, getExpenseCategoryLabel, getMonthName } from '@/lib/utils'

const CATEGORIES = ['MAINTENANCE','CLEANING','UTILITIES','SECURITY','INSURANCE','LEGAL','OTHER']
const CAT_COLORS: Record<string,string> = { MAINTENANCE:'#1D9E75', CLEANING:'#10b981', UTILITIES:'#f59e0b', SECURITY:'#0F6E56', INSURANCE:'#ec4899', LEGAL:'#085041', OTHER:'#6b7280' }

const SOURCE_LABELS: Record<string,string> = { GAS:'Gas Fund', SERVICE_CHARGE:'Service Charge Fund', GENERAL:'General' }
const SOURCE_COLORS: Record<string,{ bg:string; color:string }> = {
  GAS:            { bg:'#fef9c3', color:'#854d0e' },
  SERVICE_CHARGE: { bg:'#dbeafe', color:'#1d4ed8' },
  GENERAL:        { bg:'#f1f5f9', color:'#475569' },
}

export function ExpensesClient({ expenses, isReadOnly }: { expenses: any[]; isReadOnly?: boolean }) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const now = new Date()
  const [form, setForm] = useState({ title:'', amount:'', category:'MAINTENANCE', incomeSource:'GENERAL', date: now.toISOString().split('T')[0], description:'' })

  const total = expenses.reduce((s,e) => s+e.amount, 0)
  const thisMonth = expenses.filter(e => { const d = new Date(e.date); return d.getMonth()+1 === now.getMonth()+1 && d.getFullYear() === now.getFullYear() }).reduce((s,e) => s+e.amount, 0)
  const byCat = CATEGORIES.map(c => ({ cat: c, total: expenses.filter(e=>e.category===c).reduce((s,e)=>s+e.amount,0) })).filter(x=>x.total>0)

  async function submit() {
    setError(''); setSaving(true)
    const d = new Date(form.date)
    const res = await fetch('/api/expenses', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, amount: Number(form.amount), month: d.getMonth() + 1, year: d.getFullYear() })
    })
    if (res.ok) { setShowAdd(false); router.refresh() }
    else { const d = await res.json(); setError(d.error || 'Failed') }
    setSaving(false)
  }

  async function deleteExpense(id: string) {
    if (!confirm('Delete this expense?')) return
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div style={{ padding: '2rem 2.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      <PageHeader title="General Expenses" subtitle="Other building costs not tied to a specific fund" action={!isReadOnly ? <Button onClick={() => setShowAdd(true)}>+ Log Expense</Button> : undefined} />
      <div style={{ marginBottom: '1rem', padding: '10px 14px', borderRadius: 8, background: 'rgba(29,158,117,0.07)', border: '1px solid rgba(29,158,117,0.2)', fontSize: 13, color: 'var(--text-secondary)' }}>
        Service charge expenses are managed on the <a href="/dashboard/service-charge" style={{ color:'var(--brand,#1D9E75)', fontWeight:600 }}>Service Charge</a> page. Gas cylinder expenses are on the <a href="/dashboard/gas" style={{ color:'var(--brand,#1D9E75)', fontWeight:600 }}>Gas</a> page.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="All Time Total" value={formatCurrency(total)} color="#dc2626" />
        <StatCard label="This Month" value={formatCurrency(thisMonth)} color="#d97706" />
        <StatCard label="Total Entries" value={expenses.length} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <Card>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brand)', margin: 0 }}>All Expenses</h3>
          </div>
          {expenses.length === 0 ? <EmptyState title="No expenses logged yet" /> : (
            <table className="data-table">
              <thead><tr><th>Title</th><th>Category</th><th>Charged To</th><th>Date</th><th>Amount</th><th></th></tr></thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td>
                      <span style={{ fontWeight: 500 }}>{e.title}</span>
                      {e.description && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{e.description}</div>}
                    </td>
                    <td>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', fontSize:'12px', padding:'2px 8px', borderRadius:'12px', background: CAT_COLORS[e.category]+'18', color: CAT_COLORS[e.category], fontWeight: 500 }}>
                        {getExpenseCategoryLabel(e.category)}
                      </span>
                    </td>
                    <td>
                      {(() => { const src = e.incomeSource || 'GENERAL'; const s = SOURCE_COLORS[src] ?? SOURCE_COLORS.GENERAL; return <span style={{ fontSize:'12px', padding:'2px 8px', borderRadius:'12px', fontWeight:500, background:s.bg, color:s.color }}>{SOURCE_LABELS[src] ?? src}</span> })()}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{formatDate(e.date)} <span style={{color:'var(--text-muted)',fontSize:'11px'}}>{getMonthName(e.month)} {e.year}</span></td>
                    <td style={{ fontWeight: 600, color: '#dc2626' }}>{formatCurrency(e.amount)}</td>
                    {!isReadOnly && (
                      <td>
                        <button onClick={() => deleteExpense(e.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'4px', borderRadius:'4px' }}>
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

        <Card style={{ padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brand)', margin: '0 0 1rem' }}>By Category</h3>
          {byCat.length === 0 ? <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>No data yet</p> : byCat.map(x => (
            <div key={x.cat} style={{ marginBottom: '12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'4px' }}>
                <span style={{ color: CAT_COLORS[x.cat], fontWeight: 500 }}>{getExpenseCategoryLabel(x.cat)}</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(x.total)}</span>
              </div>
              <div style={{ height:'6px', borderRadius:'3px', background:'var(--border)', overflow:'hidden' }}>
                <div style={{ height:'100%', width: `${Math.min(100, (x.total/total)*100)}%`, background: CAT_COLORS[x.cat], borderRadius:'3px', transition:'width 0.5s' }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Log Expense">
        <FormField label="Title"><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={inputStyle} placeholder="e.g. Elevator maintenance" /></FormField>
        <FormField label="Category">
          <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={selectStyle}>
            {CATEGORIES.map(c=><option key={c} value={c}>{getExpenseCategoryLabel(c)}</option>)}
          </select>
        </FormField>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          <FormField label="Amount (৳)"><input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} style={inputStyle} placeholder="0" /></FormField>
          <FormField label="Date"><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={inputStyle} /></FormField>
        </div>
        <FormField label="Description (optional)"><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={inputStyle} /></FormField>
        {error && <p style={{ color:'#dc2626', fontSize:'13px' }}>{error}</p>}
        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving?'Saving...':'Log Expense'}</Button>
        </div>
      </Modal>
    </div>
  )
}
