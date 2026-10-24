// Run with: npm test
//
// The contact details, the /api/contact handler and the form's reading of its
// answers. The handler runs with a stand-in for Resend's HTTP API: nothing is
// sent anywhere, and no key is real.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { CONTACT, whatsappLink } from '../src/content/site.ts'
import { validateEnquiry } from '../src/lib/contact/validate.ts'
import {
  MAX_BODY,
  buildEmail,
  createRateLimiter,
  handleContact,
  oneLine,
  replyAddress,
  type ContactConfig,
} from '../src/lib/contact/server.ts'

/* ------------------------------ details ------------------------------ */

test('contact details are the confirmed ones', () => {
  assert.equal(CONTACT.email, 'mrdesouky8@gmail.com')
  assert.equal(CONTACT.whatsapp, '201032365569')
  assert.equal(CONTACT.whatsappDisplay, '+20 10 3236 5569')
  assert.ok(whatsappLink().startsWith('https://wa.me/201032365569?text='))
  const prefilled = new URL(whatsappLink('Line one\nName: Test & Co'))
  assert.equal(prefilled.origin + prefilled.pathname, 'https://wa.me/201032365569')
  assert.equal(prefilled.searchParams.get('text'), 'Line one\nName: Test & Co')
})

test('no placeholder email or phone number is left in the site source', () => {
  const files: string[] = []
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) walk(path)
      else if (/\.(tsx?|mdx?|json|html)$/.test(name)) files.push(path)
    }
  }
  walk(new URL('../src', import.meta.url).pathname)
  walk(new URL('../public', import.meta.url).pathname)
  const hits = files.filter((f) => /info@desoukymath\.com|201000000000|\+20 100 000 0000/.test(readFileSync(f, 'utf8')))
  assert.deepEqual(hits, [])
})

/* ------------------------------ handler ------------------------------ */

const SITE = 'https://www.mrdesouky.com'
const KEY = 're_test_not_a_real_key'
const CONFIG: ContactConfig = { apiKey: KEY, from: 'Mr. Desouky Website <website@mrdesouky.com>', to: 'mrdesouky8@gmail.com' }
const GOOD = {
  name: 'Sara Ali',
  email: 'parent@example.test',
  phone: '+20 10 0000 0000',
  role: 'parent',
  interest: 'SAT Math — Basic',
  message: 'Hello, my daughter sits the SAT in March.',
}

type Call = { url: string; init: RequestInit }

function provider(respond: () => Response | Promise<Response>) {
  const calls: Call[] = []
  const fetchStub = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} })
    return respond()
  }) as typeof fetch
  return { calls, fetch: fetchStub }
}

