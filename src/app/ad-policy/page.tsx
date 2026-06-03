import { PublicLayout } from '@/components/layout/PublicLayout'

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--land-text)', margin: '2.25rem 0 0.75rem' }}>{children}</h2>
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, color: 'var(--land-muted)', lineHeight: 1.85, margin: '0 0 1rem' }}>{children}</p>
}

export default function AdPolicyPage() {
  return (
    <PublicLayout>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)', fontSize: 12, fontWeight: 700, color: 'var(--pub-brand, #1D9E75)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Legal</span>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--land-text)', margin: '0 0 0.5rem', lineHeight: 1.2 }}>Ad Policy</h1>
        <p style={{ fontSize: 13, color: 'var(--land-muted)', marginBottom: '3rem' }}>Last updated: January 1, 2025</p>
        <div style={{ borderTop: '1px solid var(--land-border)', paddingTop: '2.5rem' }}>
          <P>This Ad Policy explains Bari Shamlai&apos;s approach to advertising — both within the platform and regarding how we handle any promotional content.</P>

          <H2>1. No Advertising Inside the App</H2>
          <P>Bari Shamlai is a paid subscription service. We do not display third-party advertisements inside the dashboard or any authenticated part of the platform. Your workspace is ad-free.</P>

          <H2>2. No Sale of User Data for Advertising</H2>
          <P>We do not sell, rent, or share your personal data or your tenants&apos; data with advertisers or advertising networks. Your data is used solely to provide you with the Service.</P>

          <H2>3. No Behavioral Tracking for Ads</H2>
          <P>We do not use behavioral tracking, retargeting pixels, or advertising cookies. The only cookies we use are essential cookies required for authentication and session management.</P>

          <H2>4. Marketing Communications</H2>
          <P>We may send occasional marketing emails about new features or updates. You can unsubscribe at any time by clicking the unsubscribe link in any marketing email or by contacting us at support@barishamlai.app.</P>
          <P>Transactional emails (bills, receipts, invitations, password resets) are necessary for the Service and cannot be unsubscribed from.</P>

          <H2>5. Promotional Content on the Website</H2>
          <P>The public Bari Shamlai website may include promotional content about our own products. This content is produced by us and is not paid advertising by any third party.</P>

          <H2>6. Affiliate Links</H2>
          <P>We may occasionally reference third-party services. If any such reference includes an affiliate relationship, we will clearly disclose it.</P>

          <H2>7. Changes to This Policy</H2>
          <P>We may update this Ad Policy from time to time. Changes will be posted on this page with an updated effective date.</P>

          <H2>8. Contact</H2>
          <P>If you have questions about this Ad Policy, contact us at support@barishamlai.app.</P>
        </div>
      </div>
    </PublicLayout>
  )
}
