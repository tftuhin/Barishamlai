'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useLang } from '@/components/layout/LanguageContext'
import { LandingNavbar } from '@/components/layout/LandingNavbar'
import { LandingFooter } from '@/components/layout/LandingFooter'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

// ── Copy / strings (bilingual) ─────────────────────────────────────────
interface CopyT {
  nav: { features: string; how: string; pricing: string; faq: string; signin: string; start: string }
  eyebrow: string
  h1Lines: string[][]
  h1Italic: string
  sub: string
  ctaPrimary: string
  ctaSecondary: string
  metas: string[]
  kpis: { val: number; suf: string; lbl: string }[]
  painEyebrow: string
  painTitle: [string, string, string]
  pain: [string, string, string][]
  featEyebrow: string
  featTitle: [string, string, string]
  stepsEyebrow: string
  stepsTitle: [string, string]
  steps: [string, string][]
  pricingEyebrow: string
  pricingTitle: [string, string]
  pricingSub: string
  tstmEyebrow: string
  tstmTitle: [string, string, string]
  testimonials: [string, string, string][]
  faqEyebrow: string
  faqTitle: [string]
  faq: [string, string][]
  finalEyebrow: string
  finalTitle: [string, string, string]
  finalSub: string
}

const COPY: Record<string, CopyT> = {
  en: {
    nav: { features: 'Features', how: 'How', pricing: 'Pricing', faq: 'FAQ', signin: 'Sign in', start: 'Get Started' },
    eyebrow: "Built for Bangladesh's apartment managers",
    h1Lines: [['Manage', 'every'], ['flat,', 'every', 'floor,'], ['every', 'month.']],
    h1Italic: 'every',
    sub: 'Bari Shamlai replaces your rent notebook, WhatsApp group, and spreadsheet with one clean platform. Bills, payments, gas, service charge — automated.',
    ctaPrimary: 'Start free — no card required',
    ctaSecondary: 'See how it works',
    metas: ['No credit card', '5-min setup', 'Made for BD'],
    kpis: [
      { val: 500, suf: '+', lbl: 'Buildings using Bari Shamlai' },
      { val: 18, suf: 'h', lbl: 'Hours saved per manager / month' },
      { val: 96, suf: '%', lbl: 'On-time payment rate' },
      { val: 5, suf: 'min', lbl: 'From signup to live' },
    ],
    painEyebrow: 'Sound familiar?',
    painTitle: ['Managing a building', "shouldn't feel like ", 'this'],
    pain: [
      ['The rent notebook', 'Crossed-out entries, smudged names, disputes over what was actually paid. One torn page and it\'s gone.', '📓'],
      ['WhatsApp chaos', '"Did you pay?" texts every month — followed by arguments, excuses, and no paper trail.', '💬'],
      ['Spreadsheet pain', 'Your gas bill formula broke again. Version 17 of the month-end Excel — sent to the wrong group.', '📊'],
      ['Receipt disputes', 'Tenant swears they paid. You have no proof. The argument takes an hour. Trust is lost permanently.', '🧾'],
      ['Gas split confusion', "Calculating each flat's gas share from meter readings takes three hours and still causes disagreements.", '⛽'],
      ['No visibility', "You're not sure who's paid, who owes what, or what the building actually earned this month.", '📡'],
    ],
    featEyebrow: 'Everything you need',
    featTitle: ['One platform.', 'Every task ', 'handled.'],
    stepsEyebrow: 'Simple by design',
    stepsTitle: ['Up and running', 'in three steps.'],
    steps: [
      ['Set up your building', 'Add your building name, enter each flat and floor, set monthly rent and charges. Takes under 5 minutes.'],
      ['Invite your residents', 'Each owner and tenant gets their own login. They see only their unit — their bills, their receipts, their history.'],
      ['Run on autopilot', 'Generate bills, collect payments, issue receipts, track gas — automated every month. Your job just got simpler.'],
    ],
    pricingEyebrow: 'Pricing',
    pricingTitle: ['Pick a plan.', 'Pay monthly.'],
    pricingSub: 'Start free. Upgrade when your building grows. No contracts, no hidden fees.',
    tstmEyebrow: 'Testimonials',
    tstmTitle: ['Trusted by building', 'managers across ', 'Dhaka.'],
    testimonials: [
      ['Before Bari Shamlai, I tracked rent in a notebook and chased tenants on WhatsApp every month. Now receipts go out automatically. I don\'t even think about it anymore.', 'Rafiqul Islam', 'Building Manager · Bashundhara R/A'],
      ["I used to rely on a caretaker to collect rent and give me a summary — which was never accurate. Now I see exactly who's paid from my phone, wherever I am.", 'Farida Sultana', 'Property Owner · Uttara'],
      ["I used to argue with my building manager about whether I'd paid the service charge. Now I just show my Bari Shamlai receipt. No more disputes. Ever.", 'Arif Hossain', 'Tenant · Gulshan-2'],
    ],
    faqEyebrow: 'FAQ',
    faqTitle: ['Common questions'],
    faq: [
      ['What happens when I exceed 5 units on the free plan?', "You'll be prompted to upgrade to a paid plan. Your data stays exactly where it is — no migration needed. The new units simply unlock once payment clears."],
      ['How does billing and rent collection work?', 'You generate monthly bills with a click. Payments are logged manually or auto-tracked when bKash / Nagad confirms. PDF receipts are issued the moment payment is recorded.'],
      ['Can tenants and owners see their own portal?', 'Yes. Every resident gets a login that shows only their unit — their bills, receipts, announcements, and gas history. Privacy is enforced at the row level.'],
      ['How is gas bill calculated?', "Enter the previous and current meter readings for each unit. Bari Shamlai computes per-unit consumption, applies the building's gas tariff, and issues bills automatically — auditable and instant."],
      ['Is my data secure?', "All data is encrypted in transit and at rest. Backups run nightly across two regions. We are GDPR-aligned and follow Bangladesh's Digital Security Act."],
      ['How do I upgrade from the free plan?', 'Click any paid plan, complete checkout, and your account manager activates premium features within 24 hours. You can downgrade or cancel any time, no questions asked.'],
    ],
    finalEyebrow: 'Get started today',
    finalTitle: ['Your building deserves', 'better than ', 'a notebook.'],
    finalSub: "Join 500+ building managers who've replaced chaos with clarity. Free to start. No credit card.",
  },
  bn: {
    nav: { features: 'ফিচার', how: 'কীভাবে', pricing: 'মূল্য', faq: 'প্রশ্ন', signin: 'সাইন ইন', start: 'শুরু করুন' },
    eyebrow: 'বাংলাদেশের ভবন ব্যবস্থাপকদের জন্য',
    h1Lines: [['প্রতিটি', 'ফ্ল্যাট,'], ['প্রতিটি', 'তলা,'], ['প্রতি', 'মাসে।']],
    h1Italic: 'প্রতিটি',
    sub: 'বাড়ি সামলাই আপনার ভাড়ার খাতা, হোয়াটসঅ্যাপ গ্রুপ ও স্প্রেডশিট বদলে দেয় একটিমাত্র পরিচ্ছন্ন প্ল্যাটফর্ম দিয়ে। বিল, পেমেন্ট, গ্যাস, সার্ভিস চার্জ — সব স্বয়ংক্রিয়।',
    ctaPrimary: 'ফ্রি শুরু করুন',
    ctaSecondary: 'কীভাবে কাজ করে দেখুন',
    metas: ['কার্ড লাগবে না', '৫ মিনিটে সেটআপ', 'বাংলাদেশের জন্য তৈরি'],
    kpis: [
      { val: 500, suf: '+', lbl: 'ভবন বাড়ি সামলাই ব্যবহার করছে' },
      { val: 18, suf: 'ঘ.', lbl: 'প্রতি মাসে সঞ্চিত সময়' },
      { val: 96, suf: '%', lbl: 'সময়মতো পেমেন্ট হার' },
      { val: 5, suf: 'মি.', lbl: 'সাইনআপ থেকে চালু' },
    ],
    painEyebrow: 'চেনা শোনাচ্ছে?',
    painTitle: ['ভবন ব্যবস্থাপনা এমন', 'হওয়া ', 'উচিত নয়'],
    pain: [
      ['ভাড়ার খাতা', 'কাটাকাটি, ঝাপসা নাম, কে কত দিল তার বিতর্ক। একটি পাতা ছিঁড়লেই সব শেষ।', '📓'],
      ['হোয়াটসঅ্যাপ বিশৃঙ্খলা', 'প্রতি মাসে "আপনি কি দিয়েছেন?" — তর্ক, অজুহাত, কোনো রেকর্ড নেই।', '💬'],
      ['স্প্রেডশিট কষ্ট', 'গ্যাস বিলের ফর্মুলা আবার ভেঙেছে। মাস শেষের এক্সেলের ১৭ নম্বর সংস্করণ — ভুল গ্রুপে।', '📊'],
      ['রসিদ বিতর্ক', 'ভাড়াটিয়া বলছে দিয়েছে। আপনার কাছে প্রমাণ নেই। তর্কে এক ঘণ্টা যায়।', '🧾'],
      ['গ্যাস ভাগের জটিলতা', 'মিটার পড়ে প্রতি ফ্ল্যাটের ভাগ বের করতে তিন ঘণ্টা — তবু মতবিরোধ থাকে।', '⛽'],
      ['কোনো স্বচ্ছতা নেই', 'কে দিয়েছে, কে বাকি, এই মাসে ভবন আসলে কত আয় করেছে — কিছুই নিশ্চিত নন।', '📡'],
    ],
    featEyebrow: 'যা যা দরকার',
    featTitle: ['একটি প্ল্যাটফর্ম।', 'সব ', 'কাজ সামলে।'],
    stepsEyebrow: 'সরল ডিজাইন',
    stepsTitle: ['চালু হবেন', 'তিন ধাপে।'],
    steps: [
      ['আপনার ভবন সেট করুন', 'ভবনের নাম দিন, প্রতিটি ফ্ল্যাট ও তলা যোগ করুন, মাসিক ভাড়া ও চার্জ ঠিক করুন। ৫ মিনিটেই হয়ে যাবে।'],
      ['বাসিন্দাদের আমন্ত্রণ দিন', 'মালিক ও ভাড়াটিয়া প্রত্যেকে নিজের লগইন পান। শুধু নিজের ইউনিট দেখতে পারেন।'],
      ['অটোপাইলটে চলুক', 'বিল তৈরি, পেমেন্ট সংগ্রহ, রসিদ, গ্যাস ট্র্যাকিং — সব প্রতি মাসে স্বয়ংক্রিয়।'],
    ],
    pricingEyebrow: 'মূল্য',
    pricingTitle: ['প্ল্যান বেছে নিন।', 'মাসিক পরিশোধ।'],
    pricingSub: 'ফ্রি শুরু করুন। ভবন বড় হলে আপগ্রেড করুন। কোনো চুক্তি নেই, লুকানো খরচ নেই।',
    tstmEyebrow: 'প্রশংসাপত্র',
    tstmTitle: ['ঢাকার ভবন', 'ব্যবস্থাপকদের ', 'আস্থা।'],
    testimonials: [
      ['বাড়ি সামলাই আসার আগে আমি খাতায় ভাড়া রাখতাম, প্রতি মাসে হোয়াটসঅ্যাপে তাড়া করতাম। এখন রসিদ আপনিই চলে যায়।', 'রফিকুল ইসলাম', 'ব্যবস্থাপক · বসুন্ধরা'],
      ['আগে কেয়ারটেকার সারসংক্ষেপ দিত — সবসময় ঠিক হতো না। এখন ফোনেই দেখি কে দিয়েছে।', 'ফরিদা সুলতানা', 'মালিক · উত্তরা'],
      ['সার্ভিস চার্জ নিয়ে ম্যানেজারের সাথে তর্ক হতো। এখন রসিদ দেখাই — শেষ।', 'আরিফ হোসেন', 'ভাড়াটিয়া · গুলশান-২'],
    ],
    faqEyebrow: 'প্রশ্ন',
    faqTitle: ['সাধারণ প্রশ্ন'],
    faq: [
      ['ফ্রি প্ল্যানে ৫টির বেশি ইউনিট হলে কী হবে?', 'আপনাকে আপগ্রেডের জন্য বলা হবে। ডেটা যেমন আছে তেমনই থাকবে — মাইগ্রেশন লাগবে না।'],
      ['বিলিং ও ভাড়া সংগ্রহ কীভাবে কাজ করে?', 'এক ক্লিকে মাসিক বিল তৈরি হয়। বিকাশ/নগদ থেকে অটো-ট্র্যাক বা ম্যানুয়ালি লগ করা যায়।'],
      ['ভাড়াটিয়া ও মালিকেরা কি নিজের পোর্টাল পান?', 'হ্যাঁ। প্রত্যেকে শুধু নিজের ইউনিট দেখেন।'],
      ['গ্যাস বিল কীভাবে গণনা হয়?', 'মিটার রিডিং দিন — সিস্টেম প্রতি ইউনিটের অংশ স্বয়ংক্রিয়ভাবে বের করে।'],
      ['ডেটা কি সুরক্ষিত?', 'সব ডেটা এনক্রিপ্টেড। প্রতিদিন ব্যাকআপ। ডিজিটাল নিরাপত্তা আইন অনুসরণ।'],
      ['আপগ্রেড কীভাবে করবো?', 'যেকোনো প্ল্যান বেছে নিয়ে চেকআউট করুন। ২৪ ঘণ্টায় চালু হয়।'],
    ],
    finalEyebrow: 'আজই শুরু করুন',
    finalTitle: ['আপনার ভবন প্রাপ্য', 'খাতার চেয়ে ', 'বেশি কিছুর।'],
    finalSub: '৫০০+ ভবন ব্যবস্থাপকের সাথে যুক্ত হন। ফ্রি শুরু করুন। কার্ড লাগবে না।',
  },
}

