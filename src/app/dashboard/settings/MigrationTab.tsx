'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, FormField, inputStyle, selectStyle } from '@/components/ui'
import { formatCurrency, getMonthName } from '@/lib/utils'

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ val: i + 1, label: getMonthName(i + 1) }))

type ModuleInfo = {
  key: string
  label: string
  billType: string
  fundType: string
  color: string
}

const ALL_MODULES: ModuleInfo[] = [
  { key: 'featureServiceCharge',    label: 'Service Charge',    billType: 'SERVICE_CHARGE',    fundType: 'SERVICE_CHARGE',    color: '#1d4ed8' },
  { key: 'featureRent',             label: 'Rent',              billType: 'RENT',              fundType: 'RENT',              color: '#dc2626' },
  { key: 'featureGas',              label: 'Gas',               billType: 'GAS',               fundType: 'GAS',               color: '#d97706' },
  { key: 'featureWater',            label: 'Water',             billType: 'WATER',             fundType: 'WATER',             color: '#0284c7' },
  { key: 'featureGarbage',          label: 'Garbage',           billType: 'GARBAGE',           fundType: 'GARBAGE',           color: '#16a34a' },
  { key: 'featureCommunitySecurity',label: 'Community Security',billType: 'COMMUNITY_SECURITY',fundType: 'COMMUNITY_SECURITY',color: '#9333ea' },
]

const now = new Date()

