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

export default function RefundPage() {
  return (
    <PublicLayout>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)', fontSize: 12, fontWeight: 700, color: 'var(--pub-brand, #1D9E75)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Legal</span>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--land-text)', margin: '0 0 0.5rem', lineHeight: 1.2 }}>Refund Policy</h1>
        <p style={{ fontSize: 13, color: 'var(--land-muted)', marginBottom: '3rem' }}>Last updated: January 1, 2025</p>
        <div style={{ borderTop: '1px solid var(--land-border)', paddingTop: '2.5rem' }}>
          <P>We want you to be satisfied with Bari Shamlai. This Refund Policy explains when and how refunds are issued for subscription payments.</P>

          <H2>1. Subscription Fees</H2>
          <P>All subscription fees are billed in advance on a monthly or multi-month basis. By subscribing, you authorize us to charge your payment method for the full period selected.</P>

          <H2>2. Free Tier</H2>
          <P>Bari Shamlai offers a free tier with limited features. We encourage you to evaluate the platform using the free tier before purchasing. No credit card is required.</P>

          <H2>3. Eligibility for Refunds</H2>
          <P>Refunds may be issued in the following circumstances:</P>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <Li><strong style={{ color: 'var(--land-text)' }}>Billing errors:</strong> If you were charged an incorrect amount due to a system error, we will refund the overcharged amount.</Li>
            <Li><strong style={{ color: 'var(--land-text)' }}>Duplicate charges:</strong> If your account was charged more than once for the same period, we will refund the duplicate charge.</Li>
            <Li><strong style={{ color: 'var(--land-text)' }}>Service outage:</strong> If the platform was unavailable for more than 48 consecutive hours due to issues on our end, you may request a pro-rated refund.</Li>
          </ul>

          <H2>4. Non-Refundable Situations</H2>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <Li>You changed your mind after purchasing</Li>
            <Li>You did not use the Service during the subscription period</Li>
            <Li>Your account was suspended for violation of our Terms of Service</Li>
            <Li>You purchased a plan after having the opportunity to evaluate it on the free tier</Li>
          </ul>

          <H2>5. How to Request a Refund</H2>
          <P>Contact us at support@barishamlai.app with your registered email, the amount charged, and the reason for your request. We will respond within 5 business days.</P>

          <H2>6. Refund Processing</H2>
          <P>Approved refunds will be processed to the original payment method within 7–14 business days.</P>

          <H2>7. Changes to This Policy</H2>
          <P>We reserve the right to modify this Refund Policy at any time. Changes will apply to subscriptions purchased after the effective date.</P>
        </div>
      </div>
    </PublicLayout>
  )
}
