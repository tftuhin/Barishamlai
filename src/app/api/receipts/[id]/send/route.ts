import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, Err, requireAuth } from '@/lib/api'
import { sendEmail } from '@/lib/email'
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
      where: { id: params.id },
      include: { bill: true, unit: true, issuedBy: true, recipient: true },
    })

    if (!receipt) return Err.notFound('Receipt not found')
    if (!receipt.recipient?.email) return Err.badRequest('Recipient has no email')

    const buildingName = process.env.NEXT_PUBLIC_BUILDING_NAME || 'Bari Shamlai'
    const amount       = new Intl.NumberFormat('en-BD').format(receipt.amount)
    const billType     = receipt.bill ? getBillTypeLabel(receipt.bill.type) : ''
    const period       = receipt.bill ? `${getMonthName(receipt.bill.month)} ${receipt.bill.year}` : ''
    const receiptNo    = receipt.id.slice(-8).toUpperCase()
    const appUrl       = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    await sendEmail({
      to:      receipt.recipient.email,
      toName:  receipt.recipient.name ?? undefined,
      subject: `Payment Receipt #${receiptNo} — ${billType} for ${period}`,
      html: `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#F8FFFE;margin:0;padding:24px">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
          <div style="background:#1D9E75;padding:28px 40px">
            <h2 style="color:#fff;margin:0;font-size:20px;font-weight:700">Payment Receipt</h2>
            <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px">${buildingName}</p>
          </div>
          <div style="padding:32px 40px">
            <p style="color:#5F5E5A;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 4px">Receipt Number</p>
            <p style="font-size:17px;font-weight:700;color:#1A2E2A;margin:0 0 24px">#${receiptNo}</p>
            <table style="width:100%;border-collapse:collapse;background:#F8FFFE;border-radius:10px;overflow:hidden;margin-bottom:24px">
              <tr><td style="padding:11px 16px;color:#5F5E5A;font-size:14px;border-bottom:1px solid #E1F5EE">Bill Type</td><td style="padding:11px 16px;font-weight:500;color:#1A2E2A;border-bottom:1px solid #E1F5EE">${billType}</td></tr>
              <tr><td style="padding:11px 16px;color:#5F5E5A;font-size:14px;border-bottom:1px solid #E1F5EE">Period</td><td style="padding:11px 16px;font-weight:500;color:#1A2E2A;border-bottom:1px solid #E1F5EE">${period}</td></tr>
              <tr><td style="padding:11px 16px;color:#5F5E5A;font-size:14px;border-bottom:1px solid #E1F5EE">Unit</td><td style="padding:11px 16px;font-weight:500;color:#1A2E2A;border-bottom:1px solid #E1F5EE">${receipt.unit?.number}</td></tr>
              <tr><td style="padding:11px 16px;color:#5F5E5A;font-size:14px">Status</td><td style="padding:11px 16px;font-weight:700;color:#16A34A">PAID ✓</td></tr>
            </table>
            <div style="background:#E1F5EE;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px">
              <p style="font-size:12px;color:#5F5E5A;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.08em">Amount Paid</p>
              <p style="font-size:36px;font-weight:700;color:#1D9E75;margin:0">৳${amount}</p>
            </div>
            <a href="${appUrl}/api/receipts/${receipt.id}/pdf" style="display:block;text-align:center;background:#1D9E75;color:#fff;padding:13px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:24px">
              View / Download Receipt PDF
            </a>
            <p style="font-size:12px;color:#5F5E5A;text-align:center;margin:0">
              This is an automated receipt from ${buildingName}. Please keep this for your records.
            </p>
          </div>
          <div style="padding:16px 40px;border-top:1px solid #E1F5EE;background:#F8FFFE">
            <p style="color:#5F5E5A;font-size:12px;margin:0">Sent by <strong>বাড়ি সামলাই</strong> · Powered by Bari Shamlai | barishamlai.com.bd</p>
          </div>
        </div>
      </body></html>`,
    })
    // sendEmail returns false if BREVO_API_KEY not set (dev mode) — that's fine

    await prisma.receipt.update({ where: { id: params.id }, data: { sentEmail: true } })

    return ok({ success: true })
  } catch {
    return Err.internal('Failed to send receipt email')
  }
}