const FEATURES = [
  { id: 'map',     title: 'Unit & Floor Map',          titleBn: 'ইউনিট ম্যাপ',       body: "See every flat at a glance. Live floor map shows who's paid and who hasn't — color-coded, clickable, real-time.", bodyBn: 'প্রতিটি ফ্ল্যাট এক নজরে। লাইভ ফ্লোর ম্যাপ দেখায় কে দিয়েছে, কে দেয়নি।',                       visual: 'map',     span: 3 },
  { id: 'gas',     title: 'Gas & Utility Matrix',      titleBn: 'গ্যাস ম্যাট্রিক্স',  body: "Enter meter readings — Bari Shamlai calculates each unit's exact share automatically. Accurate, auditable, instant.", bodyBn: 'মিটার রিডিং দিন — প্রতি ইউনিটের ভাগ স্বয়ংক্রিয়ভাবে গণনা।',                          visual: 'gas',     span: 3 },
  { id: 'bills',   title: 'Automated Billing',         titleBn: 'স্বয়ংক্রিয় বিলিং', body: 'Generate monthly rent bills with one click. Log payments instantly. No spreadsheet, no notebook.',            bodyBn: 'এক ক্লিকে মাসিক বিল। তাৎক্ষণিক পেমেন্ট লগ।',                                            visual: 'bills',   span: 2 },
  { id: 'receipt', title: 'Digital PDF Receipts',      titleBn: 'ডিজিটাল রসিদ',      body: 'Issue professional receipts the moment payment is logged. Delivered via email automatically. No disputes.',       bodyBn: 'পেমেন্টের সাথে সাথে পেশাদার রসিদ — ইমেইলে পৌঁছে যায়।',                                  visual: 'receipt', span: 2 },
  { id: 'ann',     title: 'Building Announcements',    titleBn: 'ঘোষণা',              body: 'Send notices to one tenant or the entire building. Instant, documented, no WhatsApp group chaos.',               bodyBn: 'এক ভাড়াটিয়া বা পুরো ভবনে নোটিশ। তাৎক্ষণিক, রেকর্ডসহ।',                                 visual: 'ann',     span: 2 },
  { id: 'report',  title: 'Monthly Financial Reports', titleBn: 'মাসিক রিপোর্ট',     body: 'Income, expenses, outstanding dues — a complete summary that writes itself every month.',                        bodyBn: 'আয়, ব্যয়, বকেয়া — পূর্ণ সারসংক্ষেপ আপনাআপনি।',                                         visual: 'report',  span: 6 },
]

