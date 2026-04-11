'use client'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

const POSTHOG_KEY = 'phc_y7euk4NsFWLVWvRA5wUNnGen4NbXdu5N5bffhMggCaoT'
const POSTHOG_HOST = 'https://us.i.posthog.com'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // we capture manually below
      capture_pageleave: true,
      persistence: 'localStorage',
    })
  }, [])

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return <>{children}</>
}
