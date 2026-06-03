'use client'
import { useState } from 'react'
import { Card, PageHeader, Button, Modal, FormField, selectStyle, EmptyState } from '@/components/ui'
import { formatCurrency, formatDate, getBillTypeLabel, getMonthName } from '@/lib/utils'

export function ReceiptsClient({ receipts: initialReceipts, paidBills: initialPaidBills, role }: { receipts: any[]; paidBills: any[]; role: string }) {
  const [receipts, setReceipts]     = useState<any[]>(initialReceipts)
  const [paidBills, setPaidBills]   = useState<any[]>(initialPaidBills)
  const [showIssue, setShowIssue]   = useState(false)
  const [selectedBillId, setSelectedBillId] = useState('')
  const [saving, setSaving]         = useState(false)
  const [emailingId, setEmailingId] = useState<string|null>(null)
  const [error, setError]           = useState<string|null>(null)

  async function issueReceipt() {
    if (!selectedBillId) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId: selectedBillId }),
      })
      if (res.ok) {
        const newReceipt = await res.json()
        setReceipts(prev => [newReceipt, ...prev])
        setPaidBills(prev => prev.filter(b => b.id !== selectedBillId))
        setSelectedBillId('')
        setShowIssue(false)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed to issue receipt')
      }
    } catch {
      setError('Network error — please try again')
    }
    setSaving(false)
  }

  async function sendEmail(receiptId: string) {
    setEmailingId(receiptId)
    await fetch(`/api/receipts/${receiptId}/send`, { method: 'POST' })
    setReceipts(prev => prev.map(r => r.id === receiptId ? { ...r, sentEmail: true } : r))
    setEmailingId(null)
  }

  return (
    <div style={{ padding: '2rem 2.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      <PageHeader
        title="Receipts"
        subtitle="Issue and send digital payment receipts to tenants"
        action={(role === 'ADMIN' || role === 'OWNER') && paidBills.length > 0
          ? <Button onClick={() => setShowIssue(true)}>+ Issue Receipt</Button>
          : undefined
        }
      />

      <Card>
        {receipts.length === 0 ? (
          <EmptyState title="No receipts issued yet" description={role === 'TENANT' ? 'Your landlord has not issued any receipts yet.' : 'Issue a receipt for any paid bill.'} />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Unit</th>
                <th>Bill Type</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Issued To</th>
                <th>Date</th>
                <th>Email Sent</th>
                {(role === 'ADMIN' || role === 'OWNER') && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {receipts.map((r: any) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>{r.id.slice(-8).toUpperCase()}</td>
                  <td style={{ fontWeight: 600 }}>{r.unit?.number}</td>
                  <td>{getBillTypeLabel(r.bill?.type)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.bill ? `${getMonthName(r.bill.month)} ${r.bill.year}` : '—'}</td>
                  <td style={{ fontWeight: 600, color: '#15803d' }}>{formatCurrency(r.amount)}</td>
                  <td>{r.recipient?.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{formatDate(r.createdAt)}</td>
                  <td>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px', background: r.sentEmail ? '#f0fdf4' : '#fefce8', color: r.sentEmail ? '#15803d' : '#a16207' }}>
                      {r.sentEmail ? '✓ Sent' : 'Not sent'}
                    </span>
                  </td>
                  {(role === 'ADMIN' || role === 'OWNER') && (
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button size="sm" variant="secondary" onClick={() => window.open(`/api/receipts/${r.id}/pdf`, '_blank')}>
                          PDF
                        </Button>
                        {!r.sentEmail && (
                          <Button size="sm" onClick={() => sendEmail(r.id)} disabled={emailingId === r.id}>
                            {emailingId === r.id ? '...' : 'Email'}
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={showIssue} onClose={() => { setShowIssue(false); setError(null) }} title="Issue Digital Receipt">
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Select a paid bill to generate a digital receipt for the tenant.
        </p>
        <FormField label="Select Paid Bill">
          <select value={selectedBillId} onChange={e => setSelectedBillId(e.target.value)} style={selectStyle}>
            <option value="">Choose a bill...</option>
            {paidBills.map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.unit.number} — {getBillTypeLabel(b.type)} — {getMonthName(b.month)} {b.year} — {formatCurrency(b.amount)}
              </option>
            ))}
          </select>
        </FormField>
        {error && (
          <p style={{ fontSize: '13px', color: '#dc2626', margin: '0 0 0.75rem', padding: '8px 12px', background: '#fef2f2', borderRadius: 6 }}>
            {error}
          </p>
        )}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => { setShowIssue(false); setError(null) }}>Cancel</Button>
          <Button onClick={issueReceipt} disabled={!selectedBillId || saving}>{saving ? 'Issuing...' : 'Issue Receipt'}</Button>
        </div>
      </Modal>
    </div>
  )
}
