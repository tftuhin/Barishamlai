import { prisma } from '@/lib/prisma'
import { toPaisa } from './money'
import { validateAllocation, deriveBillStatus } from './paymentLogic'
import type { PaymentMethod, PaymentVerificationStatus, FundType } from '@prisma/client'

export interface RecordPaymentInput {
  buildingId: string
  amountPaisa: bigint
  method: PaymentMethod
  externalReference?: string | null
  receivedAt?: Date
  receivedByUserId?: string | null
  verificationStatus?: PaymentVerificationStatus
  verifiedByUserId?: string | null
  notes?: string | null
}

export interface AllocatePaymentInput {
  buildingId: string
  paymentId: string
  billId: string
  amountPaisa: bigint
  userId?: string | null
}

/**
 * Records an independent payment in the ledger.
 */
export async function recordPayment(input: RecordPaymentInput) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        buildingId:         input.buildingId,
        amountPaisa:        input.amountPaisa,
        method:             input.method,
        externalReference:  input.externalReference ?? null,
        receivedAt:         input.receivedAt ?? new Date(),
        receivedByUserId:   input.receivedByUserId ?? null,
        verificationStatus: input.verificationStatus ?? 'PENDING_REVIEW',
        verifiedByUserId:   input.verifiedByUserId ?? null,
        notes:              input.notes ?? null,
      },
    })

    // Log financial audit event if verified
    if (payment.verificationStatus === 'VERIFIED') {
      await tx.financialEvent.create({
        data: {
          buildingId:      input.buildingId,
          fund:            'OPERATING' as FundType,
          eventType:       'PAYMENT_RECEIVED',
          amountPaisa:     input.amountPaisa,
          direction:       'INFLOW',
          effectiveAt:     payment.receivedAt,
          entityType:      'Payment',
          entityId:        payment.id,
          createdByUserId: input.receivedByUserId ?? null,
          reason:          input.notes ?? `Payment via ${input.method}`,
        },
      })
    }

    return payment
  })
}

/**
 * Atomically allocates a verified payment (or portion thereof) to a specific bill.
 */
export async function allocatePayment(input: AllocatePaymentInput) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: input.paymentId },
      include: { allocations: { where: { voidedAt: null } } },
    })

    if (!payment || payment.buildingId !== input.buildingId) {
      throw new Error('Payment not found in this building')
    }

    if (payment.verificationStatus !== 'VERIFIED') {
      throw new Error('Cannot allocate an unverified payment')
    }

    const bill = await tx.bill.findUnique({
      where: { id: input.billId },
      include: { allocations: { where: { voidedAt: null } } },
    })

    if (!bill || bill.buildingId !== input.buildingId) {
      throw new Error('Bill not found in this building')
    }

    const existingPaymentAllocations = payment.allocations.reduce((s, a) => s + a.amountPaisa, BigInt(0))
    const existingBillAllocations = bill.allocations.reduce((s, a) => s + a.amountPaisa, BigInt(0))
    const billAmountPaisa = toPaisa(bill.amount)

    // Run strict financial invariant checks
    const check = validateAllocation({
      paymentAmountPaisa:              payment.amountPaisa,
      existingPaymentAllocationsPaisa: existingPaymentAllocations,
      billAmountPaisa,
      existingBillAllocationsPaisa: existingBillAllocations,
      requestedAllocationPaisa:        input.amountPaisa,
    })

    if (!check.valid) {
      throw new Error(check.error || 'Invalid allocation')
    }

    // Create immutable allocation
    const allocation = await tx.paymentAllocation.create({
      data: {
        paymentId:       payment.id,
        billId:          bill.id,
        amountPaisa:     input.amountPaisa,
        createdByUserId: input.userId ?? null,
      },
    })

    // Determine new bill status
    const totalBillAllocated = existingBillAllocations + input.amountPaisa
    const { status } = deriveBillStatus({
      billAmountPaisa,
      totalAllocatedPaisa: totalBillAllocated,
      dueDate:             bill.dueDate,
    })

    await tx.bill.update({
      where: { id: bill.id },
      data: {
        status,
        paidAt: status === 'PAID' ? new Date() : bill.paidAt,
      },
    })

    // Record immutable audit event
    await tx.financialEvent.create({
      data: {
        buildingId:      input.buildingId,
        fund:            (bill.type as unknown) as FundType,
        eventType:       'PAYMENT_ALLOCATED',
        amountPaisa:     input.amountPaisa,
        direction:       'INFLOW',
        effectiveAt:     new Date(),
        entityType:      'PaymentAllocation',
        entityId:        allocation.id,
        createdByUserId: input.userId ?? null,
        reason:          `Allocated payment ${payment.id} to bill ${bill.id}`,
      },
    })

    return { allocation, newStatus: status }
  })
}
