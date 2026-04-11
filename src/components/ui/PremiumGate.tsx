'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

const FEATURE_PERKS = [
  'Unlimited units (free plan: 5 max)',
  'Gas bill generation & meter tracking',
  'Digital PDF receipts via email',
  'In-app messaging & announcements',
  'Advanced financial reports',
  'Priority support',
]

export function PremiumGate({ feature }: { feature: string }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', background: 'var(--surface)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{
          background: '#fff', borderRadius: '20px', padding: '3rem 2.5rem',
          maxWidth: '480px', width: '100%', textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* Lock icon */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #1D9E75, #085041)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(29,158,117,0.3)',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C9.24 2 7 4.24 7 7v2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2V7c0-2.76-2.24-5-5-5zm0 2c1.65 0 3 1.35 3 3v2H9V7c0-1.65 1.35-3 3-3zm0 9a2 2 0 110 4 2 2 0 010-4z" fill="white"/>
          </svg>
        </motion.div>

        <div style={{
          display: 'inline-block', padding: '4px 14px', borderRadius: '20px',
          background: 'rgba(29,158,117,0.08)', color: '#1D9E75',
          fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', marginBottom: '1rem',
        }}>
          Premium Feature
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1A2E2A', marginBottom: '0.75rem', lineHeight: 1.2 }}>
          {feature} requires Premium
        </h1>
        <p style={{ color: '#64748B', fontSize: '15px', lineHeight: 1.6, marginBottom: '2rem' }}>
          Upgrade your building to FlatDesk Premium to unlock this feature and everything else in the platform.
        </p>

        {/* Feature list */}
        <div style={{
          background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem',
          marginBottom: '2rem', textAlign: 'left',
        }}>
          {FEATURE_PERKS.map((perk, i) => (
            <motion.div
              key={perk}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.3 }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" fill="#1D9E75" opacity="0.12"/>
                <path d="M7 12l3.5 3.5L17 8" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: '13.5px', color: '#334155' }}>{perk}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/dashboard/settings"
            style={{
              display: 'block', padding: '14px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #1D9E75, #085041)',
              color: '#fff', fontWeight: 700, fontSize: '15px',
              textDecoration: 'none', marginBottom: '12px',
              boxShadow: '0 4px 14px rgba(29,158,117,0.35)',
            }}
          >
            Contact Admin to Upgrade
          </Link>
        </motion.div>
        <Link
          href="/dashboard"
          style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'none' }}
        >
          ← Back to Dashboard
        </Link>
      </motion.div>
    </div>
  )
}
