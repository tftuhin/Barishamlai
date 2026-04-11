import { PublicLayout } from '@/components/layout/PublicLayout'

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--land-text)', margin: '2.25rem 0 0.75rem' }}>{children}</h2>
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, color: 'var(--land-muted)', lineHeight: 1.85, margin: '0 0 1rem' }}>{children}</p>
}
function Li({ children }: { children: React.ReactNode }) {
  return <li style={{ fontSize: 15, color: 'var(--land-muted)', lineHeight: 1.85, marginBottom: '0.4rem' }}>{children}</li>
}

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)', fontSize: 12, fontWeight: 700, color: 'var(--pub-brand, #1D9E75)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Legal</span>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--land-text)', margin: '0 0 0.5rem', lineHeight: 1.2 }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: 'var(--land-muted)', marginBottom: '3rem' }}>Last updated: January 1, 2025</p>
        <div style={{ borderTop: '1px solid var(--land-border)', paddingTop: '2.5rem' }}>
          <P>Bari Shamlai (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard data when you use our platform.</P>

          <H2>1. Information We Collect</H2>
          <P>We collect information you provide directly, including:</P>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <Li>Account information (name, email address, phone number, password)</Li>
            <Li>Building and property details you enter into the platform</Li>
            <Li>Tenant and owner information you add to your buildings</Li>
            <Li>Payment and billing records</Li>
            <Li>Messages sent through the platform</Li>
          </ul>
          <P>We also collect usage data automatically — pages visited, browser type, IP address, and device information.</P>

          <H2>2. How We Use Your Information</H2>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <Li>Provide and maintain the Service</Li>
            <Li>Send transactional emails (bills, receipts, invitations, password resets)</Li>
            <Li>Respond to your support requests</Li>
            <Li>Improve the platform based on usage patterns</Li>
            <Li>Comply with legal obligations</Li>
          </ul>
          <P>We do not sell your personal data to third parties.</P>

          <H2>3. Data Sharing</H2>
          <P>We share data only with service providers who help us operate the platform (Supabase for database hosting, Brevo for email delivery). These providers are contractually obligated to keep your data confidential.</P>

          <H2>4. Data Retention</H2>
          <P>We retain your data for as long as your account is active. If you delete your account, we will delete or anonymize your personal data within 30 days, except where retention is required by law.</P>

          <H2>5. Security</H2>
          <P>We use industry-standard measures including encrypted connections (TLS), encrypted storage, and restricted access controls. See our Data Security page for full details.</P>

          <H2>6. Your Rights</H2>
          <P>You have the right to access, correct, or delete your personal data. Contact us at support@barishamlai.app and we will respond within 30 days.</P>

          <H2>7. Cookies</H2>
          <P>We use only essential cookies required for authentication and session management. We do not use advertising or third-party tracking cookies.</P>

          <H2>8. Children&apos;s Privacy</H2>
          <P>The Service is not directed to children under 18. We do not knowingly collect personal information from children.</P>

          <H2>9. Changes to This Policy</H2>
          <P>We may update this Privacy Policy periodically. We will notify you of significant changes via email or an in-app notice.</P>

          <H2>10. Contact</H2>
          <P>For privacy-related questions, contact us at support@barishamlai.app.</P>
        </div>
      </div>
    </PublicLayout>
  )
}
