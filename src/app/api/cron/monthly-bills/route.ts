export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { isPrismaConflict } from '@/lib/api'

function monthName(m: number) {
  return ['January','February','March','April','May','June','July','August','September','October','November','December'][m - 1]
}

function rentEmailHtml(d: {
  name: string; building: string; unit: string
  amount: number; month: number; year: number; due: Date
}) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#F8FFFE;margin:0;padding:24px">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
  <div style="background:#1D9E75;padding:28px 40px">
    <h2 style="color:#fff;margin:0;font-size:20px;font-weight:700">বাড়ি সামলাই — Rent Bill</h2>
    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px">${d.building}</p>
  </div>
  <div style="padding:32px 40px">
    <p style="color:#1A2E2A;margin:0 0 20px">Dear <strong>${d.name}</strong>,</p>
    <p style="color:#3D5A53;margin:0 0 24px">Your rent bill for <strong>${monthName(d.month)} ${d.year}</strong> has been generated for Unit <strong>${d.unit}</strong>.</p>
    <div style="background:#E1F5EE;border-radius:10px;padding:24px;margin-bottom:24px;text-align:center">
      <p style="font-size:12px;color:#5F5E5A;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.08em">Amount Due</p>
      <p style="font-size:32px;font-weight:700;color:#1D9E75;margin:0">৳${d.amount.toLocaleString()}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr><td style="padding:11px 16px;color:#5F5E5A;font-size:14px;border-bottom:1px solid #E1F5EE">Period</td><td style="padding:11px 16px;font-size:14px;font-weight:500;color:#1A2E2A;border-bottom:1px solid #E1F5EE">${monthName(d.month)} ${d.year}</td></tr>
      <tr><td style="padding:11px 16px;color:#5F5E5A;font-size:14px">Due Date</td><td style="padding:11px 16px;font-size:14px;font-weight:500;color:#1A2E2A">${d.due.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</td></tr>
    </table>
    <p style="color:#5F5E5A;font-size:13px;margin:0">Please contact your building manager to arrange payment.</p>
  </div>
  <div style="padding:16px 40px;border-top:1px solid #E1F5EE;background:#F8FFFE">
    <p style="color:#5F5E5A;font-size:12px;margin:0">Sent by <strong>বাড়ি সামলাই</strong> · This is an automated message. Do not reply.</p>
  </div>
</div></body></html>`
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now     = new Date()
  const month   = now.getMonth() + 1
  const year    = now.getFullYear()
  const dueDate = new Date(year, month - 1, 10)

  const buildings = await prisma.building.findMany({
    include: { units: { include: { tenant: true } }, config: true },
  })

  let rentCreated = 0, scCreated = 0, emailsSent = 0

  for (const building of buildings) {
    const scOccupied = building.config?.serviceChargeOccupied ?? 0
    const scVacant   = building.config?.serviceChargeVacant   ?? 0

    for (const unit of building.units) {
      // RENT: occupied, not owner-occupied
      if (unit.status === 'OCCUPIED' && !unit.isOwnerOccupied && unit.monthlyRent > 0) {
        try {
          await prisma.bill.create({
            data: {
              unitId: unit.id, buildingId: building.id,
              type: 'RENT', amount: unit.monthlyRent,
              month, year, dueDate, status: 'PENDING',
            },
          })
          rentCreated++

          if (unit.tenant?.email) {
            try {
              const sent = await sendEmail({
                to:      unit.tenant.email,
                toName:  unit.tenant.name,
                subject: `Rent Bill for ${monthName(month)} ${year} — ${building.name}`,
                html:    rentEmailHtml({
                  name:     unit.tenant.name,
                  building: building.name,
                  unit:     unit.number,
                  amount:   unit.monthlyRent,
                  month, year, due: dueDate,
                }),
              })
              if (sent) emailsSent++
            } catch { /* email failure is non-fatal */ }
          }
        } catch (e) {
          if (!isPrismaConflict(e)) throw e // re-throw unexpected errors
        }
      }

      // SERVICE_CHARGE: all units
      const scAmount = unit.status === 'OCCUPIED' ? scOccupied : scVacant
      if (scAmount > 0) {
        try {
          await prisma.bill.create({
            data: {
              unitId: unit.id, buildingId: building.id,
              type: 'SERVICE_CHARGE', amount: scAmount,
              month, year, dueDate, status: 'PENDING',
            },
          })
          scCreated++
        } catch (e) {
          if (!isPrismaConflict(e)) throw e
        }
      }
    }
  }

  return NextResponse.json({ success: true, month, year, rentCreated, scCreated, emailsSent })
}
