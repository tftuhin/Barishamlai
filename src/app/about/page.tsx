import { PublicLayout } from '@/components/layout/PublicLayout'

const values = [
  { icon: '🏠', title: 'Built for Bangladesh', body: 'Designed from the ground up for the Bangladeshi rental market — local currency, local workflows, and Bengali language support.' },
  { icon: '⚡', title: 'Automation First', body: 'Monthly bill generation, reminders, receipts — automated so property managers can focus on what matters.' },
  { icon: '🔒', title: 'Secure by Default', body: 'All data is encrypted at rest and in transit using industry-standard infrastructure.' },
  { icon: '📞', title: 'Real Support', body: 'A small, responsive team. When you have a question, a real person answers — no bots, no endless ticket queues.' },
]

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ padding: '5rem 1.5rem 4rem', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)', fontSize: 12, fontWeight: 700, color: 'var(--pub-brand, #1D9E75)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          About Us
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--land-text)', margin: '0 0 1rem', lineHeight: 1.2 }}>
          We make managing properties simple
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--land-muted)', lineHeight: 1.8, margin: 0 }}>
          Bari Shamlai started because managing a building in Bangladesh was unnecessarily painful — scattered spreadsheets, missed payments, and no central record of anything. We built the tool we wished existed.
        </p>
      </section>

      {/* Mission */}
      <section style={{ padding: '3rem 1.5rem', borderTop: '1px solid var(--land-border)', borderBottom: '1px solid var(--land-border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--land-text)', marginBottom: '0.75rem' }}>Our Mission</h2>
            <p style={{ fontSize: 15, color: 'var(--land-muted)', lineHeight: 1.8 }}>
              To give every building owner and manager in Bangladesh a modern, affordable tool to run their property — without needing an accountant, a spreadsheet expert, or a full-time administrator.
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--land-text)', marginBottom: '0.75rem' }}>Our Story</h2>
            <p style={{ fontSize: 15, color: 'var(--land-muted)', lineHeight: 1.8 }}>
              Founded in 2024, Bari Shamlai grew out of the frustration of managing a multi-unit building with nothing but a notebook and WhatsApp messages. We built something better — a platform that handles billing, payments, messaging, and reporting all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--land-text)', textAlign: 'center', marginBottom: '2.5rem' }}>What we stand for</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {values.map(v => (
              <div key={v.title} style={{ background: 'var(--land-card)', border: '1px solid var(--land-border)', borderRadius: 14, padding: '1.5rem' }}>
                <div style={{ fontSize: 28, marginBottom: '0.75rem' }}>{v.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--land-text)', marginBottom: '0.5rem' }}>{v.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--land-muted)', lineHeight: 1.7, margin: 0 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '3rem 1.5rem 5rem', borderTop: '1px solid var(--land-border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--land-text)', textAlign: 'center', marginBottom: '2.5rem' }}>The team</h2>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: 'var(--land-card)', border: '1px solid var(--land-border)', borderRadius: 14, padding: '1.75rem 2rem', textAlign: 'center', minWidth: 200 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#1D9E75,#085041)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: 22, fontWeight: 800, color: '#fff' }}>T</div>
              <p style={{ fontWeight: 700, color: 'var(--land-text)', margin: '0 0 4px' }}>Tuhin</p>
              <p style={{ fontSize: 12, color: 'var(--pub-brand, #1D9E75)', margin: '0 0 10px', fontWeight: 600 }}>Founder & Developer</p>
              <p style={{ fontSize: 13, color: 'var(--land-muted)', margin: 0, lineHeight: 1.6 }}>Building tools for people who actually manage buildings.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
