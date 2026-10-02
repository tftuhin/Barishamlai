export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailBase, amountBox, detailTable } from '@/lib/email'
import { isPrismaConflict } from '@/lib/api'

import { escapeHtml } from '@/lib/security'
import { USER_PUBLIC_SELECT } from '@/lib/dto'

function monthName(m: number) {
  return ['January','February','March','April','May','June','July','August','September','October','November','December'][m - 1]
}

function billNotificationHtml(opts: {
  recipientName?: string
  buildingName:   string
  billType:       string
  unit:           string
  amount:         number
  month:          number
  year:           number
  dueDate:        Date
}): string {
  const safeName = escapeHtml(opts.recipientName ?? 'Resident')
  const safeBuilding = escapeHtml(opts.buildingName)
  const safeType = escapeHtml(opts.billType)
  const safeUnit = escapeHtml(opts.unit)
  const safePeriod = escapeHtml(`${monthName(opts.month)} ${opts.year}`)

  return emailBase({
    heading:    `${safeType} Bill`,
    subheading: safeBuilding,
    bodyHtml: `
      <p style="color:#1A2E2A;margin:0 0 12px">Dear <strong>${safeName}</strong>,</p>
      <p style="color:#3D5A53;margin:0 0 4px;line-height:1.65">
        Your <strong>${safeType}</strong> bill for <strong>${safePeriod}</strong>
        has been generated for Unit <strong>${safeUnit}</strong>.
      </p>
      ${amountBox('Amount Due', opts.amount)}
      ${detailTable([
        ['Period',   safePeriod],
        ['Unit',     safeUnit],
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
  // Always require CRON_SECRET in production; fail-closed if not configured
  const secret = process.env.CRON_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  } else {
    const auth = req.headers.get('authorization') ?? ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    // Use length-constant comparison to prevent timing attacks
    const secretBuf = Buffer.from(secret)
    const tokenBuf  = Buffer.from(token.padEnd(secret.length, '\0').slice(0, secret.length))
    const match = token.length === secret.length &&
      require('crypto').timingSafeEqual(secretBuf, tokenBuf)
    if (!match)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now     = new Date()
  const month   = now.getMonth() + 1
  const year    = now.getFullYear()
  const dueDate = new Date(year, month - 1, 10) // 10th of current month

  // T13: Restrict cron billing strictly to ACTIVE buildings
  const buildings = await prisma.building.findMany({
    where: { status: 'ACTIVE' },
    include: {
      units:  { include: { tenant: { select: USER_PUBLIC_SELECT }, owner: { select: USER_PUBLIC_SELECT } } },
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
          const tenant = unit.tenant
          if (tenant?.email) {
            try {
              const sent = await sendEmail({
                to:      tenant.email,
                toName:  tenant.name,
                subject: `Rent Bill for ${monthName(month)} ${year} — ${building.name}`,
                html: billNotificationHtml({
                  recipientName: tenant.name ?? 'Tenant',
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

          // Email flat owner
          const owner = unit.owner
          if (owner?.email) {
            try {
              const sent = await sendEmail({
                to:      owner.email,
                toName:  owner.name,
                subject: `Rent Bill Generated — ${monthName(month)} ${year} — Unit ${unit.number}`,
                html: billNotificationHtml({
                  recipientName: owner.name ?? 'Owner',
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

      // ── GAS (T10 Invariant Enforcement) ─────────────────
      // Stop unmetered placeholder billing without verified meter readings.
      // Only auto-generate if a verified reading exists for this unit in the billing cycle.
      if (featureGas && gasRate > 0 && unit.status === 'OCCUPIED' && !unit.isOwnerOccupied) {
        const periodStart = new Date(year, month - 1, 1)
        const periodEnd   = new Date(year, month, 1)

        const currentReading = await prisma.meterReading.findFirst({
          where: {
            unitId: unit.id,
            meterType: 'GAS',
            readAt: { gte: periodStart, lt: periodEnd },
          },
          orderBy: { readAt: 'desc' },
        })

        if (currentReading) {
          const prevReading = await prisma.meterReading.findFirst({
            where: {
              unitId: unit.id,
              meterType: 'GAS',
              readAt: { lt: periodStart },
            },
            orderBy: { readAt: 'desc' },
          })

          const prevVal = prevReading?.reading ?? 0
          const consumed = currentReading.reading > prevVal ? currentReading.reading - prevVal : 0
          const gasAmount = Math.round(consumed * gasRate)

          if (gasAmount > 0) {
            try {
              await prisma.bill.create({
                data: {
                  unitId:              unit.id,
                  buildingId:          building.id,
                  type:                'GAS',
                  amount:              gasAmount,
                  month, year, dueDate,
                  status:              'PENDING',
                  meterReading:        currentReading.reading,
                  openingMeterReading: prevVal,
                  note:                `Verified meter reading (${consumed} units @ ৳${gasRate})`,
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
                      amount:        gasAmount,
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
        // If no verified meter reading exists, skip auto-generation
        // Admin will enter readings and generate batch from Gas page
      }
    }
  }

  return NextResponse.json({
    success: true, month, year,
    rentCreated, scCreated, gasCreated, emailsSent,
  })
}
