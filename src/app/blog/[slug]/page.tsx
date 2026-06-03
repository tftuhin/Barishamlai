'use client'
import Link from 'next/link'
import Image from 'next/image'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { useLang } from '@/components/layout/LanguageContext'
import { getPost } from '../posts'
import type { Lang } from '@/lib/i18n'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

function formatDate(dateStr: string, lang: Lang) {
  const date = new Date(dateStr)
  if (lang === 'bn') {
    const months = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Parse inline bold (**text**) */
function parseInline(text: string, bn: boolean): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} style={{ color: 'var(--land-text)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
      : part
  )
}

function isTableRow(line: string) {
  const t = line.trim()
  return t.startsWith('|') && t.endsWith('|')
}

function isSeparatorRow(line: string) {
  return /^\|[\s\-:|]+\|$/.test(line.trim())
}

function parseTableRow(line: string): string[] {
  const parts = line.trim().split('|')
  // remove first and last empty strings from leading/trailing |
  return parts.slice(1, parts.length - 1).map(c => c.trim())
}

function renderContent(markdown: string, bn: boolean): React.ReactNode[] {
  const fontFamily = bn ? 'var(--font-bn)' : 'inherit'
  const lines = markdown.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  let listItems: string[] = []

  function flushList(key: number) {
    if (listItems.length === 0) return
    elements.push(
      <ul key={`ul-${key}`} style={{ margin: '0 0 1.25rem 1.25rem', padding: 0 }}>
        {listItems.map((item, j) => (
          <li key={j} style={{ fontSize: 15, color: 'var(--land-muted)', lineHeight: 1.85, marginBottom: '0.4rem', fontFamily }}>
            {parseInline(item, bn)}
          </li>
        ))}
      </ul>
    )
    listItems = []
  }

  while (i < lines.length) {
    const line = lines[i]

    // Inline image: ![alt](url)
    if (line.startsWith('![')) {
      flushList(i)
      const match = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
      if (match) {
        const [, alt, src] = match
        elements.push(
          <div key={`img-${i}`} style={{ margin: '1.75rem 0', borderRadius: 12, overflow: 'hidden', position: 'relative', aspectRatio: '16/9' }}>
            <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} sizes="(max-width: 760px) 100vw, 760px" />
          </div>
        )
      }
      i++; continue
    }

    // Table block
    if (isTableRow(line)) {
      flushList(i)
      const tableLines: string[] = []
      while (i < lines.length && isTableRow(lines[i])) {
        tableLines.push(lines[i])
        i++
      }
      const rows = tableLines.filter(l => !isSeparatorRow(l))
      if (rows.length === 0) continue
      const [headerRow, ...dataRows] = rows
      const headers = parseTableRow(headerRow)
      elements.push(
        <div key={`tbl-${i}`} style={{ overflowX: 'auto', margin: '1.5rem 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily }}>
            <thead>
              <tr>
                {headers.map((h, j) => (
                  <th key={j} style={{
                    background: 'rgba(29,158,117,0.12)', color: 'var(--land-text)',
                    fontWeight: 700, padding: '10px 14px', textAlign: 'left',
                    border: '1px solid var(--land-border)', whiteSpace: 'nowrap',
                  }}>
                    {parseInline(h, bn)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, j) => (
                <tr key={j} style={{ background: j % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  {parseTableRow(row).map((cell, k) => (
                    <td key={k} style={{
                      padding: '9px 14px', border: '1px solid var(--land-border)',
                      color: 'var(--land-muted)', verticalAlign: 'top', lineHeight: 1.6,
                    }}>
                      {parseInline(cell, bn)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // H2
    if (line.startsWith('## ')) {
      flushList(i)
      elements.push(
        <h2 key={i} style={{
          fontSize: '1.35rem', fontWeight: 700, color: 'var(--land-text)',
          margin: '2.25rem 0 0.75rem', lineHeight: 1.3, fontFamily,
        }}>
          {line.slice(3)}
        </h2>
      )
      i++; continue
    }

    // H3
    if (line.startsWith('### ')) {
      flushList(i)
      elements.push(
        <h3 key={i} style={{
          fontSize: '1.05rem', fontWeight: 700, color: 'var(--land-text)',
          margin: '1.75rem 0 0.5rem', lineHeight: 1.4, fontFamily,
        }}>
          {line.slice(4)}
        </h3>
      )
      i++; continue
    }

    // Blockquote / callout (> text)
    if (line.startsWith('> ')) {
      flushList(i)
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      const text = quoteLines.join(' ')
      elements.push(
        <div key={`bq-${i}`} style={{
          background: 'rgba(29,158,117,0.07)', borderLeft: '3px solid #1D9E75',
          borderRadius: '0 10px 10px 0', padding: '1rem 1.25rem',
          margin: '1.5rem 0', fontSize: 14, color: 'var(--land-muted)',
          lineHeight: 1.75, fontFamily,
        }}>
          {parseInline(text, bn)}
        </div>
      )
      continue
    }

    // Horizontal rule
    if (line.startsWith('---')) {
      flushList(i)
      elements.push(
        <hr key={i} style={{ border: 'none', borderTop: '1px solid var(--land-border)', margin: '2rem 0' }} />
      )
      i++; continue
    }

    // List item
    if (line.startsWith('- ')) {
      listItems.push(line.slice(2))
      i++; continue
    }

    // Blank line
    if (line.trim() === '') {
      flushList(i)
      i++; continue
    }

    // Paragraph
    flushList(i)
    elements.push(
      <p key={i} style={{ fontSize: 15, color: 'var(--land-muted)', lineHeight: 1.85, margin: '0 0 1rem', fontFamily }}>
        {parseInline(line, bn)}
      </p>
    )
    i++
  }

  flushList(lines.length)
  return elements
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const { t, lang } = useLang()
  const bn = lang === 'bn'
  const post = getPost(slug)

  return (
    <PublicLayout>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '4.5rem 1.5rem 6rem' }}>
        {/* Back link */}
        <Link href="/blog" style={{
          display: 'inline-block', fontSize: 14, fontWeight: 600,
          color: 'var(--pub-brand, #1D9E75)', textDecoration: 'none',
          marginBottom: '2rem', fontFamily: bn ? 'var(--font-bn)' : 'inherit',
        }}>
          {t('blogBackToList')}
        </Link>

        {!post ? (
          <p style={{ color: 'var(--land-muted)', fontFamily: bn ? 'var(--font-bn)' : 'inherit' }}>
            {t('blogNotFound')}
          </p>
        ) : (
          <article>
            {/* Cover image */}
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '16/7', marginBottom: '2rem' }}>
              <Image src={post.coverImage} alt={post.coverAlt} fill style={{ objectFit: 'cover' }} sizes="760px" priority />
            </div>

            {/* Category */}
            <span style={{
              display: 'inline-block', padding: '3px 12px', borderRadius: 20,
              background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.2)',
              fontSize: 11, fontWeight: 700, color: 'var(--pub-brand, #1D9E75)',
              letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '1rem',
              fontFamily: bn ? 'var(--font-bn)' : 'inherit',
            }}>
              {post.category[lang]}
            </span>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800,
              color: 'var(--land-text)', margin: '0 0 1.25rem', lineHeight: 1.2,
              fontFamily: bn ? 'var(--font-bn)' : 'inherit',
            }}>
              {post.title[lang]}
            </h1>

            {/* Meta */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center',
              paddingBottom: '1.75rem', borderBottom: '1px solid var(--land-border)',
              marginBottom: '2rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#1D9E75,#085041)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>
                  {post.author[lang][0]}
                </div>
                <span style={{ fontSize: 13, color: 'var(--land-text)', fontWeight: 600, fontFamily: bn ? 'var(--font-bn)' : 'inherit' }}>
                  {t('blogBy')} {post.author[lang]}
                </span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--land-muted)', fontFamily: bn ? 'var(--font-bn)' : 'inherit' }}>
                {formatDate(post.date, lang)}
              </span>
              <span style={{ fontSize: 13, color: 'var(--land-muted)', fontFamily: bn ? 'var(--font-bn)' : 'inherit' }}>
                {post.readingTime} {t('blogMinRead')}
              </span>
            </div>

            {/* Body */}
            <div>{renderContent(post.content[lang], bn)}</div>

            {/* Footer CTA */}
            <div style={{
              marginTop: '3rem', padding: '2rem', borderRadius: 16,
              background: 'rgba(29,158,117,0.07)', border: '1px solid rgba(29,158,117,0.2)',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '1rem', fontWeight: 700, color: 'var(--land-text)',
                margin: '0 0 0.5rem', fontFamily: bn ? 'var(--font-bn)' : 'inherit',
              }}>
                {bn ? 'বাড়ি সামলাই ব্যবহার করে দেখুন — বিনামূল্যে শুরু করুন' : 'Ready to simplify your building management?'}
              </p>
              <p style={{
                fontSize: 13, color: 'var(--land-muted)', margin: '0 0 1.25rem',
                fontFamily: bn ? 'var(--font-bn)' : 'inherit',
              }}>
                {bn ? 'হাজারো বাড়িওয়ালা ইতিমধ্যে বাড়ি সামলাই ব্যবহার করছেন।' : 'Join thousands of property managers across Bangladesh.'}
              </p>
              <Link href={`${APP_URL}/signup`} style={{
                display: 'inline-block', padding: '10px 24px', borderRadius: 10,
                background: 'linear-gradient(135deg, #1D9E75, #085041)',
                color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(29,158,117,0.3)',
                fontFamily: bn ? 'var(--font-bn)' : 'inherit',
              }}>
                {bn ? 'বিনামূল্যে শুরু করুন' : 'Get started free'}
              </Link>
            </div>
          </article>
        )}
      </div>
    </PublicLayout>
  )
}
