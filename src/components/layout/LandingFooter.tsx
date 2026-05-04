'use client'
import Link from 'next/link'
import { BariShamlaiMark } from '@/components/ui/BariShamlaiLogo'
import { useLang } from '@/components/layout/LanguageContext'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

export function LandingFooter() {
  const { lang } = useLang()

  return (
    <footer className="footer wrap">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="nav-logo" style={{ fontSize: 16 }}>
            <BariShamlaiMark size={22} />
            <span>{lang === 'bn' ? 'বাড়ি সামলাই' : 'Bari Shamlai'}</span>
          </div>
          <p>The smartest way to manage every flat, every floor, every month. Built for Bangladesh&apos;s apartment managers.</p>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <ul>
            <li><a href={`${APP_URL}/signup`}>Sign up</a></li>
            <li><a href={`${APP_URL}/login`}>Sign in</a></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/refund">Refund</Link></li>
            <li><Link href="/data-security">Data security</Link></li>
            <li><Link href="/ad-policy">Ad policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Bari Shamlai · All rights reserved</span>
        <span>Made in Dhaka</span>
      </div>
    </footer>
  )
}