const PLANS = [
  { name: 'Starter',    price: 'Free',  priceSm: 'Forever',  units: 'Up to 5 units · No card', feats: ['Monthly billing & rent tracking', 'Service charge collection', 'Building expenses', 'Basic dashboard & floor map'],                                                           cta: 'Start Free' },
  { name: 'Basic',      price: '৳200',  priceSm: '/mo',      units: '10 units',                feats: ['Everything in Starter', 'Gas & utility matrix', 'Digital PDF receipts', 'In-app messaging', 'Monthly financial reports'],                                                    cta: 'Get Basic' },
  { name: 'Standard',   price: '৳300',  priceSm: '/mo',      units: '20 units',                feats: ['Everything in Basic', 'Multi-floor visual map', 'Invitation system', 'Expense analytics', 'Priority support'],                                                               cta: 'Get Standard', featured: true, tag: 'Most popular' },
  { name: 'Pro',        price: '৳400',  priceSm: '/mo',      units: '30 units',                feats: ['Everything in Standard', 'Advanced reports', 'Bulk billing', 'Custom rent cycles', 'Dedicated support'],                                                                      cta: 'Get Pro' },
  { name: 'Enterprise', price: '৳500',  priceSm: '/mo',      units: '30+ units (∞)',           feats: ['Everything in Pro', 'Unlimited units', 'Multi-building dashboard', 'Custom branding', 'SLA guarantee'],                                                                       cta: 'Get Enterprise' },
]

