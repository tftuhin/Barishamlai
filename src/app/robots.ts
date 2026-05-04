import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

const MAIN_HOST = 'barishamlai.com'
const APP_HOST  = 'app.barishamlai.com'

export default function robots(): MetadataRoute.Robots {
  const host = headers().get('host') ?? ''
  const isApp = host.includes(APP_HOST)

  // App subdomain: no SEO crawling needed
  if (isApp) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  // Main marketing domain
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/developer/',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/pending-approval',
        ],
      },
    ],
    sitemap: `https://${MAIN_HOST}/sitemap.xml`,
  }
}
