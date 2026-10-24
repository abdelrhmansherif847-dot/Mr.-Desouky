import { createHash } from 'node:crypto'
import type { EnquiryInput } from './validate'
import type { EnquiryRole } from './types'

/**
 * SERVER-SIDE DELIVERY — the contact form on a server host (Vercel).
 *
 * The browser posts the enquiry to /api/contact; this sends it on by email
 * through Resend's HTTP API. The API key is read from the server environment
 * only — it is never a NEXT_PUBLIC_ variable and never reaches the browser.
 *
 * What makes this safe to expose as a public endpoint:
 *
 *   - The recipient is fixed here, from configuration. Nothing in the request
 *     can choose who receives the email, so the endpoint cannot be used to
 *     send mail to anyone else.
 *   - The visitor's address is used only as Reply-To (and in the body), and
 *     only when it is a single plain address.
 *   - Requests must come from this site's own pages (Origin = Host), carry a
 *     JSON body under a size cap, pass the same validation the form runs, and
 *     stay under a per-address rate limit.
 *   - Success is reported only when Resend has accepted the message and
 *     returned its id. Anything else is a failure the visitor is told about.
 *
 * Runtime dependencies are passed in (validation, fetch, the limiter), which
 * is what lets tests/contact-server.test.mts run this module on its own.
 */

export type ContactReason = 'unconfigured' | 'failed' | 'invalid' | 'rate_limited' | 'forbidden' | 'too_large'

export type ContactResponseBody =
  | { ok: true }
  | { ok: false; reason: ContactReason; fields?: Record<string, string> }

export type ContactConfig = {
  /** RESEND_API_KEY. Missing: the form says nothing was sent. */
  apiKey?: string
  /** CONTACT_FROM_EMAIL, on a domain verified in Resend. */
  from?: string
  /** Where enquiries go. Fixed server-side, never taken from the request. */
  to: string
  /** RESEND_API_URL, only to point tests at a local stand-in. */
  apiUrl?: string
}

export type ContactDeps = {
  config: ContactConfig
  validate: (values: EnquiryInput) => Record<string, string>
  fetch: typeof fetch
  limiter: { allow: (key: string) => boolean }
  /** Waiting before the one retry; tests pass a no-op. */
  sleep?: (ms: number) => Promise<void>
}

/** Far above the form's own limits (2000-character message), far below abuse. */
export const MAX_BODY = 16_000

const RESEND_URL = 'https://api.resend.com/emails'
const ROLE_LABEL: Record<EnquiryRole, string> = { student: 'Student', parent: 'Parent', other: 'Other' }

function json(status: number, body: ContactResponseBody): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

/** The body's fields as the form sends them: strings, trimmed, anything else empty. */
export function toInput(body: unknown): EnquiryInput & { company: string } {
  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const str = (key: string) => (typeof record[key] === 'string' ? (record[key] as string).trim() : '')
  return {
    name: str('name'),
    email: str('email'),
    phone: str('phone'),
    role: str('role'),
    interest: str('interest'),
    message: str('message'),
    company: str('company'),
  }
}

/** One line, no control characters: safe in a subject. */
export function oneLine(value: string, max: number): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
}

/** A single plain address, or nothing — never a list, a display name or a header. */
export function replyAddress(email: string): string | undefined {
  return /^[^\s@,;<>"()[\]\\]+@[^\s@,;<>"()[\]\\]+\.[^\s@,;<>"()[\]\\]{2,}$/.test(email) ? email : undefined
}

/** The request came from a page on this same host. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    return new URL(origin).host === new URL(request.url).host
  } catch {
    return false
  }
}

/** The caller's address as Vercel reports it, for the rate limit only. */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip') || 'unknown'
}

/**
 * At most `limit` requests per key per window. Kept in memory, so it is per
 * server instance and resets on a cold start: a brake on bursts, not a quota.
 */
export function createRateLimiter(limit: number, windowMs: number, now: () => number = Date.now) {
  const hits = new Map<string, number[]>()
  return {
    allow(key: string): boolean {
      const t = now()
      const recent = (hits.get(key) ?? []).filter((at) => t - at < windowMs)
      if (recent.length >= limit) {
        hits.set(key, recent)
        return false
      }
      recent.push(t)
      hits.set(key, recent)
      if (hits.size > 5000) hits.clear()
      return true
    },
  }
}