// ── Hooks ─────────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-stagger, .word-mask')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useScrollProgress(ref: React.RefObject<HTMLDivElement | null>) {
  const [p, setP] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const start = window.innerHeight * 0.9
      const end = -r.height + window.innerHeight * 0.4
      const total = start - end
      const cur = start - r.top
      setP(Math.max(0, Math.min(1, cur / total)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [ref])
  return p
}

function useCountUp(target: number, trigger: boolean) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let raf: number
    const start = performance.now()
    const dur = 1800
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, trigger])
  return val
}

function useCursorSpot() {
  useEffect(() => {
    let raf: number
    let tx = window.innerWidth / 2, ty = window.innerHeight / 3
    let cx = tx, cy = ty
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY }
    const tick = () => {
      cx += (tx - cx) * 0.12
      cy += (ty - cy) * 0.12
      document.documentElement.style.setProperty('--mx', cx + 'px')
      document.documentElement.style.setProperty('--my', cy + 'px')
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])
}

// ── Device Showcase ───────────────────────────────────────────────────
function DeviceShowcase({ progress: _progress }: { progress: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mx, setMx] = useState(0)
  const [my, setMy] = useState(0)
  const [active, setActive] = useState(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const el = ref.current?.parentElement
    if (!el) return
    let raf: number, tx = 0, ty = 0, cx = 0, cy = 0
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width - 0.5) * 12
      ty = ((e.clientY - r.top) / r.height - 0.5) * -8
    }
    const loop = () => {
      cx += (tx - cx) * 0.06
      cy += (ty - cy) * 0.06
      setMx(cx); setMy(cy)
      raf = requestAnimationFrame(loop)
    }
    el.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(loop)
    return () => { el.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % 3), 3200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let raf: number
    const start = performance.now()
    const loop = (now: number) => {
      setTick((now - start) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const baseRy = my
  const baseRx = mx
  const t = tick

  const isActive = (i: number) => active === i
  const phoneFloat  = Math.sin(t * 1.2) * 8
  const tabletFloat = Math.sin(t * 1.0 + 1.5) * 8
  const laptopFloat = Math.sin(t * 0.8 + 0.8) * 6

  const slotXform = (i: number, baseRot: string, floatY: number) => {
    if (isActive(i)) return `translate(0px, ${floatY}px) ${baseRot}`
    const prev = (active - 1 + 3) % 3
    if (i === prev) return `translate(-360px, ${floatY * 0.3}px) scale(0.9) ${baseRot}`
    return `translate(360px, ${floatY * 0.3}px) scale(0.9) ${baseRot}`
  }

  return (
    <>
      <div ref={ref} className="device-stage" style={{ transform: `rotateX(${baseRx}deg) rotateY(${baseRy}deg)` }}>
        <div className="device-glow" aria-hidden="true"></div>

        {/* LAPTOP */}
        <div
          className="device dev-laptop"
          data-state={isActive(0) ? 'active' : 'inactive'}
          style={{
            transform: slotXform(0, 'rotateY(-3deg) rotateX(2deg)', laptopFloat),
            opacity: isActive(0) ? 1 : 0,
            visibility: isActive(0) ? 'visible' : 'hidden',
            transitionProperty: 'transform, opacity, visibility',
          }}
        >
          <div className="lid">
            <div className="screen"><img src="/assets/screen-laptop.jpeg" alt="Bari Shamlai dashboard on laptop" /></div>
          </div>
          <div className="base"></div>
        </div>

        {/* TABLET */}
        <div
          className="device dev-tablet"
          data-state={isActive(1) ? 'active' : 'inactive'}
          style={{
            transform: slotXform(1, 'rotateY(-8deg) rotateZ(2deg)', tabletFloat),
            opacity: isActive(1) ? 1 : 0,
            visibility: isActive(1) ? 'visible' : 'hidden',
            transitionProperty: 'transform, opacity, visibility',
          }}
        >
          <div className="frame">
            <div className="screen"><img src="/assets/screen-tablet.jpeg" alt="Bari Shamlai on tablet" /></div>
          </div>
        </div>

        {/* PHONE */}
        <div
          className="device dev-phone"
          data-state={isActive(2) ? 'active' : 'inactive'}
          style={{
            transform: slotXform(2, 'rotateY(6deg) rotateZ(-3deg)', phoneFloat),
            opacity: isActive(2) ? 1 : 0,
            visibility: isActive(2) ? 'visible' : 'hidden',
            transitionProperty: 'transform, opacity, visibility',
          }}
        >
          <div className="frame">
            <div className="screen"><img src="/assets/screen-mobile.jpeg" alt="Bari Shamlai on mobile" /></div>
          </div>
        </div>

        <div className="device-dots">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              className={'device-dot' + (active === i ? ' on' : '')}
              onClick={() => setActive(i)}
              aria-label={'Show device ' + (i + 1)}
            ></button>
          ))}
        </div>
      </div>

      <FloatCards tick={tick} />
    </>
  )
}

