import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { validateAllocation, deriveBillStatus, isBillOverdue } from '../src/lib/finance/paymentLogic'

describe('Payment & Allocation Invariants (T08)', () => {
  it('rejects zero or negative allocation amounts', () => {
    const resZero = validateAllocation({
      paymentAmountPaisa: BigInt(100000),
      existingPaymentAllocationsPaisa: BigInt(0),
      billAmountPaisa: BigInt(100000),
      existingBillAllocationsPaisa: BigInt(0),
      requestedAllocationPaisa: BigInt(0),
    })
    assert.equal(resZero.valid, false)

    const resNeg = validateAllocation({
      paymentAmountPaisa: BigInt(100000),
      existingPaymentAllocationsPaisa: BigInt(0),
      billAmountPaisa: BigInt(100000),
      existingBillAllocationsPaisa: BigInt(0),
      requestedAllocationPaisa: BigInt(-500),
    })
    assert.equal(resNeg.valid, false)
  })

  it('rejects allocation exceeding payment available balance', () => {
    const res = validateAllocation({
      paymentAmountPaisa: BigInt(50000), // 500 Taka
      existingPaymentAllocationsPaisa: BigInt(30000), // 300 already allocated
      billAmountPaisa: BigInt(100000), // 1000 Taka bill
      existingBillAllocationsPaisa: BigInt(0),
      requestedAllocationPaisa: BigInt(25000), // wants 250 Taka, but only 200 available
    })
    assert.equal(res.valid, false)
    assert.ok(res.error?.includes('exceeds payment unallocated balance'))
  })

  it('rejects allocation exceeding bill remaining balance', () => {
    const res = validateAllocation({
      paymentAmountPaisa: BigInt(200000), // 2000 Taka payment
      existingPaymentAllocationsPaisa: BigInt(0),
      billAmountPaisa: BigInt(100000), // 1000 Taka bill
      existingBillAllocationsPaisa: BigInt(80000), // 800 already allocated (200 remaining)
      requestedAllocationPaisa: BigInt(30000), // wants 300 Taka, but only 200 due
    })
    assert.equal(res.valid, false)
    assert.ok(res.error?.includes('exceeds bill remaining balance'))
  })

  it('permits valid partial and exact full allocation', () => {
    // Valid partial
    const partial = validateAllocation({
      paymentAmountPaisa: BigInt(100000),
      existingPaymentAllocationsPaisa: BigInt(0),
      billAmountPaisa: BigInt(100000),
      existingBillAllocationsPaisa: BigInt(0),
      requestedAllocationPaisa: BigInt(40000), // 400 Taka partial
    })
    assert.equal(partial.valid, true)

    // Valid remaining allocation
    const exactRemaining = validateAllocation({
      paymentAmountPaisa: BigInt(100000),
      existingPaymentAllocationsPaisa: BigInt(40000),
      billAmountPaisa: BigInt(100000),
      existingBillAllocationsPaisa: BigInt(40000),
      requestedAllocationPaisa: BigInt(60000), // 600 Taka exact remaining
    })
    assert.equal(exactRemaining.valid, true)
  })

  it('deriveBillStatus marks PAID when fully covered', () => {
    const dueDate = new Date(Date.now() + 86400000) // tomorrow
    const res = deriveBillStatus({
      billAmountPaisa: BigInt(100000),
      totalAllocatedPaisa: BigInt(100000),
      dueDate,
    })
    assert.equal(res.status, 'PAID')
    assert.equal(res.remainingPaisa, BigInt(0))
  })

  it('deriveBillStatus marks PENDING when partially paid before due date', () => {
    const futureDueDate = new Date(Date.now() + 86400000) // tomorrow
    const res = deriveBillStatus({
      billAmountPaisa: BigInt(100000),
      totalAllocatedPaisa: BigInt(40000),
      dueDate: futureDueDate,
    })
    assert.equal(res.status, 'PENDING')
    assert.equal(res.remainingPaisa, BigInt(60000))
  })

  it('deriveBillStatus marks OVERDUE when partially paid after due date', () => {
    const pastDueDate = new Date(Date.now() - 86400000) // yesterday
    const res = deriveBillStatus({
      billAmountPaisa: BigInt(100000),
      totalAllocatedPaisa: BigInt(40000),
      dueDate: pastDueDate,
    })
    assert.equal(res.status, 'OVERDUE')
    assert.equal(res.remainingPaisa, BigInt(60000))
  })

  it('isBillOverdue respects paid status and due dates', () => {
    const past = new Date(Date.now() - 86400000)
    const future = new Date(Date.now() + 86400000)

    assert.equal(isBillOverdue(past, 'PENDING'), true)
    assert.equal(isBillOverdue(past, 'PAID'), false) // paid bills are never overdue
    assert.equal(isBillOverdue(past, 'VOID'), false) // void bills are not overdue
    assert.equal(isBillOverdue(future, 'PENDING'), false)
  })
})
