import type { Enquiry } from './types'

/**
 * DELIVERY SEAM — where the form sends an enquiry.
 *
 * Server host (Vercel, the default build): POST to this site's own
 * /api/contact/, which emails it on through Resend with a key that stays on
 * the server (lib/contact/server.ts). Success is reported only when that
 * route says the provider accepted the message.
 *
 * Static export (GitHub Pages, STATIC_EXPORT=true): there is no server, so
 * the older path applies. With NEXT_PUBLIC_CONTACT_ENDPOINT set, the enquiry
 * is POSTed to that form endpoint (Formspree, Web3Forms, …); without it, the
 * form says nothing was sent and hands the enquiry to WhatsApp.
 *
 * Either way it never claims a message was delivered when it was not.
 */

export type DeliveryResult =
  | { ok: true }
  | { ok: false; reason: 'unconfigured' | 'failed' | 'rate_limited' }
  | { ok: false; reason: 'invalid'; fields: Record<string, string> }

const IS_STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true'
const STATIC_ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

function body(enquiry: Enquiry) {
  return {
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    role: enquiry.role,
    interest: enquiry.interest,
    message: enquiry.message,
  }
}

async function deliverToServer(enquiry: Enquiry): Promise<DeliveryResult> {
  try {
    const response = await fetch(`${BASE_PATH}/api/contact/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body(enquiry)),
    })
    const result = (await response.json().catch(() => null)) as
      | { ok?: boolean; reason?: string; fields?: Record<string, string> }
      | null

    if (response.ok && result?.ok === true) return { ok: true }
    if (result?.reason === 'unconfigured') return { ok: false, reason: 'unconfigured' }
    if (result?.reason === 'rate_limited') return { ok: false, reason: 'rate_limited' }
    if (result?.reason === 'invalid' && result.fields) return { ok: false, reason: 'invalid', fields: result.fields }
    return { ok: false, reason: 'failed' }
  } catch {
    return { ok: false, reason: 'failed' }
  }
}

async function deliverToFormEndpoint(endpoint: string, enquiry: Enquiry): Promise<DeliveryResult> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        ...body(enquiry),
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

export async function deliverEnquiry(enquiry: Enquiry): Promise<DeliveryResult> {
  if (!IS_STATIC_EXPORT) return deliverToServer(enquiry)
  if (!STATIC_ENDPOINT) return { ok: false, reason: 'unconfigured' }
  return deliverToFormEndpoint(STATIC_ENDPOINT, enquiry)
}
