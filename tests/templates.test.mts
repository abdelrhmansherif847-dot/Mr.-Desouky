// Run with: npm test
//
// Renders each email template the way Supabase does — Go's html/template,
// which HTML-escapes values inside an attribute — then reads the href back
// the way a browser would and checks what the callback receives.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  afterVerify,
  callbackUrl,
  parseLinkType,
  recoveryUrl,
  resolveDestination,
  type Destination,
} from '../src/lib/auth/destinations.ts'

const TEMPLATES = {
  signup: readFileSync(new URL('../supabase/templates/confirm-signup.html', import.meta.url), 'utf8'),
  recovery: readFileSync(new URL('../supabase/templates/reset-password.html', import.meta.url), 'utf8'),
}

const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&#34;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const unescapeAttr = (value: string) =>
  value.replace(/&#34;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

function render(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*\.(\w+)\s*\}\}/g, (_, name) => escapeAttr(vars[name] ?? ''))
}
function hrefs(html: string) {
  return [...html.matchAll(/href="([^"]*)"/g)].map((m) => unescapeAttr(m[1]))
}

const HASH = '6f1ed002ab5595859014ebf0951522d9f6b5d0d5b6f0aa6b3d9d1a2f'

test('templates use only the variables the link needs, and never ConfirmationURL', () => {
  for (const [name, body] of Object.entries(TEMPLATES)) {
    const vars = [...body.matchAll(/\{\{\s*\.(\w+)\s*\}\}/g)].map((m) => m[1])
    assert.deepEqual([...new Set(vars)].sort(), ['RedirectTo', 'TokenHash'], name)
    assert.doesNotMatch(body, /ConfirmationURL|\.Token\b|SiteURL/, name)
  }
})

test('each template has exactly one link, with its own fixed type', () => {
  assert.match(TEMPLATES.signup, /href="\{\{ \.RedirectTo \}\}&token_hash=\{\{ \.TokenHash \}\}&type=signup"/)
  assert.match(TEMPLATES.recovery, /href="\{\{ \.RedirectTo \}\}&token_hash=\{\{ \.TokenHash \}\}&type=recovery"/)
  for (const body of Object.values(TEMPLATES)) assert.equal(hrefs(body).length, 1)
})

for (const origin of [
  'https://www.mrdesouky.com',
  'https://mr-desouky-git-claude-auth-accounts-abdelrhman-s-800.vercel.app',
]) {
  for (const destination of ['/student', '/parent'] as Destination[]) {
    test(`confirm-signup from ${new URL(origin).host} for ${destination}`, () => {
      const [href] = hrefs(render(TEMPLATES.signup, { RedirectTo: callbackUrl(origin, destination), TokenHash: HASH }))
      const url = new URL(href)
      assert.equal(url.origin, origin)
      assert.equal(url.pathname, '/auth/callback')
      assert.equal(url.searchParams.get('next'), destination)
      assert.equal(url.searchParams.get('token_hash'), HASH)
      assert.equal(parseLinkType(url.searchParams.get('type')), 'signup')
      assert.equal(afterVerify('signup', url.searchParams.get('next'), url.searchParams.get('recovery') === '1'), destination)
    })

    test(`reset-password from ${new URL(origin).host} for ${destination}`, () => {
      const [href] = hrefs(render(TEMPLATES.recovery, { RedirectTo: recoveryUrl(origin, destination), TokenHash: HASH }))
      const url = new URL(href)
      assert.equal(url.origin, origin)
      assert.equal(url.pathname, '/auth/callback')
      assert.equal(url.searchParams.get('next'), destination)
      assert.equal(url.searchParams.get('recovery'), '1')
      assert.equal(url.searchParams.get('token_hash'), HASH)
      assert.equal(parseLinkType(url.searchParams.get('type')), 'recovery')
      assert.equal(
        afterVerify('recovery', url.searchParams.get('next'), true),
        `/account/update-password?next=${encodeURIComponent(destination)}`,
      )
    })
  }
}

test('the live Magic Link template shape still produces a valid owner link', () => {
  // The Magic Link template is not in this repo and is not changed; this is
  // its link as it is live, checked against the same rules.
  const magic = '<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=magiclink">Sign in</a>'
  const [href] = hrefs(render(magic, { RedirectTo: callbackUrl('https://www.mrdesouky.com', '/admin'), TokenHash: HASH }))
  const url = new URL(href)
  assert.equal(parseLinkType(url.searchParams.get('type')), 'magiclink')
  assert.equal(resolveDestination(url.searchParams.get('next')), '/admin')
})

test('a hostile next inside a real template link still resolves to an allowlisted place', () => {
  const [href] = hrefs(render(TEMPLATES.signup, {
    RedirectTo: 'https://www.mrdesouky.com/auth/callback?next=https%3A%2F%2Fevil.test',
    TokenHash: HASH,
  }))
  const url = new URL(href)
  assert.equal(afterVerify('signup', url.searchParams.get('next'), false), '/admin')
})

test('the recovery marker cannot redirect a typed link, only a bare code', () => {
  assert.equal(afterVerify('signup', '/student', true), '/student')
  assert.equal(afterVerify('magiclink', '/admin', true), '/admin')
  assert.equal(afterVerify('email_change', '/parent', true), '/parent')
  assert.equal(afterVerify('code', '/parent', true), '/account/update-password?next=%2Fparent')
  assert.equal(afterVerify('code', '/parent', false), '/parent')
})

test('if Supabase ever falls back to the bare Site URL, the link is dead, not a working callback', () => {
  // Documented failure mode (supabase/templates/README.md): no allowlisted
  // redirect means RedirectTo is the bare Site URL. The `&` then lands in
  // the host name, which does not resolve — the link goes nowhere rather
  // than to a callback on any real host.
  const [href] = hrefs(render(TEMPLATES.signup, { RedirectTo: 'https://www.mrdesouky.com', TokenHash: HASH }))
  const url = new URL(href)
  assert.notEqual(url.hostname, 'www.mrdesouky.com')
  assert.match(url.hostname, /&token_hash=/)
  assert.notEqual(url.pathname, '/auth/callback')
})