// ── Floating notification cards ───────────────────────────────────────
function FloatCards({ tick }: { tick: number }) {
  const cards = [
    { kind: 'calculator',    x: -290, y: -80,  freq: 0.9,  phase: 0,   delay: 0.2 },
    { kind: 'rent-paid',     x:  290, y: -110, freq: 1.1,  phase: 1.2, delay: 0.5 },
    { kind: 'service-due',   x: -310, y:  120, freq: 0.8,  phase: 2.4, delay: 0.8 },
    { kind: 'rent-paid-2',   x:  310, y:  100, freq: 1.0,  phase: 3.0, delay: 1.1 },
    { kind: 'service-due-2', x:    0, y:  180, freq: 0.95, phase: 0.6, delay: 1.4 },
  ]
  return (
    <div className="float-stage" aria-hidden="true">
      {cards.map((c) => {
        const bob  = Math.sin(tick * c.freq + c.phase) * 8
        const sway = Math.cos(tick * c.freq * 0.7 + c.phase) * 5
        const tilt = Math.sin(tick * c.freq * 0.5 + c.phase) * 2
        return (
          <div
            key={c.kind}
            className={'float-card-orbit fc-' + c.kind.replace(/-2$/, '')}
            style={{
              transform: `translate(-50%, -50%) translate(${c.x + sway}px, ${c.y + bob}px) rotate(${tilt}deg)`,
              animation: `fcEnter .9s cubic-bezier(.2,.7,.2,1) ${c.delay}s both`,
            }}
          >
            <OrbitCardBody kind={c.kind} tick={tick} />
          </div>
        )
      })}
    </div>
  )
}

