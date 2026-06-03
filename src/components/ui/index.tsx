'use client'
import { cn, getStatusColor } from '@/lib/utils'
import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Card({ children, className, style, hover }: { children: ReactNode; className?: string; style?: React.CSSProperties; hover?: boolean }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' } : undefined}
      transition={{ duration: 0.2 }}
      style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '14px', ...style }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Badge({ status, label }: { status: string; label?: string }) {
  const display = label ?? status.replace('_', ' ')
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: '20px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.02em',
      border: '1px solid',
    }} className={getStatusColor(status)}>
      {display}
    </span>
  )
}

export function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    ADMIN: 'background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe',
    OWNER: 'background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0',
    TENANT: 'background:#fefce8;color:#a16207;border:1px solid #fef08a',
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
      borderRadius: '20px', fontSize: '11px', fontWeight: 600,
      ...(Object.fromEntries((styles[role] || '').split(';').filter(Boolean).map(s => s.split(':')))),
    }}>
      {role}
    </span>
  )
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', style, loading }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md'; disabled?: boolean; type?: 'button' | 'submit'; style?: React.CSSProperties; loading?: boolean
}) {
  const colorMap = {
    primary:   { background: 'var(--brand)',      color: '#fff',                    borderColor: 'var(--brand)',        hoverBg: 'var(--brand-dark)' },
    secondary: { background: '#fff',              color: 'var(--text-primary)',      borderColor: 'var(--border-strong)', hoverBg: 'var(--surface-subtle)' },
    danger:    { background: '#fef2f2',           color: '#dc2626',                 borderColor: '#fecaca',              hoverBg: '#fee2e2' },
    ghost:     { background: 'transparent',       color: 'var(--text-secondary)',   borderColor: 'transparent',          hoverBg: 'rgba(0,0,0,0.04)' },
  }
  const c = colorMap[variant]
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-body)', fontWeight: 500, borderRadius: '8px',
    border: `1px solid ${c.borderColor}`,
    background: c.background, color: c.color,
    opacity: disabled ? 0.5 : 1,
    padding: size === 'sm' ? '6px 12px' : '9px 18px',
    fontSize: size === 'sm' ? '13px' : '14px',
    ...style,
  }
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={base}
      whileHover={!(disabled || loading) ? { background: c.hoverBg } : undefined}
      whileTap={!(disabled || loading) ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.15 }}
    >
      {loading && (
        <svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )}
      {children}
    </motion.button>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem' }}
    >
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--brand)', margin: 0, lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  )
}

export function StatCard({ label, value, sub, icon, color = 'var(--brand)' }: {
  label: string; value: string | number; sub?: string; icon?: string; color?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem 1.5rem', cursor: 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 8px' }}>{label}</p>
          <motion.p
            key={String(value)}
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: 'backOut' }}
            style={{ fontSize: '1.75rem', fontWeight: 600, color, margin: 0, lineHeight: 1 }}
          >
            {value}
          </motion.p>
          {sub && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>{sub}</p>}
        </div>
        {icon && (
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d={icon} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ textAlign: 'center', padding: '4rem 2rem' }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--surface-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.div>
      <p style={{ fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px' }}>{title}</p>
      {description && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>{description}</p>}
      {action}
    </motion.div>
  )
}

export function Modal({ open, onClose, title, children, maxWidth }: { open: boolean; onClose: () => void; title: string; children: ReactNode; maxWidth?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            style={{ position: 'relative', background: '#fff', borderRadius: '16px', width: '100%', maxWidth: maxWidth ?? '520px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--brand)', margin: 0 }}>{title}</h2>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, background: 'var(--surface-subtle)' }}
                whileTap={{ scale: 0.9 }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', borderRadius: '6px', display: 'flex' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </motion.button>
            </div>
            <div style={{ padding: '1.5rem' }}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '3px' }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: '8px',
  border: '1.5px solid var(--border-strong)', fontSize: '14px',
  background: 'var(--surface)', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'var(--font-body)', transition: 'border-color 0.2s, box-shadow 0.2s',
}

export const selectStyle: React.CSSProperties = { ...inputStyle }
