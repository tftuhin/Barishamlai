'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, PageHeader, Button, Modal, FormField, inputStyle, EmptyState } from '@/components/ui'
import { formatDate, getInitials } from '@/lib/utils'

export function MessagesClient({ messages, residents, role, userId }: {
  messages: any[]; residents: any[]; role: string; userId: string
}) {
  const router = useRouter()
  const [showCompose, setShowCompose] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ subject: '', body: '', isGlobal: true, recipientIds: [] as string[] })

  async function sendMessage() {
    setSaving(true)
    await fetch('/api/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setShowCompose(false)
    setForm({ subject: '', body: '', isGlobal: true, recipientIds: [] })
    router.refresh()
    setSaving(false)
  }

  const displayMessages = role === 'ADMIN'
    ? messages
    : messages.map((mr: any) => mr.message)

  return (
    <div style={{ padding: '2rem 2.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      <PageHeader
        title="Messages"
        subtitle={role === 'ADMIN' ? 'Communicate with residents' : 'Messages from building management'}
        action={role === 'ADMIN' && <Button onClick={() => setShowCompose(true)}>+ Compose</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', minHeight: '500px' }}>
        {/* Message list */}
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 500, fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Inbox ({displayMessages.length})
          </div>
          {displayMessages.length === 0 ? (
            <EmptyState title="No messages" description="Your inbox is empty" />
          ) : (
            <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
              {displayMessages.map((msg: any) => (
                <div key={msg.id}
                  onClick={() => setSelected(msg)}
                  style={{
                    padding: '14px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                    background: selected?.id === msg.id ? 'var(--surface-subtle)' : '#fff',
                    transition: 'background 0.1s',
                    borderLeft: selected?.id === msg.id ? '3px solid var(--brand)' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{msg.subject}</span>
                    {msg.isGlobal && <span style={{ fontSize: '10px', background: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '10px', marginLeft: '6px', flexShrink: 0 }}>All</span>}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.body}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0' }}>{formatDate(msg.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Message detail */}
        <Card style={{ padding: selected ? '0' : '0' }}>
          {!selected ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ display: 'block', margin: '0 auto 10px' }}>
                  <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p style={{ fontSize: '14px' }}>Select a message to read</p>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--brand)', margin: '0 0 8px' }}>{selected.subject}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#1d4ed8' }}>
                    {getInitials(selected.sender?.name || 'Admin')}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>{selected.sender?.name || 'Admin'}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{formatDate(selected.createdAt)} · {selected.isGlobal ? 'Sent to all residents' : `${selected.recipients?.length ?? 1} recipient(s)`}</p>
                  </div>
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', margin: 0 }}>{selected.body}</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Compose Modal */}
      <Modal open={showCompose} onClose={() => setShowCompose(false)} title="Compose Message">
        <FormField label="Subject">
          <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} style={inputStyle} placeholder="e.g. Building maintenance notice" />
        </FormField>
        <FormField label="Send to">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="radio" checked={form.isGlobal} onChange={() => setForm({...form, isGlobal: true, recipientIds: []})} /> All residents
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="radio" checked={!form.isGlobal} onChange={() => setForm({...form, isGlobal: false})} /> Specific residents
            </label>
          </div>
          {!form.isGlobal && (
            <select multiple style={{ ...inputStyle, height: '120px' }}
              onChange={e => setForm({...form, recipientIds: Array.from(e.target.selectedOptions).map(o => o.value)})}>
              {residents.map((r: any) => (
                <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
              ))}
            </select>
          )}
        </FormField>
        <FormField label="Message">
          <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} style={{ ...inputStyle, height: '140px', resize: 'vertical' }} placeholder="Write your message here..." />
        </FormField>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setShowCompose(false)}>Cancel</Button>
          <Button onClick={sendMessage} disabled={saving || !form.subject || !form.body}>{saving ? 'Sending...' : 'Send Message'}</Button>
        </div>
      </Modal>
    </div>
  )
}
