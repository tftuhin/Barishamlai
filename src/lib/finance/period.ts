/**
 * Timezone and accounting period utilities strictly aligned with Asia/Dhaka.
 */

export const BUSINESS_TIMEZONE = 'Asia/Dhaka'

/**
 * Returns current year and month according to Asia/Dhaka timezone.
 */
export function getCurrentDhakaPeriod(date = new Date()): { year: number; month: number } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
  })
  const parts = formatter.formatToParts(date)
  const year = Number(parts.find(p => p.type === 'year')?.value)
  const month = Number(parts.find(p => p.type === 'month')?.value)
  return { year, month }
}

/**
 * Returns start and end UTC timestamps corresponding to the start and end
 * of a given month in Asia/Dhaka (UTC+6).
 */
export function getDhakaMonthRange(year: number, month: number): { start: Date; end: Date } {
  // Asia/Dhaka is UTC+6 (offset -360 minutes, no DST)
  // Month start: YYYY-MM-01 00:00:00 +06:00 => YYYY-(MM-1)-31 18:00:00 UTC (or previous day)
  const mPad = String(month).padStart(2, '0')
  const start = new Date(`${year}-${mPad}-01T00:00:00+06:00`)

  // End of month is 23:59:59.999 in Dhaka
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const nextMPad = String(nextMonth).padStart(2, '0')
  const nextStart = new Date(`${nextYear}-${nextMPad}-01T00:00:00+06:00`)
  const end = new Date(nextStart.getTime() - 1)

  return { start, end }
}

/**
 * Formats a Date into Asia/Dhaka human-readable string.
 */
export function formatDhakaDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString('en-BD', {
    timeZone: BUSINESS_TIMEZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...options,
  })
}
