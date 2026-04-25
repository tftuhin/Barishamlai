import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAuth } from '@/lib/api'
import { sendEmail, emailBase, amountBox, detailTable } from '@/lib/email'
import { getBillTypeLabel, getMonthName } from '@/lib/utils'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const [session, e] = await requireAuth()
  if (e) return e

  if (!['ADMIN', 'OWNER'].includes(session.user.role)) return Err.forbidden()

  try {
    const receipt = await prisma.receipt.findUnique({
      where:   { id: params.id },
      include: { bill: true, unit: true, issuedBy: true, recipient: true },
    })

    if (!receipt) return Err.notFound('Receipt not found')

    // Verify ownership: ADMINs must own the building; OWNERs must own the unit
    if (session.user.role === 'ADMIN') {
      if (receipt.unit?.buildingId !== session.user.buildingId) return Err.forbidden()
    } else {
      // OWNER: can only send receipts for units they own
      if (receipt.unit?.ownerId !== session.user.id) return Err.forbidden()
    }

    if (!receipt.recipient?.email) return Err.badRequest('Recipient has no email address')

    const buildingName = process.env.EMAIL_FROM_NAME || 'বাড়ি সামলাই'
    const billType     = receipt.bill ? getBillTypeLabel(receipt.bill.type) : 'Bill'
    const period       = receipt.bill ? `${getMonthName(receipt.bill.month)} ${receipt.bill.year}` : ''
    const receiptNo    = receipt.id.slice(-8).toUpperCase()
    const appUrl       = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const pdfUrl       = `${appUrl}/api/receipts/${receipt.id}/pdf`

    await sendEmail({
      to:      receipt.recipient.email,
      toName:  receipt.recipient.name ?? undefined,
      subject: `Payment Receipt #${receiptNo} — ${billType} for ${period}`,
      html: emailBase({
        heading:    'Payment Receipt',
        subheading: buildingName,
        bodyHtml: `
          <p style="color:#1A2E2A;margin:0 0 6px">Dear <strong>${receipt.recipient.name ?? 'Resident'}</strong>,</p>
          <p style="color:#3D5A53;margin:0 0 20px;line-height:1.65">
            Your payment has been received and confirmed. Here are the details:
          </p>

          <p style="color:#5F5E5A;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 4px">Receipt Number</p>
          <p style="font-size:17px;font-weight:700;color:#1A2E2A;margin:0 0 20px">#${receiptNo}</p>

          ${detailTable([
            ['Bill Type', billType],
            ['Period',    period],
            ['Unit',      receipt.unit?.number ?? '—'],
            ['Status',    '<span style="color:#16A34A;font-weight:700">PAID ✓</span>'],
          ])}

          ${amountBox('Amount Paid', receipt.amount)}

          <p style="color:#5F5E5A;font-size:13px;margin:0;text-align:center">
            Please keep this receipt for your records.
          </p>
        `,
        ctaLabel: 'Download Receipt PDF →',
        ctaUrl:   pdfUrl,
      }),
    })

    await prisma.receipt.update({ where: { id: params.id }, data: { sentEmail: true } })

    return ok({ success: true })
  } catch {
    return Err.internal('Failed to send receipt email')
  }
}
