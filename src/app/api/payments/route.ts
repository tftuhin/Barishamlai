import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, created, Err, requireAuth } from '@/lib/api'
import { toPaisa, toTaka } from '@/lib/finance/money'
import { recordPayment, allocatePayment } from '@/lib/finance/paymentService'
import type { PaymentMethod, PaymentVerificationStatus } from '@prisma/client'

const VALID_METHODS = new Set(['CASH', 'BKASH', 'NAGAD', 'BANK_TRANSFER', 'CARD', 'ADJUSTMENT'])

export async function GET() {
  const [session, e] = await requireAuth()
  if (e) return e

  const bId = session.user.buildingId
  if (!bId) return Err.badRequest('No building assigned')

  try {
    const role = session.user.role

    const payments = await prisma.payment.findMany({
      where: {
        buildingId: bId,
        ...(role === 'TENANT' || role === 'OWNER'
          ? { receivedByUserId: session.user.id }
          : {}),
      },
      include: {
        allocations: {
          include: {
            bill: {
              select: {
                id: true,
                type: true,
                month: true,
                year: true,
                amount: true,
                unit: { select: { number: true } },
              },
            },
          },
        },
      },
      orderBy: { receivedAt: 'desc' },
    })

    const serialized = payments.map(p => ({
      id:                 p.id,
      buildingId:         p.buildingId,
      amountTaka:         toTaka(p.amountPaisa),
      amountPaisa:        p.amountPaisa.toString(),
      currency:           p.currency,
      method:             p.method,
      externalReference:  p.externalReference,
      receivedAt:         p.receivedAt,
      verificationStatus: p.verificationStatus,
      notes:              p.notes,
      createdAt:          p.createdAt,
      allocations: p.allocations.map(a => ({
        id:          a.id,
        billId:      a.billId,
        billType:    a.bill.type,
        unitNumber:  a.bill.unit.number,
        period:      `${a.bill.month}/${a.bill.year}`,
        amountTaka:  toTaka(a.amountPaisa),
        amountPaisa: a.amountPaisa.toString(),
        effectiveAt: a.effectiveAt,
      })),
    }))

    return ok(serialized)
  } catch {
    return Err.internal('Failed to fetch payments')
  }
}

export async function POST(req: NextRequest) {
  const [session, e] = await requireAuth()
  if (e) return e

  const bId = session.user.buildingId
  if (!bId) return Err.badRequest('No building assigned')

  try {
    const body = await req.json() as Record<string, unknown>
    const { amount, method, externalReference, notes, billId } = body

    if (!amount || !method) {
      return Err.badRequest('Amount and payment method are required')
    }

    if (!VALID_METHODS.has(String(method))) {
      return Err.badRequest('Invalid payment method')
    }

    const amountPaisa = toPaisa(amount as number | string)
    if (amountPaisa <= BigInt(0)) {
      return Err.badRequest('Payment amount must be greater than zero')
    }

    const isAdmin = session.user.role === 'ADMIN'
    const verificationStatus: PaymentVerificationStatus = isAdmin ? 'VERIFIED' : 'PENDING_REVIEW'

    // 1. Record the payment
    const payment = await recordPayment({
      buildingId:         bId,
      amountPaisa,
      method:             method as PaymentMethod,
      externalReference:  externalReference ? String(externalReference).trim() : null,
      receivedAt:         new Date(),
      receivedByUserId:   session.user.id,
      verificationStatus,
      verifiedByUserId:   isAdmin ? session.user.id : null,
      notes:              notes ? String(notes).trim() : null,
    })

    // 2. If a billId was specified and payment is verified, allocate immediately
    let allocationResult = null
    if (billId && verificationStatus === 'VERIFIED') {
      allocationResult = await allocatePayment({
        buildingId:  bId,
        paymentId:   payment.id,
        billId:      String(billId),
        amountPaisa,
        userId:      session.user.id,
      })
    }

    return created({
      id:                 payment.id,
      buildingId:         payment.buildingId,
      amountTaka:         toTaka(payment.amountPaisa),
      amountPaisa:        payment.amountPaisa.toString(),
      currency:           payment.currency,
      method:             payment.method,
      externalReference:  payment.externalReference,
      verificationStatus: payment.verificationStatus,
      allocation:         allocationResult ? {
        id:         allocationResult.allocation.id,
        billId:     allocationResult.allocation.billId,
        newStatus:  allocationResult.newStatus,
      } : null,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to record payment'
    return Err.badRequest(msg)
  }
}
