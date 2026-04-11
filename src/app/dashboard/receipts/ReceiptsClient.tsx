'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, PageHeader, Button, Modal, FormField, selectStyle, EmptyState, Badge } from '@/components/ui'
import { formatCurrency, formatDate, getBillTypeLabel, getMonthName } from '@/lib/utils'

export function ReceiptsClient({ receipts, paidBills, role }: { receipts: any[]; paidBills: any[]; role: string }) {
  const router = useRouter()
  const [showIssue, setShowIssue] = useState(false)
  const [selectedBillId, setSelectedBillId] = useState('')
  const [saving, setSaving] = useState(false)
  const [emailingId, setEmailingId] = useState<string|null>(null)

  async function issueReceipt() {
    setSaving(true)
    await fetch('/api/receipts', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ billId: selectedBillId }),
    })
    setShowIssue(false); router.refresh(); setSaving(false)
  }

  async function sendEmail(receiptId: string) {
    setEmailingId(receiptId)
    await fetch(`/api/receipts/${receiptId}/send`, { method: 'POST' })
    router.refresh(); setEmailingId(null)
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

      <Modal open={showIssue} onClose={() => setShowIssue(false)} title="Issue Digital Receipt">
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
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setShowIssue(false)}>Cancel</Button>
          <Button onClick={issueReceipt} disabled={!selectedBillId || saving}>{saving ? 'Issuing...' : 'Issue Receipt'}</Button>
        </div>
      </Modal>
    </div>
  )
}
