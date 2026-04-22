import { MetadataRoute } from 'next'

const BASE_URL = 'https://barishamlai.com'

export default function robots(): MetadataRoute.Robots {
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
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
