import type { Enquiry } from './types'

/**
 * DELIVERY SEAM — static-host edition.
 *
 * GitHub Pages serves files only: there is no server to receive a POST, so
 * delivery has to happen from the browser. Two paths are supported:
 *
 *  1. A form endpoint. Set NEXT_PUBLIC_CONTACT_ENDPOINT to a URL that accepts
 *     a JSON POST and forwards it by email — Formspree, Web3Forms, Getform,
 *     Basin, or your own function all work. The value is public by design
 *     (it ships in the browser bundle), which is why these services issue
 *     per-form endpoints rather than secret keys.
 *
 *         NEXT_PUBLIC_CONTACT_ENDPOINT=https://formspree.io/f/xxxxxxxx
 *
 *  2. Nothing configured. The form still validates and keeps what was typed,
 *     then hands the completed enquiry to WhatsApp with every field already
 *     filled in. It never claims a message was delivered when it was not.
 *
 * Moving to a server host (Vercel, a VPS) later? Server-side delivery through
 * Resend is a better fit there — see docs/DEPLOYMENT.md.
 */

export type DeliveryResult =
  | { ok: true }
  | { ok: false; reason: 'unconfigured' | 'failed' }

const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT

export function isDeliveryConfigured(): boolean {
  return Boolean(ENDPOINT)
}

export async function deliverEnquiry(enquiry: Enquiry): Promise<DeliveryResult> {
  if (!ENDPOINT) return { ok: false, reason: 'unconfigured' }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: enquiry.name,
        email: enquiry.email,
        phone: enquiry.phone,
        role: enquiry.role,
        interest: enquiry.interest,
        message: enquiry.message,
        submittedAt: enquiry.submittedAt,
        _subject: `Website enquiry — ${enquiry.name} (${enquiry.interest})`,
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
