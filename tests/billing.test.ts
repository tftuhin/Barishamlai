import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { calculateWaterShares } from '../src/lib/billing/billingPipeline'
import { toPaisa } from '../src/lib/finance/money'

describe('Centralized Billing Pipeline & Water Invariants (T09 & T10)', () => {
  test('calculateWaterShares divides clean amount equally', () => {
    const units = [
      { id: 'u1', number: '1A' },
      { id: 'u2', number: '1B' },
      { id: 'u3', number: '2A' },
    ]
    const shares = calculateWaterShares(9000, units)

    assert.equal(shares.length, 3)
    assert.equal(shares[0].amountTaka, 3000)
    assert.equal(shares[1].amountTaka, 3000)
    assert.equal(shares[2].amountTaka, 3000)

    const sumPaisa = shares.reduce((acc, s) => acc + s.amountPaisa, BigInt(0))
    assert.equal(sumPaisa, toPaisa(9000))
  })

  test('calculateWaterShares guarantees exact zero-remainder sum for inexact division (3 units)', () => {
    const units = [
      { id: 'u1', number: '1A' },
      { id: 'u2', number: '1B' },
      { id: 'u3', number: '2A' },
    ]
    // 10,000 BDT = 1,000,000 paisa. 1,000,000 / 3 = 333,333 with 1 paisa remainder.
    const shares = calculateWaterShares(10000, units)

    assert.equal(shares.length, 3)
    assert.equal(shares[0].amountPaisa, BigInt(333334)) // receives remainder paisa
    assert.equal(shares[1].amountPaisa, BigInt(333333))
    assert.equal(shares[2].amountPaisa, BigInt(333333))

    const sumPaisa = shares.reduce((acc, s) => acc + s.amountPaisa, BigInt(0))
    assert.equal(sumPaisa, toPaisa(10000))
    assert.equal(sumPaisa, BigInt(1000000))
  })

  test('calculateWaterShares guarantees exact zero-remainder sum for 7 units with fractional paisa', () => {
    const units = Array.from({ length: 7 }, (_, i) => ({
      id: `u-${i + 1}`,
      number: `Flat-${i + 1}`,
    }))

    const totalInvoice = 14357.50 // 1,435,750 paisa
    const shares = calculateWaterShares(totalInvoice, units)

    assert.equal(shares.length, 7)
    const sumPaisa = shares.reduce((acc, s) => acc + s.amountPaisa, BigInt(0))
    assert.equal(sumPaisa, toPaisa(totalInvoice))
  })

  test('calculateWaterShares handles empty units or zero amount safely', () => {
    assert.deepEqual(calculateWaterShares(5000, []), [])
    assert.deepEqual(calculateWaterShares(0, [{ id: 'u1', number: '1A' }]), [])
    assert.deepEqual(calculateWaterShares(-500, [{ id: 'u1', number: '1A' }]), [])
  })
})
