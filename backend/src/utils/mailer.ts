import { Resend } from 'resend'
import { config } from '../config/env'

/**
 * Thin wrapper around Resend for transactional email.
 *
 * Design goals:
 * - Never throw to the caller. Email is best-effort; a mail failure must never
 *   break the request that triggered it (e.g. saving assignment feedback).
 * - No-op gracefully when RESEND_API_KEY isn't configured (local dev, or before
 *   the domain is verified) — it just logs what it would have sent.
 */

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null

export type SendEmailInput = {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (!resend) {
    console.warn('[mailer] RESEND_API_KEY not set — skipping email send.', {
      to: input.to,
      subject: input.subject,
    })
    return { ok: false, skipped: true }
  }

  try {
    const { error } = await resend.emails.send({
      from: config.emailFrom,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    })
    if (error) {
      console.error('[mailer] Resend returned an error:', error)
      return { ok: false, error: String(error) }
    }
    return { ok: true }
  } catch (err) {
    console.error('[mailer] Failed to send email:', err)
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Fire-and-forget helper. Sends the email without awaiting in the request path,
 * logging any failure. Use when the caller shouldn't wait on the mail round-trip.
 */
export function sendEmailInBackground(input: SendEmailInput): void {
  void sendEmail(input).catch(err => {
    console.error('[mailer] background send failed:', err)
  })
}
