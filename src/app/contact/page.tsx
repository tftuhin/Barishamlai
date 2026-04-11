'use client'
import { useForm, ValidationError } from '@formspree/react'
import { PublicLayout } from '@/components/layout/PublicLayout'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10, boxSizing: 'border-box',
  border: '1.5px solid var(--land-input-border, var(--land-border))', background: 'var(--land-input-bg, var(--land-bg))',
  color: 'var(--land-text)', fontSize: 14, outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.2s',
}

const contacts = [
  { icon: '📧', label: 'Email',         value: 'support@barishamlai.app' },
  { icon: '📍', label: 'Based in',      value: 'Dhaka, Bangladesh' },
  { icon: '🕐', label: 'Response time', value: 'Usually within 24 hours' },
]

function ContactForm() {
  const [state, handleSubmit] = useForm('xkopeedr')

  if (state.succeeded) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--land-card)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 16 }}>
        <div style={{ fontSize: 48, marginBottom: '1rem' }}>✅</div>
        <h3 style={{ color: 'var(--land-text)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Message sent!</h3>
        <p style={{ color: 'var(--land-muted)', fontSize: 14, margin: 0 }}>Thanks for reaching out. We&apos;ll get back to you within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--land-card)', border: '1px solid var(--land-border)', borderRadius: 16, padding: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--land-subtle)', marginBottom: 6 }}>Name</label>
          <input type="text" name="name" required placeholder="Your name" style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'var(--pub-brand, #1D9E75)')}
            onBlur={e => (e.target.style.borderColor = 'var(--land-input-border, var(--land-border))')} />
          <ValidationError field="name" errors={state.errors} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--land-subtle)', marginBottom: 6 }}>Email</label>
          <input type="email" name="email" required placeholder="you@example.com" style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'var(--pub-brand, #1D9E75)')}
            onBlur={e => (e.target.style.borderColor = 'var(--land-input-border, var(--land-border))')} />
          <ValidationError field="email" errors={state.errors} />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--land-subtle)', marginBottom: 6 }}>Subject</label>
        <input type="text" name="subject" required placeholder="What's this about?" style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--pub-brand, #1D9E75)')}
          onBlur={e => (e.target.style.borderColor = 'var(--land-input-border, var(--land-border))')} />
        <ValidationError field="subject" errors={state.errors} />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--land-subtle)', marginBottom: 6 }}>Message</label>
        <textarea name="message" required rows={5} placeholder="Tell us how we can help…" style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={e => (e.target.style.borderColor = 'var(--pub-brand, #1D9E75)')}
          onBlur={e => (e.target.style.borderColor = 'var(--land-input-border, var(--land-border))')} />
        <ValidationError field="message" errors={state.errors} />
      </div>

      <button type="submit" disabled={state.submitting} style={{
        width: '100%', padding: '12px', borderRadius: 10, border: 'none',
        background: state.submitting ? 'var(--land-muted)' : 'linear-gradient(135deg,#1D9E75,#085041)',
        color: '#fff', fontSize: 15, fontWeight: 700, cursor: state.submitting ? 'not-allowed' : 'pointer',
      }}>
        {state.submitting ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}

export default function ContactPage() {
  return (
    <PublicLayout>
      <section style={{ padding: '5rem 1.5rem 4rem', textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
        <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)', fontSize: 12, fontWeight: 700, color: 'var(--pub-brand, #1D9E75)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          Contact Us
        </span>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--land-text)', margin: '0 0 1rem', lineHeight: 1.2 }}>
          We&apos;d love to hear from you
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--land-muted)', lineHeight: 1.8, margin: 0 }}>
          Have a question, feedback, or need support? Send us a message and we&apos;ll get back to you as quickly as we can.
        </p>
      </section>

      <section style={{ padding: '0 1.5rem 5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--land-text)', marginBottom: '1.25rem' }}>Get in touch</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {contacts.map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{c.icon}</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--land-muted)', margin: '0 0 2px' }}>{c.label}</p>
                    <p style={{ fontSize: 14, color: 'var(--land-subtle)', margin: 0 }}>{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '1rem 1.25rem', background: 'var(--land-card)', border: '1px solid var(--land-border)', borderRadius: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--land-muted)', lineHeight: 1.7, margin: 0 }}>
                For billing issues or account problems, please include your building name and registered email so we can help you faster.
              </p>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </PublicLayout>
  )
}