function OrbitCardBody({ kind, tick }: { kind: string; tick: number }) {
  if (kind === 'calculator') {
    const items: [string, number][] = [['Rent', 18500], ['Service', 2500], ['Gas', 1450], ['Water', 600]]
    const step = Math.floor((tick * 0.9) % (items.length + 1))
    const total = items.slice(0, step).reduce((s, [, v]) => s + v, 0)
    return (
      <>
        <div className="oc-head">
          <span className="oc-tag oc-tag-calc">RECEIPT</span>
          <span className="oc-num">#2384</span>
        </div>
        <div className="oc-title">Flat 4B · June</div>
        <div className="oc-lines">
          {items.map(([label, val], i) => (
            <div key={label} className={'oc-line' + (i < step ? ' on' : '')}>
              <span>{label}</span>
              <span>৳ {val.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="oc-total">
          <span>Total</span>
          <span className="oc-total-val">৳ {total.toLocaleString()}</span>
        </div>
      </>
    )
  }
  if (kind === 'rent-paid') {
    return (
      <>
        <div className="oc-head">
          <span className="oc-avatar">RA</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="oc-name">Rent received</div>
            <div className="oc-meta">Flat 6A · just now</div>
          </div>
          <span className="oc-pulse"></span>
        </div>
        <div className="oc-amount oc-amount-pos">
          + ৳ 18,500
          <span className="oc-amount-meta">via bKash</span>
        </div>
      </>
    )
  }
  if (kind === 'rent-paid-2') {
    return (
      <>
        <div className="oc-head">
          <span className="oc-avatar" style={{ background: 'linear-gradient(135deg, oklch(0.7 0.13 270), oklch(0.78 0.12 320))' }}>FH</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="oc-name">Payment received</div>
            <div className="oc-meta">Flat 3C · 2m ago</div>
          </div>
          <span className="oc-pulse"></span>
        </div>
        <div className="oc-amount oc-amount-pos">
          + ৳ 22,000
          <span className="oc-amount-meta">via Nagad</span>
        </div>
      </>
    )
  }
  if (kind === 'service-due') {
    return (
      <>
        <div className="oc-head">
          <span className="oc-icon-warn">!</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="oc-name">Service charge due</div>
            <div className="oc-meta">3 flats · 2 days left</div>
          </div>
        </div>
        <div className="oc-bar">
          <div className="oc-bar-fill" style={{ width: (52 + Math.sin(tick * 1.6) * 14) + '%' }}></div>
        </div>
        <div className="oc-meta-row">
          <span>৳ 7,500 outstanding</span>
          <span className="oc-link">Remind →</span>
        </div>
      </>
    )
  }
  if (kind === 'service-due-2') {
    return (
      <>
        <div className="oc-head">
          <span className="oc-icon-warn" style={{ background: 'oklch(0.7 0.16 25)' }}>!</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="oc-name">Gas bill overdue</div>
            <div className="oc-meta">Flat 5B · 4 days late</div>
          </div>
        </div>
        <div className="oc-bar">
          <div className="oc-bar-fill" style={{ width: (78 + Math.sin(tick * 1.4 + 1) * 12) + '%', background: 'linear-gradient(90deg, oklch(0.7 0.16 25), oklch(0.65 0.18 12))' }}></div>
        </div>
        <div className="oc-meta-row">
          <span>৳ 1,840 overdue</span>
          <span className="oc-link" style={{ color: 'oklch(0.65 0.18 25)' }}>Notify →</span>
        </div>
      </>
    )
  }
  return null
}

// ── Hero ──────────────────────────────────────────────────────────────
function Hero({ lang, t }: { lang: string; t: CopyT }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const progress = useScrollProgress(stageRef)

  return (
    <section className="hero wrap">
      <div className="hero-copy">
        <div className="eyebrow hero-eyebrow reveal">{t.eyebrow}</div>
        <h1>
          {t.h1Lines.map((words, li) => (
            <span key={li} className="line">
              {words.map((w, wi) => (
                <span key={wi} className="word-mask" style={{ transitionDelay: (li * 0.08 + wi * 0.05) + 's' }}>
                  <span>{w === t.h1Italic ? <em className="serif">{w}</em> : w}{wi < words.length - 1 ? ' ' : ''}</span>
                </span>
              ))}
              {li < t.h1Lines.length - 1 ? ' ' : null}
            </span>
          ))}
        </h1>
        <p className="hero-sub reveal" style={{ transitionDelay: '.4s' }}>{t.sub}</p>
        <div className="hero-cta reveal" style={{ transitionDelay: '.5s' }}>
          <a href={`${APP_URL}/signup`} className="btn btn-primary">{t.ctaPrimary} <span className="arr">→</span></a>
          <a href="#how" className="btn btn-ghost">{t.ctaSecondary}</a>
        </div>
        <div className="hero-meta reveal" style={{ transitionDelay: '.6s' }}>
          {t.metas.map((m, i) => <span key={i}><span className="dot"></span>{m}</span>)}
        </div>
      </div>
      <div ref={stageRef} className="hero-stage">
        <DeviceShowcase progress={progress} />
      </div>
    </section>
  )
}

// ── KPI strip ─────────────────────────────────────────────────────────
function KPI({ kpi }: { kpi: { val: number; suf: string; lbl: string } }) {
  const ref = useRef<HTMLDivElement>(null)
  const [trigger, setTrigger] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setTrigger(true)), { threshold: 0.5 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  const v = useCountUp(kpi.val, trigger)
  return (
    <div ref={ref} className="kpi">
      <div className="num">{v}<small>{kpi.suf}</small></div>
      <div className="lbl">{kpi.lbl}</div>
    </div>
  )
}

function KPIStrip({ t }: { t: CopyT }) {
  return (
    <div className="kpi-strip">
      <div className="wrap">
        <div className="kpi-grid">
          {t.kpis.map((k, i) => <KPI key={i} kpi={k} />)}
        </div>
      </div>
    </div>
  )
}

// ── Pain section ──────────────────────────────────────────────────────
function PainCard({ data }: { data: [string, string, string] }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px')
    el.style.setProperty('--my', (e.clientY - r.top) + 'px')
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateX(${py * -4}deg) rotateY(${px * 6}deg)`
  }
  const onLeave = () => { if (ref.current) ref.current.style.transform = '' }
  return (
    <div ref={ref} className="pain-card glass tilt" onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="icon">{data[2]}</div>
      <h3>{data[0]}</h3>
      <p>{data[1]}</p>
    </div>
  )
}

function PainSection({ t }: { t: CopyT }) {
  return (
    <section className="section wrap">
      <div className="sec-head">
        <div className="eyebrow reveal">{t.painEyebrow}</div>
        <h2 className="reveal">
          {t.painTitle[0]} <em className="serif">{t.painTitle[1]}</em>{t.painTitle[2]}
        </h2>
      </div>
      <div className="pain-grid reveal-stagger">
        {t.pain.map((p, i) => <PainCard key={i} data={p} />)}
      </div>
    </section>
  )
}

// ── Feature visuals ───────────────────────────────────────────────────
function FloorMapVisual() {
  const cells = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const r = (i * 7) % 11
      if (r < 5) return 'paid'
      if (r < 7) return 'due'
      return ''
    })
  }, [])
  return (
    <div className="fv-map feature-visual">
      {cells.map((c, i) => <div key={i} className={'cell ' + c} style={{ transitionDelay: (i * 0.02) + 's' }}></div>)}
    </div>
  )
}

function GasDial() {
  const ref = useRef<SVGSVGElement>(null)
  const [trigger, setTrigger] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setTrigger(true)), { threshold: 0.4 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  const target = 73
  const v = useCountUp(target, trigger)
  const angle = (v / 100) * 270 - 135
  const r = 56
  const C = 2 * Math.PI * r
  const dash = (v / 100) * C * 0.75

  return (
    <div className="fv-gas feature-visual">
      <svg ref={ref} width="180" height="160" viewBox="0 0 180 160">
        <defs>
          <linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        <circle cx="90" cy="86" r={r} fill="none" stroke="var(--line-2)" strokeWidth="8" strokeDasharray={`${C * 0.75} ${C}`} strokeDashoffset={C * 0.125} transform="rotate(-180 90 86) rotate(45 90 86)" strokeLinecap="round"/>
        <circle cx="90" cy="86" r={r} fill="none" stroke="url(#dialGrad)" strokeWidth="8" strokeDasharray={`${dash} ${C}`} strokeDashoffset={C * 0.125} transform="rotate(-180 90 86) rotate(45 90 86)" strokeLinecap="round" style={{ transition: 'stroke-dasharray .2s linear' }} />
        {Array.from({ length: 11 }).map((_, i) => {
          const a = (-135 + (i / 10) * 270) * Math.PI / 180
          const x1 = 90 + Math.cos(a) * (r + 10)
          const y1 = 86 + Math.sin(a) * (r + 10)
          const x2 = 90 + Math.cos(a) * (r + 14)
          const y2 = 86 + Math.sin(a) * (r + 14)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--muted)" strokeWidth="1" opacity={i % 5 === 0 ? .8 : .35}/>
        })}
        <g transform={`rotate(${angle} 90 86)`} style={{ transition: 'transform .2s linear' }}>
          <line x1="90" y1="86" x2="90" y2="40" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="90" cy="86" r="6" fill="var(--ink)" />
          <circle cx="90" cy="86" r="2" fill="var(--bg-elev)" />
        </g>
        <text x="90" y="124" textAnchor="middle" fontFamily="var(--display)" fontSize="22" fontWeight="600" fill="var(--ink)" letterSpacing="-0.02em">{v}m³</text>
        <text x="90" y="140" textAnchor="middle" fontFamily="var(--mono)" fontSize="9" fill="var(--muted)" letterSpacing="0.14em">FLAT 3A · OCT</text>
      </svg>
    </div>
  )
}

function ReceiptVisual() {
  return (
    <div className="fv-receipt feature-visual">
      <div style={{ fontFamily: 'var(--display)', color: 'var(--ink)', fontWeight: 600, fontSize: 13, letterSpacing: '-0.01em', marginBottom: 8 }}>RECEIPT · 2384</div>
      <div className="stamp">PAID</div>
      <div className="line"><span>Rent · Flat 4B</span><span>৳ 18,000</span></div>
      <div className="line"><span>Service charge</span><span>৳ 1,500</span></div>
      <div className="line"><span>Gas (28m³)</span><span>৳ 612</span></div>
      <div className="line tot"><span>Total</span><span>৳ 20,112</span></div>
    </div>
  )
}

function BillsVisual() {
  const items: [string, string][] = [
    ['Flat 1A · Rent', '৳ 14,500'],
    ['Flat 1B · Rent', '৳ 14,500'],
    ['Flat 2A · Service', '৳ 1,500'],
    ['Flat 2B · Gas', '৳ 524'],
  ]
  return (
    <div className="fv-bills feature-visual">
      {items.map(([l, r], i) => (
        <div key={i} className="fv-bill-row" style={{ animation: `slideIn .6s ${i * .12}s both` }}>
          <span className="l"><i></i>{l}</span>
          <span className="r">{r}</span>
        </div>
      ))}
    </div>
  )
}

function AnnouncementVisual() {
  return (
    <div className="fv-ann feature-visual">
      <div className="meta">📢 BUILDING NOTICE · 2 MIN AGO</div>
      <div className="bubble" style={{ marginTop: 8 }}>Water tank cleaning tomorrow 10am–12pm. Please store water in advance.</div>
      <div className="bubble">Lift maintenance scheduled for Friday 9am.</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
        <span>Read by 18 / 22</span>
      </div>
    </div>
  )
}

function ReportVisual() {
  const heights = [44, 58, 72, 51, 80, 65, 92, 78, 88, 96, 84, 95]
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
  return (
    <div className="fv-report feature-visual" style={{ padding: '30px 24px 40px' }}>
      {heights.map((h, i) => (
        <div key={i} className="bar" data-m={months[i]} style={{ height: h + '%', animation: `growBar .9s ${i * .05}s cubic-bezier(.2,.7,.2,1) both` }}></div>
      ))}
    </div>
  )
}

function FeatureCard({ f, lang }: { f: typeof FEATURES[0]; lang: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(1000px) rotateX(${py * -3}deg) rotateY(${px * 4}deg)`
  }
  const onLeave = () => { if (ref.current) ref.current.style.transform = '' }

  let visual = null
  if (f.visual === 'map')     visual = <FloorMapVisual />
  else if (f.visual === 'gas')     visual = <GasDial />
  else if (f.visual === 'receipt') visual = <ReceiptVisual />
  else if (f.visual === 'bills')   visual = <BillsVisual />
  else if (f.visual === 'ann')     visual = <AnnouncementVisual />
  else if (f.visual === 'report')  visual = <ReportVisual />

  return (
    <div ref={ref} className={`feature-card glass tilt span${f.span}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      {visual}
      <div>
        <h3>{lang === 'bn' ? f.titleBn : f.title}</h3>
        <p>{lang === 'bn' ? f.bodyBn : f.body}</p>
      </div>
    </div>
  )
}

function FeaturesSection({ lang, t }: { lang: string; t: CopyT }) {
  return (
    <section id="features" className="section wrap">
      <div className="sec-head">
        <div className="eyebrow reveal">{t.featEyebrow}</div>
        <h2 className="reveal">{t.featTitle[0]} <em className="serif">{t.featTitle[1]}</em>{t.featTitle[2]}</h2>
      </div>
      <div className="features-grid reveal-stagger">
        {FEATURES.map((f) => <FeatureCard key={f.id} f={f} lang={lang} />)}
      </div>
    </section>
  )
}

// ── Steps ─────────────────────────────────────────────────────────────
function StepsSection({ t }: { t: CopyT }) {
  return (
    <section id="how" className="section wrap">
      <div className="sec-head">
        <div className="eyebrow reveal">{t.stepsEyebrow}</div>
        <h2 className="reveal">{t.stepsTitle[0]} <em className="serif">{t.stepsTitle[1]}</em></h2>
      </div>
      <div className="steps reveal-stagger">
        {t.steps.map(([ttl, body], i) => (
          <div key={i} className="step glass tilt">
            <div className="num">{String(i + 1).padStart(2, '0')}</div>
            <h3>{ttl}</h3>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Pricing ───────────────────────────────────────────────────────────
function PricingSection({ t }: { t: CopyT }) {
  return (
    <section id="pricing" className="section wrap">
      <div className="sec-head">
        <div className="eyebrow reveal">{t.pricingEyebrow}</div>
        <h2 className="reveal">{t.pricingTitle[0]} <em className="serif">{t.pricingTitle[1]}</em></h2>
        <p className="sub reveal">{t.pricingSub}</p>
      </div>
      <div className="pricing-grid reveal-stagger">
        {PLANS.map((p, i) => (
          <div key={i} className={'price-card glass' + (p.featured ? ' featured' : '')}>
            {p.tag && <span className="pc-tag">{p.tag}</span>}
            <div className="pc-name">{p.name}</div>
            <div className="pc-price">{p.price}<small>{p.priceSm}</small></div>
            <div className="pc-units">{p.units}</div>
            <ul className="pc-list">
              {p.feats.map((f, fi) => <li key={fi} className="pc-feat">{f}</li>)}
            </ul>
            <a href={`${APP_URL}/signup`} className="pc-cta">{p.cta} →</a>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Testimonials ──────────────────────────────────────────────────────
function TstmCard({ data }: { data: [string, string, string] }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateX(${py * -3}deg) rotateY(${px * 4}deg)`
  }
  const onLeave = () => { if (ref.current) ref.current.style.transform = '' }
  const initials = data[1].split(' ').map((s) => s[0]).slice(0, 2).join('')
  return (
    <div ref={ref} className="tstm glass tilt" onMouseMove={onMove} onMouseLeave={onLeave}>
      <q>{data[0]}</q>
      <div className="tstm-by">
        <div className="tstm-av">{initials}</div>
        <div>
          <div className="tstm-name">{data[1]}</div>
          <div className="tstm-role">{data[2]}</div>
        </div>
      </div>
    </div>
  )
}

function TestimonialsSection({ t }: { t: CopyT }) {
  return (
    <section className="section wrap">
      <div className="sec-head">
        <div className="eyebrow reveal">{t.tstmEyebrow}</div>
        <h2 className="reveal">{t.tstmTitle[0]} <em className="serif">{t.tstmTitle[1]}</em>{t.tstmTitle[2]}</h2>
      </div>
      <div className="testimonials reveal-stagger">
        {t.testimonials.map((tt, i) => <TstmCard key={i} data={tt} />)}
      </div>
    </section>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────
function FAQItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(idx === 0)
  return (
    <div className={'faq-item' + (open ? ' open' : '')} onClick={() => setOpen((v) => !v)}>
      <div className="faq-q">
        <span>{q}</span>
        <span className="faq-toggle"></span>
      </div>
      <div className="faq-a">{a}</div>
    </div>
  )
}

function FAQSection({ t }: { t: CopyT }) {
  return (
    <section id="faq" className="section wrap" style={{ paddingBottom: 60 }}>
      <div className="sec-head">
        <div className="eyebrow reveal">{t.faqEyebrow}</div>
        <h2 className="reveal">{t.faqTitle[0]}</h2>
      </div>
      <div className="faq-list reveal-stagger" style={{ maxWidth: 880 }}>
        {t.faq.map(([q, a], i) => <FAQItem key={i} q={q} a={a} idx={i} />)}
      </div>
    </section>
  )
}

// ── Final CTA ─────────────────────────────────────────────────────────
function FinalCTA({ lang, t }: { lang: string; t: CopyT }) {
  return (
    <section className="section wrap">
      <div className="final-cta reveal">
        <div className="eyebrow" style={{ justifyContent: 'center' }}>{t.finalEyebrow}</div>
        <h2 style={{ marginTop: 14 }}>{t.finalTitle[0]} <em className="serif">{t.finalTitle[1]}</em>{t.finalTitle[2]}</h2>
        <p>{t.finalSub}</p>
        <div className="final-cta-actions">
          <a href={`${APP_URL}/signup`} className="btn btn-primary">
            {lang === 'bn' ? 'ফ্রি অ্যাকাউন্ট তৈরি করুন' : 'Create free account'} <span className="arr">→</span>
          </a>
          <a href={`${APP_URL}/login`} className="btn btn-ghost">
            {lang === 'bn' ? 'লগইন' : 'Sign in'}
          </a>
        </div>
      </div>
    </section>
  )
}

// ── Root ──────────────────────────────────────────────────────────────
export function LandingPage() {
  const { lang } = useLang()
  const t = COPY[lang as keyof typeof COPY] ?? COPY.en

  useCursorSpot()
  useReveal()

  return (
    <div className={`lp${lang === 'bn' ? ' lang-bn' : ''}`}>
      <div className="page-bg"></div>
      <div className="page-grid"></div>
      <div className="cursor-spot"></div>
      <LandingNavbar />
      <main>
        <Hero lang={lang} t={t} />
        <KPIStrip t={t} />
        <PainSection t={t} />
        <FeaturesSection lang={lang} t={t} />
        <StepsSection t={t} />
        <PricingSection t={t} />
        <TestimonialsSection t={t} />
        <FAQSection t={t} />
        <FinalCTA lang={lang} t={t} />
      </main>
      <LandingFooter />
    </div>
  )
}
