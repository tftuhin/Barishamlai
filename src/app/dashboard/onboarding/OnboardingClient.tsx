'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/components/layout/LanguageContext'

type Unit = { id: string; number: string; floor: number }
type FundBalance  = { fundType: string; amount: number; note?: string | null }
type UnitBalance  = { unitId: string; billType: string; amount: number }

type Props = {
  units: Unit[]
  defaultModules: { featureRent: boolean; featureServiceCharge: boolean; featureGas: boolean }
  existingFundBalances: FundBalance[]
  existingUnitBalances: UnitBalance[]
}

const STEPS = 5
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function generatePreview(floorCount: number, flatsPerFloor: number[]): Array<{ number: string; floor: number }> {
  const result: Array<{ number: string; floor: number }> = []
  for (let f = 1; f <= floorCount; f++) {
    const count = flatsPerFloor[f - 1] ?? 0
    for (let u = 0; u < count && u < 26; u++) {
      result.push({ number: `${f}-${LETTERS[u]}`, floor: f })
    }
  }
  return result
}

export function OnboardingClient({ units: initialUnits, defaultModules, existingFundBalances, existingUnitBalances }: Props) {
  const router = useRouter()
  const { lang } = useLang()
  const bn = lang === 'bn'

  const [step, setStep]     = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  // All units — starts from server-fetched, updated when step 2 creates them
  const [allUnits, setAllUnits] = useState<Unit[]>(initialUnits)

  // ── Step 1 — Module selection ─────────────────────────
  const [modules, setModules] = useState(defaultModules)

  // ── Step 2 — Building structure ───────────────────────
  const [floorCount,    setFloorCount]    = useState(1)
  const [flatsPerFloor, setFlatsPerFloor] = useState<number[]>([4])
  const preview = generatePreview(floorCount, flatsPerFloor)
  const alreadyHasUnits = allUnits.length > 0

  // Keep flatsPerFloor array in sync with floorCount
  useEffect(() => {
    setFlatsPerFloor(prev => {
      const next = [...prev]
      while (next.length < floorCount) next.push(next[next.length - 1] ?? 4)
      return next.slice(0, floorCount)
    })
  }, [floorCount])

  function setFlatsOnFloor(floorIndex: number, value: number) {
    setFlatsPerFloor(prev => {
      const next = [...prev]
      next[floorIndex] = Math.max(0, Math.min(26, value))
      return next
    })
  }

  // ── Step 3 — Fund opening balances ────────────────────
  const [scBalance,  setScBalance]  = useState(
    String(existingFundBalances.find(f => f.fundType === 'SERVICE_CHARGE')?.amount ?? 0)
  )
  const [gasBalance, setGasBalance] = useState(
    String(existingFundBalances.find(f => f.fundType === 'GAS')?.amount ?? 0)
  )

  // ── Step 4 — Per-unit opening balances ────────────────
  type UnitRow = { rent: string; serviceCharge: string; gas: string }
  function initUnitRows(units: Unit[]): Record<string, UnitRow> {
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
  const [unitRows, setUnitRows] = useState<Record<string, UnitRow>>(() => initUnitRows(initialUnits))

  function updateUnit(unitId: string, field: keyof UnitRow, value: string) {
    setUnitRows(prev => ({ ...prev, [unitId]: { ...prev[unitId], [field]: value } }))
  }

  // ── Step handlers ─────────────────────────────────────

  async function saveStep1() {
    setSaving(true); setError('')
    try {
      await fetch('/api/config', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modules),
      })
      setStep(2)
    } catch { setError('Failed to save modules') }
    finally { setSaving(false) }
  }

  async function saveStep2() {
    // If units already exist, just proceed
    if (alreadyHasUnits) { setStep(3); return }

    if (preview.length === 0) { setStep(3); return }

    setSaving(true); setError('')
    try {
      const res = await fetch('/api/units/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ units: preview }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.message || d.error || 'Failed to create units')
        return
      }
      const created: Unit[] = await res.json()
      setAllUnits(created)
      setUnitRows(initUnitRows(created))
      setStep(3)
    } catch { setError('Failed to create units') }
    finally { setSaving(false) }
  }

  async function saveStep3() {
    setSaving(true); setError('')
    try {
      const balances: FundBalance[] = []
      if (modules.featureServiceCharge) balances.push({ fundType: 'SERVICE_CHARGE', amount: Number(scBalance) || 0 })
      if (modules.featureGas)           balances.push({ fundType: 'GAS',            amount: Number(gasBalance) || 0 })

      if (balances.length > 0) {
        await fetch('/api/onboarding/fund-balances', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ balances }),
        })
      }
      setStep(4)
    } catch { setError('Failed to save fund balances') }
    finally { setSaving(false) }
  }

  async function saveStep4() {
    setSaving(true); setError('')
    try {
      const balances: UnitBalance[] = []
      for (const u of allUnits) {
        const row = unitRows[u.id]
        if (!row) continue
        if (modules.featureRent          && Number(row.rent)          !== 0)
          balances.push({ unitId: u.id, billType: 'RENT',           amount: Number(row.rent) })
        if (modules.featureServiceCharge && Number(row.serviceCharge) !== 0)
          balances.push({ unitId: u.id, billType: 'SERVICE_CHARGE', amount: Number(row.serviceCharge) })
        if (modules.featureGas           && Number(row.gas)           !== 0)
          balances.push({ unitId: u.id, billType: 'GAS',            amount: Number(row.gas) })
      }

      await fetch('/api/onboarding/unit-balances', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balances }),
      })
      setStep(5)
    } catch { setError('Failed to save unit balances') }
    finally { setSaving(false) }
  }

  async function finishOnboarding() {
    setSaving(true)
    await fetch('/api/config', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...modules, onboardingComplete: true }),
    })
    router.push('/dashboard')
  }

  async function skipOnboarding() {
    setSaving(true)
    await fetch('/api/config', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...modules, onboardingComplete: true }),
    })
    router.push('/dashboard')
  }

  const stepLabels = bn
    ? ['মডিউল নির্বাচন', 'বিল্ডিং কাঠামো', 'ফান্ড ব্যালেন্স', 'ফ্ল্যাটের বকেয়া', 'সম্পন্ন']
    : ['Choose Modules', 'Building Structure', 'Fund Balances', 'Unit Dues', 'Done']

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1.5px solid var(--border-strong, #C8D8D4)',
    background: '#fff', color: 'var(--text-primary)',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5,
    display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em',
    fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit',
  }
  const sectionHead: React.CSSProperties = {
    fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem',
    fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit',
  }
  const sectionSub: React.CSSProperties = {
    fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 1.5rem',
    fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 700 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
            {bn ? 'বাড়ি সামলাই সেটআপ' : "Welcome — Let's set up your building"}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
            {bn ? 'পুরানো রেকর্ড মাইগ্রেট করুন এবং মডিউল চালু করুন।' : 'Configure modules, define your building structure, and migrate existing records.'}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
          {Array.from({ length: STEPS }, (_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i + 1 <= step ? 'var(--brand, #1D9E75)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* Step label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand, #1D9E75)', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
            {bn ? `ধাপ ${step} / ${STEPS}` : `Step ${step} of ${STEPS}`} — {stepLabels[step - 1]}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {stepLabels.map((label, i) => (
              <span key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i + 1 === step ? 'var(--brand)' : i + 1 < step ? 'var(--brand-light, #9FE1CB)' : 'var(--border)',
                display: 'inline-block', transition: 'background 0.3s',
              }} title={label} />
            ))}
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>

          {/* ── STEP 1: Modules ── */}
          {step === 1 && (
            <div>
              <h2 style={sectionHead}>{bn ? 'কোন মডিউলগুলো ব্যবহার করবেন?' : 'Which modules do you use?'}</h2>
              <p style={sectionSub}>{bn ? 'অব্যবহৃত মডিউল বন্ধ রাখলে সাইডবার থেকে সেটি সরিয়ে নেওয়া হবে।' : 'Disabled modules are hidden from the sidebar. You can change this anytime in Settings.'}</p>

              {[
                { key: 'featureRent',          en: 'Rent',          bn: 'ভাড়া',         desc_en: 'Monthly rent collection — income only, no expenses',            desc_bn: 'মাসিক ভাড়া আদায় — কোনো খরচ নেই' },
                { key: 'featureServiceCharge', en: 'Service Charge', bn: 'সার্ভিস চার্জ', desc_en: 'Security, cleaning, lift, electricity, generator & maintenance', desc_bn: 'নিরাপত্তা, পরিচ্ছন্নতা, লিফট, বিদ্যুৎ, জেনারেটর ইত্যাদি' },
                { key: 'featureGas',           en: 'Gas Bill',       bn: 'গ্যাস বিল',      desc_en: 'Gas billing + gas cylinder purchase expenses',                 desc_bn: 'গ্যাস সিলিন্ডার ক্রয় খরচসহ গ্যাস বিল' },
              ].map(m => (
                <label key={m.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                  <input type="checkbox"
                    checked={modules[m.key as keyof typeof modules]}
                    onChange={e => setModules(prev => ({ ...prev, [m.key]: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: '#1D9E75', marginTop: 2, flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>{bn ? m.bn : m.en}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>{bn ? m.desc_bn : m.desc_en}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* ── STEP 2: Building Structure ── */}
          {step === 2 && (
            <div>
              <h2 style={sectionHead}>{bn ? 'বিল্ডিংয়ের কাঠামো কেমন?' : 'Define your building structure'}</h2>
              <p style={sectionSub}>
                {alreadyHasUnits
                  ? (bn ? `${allUnits.length}টি ফ্ল্যাট ইতিমধ্যে যোগ করা হয়েছে। পরবর্তী ধাপে যান।` : `${allUnits.length} units are already configured. Proceed to the next step.`)
                  : (bn ? 'ফ্লোরের সংখ্যা এবং প্রতিটি ফ্লোরে ফ্ল্যাটের সংখ্যা দিন। ফ্ল্যাটের নম্বর স্বয়ংক্রিয়ভাবে হবে (যেমন ১-A, ১-B, ২-A)।' : 'Enter the number of floors and flats per floor. Unit numbers are auto-generated as 1-A, 1-B, 2-A, 2-B, etc.')}
              </p>

              {alreadyHasUnits ? (
                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--surface-subtle, #E1F5EE)', border: '1px solid var(--brand-light, #9FE1CB)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-dark, #0F6E56)', marginBottom: 8, fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                    {bn ? 'বিদ্যমান ফ্ল্যাটসমূহ' : 'Existing units'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {allUnits.map(u => (
                      <span key={u.id} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#fff', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                        {u.number}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Floor count */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>{bn ? 'মোট ফ্লোর সংখ্যা' : 'Number of floors'}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setFloorCount(f => Math.max(1, f - 1))}
                        style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid var(--border-strong)', background: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', flexShrink: 0 }}
                      >−</button>
                      <input
                        type="number" value={floorCount} min={1} max={50}
                        onChange={e => setFloorCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                        style={{ ...inputStyle, width: 80, textAlign: 'center' }}
                      />
                      <button
                        type="button"
                        onClick={() => setFloorCount(f => Math.min(50, f + 1))}
                        style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid var(--border-strong)', background: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', flexShrink: 0 }}
                      >+</button>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                        {bn ? 'টি ফ্লোর' : `floor${floorCount !== 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>

                  {/* Per-floor flat count */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>{bn ? 'প্রতিটি ফ্লোরে ফ্ল্যাটের সংখ্যা' : 'Flats per floor'}</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                      {Array.from({ length: floorCount }, (_, i) => (
                        <div key={i} style={{ padding: '10px 12px', border: '1.5px solid var(--border-strong)', borderRadius: 10, background: 'var(--surface-subtle, #E1F5EE)' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-dark, #0F6E56)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {bn ? `${i + 1} তলা` : `Floor ${i + 1}`}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button type="button" onClick={() => setFlatsOnFloor(i, (flatsPerFloor[i] ?? 0) - 1)}
                              style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>−</button>
                            <input type="number" value={flatsPerFloor[i] ?? 0} min={0} max={26}
                              onChange={e => setFlatsOnFloor(i, Number(e.target.value) || 0)}
                              style={{ ...inputStyle, width: '100%', textAlign: 'center', padding: '4px 6px', fontSize: 13 }}
                            />
                            <button type="button" onClick={() => setFlatsOnFloor(i, (flatsPerFloor[i] ?? 0) + 1)}
                              style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  {preview.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{bn ? 'প্রিভিউ' : 'Preview'}</span>
                        <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--text-secondary)', textTransform: 'none', letterSpacing: 0 }}>
                          {bn ? `মোট ${preview.length}টি ফ্ল্যাট` : `${preview.length} units total`}
                        </span>
                      </div>
                      <div style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-gray, #F5F5F3)', maxHeight: 180, overflowY: 'auto' }}>
                        {Array.from({ length: floorCount }, (_, fi) => {
                          const floorUnits = preview.filter(u => u.floor === fi + 1)
                          if (floorUnits.length === 0) return null
                          return (
                            <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: fi < floorCount - 1 ? 8 : 0, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', minWidth: 52, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {bn ? `${fi + 1} তলা` : `Floor ${fi + 1}`}
                              </span>
                              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                {floorUnits.map(u => (
                                  <span key={u.number} style={{ fontSize: 12, fontWeight: 600, padding: '2px 9px', borderRadius: 16, background: 'var(--brand, #1D9E75)', color: '#fff', letterSpacing: '0.02em' }}>
                                    {u.number}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {preview.length === 0 && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                      {bn ? 'প্রতিটি ফ্লোরে কমপক্ষে ১টি ফ্ল্যাট দিন।' : 'Add at least 1 flat per floor to see a preview.'}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── STEP 3: Fund Balances ── */}
          {step === 3 && (
            <div>
              <h2 style={sectionHead}>{bn ? 'ফান্ডের বর্তমান ব্যালেন্স কত?' : 'What is the current balance in each fund?'}</h2>
              <p style={sectionSub}>{bn ? 'পুরানো সিস্টেম থেকে মাইগ্রেট করলে এই ব্যালেন্সটি শুরুর হিসাব হিসেবে যোগ হবে।' : 'Enter the cash currently held in each fund from your previous system. This becomes the opening balance.'}</p>

              {modules.featureServiceCharge && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>{bn ? 'সার্ভিস চার্জ ফান্ড (৳)' : 'Service Charge Fund (৳)'}</label>
                  <input type="number" value={scBalance} onChange={e => setScBalance(e.target.value)} style={inputStyle} placeholder="0" />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                    {bn ? 'নেতিবাচক মান = ঘাটতি' : 'Negative value = deficit'}
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
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                  {bn ? 'কোনো ফান্ড সক্রিয় নেই।' : 'No funds active — all module funds are disabled.'}
                </p>
              )}
            </div>
          )}

          {/* ── STEP 4: Unit Opening Balances ── */}
          {step === 4 && (
            <div>
              <h2 style={sectionHead}>{bn ? 'প্রতিটি ফ্ল্যাটের বকেয়া/অগ্রিম কত?' : 'Opening due or credit per unit'}</h2>
              <p style={sectionSub}>{bn ? 'ধনাত্মক = বকেয়া, ঋণাত্মক = অগ্রিম/ক্রেডিট। শূন্য রাখলে সংরক্ষণ হবে না।' : 'Positive = amount owed by tenant. Negative = advance/credit. Leave 0 to skip.'}</p>

              {allUnits.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                  {bn ? 'কোনো ফ্ল্যাট যোগ করা হয়নি।' : 'No units configured — balances can be entered later from Settings.'}
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-subtle, #E1F5EE)' }}>
                        <th style={{ textAlign: 'left', padding: '9px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                          {bn ? 'ফ্ল্যাট' : 'Unit'}
                        </th>
                        {modules.featureRent && (
                          <th style={{ textAlign: 'left', padding: '9px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                            {bn ? 'ভাড়া (৳)' : 'Rent (৳)'}
                          </th>
                        )}
                        {modules.featureServiceCharge && (
                          <th style={{ textAlign: 'left', padding: '9px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                            {bn ? 'স/চার্জ (৳)' : 'S.Charge (৳)'}
                          </th>
                        )}
                        {modules.featureGas && (
                          <th style={{ textAlign: 'left', padding: '9px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                            {bn ? 'গ্যাস (৳)' : 'Gas (৳)'}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {allUnits.map((u, idx) => (
                        <tr key={u.id} style={{ background: idx % 2 === 0 ? '#fff' : 'var(--surface-gray, #F5F5F3)' }}>
                          <td style={{ padding: '7px 12px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13, color: 'var(--brand, #1D9E75)', whiteSpace: 'nowrap' }}>
                            {u.number}
                          </td>
                          {modules.featureRent && (
                            <td style={{ padding: '5px 12px', borderBottom: '1px solid var(--border)' }}>
                              <input type="number" value={unitRows[u.id]?.rent ?? '0'} onChange={e => updateUnit(u.id, 'rent', e.target.value)}
                                style={{ ...inputStyle, width: 100, padding: '5px 8px', fontSize: 13 }} placeholder="0" />
                            </td>
                          )}
                          {modules.featureServiceCharge && (
                            <td style={{ padding: '5px 12px', borderBottom: '1px solid var(--border)' }}>
                              <input type="number" value={unitRows[u.id]?.serviceCharge ?? '0'} onChange={e => updateUnit(u.id, 'serviceCharge', e.target.value)}
                                style={{ ...inputStyle, width: 100, padding: '5px 8px', fontSize: 13 }} placeholder="0" />
                            </td>
                          )}
                          {modules.featureGas && (
                            <td style={{ padding: '5px 12px', borderBottom: '1px solid var(--border)' }}>
                              <input type="number" value={unitRows[u.id]?.gas ?? '0'} onChange={e => updateUnit(u.id, 'gas', e.target.value)}
                                style={{ ...inputStyle, width: 100, padding: '5px 8px', fontSize: 13 }} placeholder="0" />
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

          {/* ── STEP 5: Done ── */}
          {step === 5 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                {bn ? 'সেটআপ সম্পন্ন!' : 'Setup complete!'}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 0.5rem', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                {bn
                  ? 'আপনার বিল্ডিং সেটআপ হয়ে গেছে। ড্যাশবোর্ডে যান এবং ফ্ল্যাট, বিল ও খরচ ম্যানেজ করুন।'
                  : 'Your building is configured. Opening balances and module settings have been saved.'}
              </p>
              {allUnits.length > 0 && (
                <p style={{ fontSize: 13, color: 'var(--brand, #1D9E75)', fontWeight: 600, margin: '0 auto', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                  {bn ? `${allUnits.length}টি ফ্ল্যাট তৈরি হয়েছে।` : `${allUnits.length} units created.`}
                </p>
              )}
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
          {step < 5 ? (
            <button onClick={skipOnboarding} disabled={saving}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit', padding: '8px 0' }}>
              {bn ? 'পরে সেটআপ করব →' : 'Skip for now →'}
            </button>
          ) : <span />}

          <div style={{ display: 'flex', gap: 10 }}>
            {step > 1 && step < 5 && (
              <button onClick={() => { setError(''); setStep(s => s - 1) }} disabled={saving}
                style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid var(--border)', background: '#fff', color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                {bn ? '← পিছনে' : '← Back'}
              </button>
            )}

            {step === 1 && (
              <button onClick={saveStep1} disabled={saving}
                style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#1D9E75,#085041)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                {saving ? '...' : (bn ? 'পরবর্তী →' : 'Next →')}
              </button>
            )}
            {step === 2 && (
              <button onClick={saveStep2} disabled={saving || (!alreadyHasUnits && preview.length === 0)}
                style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#1D9E75,#085041)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit', opacity: (!alreadyHasUnits && preview.length === 0) ? 0.5 : 1 }}>
                {saving ? (bn ? 'তৈরি হচ্ছে...' : 'Creating...') : (alreadyHasUnits ? (bn ? 'পরবর্তী →' : 'Next →') : (bn ? `${preview.length}টি ফ্ল্যাট তৈরি করুন →` : `Create ${preview.length} unit${preview.length !== 1 ? 's' : ''} →`))}
              </button>
            )}
            {step === 3 && (
              <button onClick={saveStep3} disabled={saving}
                style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#1D9E75,#085041)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                {saving ? '...' : (bn ? 'পরবর্তী →' : 'Next →')}
              </button>
            )}
            {step === 4 && (
              <button onClick={saveStep4} disabled={saving}
                style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#1D9E75,#085041)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                {saving ? '...' : (bn ? 'সংরক্ষণ করুন →' : 'Save →')}
              </button>
            )}
            {step === 5 && (
              <button onClick={finishOnboarding} disabled={saving}
                style={{ padding: '10px 28px', borderRadius: 8, background: 'linear-gradient(135deg,#1D9E75,#085041)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: bn ? 'var(--font-noto-bn)' : 'inherit' }}>
                {saving ? '...' : (bn ? 'ড্যাশবোর্ডে যান →' : 'Go to Dashboard →')}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
