import { PublicLayout } from '@/components/layout/PublicLayout'

const measures = [
  { icon: '🔐', title: 'Encryption at Rest',    body: 'All data stored in our database is encrypted at rest using AES-256. Backups are also encrypted before storage.' },
  { icon: '🌐', title: 'Encryption in Transit', body: 'All communication between your browser and our servers is encrypted using TLS 1.2+. We enforce HTTPS across all endpoints.' },
  { icon: '🏗️', title: 'Secure Infrastructure',  body: 'Hosted on Supabase (PostgreSQL) backed by AWS, with enterprise-grade security controls including network isolation and access logging.' },
  { icon: '🔑', title: 'Authentication',         body: 'Sessions are protected with cryptographically signed JWTs. Passwords are hashed with bcrypt (cost factor 12) and never stored in plain text.' },
  { icon: '👥', title: 'Role-Based Access',      body: 'Every user has a role (Admin, Owner, or Tenant) with strict permissions. Users can only access data relevant to their building and role.' },
  { icon: '🔄', title: 'Regular Backups',        body: 'Database backups are performed daily and retained for 7 days. Point-in-time recovery is available for the previous 24 hours.' },
]

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--land-text)', margin: '2.25rem 0 0.75rem' }}>{children}</h2>
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, color: 'var(--land-muted)', lineHeight: 1.85, margin: '0 0 1rem' }}>{children}</p>
}

export default function DataSecurityPage() {
  return (
    <PublicLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 3.5rem' }}>
          <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)', fontSize: 12, fontWeight: 700, color: 'var(--pub-brand, #1D9E75)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Security</span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--land-text)', margin: '0 0 1rem', lineHeight: 1.2 }}>Data Security</h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--land-muted)', lineHeight: 1.8, margin: 0 }}>
            Your data and your tenants&apos; data are your most important assets. Here&apos;s exactly how we protect them.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '4rem' }}>
          {measures.map(m => (
            <div key={m.title} style={{ background: 'var(--land-card)', border: '1px solid var(--land-border)', borderRadius: 14, padding: '1.5rem' }}>
              <div style={{ fontSize: 26, marginBottom: '0.75rem' }}>{m.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--land-text)', marginBottom: '0.5rem' }}>{m.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--land-muted)', lineHeight: 1.7, margin: 0 }}>{m.body}</p>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--land-border)', paddingTop: '3rem' }}>
          <H2>Vulnerability Reporting</H2>
          <P>If you discover a security vulnerability, please report it responsibly by emailing security@barishamlai.app. We take all reports seriously and will respond within 48 hours.</P>

          <H2>Third-Party Services</H2>
          <P>We use Supabase for database hosting, Brevo for transactional email, and Vercel for application hosting. Each provider is evaluated for security compliance. We do not share data with advertising networks or data brokers.</P>

          <H2>Incident Response</H2>
          <P>In the event of a data breach affecting your personal data, we will notify you within 72 hours of becoming aware of the incident, describing what happened, what data was affected, and what steps we are taking.</P>

          <H2>Compliance</H2>
          <P>Bari Shamlai is operated in compliance with applicable Bangladeshi data protection guidelines. We continually review our practices to align with evolving best practices.</P>

          <H2>Questions</H2>
          <P>For security-related questions, email us at security@barishamlai.app.</P>
        </div>
      </div>
    </PublicLayout>
  )
}
