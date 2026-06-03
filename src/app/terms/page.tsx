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

export default function TermsPage() {
  return (
    <PublicLayout>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)', fontSize: 12, fontWeight: 700, color: 'var(--pub-brand, #1D9E75)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Legal</span>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--land-text)', margin: '0 0 0.5rem', lineHeight: 1.2 }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: 'var(--land-muted)', marginBottom: '3rem' }}>Last updated: January 1, 2025</p>
        <div style={{ borderTop: '1px solid var(--land-border)', paddingTop: '2.5rem' }}>
          <P>By accessing or using Bari Shamlai (&quot;the Service&quot;), you agree to be bound by these Terms of Service. Please read them carefully before using the platform.</P>

          <H2>1. Acceptance of Terms</H2>
          <P>By creating an account or using any part of the Service, you confirm that you are at least 18 years old, have the authority to enter into this agreement, and agree to these Terms in full.</P>

          <H2>2. Use of the Service</H2>
          <P>Bari Shamlai is a building management platform. You may use the Service only for lawful purposes. You agree not to:</P>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <Li>Use the Service to engage in fraudulent or deceptive practices</Li>
            <Li>Upload or transmit harmful, illegal, or offensive content</Li>
            <Li>Attempt to gain unauthorized access to other accounts or systems</Li>
            <Li>Collect data about other users without their consent</Li>
            <Li>Resell or sublicense access to the Service without written permission</Li>
          </ul>

          <H2>3. Accounts and Security</H2>
          <P>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately at support@barishamlai.app if you suspect unauthorized access.</P>

          <H2>4. Subscription and Billing</H2>
          <P>Some features require a paid subscription. By subscribing, you authorize us to charge the applicable fees to your chosen payment method. All fees are in Bangladeshi Taka (BDT) and are non-refundable except as described in our Refund Policy.</P>

          <H2>5. Data and Privacy</H2>
          <P>Your use of the Service is also governed by our Privacy Policy, incorporated into these Terms by reference.</P>

          <H2>6. Intellectual Property</H2>
          <P>All content, features, and functionality of the Service are owned by Bari Shamlai and are protected by applicable intellectual property laws. You may not copy, modify, or distribute any part of the Service without our written consent.</P>

          <H2>7. Termination</H2>
          <P>We reserve the right to suspend or terminate your account at any time if we reasonably believe you have violated these Terms.</P>

          <H2>8. Limitation of Liability</H2>
          <P>To the maximum extent permitted by applicable law, Bari Shamlai shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</P>

          <H2>9. Changes to Terms</H2>
          <P>We may update these Terms from time to time. We will notify registered users of material changes by email or via an in-app notice.</P>

          <H2>10. Contact</H2>
          <P>For questions about these Terms, contact us at support@barishamlai.app.</P>
        </div>
      </div>
    </PublicLayout>
  )
}
