'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/components/layout/LanguageContext'

type Unit = { id: string; number: string; floor: number }

type FundBalance = { fundType: string; amount: number; note?: string | null }
type UnitBalance = { unitId: string; billType: string; amount: number }

type Props = {
  units: Unit[]
  defaultModules: { featureRent: boolean; featureServiceCharge: boolean; featureGas: boolean }
  existingFundBalances: FundBalance[]
  existingUnitBalances: UnitBalance[]
}

const STEPS = 4

function formatAmount(v: number) {
  if (v === 0) return ''
  return String(v)
}

export function OnboardingClient({ units, defaultModules, existingFundBalances, existingUnitBalances }: Props) {
  const router = useRouter()
  const { lang } = useLang()
  const bn = lang === 'bn'

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Step 1 — module selection
  const [modules, setModules] = useState(defaultModules)

  // Step 2 — fund opening balances
  const [scBalance, setScBalance] = useState(
    String(existingFundBalances.find(f => f.fundType === 'SERVICE_CHARGE')?.amount ?? 0)
  )
  const [gasBalance, setGasBalance] = useState(
    String(existingFundBalances.find(f => f.fundType === 'GAS')?.amount ?? 0)
  )

  // Step 3 — per-unit opening balances
  type UnitRow = { rent: string; serviceCharge: string; gas: string }
  const initUnitRows = (): Record<string, UnitRow> => {
    const map: Record<string, UnitRow> = {}
    for (const u of units) {
      map[u.id] = {
        rent:          String(existingUnitBalances.find(b => b.unitId === u.id && b.billType === 'RENT')?.amount          ?? 0),
        serviceCharge: String(existingUnitBalances.find(b => b.unitId === u.id && b.billType === 'SERVICE_CHARGE')?.amount ?? 0),
        gas:           String(existingUnitBalances.find(b => b.unitId === u.id && b.billType === 'GAS')?.amount           ?? 0),
      }
    }
    return map
  }
  const [unitRows, setUnitRows] = useState<Record<string, UnitRow>>(initUnitRows)

  function updateUnit(unitId: string, field: keyof UnitRow, value: string) {
    setUnitRows(prev => ({ ...prev, [unitId]: { ...prev[unitId], [field]: value } }))
  }

  async function saveStep1() {
    setSaving(true); setError('')
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modules),
      })
      setStep(2)
    } catch { setError('Failed to save modules') }
    finally { setSaving(false) }
  }

  async function saveStep2() {
    setSaving(true); setError('')
    try {
      const balances: FundBalance[] = []
      if (modules.featureServiceCharge) balances.push({ fundType: 'SERVICE_CHARGE', amount: Number(scBalance) || 0 })
      if (modules.featureGas)           balances.push({ fundType: 'GAS',            amount: Number(gasBalance) || 0 })

      if (balances.length > 0) {
        await fetch('/api/onboarding/fund-balances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ balances }),
        })
      }
      setStep(3)
    } catch { setError('Failed to save fund balances') }
    finally { setSaving(false) }
  }

  async function saveStep3() {
    setSaving(true); setError('')
    try {
      const balances: UnitBalance[] = []
      for (const u of units) {
        const row = unitRows[u.id]
        if (modules.featureRent && Number(row.rent) !== 0)
          balances.push({ unitId: u.id, billType: 'RENT', amount: Number(row.rent) })
        if (modules.featureServiceCharge && Number(row.serviceCharge) !== 0)
          balances.push({ unitId: u.id, billType: 'SERVICE_CHARGE', amount: Number(row.serviceCharge) })
        if (modules.featureGas && Number(row.gas) !== 0)
          balances.push({ unitId: u.id, billType: 'GAS', amount: Number(row.gas) })
      }

      await fetch('/api/onboarding/unit-balances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balances }),
      })
      setStep(4)
    } catch { setError('Failed to save unit balances') }
    finally { setSaving(false) }
  }

  async function finishOnboarding() {
    setSaving(true)
    await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...modules, onboardingComplete: true }),
    })
    router.push('/dashboard')
  }

  async function skipOnboarding() {
    setSaving(true)
    await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...modules, onboardingComplete: true }),
    })
    router.push('/dashboard')
  }

  const stepLabel = bn
    ? [`মডিউল নির্বাচন`, `ফান্ড ব্যালেন্স`, `ফ্ল্যাটের বকেয়া`, `সম্পন্ন`][step - 1]
    : [`Choose Modules`, `Fund Balances`, `Unit Dues`, `Done`][step - 1]

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface-2, rgba(255,255,255,0.04))', color: 'var(--text)',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block',
    fontFamily: bn ? 'var(--font-hind)' : 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 680 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.5rem', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
            {bn ? 'বাড়ি সামলাই সেটআপ' : 'Welcome — Let\'s set up your building'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
            {bn ? 'পুরানো রেকর্ড মাইগ্রেট করুন এবং মডিউল চালু করুন।' : 'Migrate your existing records and enable the modules you use.'}
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
          {Array.from({ length: STEPS }, (_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i + 1 <= step ? 'var(--brand, #1D9E75)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* Step label */}
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand, #1D9E75)', marginBottom: '1.5rem', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
          {bn ? `ধাপ ${step} / ${STEPS}` : `Step ${step} of ${STEPS}`} — {stepLabel}
        </div>

        {/* Card */}
        <div style={{ background: 'var(--surface-card, var(--surface))', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem' }}>

          {/* ── STEP 1: Modules ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.5rem', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                {bn ? 'কোন মডিউলগুলো ব্যবহার করবেন?' : 'Which modules do you use?'}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 1.5rem', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                {bn ? 'অব্যবহৃত মডিউল বন্ধ রাখলে সাইডবার থেকে সেটি সরিয়ে নেওয়া হবে।' : 'Disabled modules are hidden from the sidebar. You can change this anytime in Settings.'}
              </p>

              {[
                { key: 'featureRent',          en: 'Rent',           bn: 'ভাড়া',          desc: bn ? 'মাসিক ভাড়া আদায় — কোনো খরচ নেই' : 'Monthly rent collection — income only, no expenses' },
                { key: 'featureServiceCharge', en: 'Service Charge',  bn: 'সার্ভিস চার্জ',  desc: bn ? 'নিরাপত্তা, পরিচ্ছন্নতা, লিফট, বিদ্যুৎ, জেনারেটর ইত্যাদি খরচ' : 'Security, cleaning, lift, electricity, generator & maintenance' },
                { key: 'featureGas',           en: 'Gas Bill',        bn: 'গ্যাস বিল',       desc: bn ? 'গ্যাস সিলিন্ডার ক্রয় খরচসহ গ্যাস বিল' : 'Gas billing + gas cylinder purchase expenses' },
              ].map(m => (
                <label key={m.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={modules[m.key as keyof typeof modules]}
                    onChange={e => setModules(prev => ({ ...prev, [m.key]: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: '#1D9E75', marginTop: 2, flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                      {bn ? m.bn : m.en}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                      {m.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* ── STEP 2: Fund Balances ── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.5rem', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                {bn ? 'ফান্ডের বর্তমান ব্যালেন্স কত?' : 'What is the current balance in each fund?'}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 1.5rem', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                {bn ? 'পুরানো সিস্টেম থেকে মাইগ্রেট করলে এই ব্যালেন্সটি শুরুর হিসাব হিসেবে যোগ হবে।' : 'Enter the cash currently held in each fund from your previous system. This is the opening balance.'}
              </p>

              {modules.featureServiceCharge && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>{bn ? 'সার্ভিস চার্জ ফান্ড (৳)' : 'Service Charge Fund (৳)'}</label>
                  <input type="number" value={scBalance} onChange={e => setScBalance(e.target.value)} style={inputStyle} placeholder="0" />
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                    {bn ? 'নেতিবাচক মান = ঘাটতি' : 'Negative value = deficit/deficit fund'}
                  </p>
                </div>
              )}

              {modules.featureGas && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>{bn ? 'গ্যাস ফান্ড (৳)' : 'Gas Fund (৳)'}</label>
                  <input type="number" value={gasBalance} onChange={e => setGasBalance(e.target.value)} style={inputStyle} placeholder="0" />
                </div>
              )}

              {!modules.featureServiceCharge && !modules.featureGas && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                  {bn ? 'কোনো ফান্ড সক্রিয় নেই।' : 'No funds active — all module funds are disabled.'}
                </p>
              )}
            </div>
          )}

          {/* ── STEP 3: Unit Opening Balances ── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.5rem', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                {bn ? 'প্রতিটি ফ্ল্যাটের বকেয়া/অগ্রিম কত?' : 'What does each unit currently owe or have in credit?'}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 1.25rem', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                {bn ? 'ধনাত্মক = বকেয়া (ভাড়াটে বকেয়া), ঋণাত্মক = অগ্রিম (ক্রেডিট)। শূন্য রাখলে সেটি সংরক্ষণ হবে না।' : 'Positive = amount owed by tenant. Negative = advance/credit. Leave 0 to skip.'}
              </p>

              {units.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                  {bn ? 'এখনো কোনো ফ্ল্যাট যোগ করা হয়নি। পরে সেটিংস থেকে ব্যালেন্স আপডেট করুন।' : 'No units added yet. You can update balances later from Settings.'}
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {bn ? 'ফ্ল্যাট' : 'Unit'}
                        </th>
                        {modules.featureRent && (
                          <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                            {bn ? 'ভাড়া (৳)' : 'Rent (৳)'}
                          </th>
                        )}
                        {modules.featureServiceCharge && (
                          <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                            {bn ? 'সার্ভিস চার্জ (৳)' : 'Service Charge (৳)'}
                          </th>
                        )}
                        {modules.featureGas && (
                          <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                            {bn ? 'গ্যাস (৳)' : 'Gas (৳)'}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {units.map(u => (
                        <tr key={u.id}>
                          <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {bn ? `ফ্লোর ${u.floor} — ${u.number}` : `Floor ${u.floor} — ${u.number}`}
                          </td>
                          {modules.featureRent && (
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)' }}>
                              <input type="number" value={unitRows[u.id]?.rent ?? ''} onChange={e => updateUnit(u.id, 'rent', e.target.value)}
                                style={{ ...inputStyle, width: 100 }} placeholder="0" />
                            </td>
                          )}
                          {modules.featureServiceCharge && (
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)' }}>
                              <input type="number" value={unitRows[u.id]?.serviceCharge ?? ''} onChange={e => updateUnit(u.id, 'serviceCharge', e.target.value)}
                                style={{ ...inputStyle, width: 100 }} placeholder="0" />
                            </td>
                          )}
                          {modules.featureGas && (
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)' }}>
                              <input type="number" value={unitRows[u.id]?.gas ?? ''} onChange={e => updateUnit(u.id, 'gas', e.target.value)}
                                style={{ ...inputStyle, width: 100 }} placeholder="0" />
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Done ── */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.75rem', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                {bn ? 'সেটআপ সম্পন্ন!' : 'Setup complete!'}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 1.5rem', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                {bn
                  ? 'আপনার বিল্ডিং সেটআপ হয়ে গেছে। ড্যাশবোর্ডে যান এবং ফ্ল্যাট, বিল ও খরচ ম্যানেজ করুন।'
                  : 'Your building is configured. Opening balances and module settings have been saved. Go to your dashboard to manage units, bills, and expenses.'}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          {step < 4 ? (
            <button onClick={skipOnboarding} disabled={saving}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
              {bn ? 'পরে সেটআপ করব →' : 'Skip for now →'}
            </button>
          ) : <span />}

          <div style={{ display: 'flex', gap: 10 }}>
            {step > 1 && step < 4 && (
              <button onClick={() => setStep(s => s - 1)} disabled={saving}
                style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 14, cursor: 'pointer', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                {bn ? '← পিছনে' : '← Back'}
              </button>
            )}

            {step === 1 && (
              <button onClick={saveStep1} disabled={saving}
                style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#1D9E75,#085041)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                {saving ? '...' : (bn ? 'পরবর্তী →' : 'Next →')}
              </button>
            )}
            {step === 2 && (
              <button onClick={saveStep2} disabled={saving}
                style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#1D9E75,#085041)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                {saving ? '...' : (bn ? 'পরবর্তী →' : 'Next →')}
              </button>
            )}
            {step === 3 && (
              <button onClick={saveStep3} disabled={saving}
                style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#1D9E75,#085041)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                {saving ? '...' : (bn ? 'সংরক্ষণ করুন →' : 'Save →')}
              </button>
            )}
            {step === 4 && (
              <button onClick={finishOnboarding} disabled={saving}
                style={{ padding: '10px 28px', borderRadius: 8, background: 'linear-gradient(135deg,#1D9E75,#085041)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: bn ? 'var(--font-hind)' : 'inherit' }}>
                {saving ? '...' : (bn ? 'ড্যাশবোর্ডে যান →' : 'Go to Dashboard →')}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
