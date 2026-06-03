import { BrevoClient } from '@getbrevo/brevo'

interface SendEmailOptions {
  to: string
  toName?: string
  subject: string
  html: string
}

/**
 * Sends a transactional email via Brevo.
 * Returns true if sent, false if BREVO_API_KEY is not configured (dev/test mode).
 * Throws on API error.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return false

  const fromEmail = process.env.EMAIL_FROM_ADDRESS || 'noreply@barishamlai.app'
  const fromName  = process.env.EMAIL_FROM_NAME    || 'বাড়ি সামলাই'

  const client = new BrevoClient({ apiKey })

  try {
    await client.transactionalEmails.sendTransacEmail({
      sender:      { email: fromEmail, name: fromName },
      to:          [{ email: opts.to, name: opts.toName }],
      subject:     opts.subject,
      htmlContent: opts.html,
    })
    return true
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(`Brevo send failed: ${msg}`)
  }
}

/**
 * Builds a consistent, branded HTML email.
 * All transactional emails should go through this template.
 */
export function emailBase(opts: {
  heading: string
  subheading?: string
  bodyHtml: string
  ctaLabel?: string
  ctaUrl?: string
  footerNote?: string
}): string {
  const appName  = process.env.EMAIL_FROM_NAME || 'বাড়ি সামলাই'
  const footer   = opts.footerNote
    ?? `Sent by <strong>${appName}</strong> &middot; This is an automated message. Please do not reply.`

  const cta = opts.ctaLabel && opts.ctaUrl
    ? `<a href="${opts.ctaUrl}" style="display:block;text-align:center;background:#1D9E75;color:#ffffff;padding:14px 24px;border-radius:9px;text-decoration:none;font-weight:600;font-size:15px;margin-top:28px;letter-spacing:-0.01em">
        ${opts.ctaLabel}
       </a>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${opts.heading}</title>
</head>
<body style="margin:0;padding:24px 16px;background:#F8FFFE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1D9E75 0%,#085041 100%);padding:28px 40px 26px">
      <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;letter-spacing:-0.01em;line-height:1.3">${opts.heading}</h1>
      ${opts.subheading ? `<p style="color:rgba(255,255,255,0.78);margin:6px 0 0;font-size:13px">${opts.subheading}</p>` : ''}
    </div>

    <!-- Body -->
    <div style="padding:32px 40px 28px">
      ${opts.bodyHtml}
      ${cta}
    </div>

    <!-- Footer -->
    <div style="padding:16px 40px 18px;border-top:1px solid #E1F5EE;background:#F8FFFE">
      <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6">${footer}</p>
    </div>

  </div>
</body>
</html>`
}

/* ── Shared layout helpers ────────────────────────────────── */

/** A green "amount" highlight box used in bill/receipt emails. */
export function amountBox(label: string, amount: number): string {
  return `<div style="background:#E1F5EE;border-radius:10px;padding:22px 24px;text-align:center;margin:22px 0">
    <p style="font-size:11px;font-weight:700;color:#5F5E5A;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.1em">${label}</p>
    <p style="font-size:34px;font-weight:700;color:#1D9E75;margin:0;letter-spacing:-0.02em">৳${amount.toLocaleString('en-BD')}</p>
  </div>`
}

/** A two-column detail row table used in bill/receipt emails. */
export function detailTable(rows: Array<[string, string]>): string {
  const rowHtml = rows.map(([label, value], i) => {
    const border = i < rows.length - 1 ? 'border-bottom:1px solid #E1F5EE;' : ''
    return `<tr>
      <td style="padding:11px 16px;color:#5F5E5A;font-size:14px;${border}">${label}</td>
      <td style="padding:11px 16px;font-size:14px;font-weight:500;color:#1A2E2A;${border}">${value}</td>
    </tr>`
  }).join('')

  return `<table style="width:100%;border-collapse:collapse;background:#F8FFFE;border-radius:10px;overflow:hidden;margin:16px 0">${rowHtml}</table>`
}
