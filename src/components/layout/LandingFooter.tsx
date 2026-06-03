'use client'
import { BariShamlaiMark } from '@/components/ui/BariShamlaiLogo'
import { useLang } from '@/components/layout/LanguageContext'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''
const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL ?? ''

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
            <li><a href={`${MAIN_URL}/#features`}>Features</a></li>
            <li><a href={`${MAIN_URL}/#pricing`}>Pricing</a></li>
            <li><a href={`${MAIN_URL}/#how`}>How it works</a></li>
            <li><a href={`${MAIN_URL}/#faq`}>FAQ</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <ul>
            <li><a href={`${APP_URL}/signup`}>Sign up</a></li>
            <li><a href={`${APP_URL}/login`}>Sign in</a></li>
            <li><a href={`${MAIN_URL}/about`}>About</a></li>
            <li><a href={`${MAIN_URL}/contact`}>Contact</a></li>
            <li><a href={`${MAIN_URL}/blog`}>Blog</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href={`${MAIN_URL}/privacy`}>Privacy</a></li>
            <li><a href={`${MAIN_URL}/terms`}>Terms</a></li>
            <li><a href={`${MAIN_URL}/refund`}>Refund</a></li>
            <li><a href={`${MAIN_URL}/data-security`}>Data security</a></li>
            <li><a href={`${MAIN_URL}/ad-policy`}>Ad policy</a></li>
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