/**
 * The email for an enquiry. Built only from what the visitor sent, so the same
 * enquiry always produces the same body, byte for byte. No timestamp: the
 * email's own Date header says when it was sent, and a time in the body would
 * make a retry a different email (see idempotencyKey).
 */
export function buildEmail(values: EnquiryInput, config: { from: string; to: string }) {
  const role = ROLE_LABEL[values.role as EnquiryRole] ?? values.role
  const text = [
    'New enquiry from the website contact form.',
    '',
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Phone / WhatsApp: ${values.phone || 'not given'}`,
    `I am a: ${role}`,
    `Interested in: ${values.interest}`,
    '',
    'Message:',
    values.message,
    '',
    '—',
    'Reply to this email to answer the sender directly.',
  ].join('\n')

  return {
    from: config.from,
    to: [config.to],
    subject: oneLine(`Website enquiry — ${values.name} (${values.interest})`, 150),
    text,
    ...(replyAddress(values.email) ? { reply_to: replyAddress(values.email) } : {}),
  }
}

/**
 * Resend keeps an idempotency key for 24 hours and allows it one body: the
 * same key with the same body returns the original result without sending
 * again; the same key with a different body is refused (409
 * invalid_idempotent_request). So the key is the hash of the exact body sent.
 * A retried enquiry is one email, and two different emails can never share
 * a key.
 */
export function idempotencyKey(body: string): string {
  return createHash('sha256').update(body).digest('hex')
}

/** Resend's answer while another request with the same key is still running. */
const IN_PROGRESS = 'concurrent_idempotent_requests'
const RETRY_AFTER_MS = 1500
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function handleContact(request: Request, deps: ContactDeps): Promise<Response> {
  if (!sameOrigin(request)) return json(403, { ok: false, reason: 'forbidden' })
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return json(415, { ok: false, reason: 'invalid' })
  }

  const declared = Number(request.headers.get('content-length') ?? '0')
  if (declared > MAX_BODY) return json(413, { ok: false, reason: 'too_large' })
  const raw = await request.text()
  if (raw.length > MAX_BODY) return json(413, { ok: false, reason: 'too_large' })

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return json(400, { ok: false, reason: 'invalid' })
  }

  const { company, ...values } = toInput(parsed)
  // Honeypot: a field people never see. Answered like a success so a bot
  // learns nothing, and nothing is sent.
  if (company) return json(200, { ok: true })

  const fields = deps.validate(values)
  if (Object.keys(fields).length > 0) return json(400, { ok: false, reason: 'invalid', fields })

  if (!deps.limiter.allow(clientKey(request))) return json(429, { ok: false, reason: 'rate_limited' })

  const { apiKey, from, to } = deps.config
  if (!apiKey || !from || !to) return json(503, { ok: false, reason: 'unconfigured' })

  const body = JSON.stringify(buildEmail(values, { from, to }))
  const key = idempotencyKey(body)
  const send = async () => {
    const response = await deps.fetch(deps.config.apiUrl || RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body,
      signal: AbortSignal.timeout(10_000),
    })
    const result = (await response.json().catch(() => null)) as { id?: unknown; name?: unknown } | null
    return { response, result }
  }

  try {
    let { response, result } = await send()
    // The same enquiry is already being sent (a second tab, a double submit).
    // Resend says a later retry is safe and returns that request's result, so
    // ask once more with the same key and body rather than report a failure.
    if (response.status === 409 && result?.name === IN_PROGRESS) {
      await (deps.sleep ?? wait)(RETRY_AFTER_MS)
      ;({ response, result } = await send())
    }
    if (response.ok && typeof result?.id === 'string') return json(200, { ok: true })

    // Status and Resend's error name only: never the key, never the enquiry.
    console.error('[contact] provider refused the message', response.status, typeof result?.name === 'string' ? result.name : '')
    return json(502, { ok: false, reason: 'failed' })
  } catch (error) {
    console.error('[contact] provider unreachable', error instanceof Error ? error.name : 'error')
    return json(502, { ok: false, reason: 'failed' })
  }
}
