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
 * Throws on API error with a descriptive message.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<boolean> {
  // Read at call time so Vercel env vars are always available
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return false

  const fromEmail = process.env.EMAIL_FROM_ADDRESS || 'noreply@barishamlai.app'
  const fromName  = process.env.EMAIL_FROM_NAME    || 'Bari Shamlai'

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
