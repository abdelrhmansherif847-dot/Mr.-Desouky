import type { Enquiry } from './types'

/**
 * DELIVERY SEAM
 * =============
 * The contact form is fully built; only the transport is pluggable.
 *
 * To turn delivery on, set these environment variables (e.g. in Vercel):
 *
 *   CONTACT_PROVIDER = "resend"
 *   RESEND_API_KEY   = "re_..."
 *   CONTACT_TO       = "info@desoukymath.com"     // where enquiries land
 *   CONTACT_FROM     = "site@yourdomain.com"      // a verified sender
 *
 * With nothing set, the form still validates and responds — it simply tells
 * the visitor to use WhatsApp or email instead of silently dropping the
 * enquiry. Nothing here ever pretends a message was delivered when it was not.
 *
 * To use a different provider (SMTP, a CRM, a database), replace the body of
 * `deliverEnquiry` — nothing else in the app needs to change.
 */

export type DeliveryResult = { ok: true } | { ok: false; reason: 'unconfigured' | 'failed' }

export function isDeliveryConfigured(): boolean {
  return Boolean(
    process.env.CONTACT_PROVIDER &&
      process.env.RESEND_API_KEY &&
      process.env.CONTACT_TO &&
      process.env.CONTACT_FROM,
  )
}

function renderEmail(enquiry: Enquiry): string {
  const rows: [string, string][] = [
    ['Name', enquiry.name],
    ['Email', enquiry.email],
    ['Phone', enquiry.phone || '—'],
    ['Role', enquiry.role],
    ['Interested in', enquiry.interest],
    ['Submitted', enquiry.submittedAt],
  ]

  return [
    'New website enquiry',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Message:',
    enquiry.message,
  ].join('\n')
}

export async function deliverEnquiry(enquiry: Enquiry): Promise<DeliveryResult> {
  if (!isDeliveryConfigured()) {
    return { ok: false, reason: 'unconfigured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM,
        to: [process.env.CONTACT_TO],
        reply_to: enquiry.email,
        subject: `Website enquiry — ${enquiry.name} (${enquiry.interest})`,
        text: renderEmail(enquiry),
      }),
    })

    if (!response.ok) {
      console.error('[contact] delivery failed', response.status)
      return { ok: false, reason: 'failed' }
    }

    return { ok: true }
  } catch (error) {
    console.error('[contact] delivery threw', error)
    return { ok: false, reason: 'failed' }
  }
}
