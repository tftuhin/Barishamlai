import type { Metadata } from 'next'
import { Inter, Hind_Siliguri } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { LanguageProvider } from '@/components/layout/LanguageContext'
import { ThemeProvider } from '@/components/layout/ThemeContext'
import { PostHogProvider } from '@/components/layout/PostHogProvider'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
})

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-hind',
})

export const metadata: Metadata = {
  title: 'বাড়ি সামলাই — ভবন ব্যবস্থাপনা সিস্টেম',
  description: 'আপনার ভবন, সামলানো হয়েছে। বিল, খরচ, রসিদ এবং বাসিন্দাদের যোগাযোগ — এক প্ল্যাটফর্মে।',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${inter.variable} ${hindSiliguri.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('bs_theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}` }} />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-4F5H83BZ8G" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-4F5H83BZ8G');` }} />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <Suspense>
              <PostHogProvider>
                {children}
              </PostHogProvider>
            </Suspense>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
