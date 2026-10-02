import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { toPaisa, toTaka, formatBDT, addPaisa, subtractPaisa, allocatePaisaEvenly } from '../src/lib/finance/money'
import { getCurrentDhakaPeriod, getDhakaMonthRange, BUSINESS_TIMEZONE } from '../src/lib/finance/period'

describe('Money Engine & Financial Invariants Tests (T06)', () => {
  it('toPaisa converts Taka accurately with half-up rounding', () => {
    assert.equal(toPaisa(1500), BigInt(150000))
    assert.equal(toPaisa(1500.50), BigInt(150050))
    assert.equal(toPaisa('1500.55'), BigInt(150055))
    assert.equal(toPaisa('1500.555'), BigInt(150056)) // half-up rounding
    assert.equal(toPaisa('1500.554'), BigInt(150055))
    assert.equal(toPaisa(0), BigInt(0))
    assert.equal(toPaisa(null), BigInt(0))
  })

  it('toTaka converts paisa back to decimal Taka', () => {
    assert.equal(toTaka(BigInt(150000)), 1500)
    assert.equal(toTaka(BigInt(150050)), 1500.5)
    assert.equal(toTaka(BigInt(0)), 0)
  })

  it('formatBDT formats currency without floating point artifacts', () => {
    const formatted = formatBDT(BigInt(150000))
    assert.ok(formatted.includes('1,500') || formatted.includes('1500'))
  })

  it('addPaisa and subtractPaisa perform exact arithmetic', () => {
    const a = toPaisa('100.10')
    const b = toPaisa('200.20')
    const sum = addPaisa(a, b)
    assert.equal(sum, BigInt(30030)) // exactly 300.30, no 300.30000000000007

    const diff = subtractPaisa(sum, a)
    assert.equal(diff, b)
  })

  it('allocatePaisaEvenly ensures sum(allocations) === totalPaisa exactly (Water invariant)', () => {
    // 1000 Taka (100,000 paisa) divided among 3 units
    const total = BigInt(100000)
    const allocations = allocatePaisaEvenly(total, 3)

    assert.equal(allocations.length, 3)
    const sum = allocations.reduce((s, x) => s + x, BigInt(0))
    assert.equal(sum, total, 'Allocation sum must equal source invoice exactly in paisa')
    assert.equal(allocations[0], BigInt(33334))
    assert.equal(allocations[1], BigInt(33333))
    assert.equal(allocations[2], BigInt(33333))
  })

  it('getDhakaMonthRange provides valid UTC boundaries for Asia/Dhaka', () => {
    const { start, end } = getDhakaMonthRange(2026, 10)
    assert.ok(start instanceof Date)
    assert.ok(end instanceof Date)
    assert.ok(start.getTime() < end.getTime())

    // 2026-10-01 00:00:00 +06:00 is 2026-09-30 18:00:00 UTC
    assert.equal(start.toISOString(), '2026-09-30T18:00:00.000Z')
  })

  it('getCurrentDhakaPeriod returns valid month and year', () => {
    const period = getCurrentDhakaPeriod()
    assert.ok(period.year >= 2026)
    assert.ok(period.month >= 1 && period.month <= 12)
    assert.equal(BUSINESS_TIMEZONE, 'Asia/Dhaka')
  })
})
