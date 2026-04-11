import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getBillTypeLabel, getMonthName } from '@/lib/utils'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const receipt = await prisma.receipt.findUnique({
    where: { id: params.id },
    include: {
      bill: true,
      unit: true,
      issuedBy: true,
      recipient: true,
    },
  })

  if (!receipt) return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })

  const buildingName = process.env.NEXT_PUBLIC_BUILDING_NAME || 'Building Management'
  const r = receipt
  const issueDate = new Date(r.createdAt).toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' })
  const receiptNo = r.id.slice(-8).toUpperCase()
  const billPeriod = r.bill ? `${getMonthName(r.bill.month)} ${r.bill.year}` : ''
  const billType = r.bill ? getBillTypeLabel(r.bill.type) : ''
  const amount = new Intl.NumberFormat('en-BD').format(r.amount)

  // Generate a clean HTML receipt that browsers can print as PDF
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Receipt ${receiptNo}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #fff; color: #1a1917; padding: 40px; max-width: 680px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #1e3a5f; margin-bottom: 32px; }
  .logo { font-family: 'DM Serif Display', serif; font-size: 28px; color: #1e3a5f; }
  .building-name { font-size: 13px; color: #6b6860; margin-top: 4px; }
  .receipt-badge { background: #1e3a5f; color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; }
  .receipt-no { font-size: 12px; color: #9c9890; text-align: right; margin-top: 6px; }
  .section-title { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #9c9890; margin-bottom: 12px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
  .field-label { font-size: 12px; color: #9c9890; margin-bottom: 3px; }
  .field-value { font-size: 14px; font-weight: 500; color: #1a1917; }
  .amount-box { background: #f5f4f0; border: 1px solid #e8e6e0; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center; }
  .amount-label { font-size: 12px; color: #9c9890; margin-bottom: 8px; }
  .amount-value { font-family: 'DM Serif Display', serif; font-size: 42px; color: #1e3a5f; }
  .amount-currency { font-size: 20px; vertical-align: super; }
  .paid-stamp { display: inline-block; border: 3px solid #15803d; color: #15803d; padding: 6px 20px; border-radius: 8px; font-size: 18px; font-weight: 700; letter-spacing: 0.1em; transform: rotate(-5deg); margin-top: 8px; }
  .footer { border-top: 1px solid #e8e6e0; padding-top: 20px; font-size: 12px; color: #9c9890; text-align: center; line-height: 1.6; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">BuildingHQ</div>
    <div class="building-name">${buildingName}</div>
  </div>
  <div style="text-align:right">
    <div class="receipt-badge">PAYMENT RECEIPT</div>
    <div class="receipt-no"># ${receiptNo}</div>
    <div style="font-size:12px;color:#9c9890;margin-top:4px">${issueDate}</div>
  </div>
</div>

<div class="grid">
  <div>
    <div class="section-title">Issued To</div>
    <div class="field-label">Tenant Name</div>
    <div class="field-value">${r.recipient?.name ?? '—'}</div>
    <div style="margin-top:12px">
      <div class="field-label">Email</div>
      <div class="field-value">${r.recipient?.email ?? '—'}</div>
    </div>
    <div style="margin-top:12px">
      <div class="field-label">Phone</div>
      <div class="field-value">${r.recipient?.phone ?? '—'}</div>
    </div>
  </div>
  <div>
    <div class="section-title">Property Details</div>
    <div class="field-label">Unit</div>
    <div class="field-value">${r.unit?.number ?? '—'}</div>
    <div style="margin-top:12px">
      <div class="field-label">Bill Type</div>
      <div class="field-value">${billType}</div>
    </div>
    <div style="margin-top:12px">
      <div class="field-label">Bill Period</div>
      <div class="field-value">${billPeriod}</div>
    </div>
    <div style="margin-top:12px">
      <div class="field-label">Issued By</div>
      <div class="field-value">${r.issuedBy?.name ?? '—'}</div>
    </div>
  </div>
</div>

<div class="amount-box">
  <div class="amount-label">Amount Paid</div>
  <div class="amount-value"><span class="amount-currency">৳</span>${amount}</div>
  <div><span class="paid-stamp">PAID</span></div>
</div>

<div class="footer">
  This is a computer-generated receipt and does not require a physical signature.<br/>
  For queries, contact building management at ${buildingName}.<br/>
  Thank you for your timely payment.
</div>

<script>window.onload = () => window.print()</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
