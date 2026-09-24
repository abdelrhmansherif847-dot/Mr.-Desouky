// Run with: npm test
//
// The rules that decide where a link may send someone and who may enter a
// portal. Pure functions, tested directly — no Supabase, no browser.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DESTINATIONS,
  LINK_TYPES,
  afterVerify,
  callbackUrl,
  loginFor,
  parseLinkType,
  recoveryUrl,
  resolveDestination,
} from '../src/lib/auth/destinations.ts'
import { portalDecision } from '../src/lib/auth/access.ts'
import {
  passwordProblem,
  phoneProblem,
  resetOutcome,
  signInOutcome,
  signUpOutcome,
} from '../src/lib/auth/errors.ts'

const HOSTILE = [
  '//evil.test',
  'https://evil.test',
  'http://evil.test/admin',
  '/\\evil.test',
  '\\\\evil.test',
  '/admin/../evil',
  '/admin?x=1',
  '/admin/',
  ' /admin',
  '/Admin',
  'javascript:alert(1)',
  '%2F%2Fevil.test',
  '/student#x',
  '/account/update-password',
  '/owner',
  '/assistant',
  '',
  null,
  undefined,
]

test('open redirect: every hostile next falls back to /admin', () => {
  for (const value of HOSTILE) {
    assert.equal(resolveDestination(value), '/admin', JSON.stringify(value))
  }
})

test('open redirect: the allowlist is exactly /admin, /student, /parent', () => {
  assert.deepEqual([...DESTINATIONS], ['/admin', '/student', '/parent'])
  for (const destination of DESTINATIONS) assert.equal(resolveDestination(destination), destination)
})

test('callback addresses carry an encoded next, and recovery adds its marker', () => {
  assert.equal(callbackUrl('https://x.test', '/student'), 'https://x.test/auth/callback?next=%2Fstudent')
  assert.equal(
    recoveryUrl('https://x.test', '/parent'),
    'https://x.test/auth/callback?next=%2Fparent&recovery=1',
  )
})

test('link types: only the four known types are redeemed; absent means magiclink', () => {
  assert.deepEqual([...LINK_TYPES], ['magiclink', 'signup', 'recovery', 'email_change'])
  for (const type of LINK_TYPES) assert.equal(parseLinkType(type), type)
  assert.equal(parseLinkType(null), 'magiclink')
  assert.equal(parseLinkType(undefined), 'magiclink')
  assert.equal(parseLinkType(''), 'magiclink')
  for (const bad of ['invite', 'email', 'phone_change', 'sms', 'MAGICLINK', 'recovery ', 'signup,recovery']) {
    assert.equal(parseLinkType(bad), null, bad)
  }
})

test('after a link: recovery goes to set a password, everything else to the allowlisted destination', () => {
  assert.equal(afterVerify('magiclink', '/student', false), '/student')
  assert.equal(afterVerify('signup', '/parent', false), '/parent')
  assert.equal(afterVerify('email_change', '//evil.test', false), '/admin')
  assert.equal(afterVerify('code', '/parent', false), '/parent')
  assert.equal(afterVerify('recovery', '/parent', false), '/account/update-password?next=%2Fparent')
  assert.equal(afterVerify('code', '/student', true), '/account/update-password?next=%2Fstudent')
  // The destination carried through a reset is allowlisted too.
  assert.equal(afterVerify('recovery', 'https://evil.test', false), '/account/update-password?next=%2Fadmin')
})

test('retry links go to the matching sign-in screen', () => {
  assert.equal(loginFor('/admin'), '/admin/login')
  assert.equal(loginFor('/student'), '/login/student')
  assert.equal(loginFor('/parent'), '/login/parent')
})

test('portal access: the full matrix', () => {
  const p = (role: string, status: string) => ({ role, status })
  const cases: [Parameters<typeof portalDecision>[0], 'student' | 'parent', string][] = [
    [null, 'student', '/login/student'],
    [null, 'parent', '/login/parent'],
    [p('student', 'approved'), 'student', 'allow'],
    [p('parent', 'approved'), 'parent', 'allow'],
    [p('student', 'approved'), 'parent', '/student'],
    [p('parent', 'approved'), 'student', '/parent'],
    [p('student', 'pending'), 'student', '/account/pending'],
    [p('parent', 'pending'), 'parent', '/account/pending'],
    [p('student', 'suspended'), 'student', '/account/suspended'],
    [p('parent', 'suspended'), 'student', '/account/suspended'],
    [p('owner', 'approved'), 'student', '/admin'],
    [p('owner', 'approved'), 'parent', '/admin'],
    // Suspension and approval are checked before role, for everyone.
    [p('owner', 'pending'), 'student', '/account/pending'],
    [p('owner', 'suspended'), 'parent', '/account/suspended'],
    [p('assistant', 'approved'), 'student', '/login/student'],
    [p('assistant', 'approved'), 'parent', '/login/parent'],
    [p('student', 'unknown'), 'student', '/account/pending'],
    [{ role: null, status: null }, 'student', '/account/pending'],
    [p('superuser', 'approved'), 'student', '/login/student'],
  ]
  for (const [profile, portal, expected] of cases) {
    assert.equal(portalDecision(profile, portal), expected, `${JSON.stringify(profile)} @ ${portal}`)
  }
})

test('non-disclosure: sign-in says the same thing for unknown address and wrong password', () => {
  const unknown = signInOutcome({ status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' })
  const wrong = signInOutcome({ status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' })
  assert.deepEqual(unknown, wrong)
  assert.equal(unknown.ok, false)
  assert.deepEqual(signInOutcome(null), { ok: true })
})

test('non-disclosure: sign-up for an existing address looks like success', () => {
  assert.deepEqual(signUpOutcome(null), { ok: true })
  assert.deepEqual(signUpOutcome({ status: 422, code: 'user_already_exists', message: 'User already registered' }), { ok: true })
  const closed = signUpOutcome({ status: 500, code: 'unexpected_failure', message: 'Database error saving new user' })
  assert.equal(closed.ok, false)
  assert.match(closed.ok ? '' : closed.message, /not open yet/)
  assert.equal(signUpOutcome({ status: 422, code: 'signup_disabled', message: 'Signups not allowed' }).ok, false)
})

test('non-disclosure: a reset request always looks sent, including the per-account rate limit', () => {
  for (const error of [
    null,
    { status: 400, message: 'x' },
    { status: 422, message: 'x' },
    { status: 429, code: 'over_email_send_rate_limit', message: 'For security purposes…' },
  ]) {
    assert.deepEqual(resetOutcome(error), { ok: true })
  }
  assert.equal(resetOutcome({ status: 500, message: 'x' }).ok, false)
})

test('field checks', () => {
  assert.equal(passwordProblem('short', 'short') !== null, true)
  assert.equal(passwordProblem('long enough', 'different!!'), 'The two passwords do not match.')
  assert.equal(passwordProblem('x'.repeat(73), 'x'.repeat(73)) !== null, true)
  assert.equal(passwordProblem('correct horse', 'correct horse'), null)
  assert.equal(phoneProblem('+20 100 000 0000'), null)
  assert.equal(phoneProblem('(010) 000-0000'), null)
  assert.notEqual(phoneProblem(''), null)
  assert.notEqual(phoneProblem('call me'), null)
  assert.notEqual(phoneProblem('123'), null)
  assert.notEqual(phoneProblem('1'.repeat(40)), null)
})
