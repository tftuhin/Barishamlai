import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAuth, requireAdmin } from '@/lib/api'
import { sendEmail, emailBase, amountBox, detailTable } from '@/lib/email'
import { getBillTypeLabel, getMonthName } from '@/lib/utils'

function rentPaidHtml(opts: {
  recipientName: string
  buildingName: string
  unit: string
  amount: number
  month: number
  year: number
  paidAt: Date
}): string {
  return emailBase({
    heading: 'Rent Payment Received',
    subheading: opts.buildingName,
    bodyHtml: `
      <p style="color:#1A2E2A;margin:0 0 12px">Dear <strong>${opts.recipientName}</strong>,</p>
      <p style="color:#3D5A53;margin:0 0 20px;line-height:1.65">
        The rent for <strong>${getMonthName(opts.month)} ${opts.year}</strong>
        for Unit <strong>${opts.unit}</strong> has been marked as paid.
      </p>
      ${amountBox('Amount Paid', opts.amount)}
      ${detailTable([
        ['Period',  `${getMonthName(opts.month)} ${opts.year}`],
        ['Unit',    opts.unit],
        ['Paid On', opts.paidAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
        ['Status',  '<span style="color:#16A34A;font-weight:700">PAID ✓</span>'],
      ])}
      <p style="color:#5F5E5A;font-size:13px;margin:0;text-align:center">
        Thank you for your payment. Please keep this notification for your records.
      </p>
    `,
  })
}

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const [session, e] = await requireAuth()
  if (e) return e

  try {
    const bill = await prisma.bill.findUnique({
      where: { id: params.id },
      include: {
        unit: {
          include: {
            tenant: { select: { id: true, name: true, email: true } },
            owner:  { select: { id: true, name: true, email: true } },
          },
        },
        building: { select: { name: true } },
      },
    })
    if (!bill) return Err.notFound('Bill not found')

    const isAdmin =
      session.user.role === 'ADMIN' && bill.buildingId === session.user.buildingId
    const isOwnerPayingRent =
      session.user.role === 'OWNER' &&
      bill.type === 'RENT' &&
      bill.unit.ownerId === session.user.id

    if (!isAdmin && !isOwnerPayingRent) return Err.forbidden()

    const updated = await prisma.bill.update({
      where: { id: params.id },
      data: { status: 'PAID', paidAt: new Date() },
    })

    // ── Auto-email on rent payment ───────────────────────────────
    if (bill.type === 'RENT') {
      const buildingName = bill.building?.name ?? 'Bari Shamlai'
      const unit         = bill.unit
      const paidAt       = updated.paidAt ?? new Date()

      const emailOpts = {
        unit:          unit.number,
        amount:        bill.amount,
        month:         bill.month,
        year:          bill.year,
        paidAt,
        buildingName,
      }

      // Email tenant
      if (unit.tenant?.email) {
        try {
          await sendEmail({
            to:      unit.tenant.email,
            toName:  unit.tenant.name ?? undefined,
            subject: `Rent Paid — ${getMonthName(bill.month)} ${bill.year} — Unit ${unit.number}`,
            html: rentPaidHtml({ recipientName: unit.tenant.name ?? 'Tenant', ...emailOpts }),
          })
        } catch { /* non-fatal */ }
      }

      // Email owner
      if (unit.owner?.email) {
        try {
          await sendEmail({
            to:      unit.owner.email,
            toName:  unit.owner.name ?? undefined,
            subject: `Rent Received — ${getMonthName(bill.month)} ${bill.year} — Unit ${unit.number}`,
            html: rentPaidHtml({ recipientName: unit.owner.name ?? 'Owner', ...emailOpts }),
          })
        } catch { /* non-fatal */ }
      }
    }

    return ok(updated)
  } catch {
    return Err.internal('Failed to update bill')
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const [session, e] = await requireAdmin()
  if (e) return e

  try {
    const bill = await prisma.bill.findUnique({
      where: { id: params.id },
      select: { buildingId: true, status: true },
    })
    if (!bill) return Err.notFound('Bill not found')
    if (bill.buildingId !== session.user.buildingId) return Err.forbidden()
    if (bill.status !== 'PAID') return Err.badRequest('Bill is not paid')

    const updated = await prisma.bill.update({
      where: { id: params.id },
      data: { status: 'PENDING', paidAt: null },
    })
    return ok(updated)
  } catch {
    return Err.internal('Failed to revert bill')
  }
}