export function MigrationTab({
  units,
  fundBalances: initialFundBalances,
  enabledModules,
}: {
  units: { id: string; number: string; floor: number }[]
  fundBalances: { fundType: string; amount: number }[]
  enabledModules: Record<string, boolean>
}) {
  const router = useRouter()

  const activeModules = ALL_MODULES.filter(m => enabledModules[m.key] !== false)
  const [activeModule, setActiveModule] = useState<ModuleInfo>(activeModules[0] ?? ALL_MODULES[0])

  // Fund balance state
  const [fundBalances, setFundBalances] = useState<Record<string, number>>(
    Object.fromEntries(initialFundBalances.map(b => [b.fundType, b.amount]))
  )
  const [editingFund, setEditingFund] = useState(false)
  const [fundInput, setFundInput]     = useState('')
  const [savingFund, setSavingFund]   = useState(false)
  const [fundMsg, setFundMsg]         = useState<{ ok: boolean; text: string } | null>(null)

  function openFundEdit(module: ModuleInfo) {
    setFundInput(String(fundBalances[module.fundType] ?? 0))
    setEditingFund(true)
    setFundMsg(null)
  }

  async function saveFundBalance(module: ModuleInfo) {
    setSavingFund(true); setFundMsg(null)
    const res = await fetch('/api/fund-balance', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fundType: module.fundType, amount: Number(fundInput) }),
    })
    if (res.ok) {
      setFundBalances(prev => ({ ...prev, [module.fundType]: Number(fundInput) }))
      setEditingFund(false)
      setFundMsg({ ok: true, text: 'Fund balance updated.' })
    } else {
      setFundMsg({ ok: false, text: 'Failed to save.' })
    }
    setSavingFund(false)
  }

  // Due bill form state
  const [billForm, setBillForm] = useState({
    unitId: units[0]?.id ?? '',
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear() - 1),
    amount: '',
  })
  const [addingBill, setAddingBill] = useState(false)
  const [billMsg, setBillMsg]       = useState<{ ok: boolean; text: string } | null>(null)
  const [recentBills, setRecentBills] = useState<{ id: string; unitNumber: string; month: number; year: number; amount: number }[]>([])

  async function addDueBill(module: ModuleInfo) {
    if (!billForm.unitId || !billForm.amount || !billForm.month || !billForm.year) {
      setBillMsg({ ok: false, text: 'All fields are required.' }); return
    }
    setAddingBill(true); setBillMsg(null)
    const month = Number(billForm.month)
    const year  = Number(billForm.year)
    // Due date = last day of the billed month
    const dueDate = new Date(year, month, 0).toISOString().split('T')[0]
    const res = await fetch('/api/bills/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bills: [{
          unitId:  billForm.unitId,
          type:    module.billType,
          amount:  Number(billForm.amount),
          month,
          year,
          dueDate,
        }],
      }),
    })
    const data = await res.json()
    if (res.ok && data.created > 0) {
      const unit = units.find(u => u.id === billForm.unitId)
      setRecentBills(prev => [
        { id: Date.now().toString(), unitNumber: unit?.number ?? '?', month, year, amount: Number(billForm.amount) },
        ...prev,
      ])
      setBillMsg({ ok: true, text: `Bill added for Unit ${unit?.number} — ${getMonthName(month)} ${year}.` })
      setBillForm(f => ({ ...f, amount: '' }))
      router.refresh()
    } else if (data.skipped > 0) {
      setBillMsg({ ok: false, text: 'A bill already exists for this unit/month/year. Skipped.' })
    } else {
      setBillMsg({ ok: false, text: data.error || 'Failed to create bill.' })
    }
    setAddingBill(false)
  }

  // Switch module — reset messages
  function switchModule(m: ModuleInfo) {
    setActiveModule(m)
    setEditingFund(false)
    setFundMsg(null)
    setBillMsg(null)
    setRecentBills([])
  }

  if (activeModules.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
        No modules are enabled. Enable modules in the Configuration tab first.
      </div>
    )
  }

  const modTabSt = (m: ModuleInfo): React.CSSProperties => ({
    padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
    borderRadius: 8, transition: 'all 0.15s',
    background: activeModule.key === m.key ? m.color : 'var(--surface-subtle)',
    color: activeModule.key === m.key ? '#fff' : 'var(--text-secondary)',
  })

  const currentFund = fundBalances[activeModule.fundType] ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Info banner */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#1e40af' }}>
        <strong>Data Migration</strong> — Use this to import historical records from your previous manual or Excel system.
        Bills added here appear as <strong>Pending</strong> in the billing matrix. Mark them paid if they have already been collected.
        The fund opening balance sets the base balance before your first transaction in this app.
      </div>

      {/* Module selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {activeModules.map(m => (
          <button key={m.key} style={modTabSt(m)} onClick={() => switchModule(m)}>{m.label}</button>
        ))}
      </div>

      {/* ── Fund Opening Balance ── */}
      <Card>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: activeModule.color, margin: 0 }}>{activeModule.label} — Fund Opening Balance</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              The balance of this fund before your first transaction in the app. Used as the base for balance calculations.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: currentFund >= 0 ? '#15803d' : '#dc2626' }}>
              {formatCurrency(currentFund)}
            </span>
            {!editingFund && (
              <button
                onClick={() => openFundEdit(activeModule)}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
              >
                Edit
              </button>
            )}
          </div>
        </div>
        {editingFund && (
          <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 220px' }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Opening Balance (৳)</label>
              <input
                type="number"
                value={fundInput}
                onChange={e => setFundInput(e.target.value)}
                style={inputStyle}
                placeholder="e.g. 50000"
                autoFocus
              />
            </div>
            <button
              onClick={() => saveFundBalance(activeModule)}
              disabled={savingFund}
              style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: activeModule.color, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: savingFund ? 0.6 : 1 }}
            >
              {savingFund ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => { setEditingFund(false); setFundMsg(null) }}
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 14, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}
        {fundMsg && (
          <div style={{ padding: '8px 1.5rem', fontSize: 13, color: fundMsg.ok ? '#15803d' : '#dc2626', borderTop: '1px solid var(--border)' }}>
            {fundMsg.ok ? '✓ ' : '✗ '}{fundMsg.text}
          </div>
        )}
      </Card>

      {/* ── Unit Due Bills ── */}
      <Card>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: activeModule.color, margin: 0 }}>{activeModule.label} — Historical Due Bills</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Add unpaid bills from before this app was used. Each entry is a single month&apos;s due for one unit — add multiple entries for multiple months.
          </p>
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 1fr auto', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Unit</label>
              <select value={billForm.unitId} onChange={e => setBillForm(f => ({ ...f, unitId: e.target.value }))} style={selectStyle}>
                {units.map(u => (
                  <option key={u.id} value={u.id}>Unit {u.number} (Floor {u.floor})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Month</label>
              <select value={billForm.month} onChange={e => setBillForm(f => ({ ...f, month: e.target.value }))} style={selectStyle}>
                {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Year</label>
              <input
                type="number"
                value={billForm.year}
                onChange={e => setBillForm(f => ({ ...f, year: e.target.value }))}
                style={{ ...inputStyle, padding: '8px 8px' }}
                min="2000" max="2100"
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Amount (৳)</label>
              <input
                type="number"
                value={billForm.amount}
                onChange={e => setBillForm(f => ({ ...f, amount: e.target.value }))}
                style={inputStyle}
                placeholder="0"
                min="1"
              />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 5, opacity: 0 }}>.</label>
              <button
                onClick={() => addDueBill(activeModule)}
                disabled={addingBill || !billForm.amount || !billForm.unitId}
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: activeModule.color, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', opacity: (addingBill || !billForm.amount) ? 0.6 : 1 }}
              >
                {addingBill ? 'Adding…' : '+ Add Bill'}
              </button>
            </div>
          </div>

          {billMsg && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: billMsg.ok ? '#f0fdf4' : '#fef2f2', border: `1px solid ${billMsg.ok ? '#86efac' : '#fca5a5'}`, fontSize: 13, color: billMsg.ok ? '#15803d' : '#dc2626' }}>
              {billMsg.ok ? '✓ ' : '✗ '}{billMsg.text}
            </div>
          )}
        </div>

        {/* Recent additions in this session */}
        {recentBills.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1.5rem' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Added this session</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentBills.map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Unit <strong>{b.unitNumber}</strong> — {getMonthName(b.month)} {b.year}
                  </span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>{formatCurrency(b.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Tips */}
      <div style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem 1.25rem', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        <strong style={{ display: 'block', marginBottom: 4, color: 'var(--text)' }}>Tips</strong>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>Each row adds one month&apos;s bill for one unit — repeat for multiple overdue months.</li>
          <li>Bills are added as <strong>Pending</strong>. Mark them paid from the module page if the money was already collected.</li>
          <li>If a bill already exists for that unit/month/type, the duplicate is skipped automatically.</li>
          <li>The <strong>Fund Opening Balance</strong> should be the total cash-in-hand for that fund on the day you started using this app.</li>
        </ul>
      </div>
    </div>
  )
}
