'use client'
import Link from 'next/link'
import Image from 'next/image'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { useLang } from '@/components/layout/LanguageContext'
import { posts } from './posts'
import type { Lang } from '@/lib/i18n'

function formatDate(dateStr: string, lang: Lang) {
  const date = new Date(dateStr)
  if (lang === 'bn') {
    const bn = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
    return `${date.getDate()} ${bn[date.getMonth()]}, ${date.getFullYear()}`
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogPage() {
  const { t, lang } = useLang()
  const bn = lang === 'bn'

  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ padding: '5rem 1.5rem 3.5rem', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <span style={{
          display: 'inline-block', padding: '4px 14px', borderRadius: 20,
          background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)',
          fontSize: 12, fontWeight: 700, color: 'var(--pub-brand, #1D9E75)',
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem',
          fontFamily: bn ? 'var(--font-bn)' : 'inherit',
        }}>
          {t('blogHeroBadge')}
        </span>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800,
          color: 'var(--land-text)', margin: '0 0 1rem', lineHeight: 1.2,
          fontFamily: bn ? 'var(--font-bn)' : 'inherit',
        }}>
          {t('blogHeroTitle')}
        </h1>
        <p style={{
          fontSize: '1.1rem', color: 'var(--land-muted)', lineHeight: 1.8, margin: 0,
          fontFamily: bn ? 'var(--font-bn)' : 'inherit',
        }}>
          {t('blogHeroSubtitle')}
        </p>
      </section>

      {/* Posts grid */}
      <section style={{ padding: '2rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <article
                style={{
                  background: 'var(--land-card)', border: '1px solid var(--land-border)',
                  borderRadius: 16, overflow: 'hidden', height: '100%',
                  display: 'flex', flexDirection: 'column',
                  transition: 'border-color 0.2s, transform 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'rgba(29,158,117,0.5)'
                  el.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--land-border)'
                  el.style.transform = 'translateY(0)'
                }}
              >
                {/* Cover image */}
                <div style={{ position: 'relative', height: 180, flexShrink: 0, overflow: 'hidden' }}>
                  <Image
                    src={post.coverImage}
                    alt={post.coverAlt}
                    fill
                    style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>

                {/* Card body */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                  {/* Category */}
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                    background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.2)',
                    fontSize: 11, fontWeight: 700, color: 'var(--pub-brand, #1D9E75)',
                    letterSpacing: '0.06em', textTransform: 'uppercase', alignSelf: 'flex-start',
                    fontFamily: bn ? 'var(--font-bn)' : 'inherit',
                  }}>
                    {post.category[lang]}
                  </span>

                  {/* Title */}
                  <h2 style={{
                    fontSize: '1rem', fontWeight: 700, color: 'var(--land-text)',
                    margin: 0, lineHeight: 1.4,
                    fontFamily: bn ? 'var(--font-bn)' : 'inherit',
                  }}>
                    {post.title[lang]}
                  </h2>

                  {/* Excerpt */}
                  <p style={{
                    fontSize: 13, color: 'var(--land-muted)', lineHeight: 1.7,
                    margin: 0, flex: 1,
                    fontFamily: bn ? 'var(--font-bn)' : 'inherit',
                  }}>
                    {post.excerpt[lang]}
                  </p>

                  {/* Meta + Read more */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--land-muted)', fontFamily: bn ? 'var(--font-bn)' : 'inherit' }}>
                      {formatDate(post.date, lang)} · {post.readingTime} {t('blogMinRead')}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--pub-brand, #1D9E75)', fontFamily: bn ? 'var(--font-bn)' : 'inherit' }}>
                      {t('blogReadMore')}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  )
}
