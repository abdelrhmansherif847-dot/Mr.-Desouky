// Run with: npm test
//
// The Supabase Redirect URLs entry a Preview needs, checked against every
// address this app asks an email to come back to. Supabase honours a
// requested redirect only on the Site URL's host or when it matches an entry
// on that list; otherwise it substitutes the bare Site URL and the emailed
// link is dead (tests/templates.test.mts shows exactly how).
//
// `glob` follows Supabase's documented rules (docs: Auth → Redirect URLs):
// `*` and `?` stop at the separators `.` and `/`, `**` matches anything. It
// is a model of those rules for checking entries, not Supabase's own code.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DESTINATIONS, callbackUrl, recoveryUrl } from '../src/lib/auth/destinations.ts'

function glob(pattern: string): RegExp {
  let source = ''
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i]
    if (c === '*' && pattern[i + 1] === '*') {
      source += '.*'
      i++
    } else if (c === '*') source += '[^./]*'
    else if (c === '?') source += '[^./]'
    else source += c.replace(/[.+^${}()|[\]\\/]/g, '\\$&')
  }
  return new RegExp(`^${source}$`)
}

const allowed = (entry: string, url: string) => glob(entry).test(url)

const PREVIEW = 'https://mr-desouky-git-claude-portal-product-abdelrhman-s-800.vercel.app'
const ENTRY = `${PREVIEW}/**`
const everyRedirect = (origin: string) =>
  DESTINATIONS.flatMap((d) => [callbackUrl(origin, d), recoveryUrl(origin, d)])

test('the matcher follows the documented examples', () => {
  assert.ok(allowed('http://localhost:3000/*', 'http://localhost:3000/foo'))
  assert.ok(!allowed('http://localhost:3000/*', 'http://localhost:3000/foo/bar'))
  assert.ok(!allowed('http://localhost:3000/*', 'http://localhost:3000/foo/'))
  assert.ok(allowed('http://localhost:3000/**', 'http://localhost:3000/foo/bar'))
  assert.ok(allowed('http://localhost:3000/?', 'http://localhost:3000/a'))
  assert.ok(!allowed('http://localhost:3000/?', 'http://localhost:3000/foo'))
})

test('the Preview entry admits every link the app sends from that Preview', () => {
  const redirects = everyRedirect(PREVIEW)
  assert.equal(redirects.length, 6)
  for (const url of redirects) assert.ok(allowed(ENTRY, url), url)
})

test('the Preview entry admits nothing on any other host', () => {
  for (const url of [
    // Another Vercel name anyone could claim, ending in the team's suffix.
    'https://evil-abdelrhman-s-800.vercel.app/auth/callback?next=%2Fadmin',
    // The Preview host as a prefix of someone else's domain.
    `${PREVIEW}.evil.test/auth/callback?next=%2Fadmin`,
    `${PREVIEW.replace('https:', 'http:')}/auth/callback?next=%2Fadmin`,
    // This deployment's own unique address: a different host from the
    // branch address, so sign in on the branch address.
    'https://mr-desouky-b7p0t352d-abdelrhman-s-800.vercel.app/auth/callback?next=%2Fadmin',
    'https://www.mrdesouky.com.evil.test/auth/callback?next=%2Fadmin',
  ]) {
    assert.ok(!allowed(ENTRY, url), url)
  }
})

test('under the documented rules, an exact /auth/callback entry misses the links the app sends', () => {
  // Every redirect carries ?next=, so an entry without a wildcard does not
  // match it as written; `/**` matches whether or not the query is compared.
  for (const url of everyRedirect(PREVIEW)) assert.ok(!allowed(`${PREVIEW}/auth/callback`, url), url)
})

test('why not the team-wide wildcard: it also admits a look-alike host', () => {
  const teamWide = 'https://*-abdelrhman-s-800.vercel.app/**'
  assert.ok(allowed(teamWide, `${PREVIEW}/auth/callback?next=%2Fadmin`))
  assert.ok(allowed(teamWide, 'https://evil-abdelrhman-s-800.vercel.app/auth/callback?next=%2Fadmin'))
})
