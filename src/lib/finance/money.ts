/**
 * Financial calculation engine using exact integer Paisa (1 Taka = 100 Paisa).
 * Eliminates JavaScript binary floating-point errors (e.g. 0.1 + 0.2 !== 0.3).
 * Uses constructor BigInt() for universal compatibility across all TypeScript/Next.js targets.
 */

/**
 * Converts a Taka amount (number or string) to integer paisa (bigint)
 * using documented half-up decimal conversion.
 */
export function toPaisa(taka: number | string | null | undefined): bigint {
  if (taka === null || taka === undefined) return BigInt(0)
  const str = String(taka).trim()
  if (!str || isNaN(Number(str))) return BigInt(0)

  // Split into integer and fractional parts to avoid floating-point math
  const isNegative = str.startsWith('-')
  const clean = isNegative ? str.slice(1) : str
  const [intPart = '0', fracPart = '0'] = clean.split('.')

  // Pad or round fractional part to 2 decimal places (paisa)
  const paddedFrac = (fracPart + '00').slice(0, 3) // take up to 3 digits for half-up rounding
  const twoDigitFrac = Number(paddedFrac.slice(0, 2))
  const thirdDigit = Number(paddedFrac.charAt(2) || '0')
  const roundedFrac = thirdDigit >= 5 ? twoDigitFrac + 1 : twoDigitFrac

  const totalPaisa = BigInt(intPart) * BigInt(100) + BigInt(roundedFrac)
  return isNegative ? -totalPaisa : totalPaisa
}

/**
 * Converts integer paisa to Taka (number) for display/serialization boundary.
 */
export function toTaka(paisa: bigint | number | null | undefined): number {
  if (paisa === null || paisa === undefined) return 0
  const b = typeof paisa === 'bigint' ? paisa : BigInt(Math.round(paisa))
  return Number(b) / 100
}

/**
 * Formats paisa as a Bangladeshi Taka currency string.
 * Boundary display only: e.g. ৳1,500.50 or ৳1,500
 */
export function formatBDT(paisa: bigint | number | null | undefined, showDecimals = false): string {
  const taka = toTaka(paisa)
  const formatter = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })
  return formatter.format(taka).replace('BDT', '৳').trim()
}

/**
 * Adds multiple paisa amounts together safely.
 */
export function addPaisa(...amounts: (bigint | number | null | undefined)[]): bigint {
  return amounts.reduce<bigint>((sum, a) => {
    if (a === null || a === undefined) return sum
    return sum + (typeof a === 'bigint' ? a : toPaisa(a))
  }, BigInt(0))
}

/**
 * Subtracts b from a safely.
 */
export function subtractPaisa(a: bigint | number, b: bigint | number): bigint {
  const pA = typeof a === 'bigint' ? a : toPaisa(a)
  const pB = typeof b === 'bigint' ? b : toPaisa(b)
  return pA - pB
}

/**
 * Distributes a source total evenly across count units with exact remainder allocation to the first N units.
 * Guarantee: sum(allocations) === totalPaisa.
 */
export function allocatePaisaEvenly(totalPaisa: bigint, count: number): bigint[] {
  if (count <= 0) return []
  const countBig = BigInt(count)
  const base = totalPaisa / countBig
  const remainder = totalPaisa % countBig

  const allocations: bigint[] = []
  for (let i = 0; i < count; i++) {
    allocations.push(i < Number(remainder) ? base + BigInt(1) : base)
  }
  return allocations
}
