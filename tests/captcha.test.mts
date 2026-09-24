// Run with: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { captchaProblem, signUpCaptchaProblem } from '../src/lib/auth/captcha.ts'
import {
  CAPTCHA_FAILED,
  isCaptchaFailure,
  magicLinkOutcome,
  resetOutcome,
  signInOutcome,
  signUpOutcome,
} from '../src/lib/auth/errors.ts'

// What Supabase Auth returns when a CAPTCHA token is missing or rejected.
const CAPTCHA_400 = { status: 400, code: 'captcha_failed', message: 'captcha protection: request disallowed (invalid-input-response)' }
const CAPTCHA_400_NO_CODE = { status: 400, message: 'captcha protection: request disallowed (timeout-or-duplicate)' }

test('registration is never sent without a CAPTCHA result', () => {
  assert.match(signUpCaptchaProblem(false, null) ?? '', /not open yet/)
  // Even a token is not enough if no site key is configured: nothing to verify it against.
  assert.match(signUpCaptchaProblem(false, 'token') ?? '', /not open yet/)
  assert.match(signUpCaptchaProblem(true, null) ?? '', /security check/)
  assert.match(signUpCaptchaProblem(true, '') ?? '', /security check/)
  assert.equal(signUpCaptchaProblem(true, 'token'), null)
})

test('sign-in and reset only require a token once the widget is configured', () => {
  assert.equal(captchaProblem(false, null), null)
  assert.match(captchaProblem(true, null) ?? '', /security check/)
  assert.equal(captchaProblem(true, 'token'), null)
})

test('captcha failures are recognised by code or message', () => {
  assert.equal(isCaptchaFailure(CAPTCHA_400), true)
  assert.equal(isCaptchaFailure(CAPTCHA_400_NO_CODE), true)
  assert.equal(isCaptchaFailure({ status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' }), false)
  assert.equal(isCaptchaFailure(null), false)
})

test('a refused CAPTCHA has one generic message everywhere, and never reads as success', () => {
  for (const error of [CAPTCHA_400, CAPTCHA_400_NO_CODE]) {
    assert.deepEqual(signUpOutcome(error), { ok: false, message: CAPTCHA_FAILED })
    assert.deepEqual(signInOutcome(error), { ok: false, message: CAPTCHA_FAILED })
    // These two treat a plain 400 as "sent"; a CAPTCHA 400 must not.
    assert.deepEqual(resetOutcome(error), { ok: false, message: CAPTCHA_FAILED })
    assert.deepEqual(magicLinkOutcome(error), { ok: false, message: CAPTCHA_FAILED })
  }
  // The message mentions neither an address nor an account.
  assert.doesNotMatch(CAPTCHA_FAILED, /email|account|exist|registered|user/i)
})

test('the existing non-disclosure answers are unchanged', () => {
  assert.deepEqual(signUpOutcome({ status: 422, code: 'user_already_exists', message: 'User already registered' }), { ok: true })
  assert.deepEqual(resetOutcome({ status: 400, message: 'x' }), { ok: true })
  assert.equal(magicLinkOutcome({ status: 400, message: 'x' }), 'sent')
  assert.equal(magicLinkOutcome(null), 'sent')
})
