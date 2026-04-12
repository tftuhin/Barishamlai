export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailBase, amountBox, detailTable } from '@/lib/email'
import { isPrismaConflict } from '@/lib/api'

function monthName(m: number) {
  return ['January','February','March','April','May','June','July','August','September','October','November','December'][m - 1]
}

function billNotificationHtml(opts: {
  recipientName: string
  buildingName:  string
  billType:      string
  unit:          string
  amount:        number
  month:         number
  year:          number
  dueDate:       Date
}): string {
  return emailBase({
    heading:    `${opts.billType} Bill`,
    subheading: opts.buildingName,
    bodyHtml: `
      <p style="color:#1A2E2A;margin:0 0 12px">Dear <strong>${opts.recipientName}</strong>,</p>
      <p style="color:#3D5A53;margin:0 0 4px;line-height:1.65">
        Your <strong>${opts.billType}</strong> bill for <strong>${monthName(opts.month)} ${opts.year}</strong>
        has been generated for Unit <strong>${opts.unit}</strong>.
      </p>
      ${amountBox('Amount Due', opts.amount)}
      ${detailTable([
        ['Period',   `${monthName(opts.month)} ${opts.year}`],
        ['Unit',     opts.unit],
        ['Due Date', opts.dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
        ['Status',   '<span style="color:#d97706;font-weight:700">PENDING</span>'],
      ])}
      <p style="color:#5F5E5A;font-size:13px;margin:0">
        Please contact your building manager to arrange payment before the due date.
      </p>
    `,
  })
}

export async function GET(req: NextRequest) {
  // Protect with CRON_SECRET if configured
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now     = new Date()
  const month   = now.getMonth() + 1
  const year    = now.getFullYear()
  const dueDate = new Date(year, month - 1, 10) // 10th of current month

  const buildings = await prisma.building.findMany({
    include: {
      units:  { include: { tenant: true } },
      config: true,
    },
  })

  let rentCreated = 0, scCreated = 0, gasCreated = 0, emailsSent = 0

  for (const building of buildings) {
    const cfg = building.config

    const featureRent  = cfg?.featureRent          ?? true
    const featureSC    = cfg?.featureServiceCharge  ?? true
    const featureGas   = cfg?.featureGas            ?? true

    const scOccupied = cfg?.serviceChargeOccupied ?? 0
    const scVacant   = cfg?.serviceChargeVacant   ?? 0
    const gasRate    = cfg?.gasUnitRate            ?? 0

    for (const unit of building.units) {
      // ── RENT ────────────────────────────────────────────
      if (featureRent && unit.status === 'OCCUPIED' && !unit.isOwnerOccupied && unit.monthlyRent > 0) {
        try {
          await prisma.bill.create({
            data: {
              unitId:     unit.id,
              buildingId: building.id,
              type:       'RENT',
              amount:     unit.monthlyRent,
              month, year, dueDate,
              status: 'PENDING',
            },
          })
          rentCreated++

          // Email tenant
          const recipient = unit.tenant
          if (recipient?.email) {
            try {
              const sent = await sendEmail({
                to:      recipient.email,
                toName:  recipient.name,
                subject: `Rent Bill for ${monthName(month)} ${year} — ${building.name}`,
                html: billNotificationHtml({
                  recipientName: recipient.name,
                  buildingName:  building.name,
                  billType:      'Rent',
                  unit:          unit.number,
                  amount:        unit.monthlyRent,
                  month, year, dueDate,
                }),
              })
              if (sent) emailsSent++
            } catch { /* email failure is non-fatal */ }
          }
        } catch (e) {
          if (!isPrismaConflict(e)) throw e
        }
      }

      // ── SERVICE CHARGE ───────────────────────────────────
      if (featureSC) {
        // Use per-unit custom rate if set, otherwise fall back to building-level rate
        const scAmount = unit.customServiceCharge != null
          ? unit.customServiceCharge
          : (unit.status === 'VACANT' ? scVacant : scOccupied)

        if (scAmount > 0) {
          try {
            await prisma.bill.create({
              data: {
                unitId:     unit.id,
                buildingId: building.id,
                type:       'SERVICE_CHARGE',
                amount:     scAmount,
                month, year, dueDate,
                status: 'PENDING',
              },
            })
            scCreated++

            // Email tenant (if occupied unit has a tenant)
            const recipient = unit.status === 'OCCUPIED' ? unit.tenant : null
            if (recipient?.email) {
              try {
                const sent = await sendEmail({
                  to:      recipient.email,
                  toName:  recipient.name,
                  subject: `Service Charge Bill for ${monthName(month)} ${year} — ${building.name}`,
                  html: billNotificationHtml({
                    recipientName: recipient.name,
                    buildingName:  building.name,
                    billType:      'Service Charge',
                    unit:          unit.number,
                    amount:        scAmount,
                    month, year, dueDate,
                  }),
                })
                if (sent) emailsSent++
              } catch { /* non-fatal */ }
            }
          } catch (e) {
            if (!isPrismaConflict(e)) throw e
          }
        }
      }

      // ── GAS ─────────────────────────────────────────────
      // Gas bills are generated per unit when featureGas is on.
      // Amount is based on meter reading; for auto-generation we use
      // a flat rate (gasUnitRate × 1 unit as placeholder — admin will
      // update the meterReading and recalculate from the Gas page).
      // We only auto-create if gasRate > 0.
      if (featureGas && gasRate > 0 && unit.status === 'OCCUPIED' && !unit.isOwnerOccupied) {
        try {
          await prisma.bill.create({
            data: {
              unitId:     unit.id,
              buildingId: building.id,
              type:       'GAS',
              amount:     gasRate, // placeholder; admin updates from Gas page
              month, year, dueDate,
              status: 'PENDING',
            },
          })
          gasCreated++

          const recipient = unit.tenant
          if (recipient?.email) {
            try {
              const sent = await sendEmail({
                to:      recipient.email,
                toName:  recipient.name,
                subject: `Gas Bill for ${monthName(month)} ${year} — ${building.name}`,
                html: billNotificationHtml({
                  recipientName: recipient.name,
                  buildingName:  building.name,
                  billType:      'Gas',
                  unit:          unit.number,
                  amount:        gasRate,
                  month, year, dueDate,
                }),
              })
              if (sent) emailsSent++
            } catch { /* non-fatal */ }
          }
        } catch (e) {
          if (!isPrismaConflict(e)) throw e
        }
      }
    }
  }

  return NextResponse.json({
    success: true, month, year,
    rentCreated, scCreated, gasCreated, emailsSent,
  })
}