const accepted = () => new Response(JSON.stringify({ id: 'email_123' }), { status: 200 })

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${SITE}/api/contact/`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: SITE, 'x-forwarded-for': '203.0.113.7', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

function deps(p: ReturnType<typeof provider>, config: ContactConfig = CONFIG, limiter = createRateLimiter(100, 60_000)) {
  return { config, validate: validateEnquiry, fetch: p.fetch, limiter, sleep: async () => {} }
}

async function read(response: Response) {
  return { status: response.status, body: await response.json() }
}

test('accepted by the provider: success, sent to the fixed address with the visitor as Reply-To', async () => {
  const p = provider(accepted)
  const r = await read(await handleContact(post({ ...GOOD, to: 'attacker@evil.test', bcc: 'x@evil.test', from: 'x@evil.test' }), deps(p)))
  assert.deepEqual(r, { status: 200, body: { ok: true } })
  assert.equal(p.calls.length, 1)
  const { url, init } = p.calls[0]
  assert.equal(url, 'https://api.resend.com/emails')
  const headers = init.headers as Record<string, string>
  assert.equal(headers.Authorization, `Bearer ${KEY}`)
  assert.equal(headers['Idempotency-Key'], createHash('sha256').update(String(init.body)).digest('hex'))
  const sent = JSON.parse(String(init.body))
  assert.deepEqual(sent.to, ['mrdesouky8@gmail.com'])
  assert.equal(sent.from, CONFIG.from)
  assert.equal(sent.reply_to, 'parent@example.test')
  assert.equal(sent.bcc, undefined)
  assert.equal(sent.subject, 'Website enquiry — Sara Ali (SAT Math — Basic)')
  assert.match(sent.text, /Name: Sara Ali/)
  assert.match(sent.text, /Phone \/ WhatsApp: \+20 10 0000 0000/)
  assert.match(sent.text, /I am a: Parent/)
  assert.match(sent.text, /my daughter sits the SAT in March/)
})

test('success only with an id from the provider; every refusal is reported as not sent', async () => {
  for (const respond of [
    () => new Response(JSON.stringify({ name: 'validation_error' }), { status: 422 }),
    () => new Response(JSON.stringify({ name: 'internal_server_error' }), { status: 500 }),
    () => new Response('not json', { status: 200 }),
    () => new Response(JSON.stringify({}), { status: 200 }),
    () => Promise.reject(new Error('network down')),
  ]) {
    const r = await read(await handleContact(post(GOOD), deps(provider(respond))))
    assert.deepEqual(r, { status: 502, body: { ok: false, reason: 'failed' } })
  }
})

test('without a key or sender: unconfigured, and nothing is attempted', async () => {
  for (const config of [{ ...CONFIG, apiKey: undefined }, { ...CONFIG, from: undefined }, { ...CONFIG, apiKey: '' }]) {
    const p = provider(accepted)
    const r = await read(await handleContact(post(GOOD), deps(p, config)))
    assert.deepEqual(r, { status: 503, body: { ok: false, reason: 'unconfigured' } })
    assert.equal(p.calls.length, 0)
  }
})

test('only this site\'s own pages may post', async () => {
  for (const headers of [{ origin: 'https://evil.test' }, { origin: 'null' }, { origin: '' }]) {
    const p = provider(accepted)
    const r = await read(await handleContact(post(GOOD, headers), deps(p)))
    assert.deepEqual(r, { status: 403, body: { ok: false, reason: 'forbidden' } })
    assert.equal(p.calls.length, 0)
  }
})

test('malformed, oversized or non-JSON requests send nothing', async () => {
  const cases: [Request, number][] = [
    [post(GOOD, { 'content-type': 'text/plain' }), 415],
    [post('{not json'), 400],
    [post({ ...GOOD, message: 'x'.repeat(MAX_BODY) }), 413],
  ]
  for (const [request, status] of cases) {
    const p = provider(accepted)
    assert.equal((await handleContact(request, deps(p))).status, status)
    assert.equal(p.calls.length, 0)
  }
})

test('the form\'s own rules are enforced again on the server, field by field', async () => {
  const p = provider(accepted)
  const r = await read(await handleContact(post({ ...GOOD, email: 'not-an-address', message: '', role: 'owner' }), deps(p)))
  assert.equal(r.status, 400)
  assert.equal(r.body.reason, 'invalid')
  assert.deepEqual(Object.keys(r.body.fields).sort(), ['email', 'message', 'role'])
  assert.equal(p.calls.length, 0)
})

test('the honeypot is answered like a success and sends nothing', async () => {
  const p = provider(accepted)
  const r = await read(await handleContact(post({ ...GOOD, company: 'Bots Inc' }), deps(p)))
  assert.deepEqual(r, { status: 200, body: { ok: true } })
  assert.equal(p.calls.length, 0)
})

test('a burst from one address is limited; another address is not', async () => {
  const p = provider(accepted)
  const d = deps(p, CONFIG, createRateLimiter(5, 10 * 60_000))
  const statuses = []
  for (let i = 0; i < 6; i++) statuses.push((await handleContact(post({ ...GOOD, message: `try ${i}` }), d)).status)
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429])
  assert.equal((await handleContact(post(GOOD, { 'x-forwarded-for': '198.51.100.9' }), d)).status, 200)
  assert.equal(p.calls.length, 6)
})

test('the limiter forgets after its window', () => {
  let t = 0
  const limiter = createRateLimiter(1, 1000, () => t)
  assert.equal(limiter.allow('a'), true)
  assert.equal(limiter.allow('a'), false)
  t = 1001
  assert.equal(limiter.allow('a'), true)
})

test('subjects are one line; Reply-To is only ever a single plain address', () => {
  assert.equal(oneLine('Sara\r\nBcc: x@evil.test', 150), 'Sara Bcc: x@evil.test')
  assert.equal(replyAddress('a@example.test'), 'a@example.test')
  for (const bad of ['a@example.test, b@evil.test', 'Name <a@example.test>', 'a@example.test\nBcc: x', 'a;b@example.test']) {
    assert.equal(replyAddress(bad), undefined, bad)
  }
  const email = buildEmail({ ...GOOD, email: 'a@x.test, b@evil.test' }, CONFIG as { from: string; to: string })
  assert.equal('reply_to' in email, false)
  assert.deepEqual(email.to, ['mrdesouky8@gmail.com'])
})

test('failures are logged without the key or the enquiry', async () => {
  const lines: string[] = []
  const original = console.error
  console.error = (...args: unknown[]) => void lines.push(args.map(String).join(' '))
  try {
    await handleContact(post(GOOD), deps(provider(() => new Response(JSON.stringify({ name: 'restricted_api_key' }), { status: 403 }))))
  } finally {
    console.error = original
  }
  assert.equal(lines.length, 1)
  assert.match(lines[0], /403 restricted_api_key/)
  for (const secret of [KEY, GOOD.email, GOOD.message, GOOD.name]) assert.ok(!lines[0].includes(secret), secret)
})

/* ------------------------------ idempotency ------------------------------ */

/**
 * Resend's documented rules for Idempotency-Key, enforced: a key is kept for
 * 24 hours with one body; the same key and body return the original response
 * and send nothing; the same key with a different body is a 409
 * invalid_idempotent_request. `busy` keys answer 409
 * concurrent_idempotent_requests once, as while another request is running.
 */
function resendLike(busy: Set<string> = new Set()) {
  const kept = new Map<string, { body: string; id: string }>()
  const calls: { key: string; body: string }[] = []
  let sent = 0
  const answer = (status: number, body: unknown) => new Response(JSON.stringify(body), { status })
  const fetchStub = (async (_url: string | URL | Request, init?: RequestInit) => {
    const key = (init?.headers as Record<string, string>)['Idempotency-Key']
    const body = String(init?.body)
    calls.push({ key, body })
    if (busy.delete(key)) return answer(409, { name: 'concurrent_idempotent_requests' })
    const earlier = kept.get(key)
    if (earlier) return earlier.body === body ? answer(200, { id: earlier.id }) : answer(409, { name: 'invalid_idempotent_request' })
    const id = `email_${++sent}`
    kept.set(key, { body, id })
    return answer(200, { id })
  }) as typeof fetch
  return { fetch: fetchStub, calls, sent: () => sent }
}

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')

test('the stand-in enforces Resend\'s rule: one key, one body', async () => {
  const r = resendLike()
  const send = (key: string, body: string) => r.fetch('x', { method: 'POST', headers: { 'Idempotency-Key': key }, body })
  assert.equal((await send('k', 'a')).status, 200)
  assert.equal((await send('k', 'a')).status, 200)
  assert.equal((await send('k', 'b')).status, 409)
  assert.equal(r.sent(), 1)
})

test('a retried enquiry is one email, and every attempt is told it was sent', async () => {
  const r = resendLike()
  const d = { ...deps(provider(accepted)), fetch: r.fetch }
  const answers = []
  for (let attempt = 0; attempt < 3; attempt++) answers.push(await read(await handleContact(post(GOOD), d)))
  assert.deepEqual(answers.map((a) => a.status), [200, 200, 200])
  assert.equal(r.sent(), 1)
  assert.equal(new Set(r.calls.map((c) => c.key)).size, 1)
  assert.equal(new Set(r.calls.map((c) => c.body)).size, 1)
})

test('the same enquiry later builds the same body, so a retry can never be refused as a mismatch', async () => {
  // The defect this replaces: the key was fixed for a day while the body
  // carried the minute, so a retry a minute later reused the key with a
  // different body and Resend answered 409. The body now holds nothing that
  // depends on when it is built.
  const first = JSON.stringify(buildEmail(GOOD, CONFIG as { from: string; to: string }))
  await new Promise((resolve) => setTimeout(resolve, 1100))
  const later = JSON.stringify(buildEmail(GOOD, CONFIG as { from: string; to: string }))
  assert.equal(later, first)
  assert.doesNotMatch(JSON.parse(first).text, /\d{2}:\d{2}|Sent:/)
})

test('different enquiries never share a key, so none is refused and each is sent', async () => {
  const r = resendLike()
  const d = { ...deps(provider(accepted)), fetch: r.fetch }
  const variants = [
    GOOD,
    { ...GOOD, message: `${GOOD.message} Also, evenings only.` },
    { ...GOOD, name: 'Sara A. Ali' },
    { ...GOOD, email: 'other.parent@example.test' },
    { ...GOOD, interest: 'EST Math — Advanced' },
    { ...GOOD, phone: '' },
    { ...GOOD, role: 'student' },
  ]
  for (const v of variants) assert.equal((await handleContact(post(v), d)).status, 200)
  assert.equal(r.sent(), variants.length)
  assert.equal(new Set(r.calls.map((c) => c.key)).size, variants.length)
  // The key is the hash of the exact body sent: two bodies cannot share one.
  for (const c of r.calls) assert.equal(c.key, sha256(c.body))
})

test('while the same enquiry is still being sent: wait, ask once more with the same key and body', async () => {
  const body = JSON.stringify(buildEmail(GOOD, CONFIG as { from: string; to: string }))
  const r = resendLike(new Set([sha256(body)]))
  const waits: number[] = []
  const d = { ...deps(provider(accepted)), fetch: r.fetch, sleep: async (ms: number) => void waits.push(ms) }
  const answer = await read(await handleContact(post(GOOD), d))
  assert.deepEqual(answer, { status: 200, body: { ok: true } })
  assert.equal(r.calls.length, 2)
  assert.equal(r.calls[0].key, r.calls[1].key)
  assert.equal(r.calls[0].body, r.calls[1].body)
  assert.equal(waits.length, 1)
  assert.equal(r.sent(), 1)
})

test('still in progress after the one retry, or any other refusal: reported as not sent', async () => {
  const busy = () => new Response(JSON.stringify({ name: 'concurrent_idempotent_requests' }), { status: 409 })
  const p = provider(busy)
  assert.deepEqual(await read(await handleContact(post(GOOD), deps(p))), { status: 502, body: { ok: false, reason: 'failed' } })
  assert.equal(p.calls.length, 2)
  const mismatch = provider(() => new Response(JSON.stringify({ name: 'invalid_idempotent_request' }), { status: 409 }))
  assert.equal((await handleContact(post(GOOD), deps(mismatch))).status, 502)
  assert.equal(mismatch.calls.length, 1, 'a mismatch is not retried')
})

/* ------------------------------ the form's side ------------------------------ */

test('the form reads every answer from /api/contact correctly', async () => {
  const answers: [number, unknown, string][] = [
    [200, { ok: true }, 'ok'],
    [503, { ok: false, reason: 'unconfigured' }, 'unconfigured'],
    [429, { ok: false, reason: 'rate_limited' }, 'rate_limited'],
    [400, { ok: false, reason: 'invalid', fields: { email: 'Please check the email address.' } }, 'invalid'],
    [502, { ok: false, reason: 'failed' }, 'failed'],
    [403, { ok: false, reason: 'forbidden' }, 'failed'],
    [500, 'not json', 'failed'],
    // A 200 that does not say ok is not a success.
    [200, {}, 'failed'],
  ]
  const original = globalThis.fetch
  const seen: string[] = []
  try {
    const { deliverEnquiry } = await import('../src/lib/contact/submit.ts')
    const enquiry = { ...GOOD, role: 'parent' as const, submittedAt: '2026-10-24T09:30:00Z' }
    for (const [status, body, expected] of answers) {
      globalThis.fetch = (async (url: string | URL | Request) => {
        seen.push(String(url))
        return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status })
      }) as typeof fetch
      const result = await deliverEnquiry(enquiry)
      assert.equal(result.ok ? 'ok' : result.reason, expected, `${status} ${JSON.stringify(body)}`)
    }
    globalThis.fetch = (async () => {
      throw new Error('offline')
    }) as typeof fetch
    assert.deepEqual(await deliverEnquiry(enquiry), { ok: false, reason: 'failed' })
  } finally {
    globalThis.fetch = original
  }
  assert.ok(seen.every((u) => u === '/api/contact/'), 'posts to the site\'s own route')
})
