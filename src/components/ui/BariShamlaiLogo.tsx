'use client'
import { motion } from 'framer-motion'

/**
 * The বাড়ি সামলাই (Bari Shamlai) logo mark.
 * Uses the building+rocket logo image.
 *
 * Props:
 *   size     — width/height in px (default 44)
 *   animated — whether to add hover animation (default false)
 *   variant  — 'color' for white bg container, 'white'/'dark' for no bg
 */
export function BariShamlaiMark({
  size = 44,
  animated = false,
  variant = 'color',
}: {
  size?: number
  animated?: boolean
  variant?: 'color' | 'white' | 'dark'
}) {
  const r = size * 0.25

  const inner = (
    <img
      src="/logo.webp"
      alt="Bari Shamlai"
      width={size}
      height={size}
      className="bari-logo-img"
      style={{ display: 'block', flexShrink: 0, objectFit: 'contain', borderRadius: r }}
    />
  )

  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: 1.08, rotate: 3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        style={{ display: 'inline-flex', flexShrink: 0 }}
      >
        {inner}
      </motion.div>
    )
  }

  return inner
}

/**
 * Full logo: mark + text
 * textColor defaults to white (designed for dark backgrounds)
 */
export function BariShamlaiLogo({
  size = 44,
  textColor = '#fff',
  subColor = 'rgba(255,255,255,0.45)',
  subText,
  animated = false,
  lang = 'bn',
}: {
  size?: number
  textColor?: string
  subColor?: string
  subText?: string
  animated?: boolean
  lang?: 'bn' | 'en'
}) {
  const appName = lang === 'bn' ? 'বাড়ি সামলাই' : 'Bari Shamlai'
  const gap = Math.round(size * 0.25)
  const nameFontSize = Math.round(size * 0.38)
  const subFontSize = Math.round(size * 0.24)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap }}>
      <BariShamlaiMark size={size} animated={animated} variant="color" />
      <div>
        <div style={{
          fontFamily: lang === 'bn' ? "var(--font-hind), var(--font-body)" : 'var(--font-body)',
          fontSize: nameFontSize,
          fontWeight: 700,
          color: textColor,
          lineHeight: 1.1,
          letterSpacing: lang === 'bn' ? '0' : '-0.3px',
        }}>
          {appName}
        </div>
        {subText && (
          <div style={{ fontSize: subFontSize, color: subColor, marginTop: 2 }}>
            {subText}
          </div>
        )}
      </div>
    </div>
  )
}
