'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Lang, translate, TranslationKey } from '@/lib/i18n'

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (k: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('bs_lang') as Lang | null : null
    if (saved === 'en' || saved === 'bn') setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') localStorage.setItem('bs_lang', l)
  }

  const t = (k: TranslationKey) => translate(k, lang)

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}

/** Tiny language toggle button — drop it anywhere.
 *  forceDark=true: always use dark-sidebar colours (no CSS-var dependency). */
export function LangToggle({ forceDark = false }: { forceDark?: boolean }) {
  const { lang, setLang } = useLang()
  const isEn = lang === 'en'

  const borderColor  = forceDark ? 'rgba(255,255,255,0.12)' : 'var(--land-border)'
  const bg           = forceDark ? 'rgba(255,255,255,0.06)' : 'var(--land-surface)'
  const color        = forceDark ? 'rgba(255,255,255,0.65)'  : 'var(--land-subtle)'
  const hoverColor   = forceDark ? '#fff'                    : 'var(--land-white)'
  const hoverBorder  = forceDark ? 'rgba(255,255,255,0.3)'   : 'var(--land-subtle)'

  return (
    <button
      onClick={() => setLang(isEn ? 'bn' : 'en')}
      title={isEn ? 'বাংলায় পরিবর্তন করুন' : 'Switch to English'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '4px 10px', borderRadius: 20,
        border: `1px solid ${borderColor}`,
        background: bg,
        color,
        fontSize: 12, fontWeight: 700, cursor: 'pointer',
        transition: 'all 0.2s', fontFamily: 'var(--font-body)',
        letterSpacing: '0.3px',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.color = hoverColor
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = hoverBorder
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.color = color
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = borderColor
      }}
    >
      {isEn ? 'BD' : 'EN'}
    </button>
  )
}
