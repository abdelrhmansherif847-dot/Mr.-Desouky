// Run with: npm test
//
// Which input an error belongs to. The forms mark an input invalid (red
// border, aria-invalid) only when fieldInvalid(error, field) is true, so these
// are the rules the screens follow.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CAPTCHA_PROMPT,
  answeredByToken,
  captchaError,
  signUpCaptchaError,
} from '../src/lib/auth/captcha.ts'
import {
  CAPTCHA_FAILED,
  LIMITS,
  captchaInvalid,
  fieldInvalid,
  looksLikeEmail,
  newPasswordProblem,
  passwordProblem,
  phoneProblem,
  resetFailure,
  signInFailure,
  signUpFailure,
  signUpFieldProblem,
  updatePasswordFailure,
  type FieldName,
  type FormError,
} from '../src/lib/auth/errors.ts'

const FIELDS: FieldName[] = ['name', 'phone', 'email', 'password', 'confirmPassword']

/** The fields an error marks invalid. */
const marked = (error: FormError | null) => FIELDS.filter((field) => fieldInvalid(error, field))

const VALID = {
  fullName: 'Test Student',
  phone: '+20 100 000 0000',
  email: 'student@example.com',
  password: 'a good password',
  confirm: 'a good password',
}

/** Sign-up as the form runs it: its own fields first, then the security check. */
const signUp = (values: typeof VALID, configured: boolean, token: string | null) =>
  signUpFieldProblem(values) ?? signUpCaptchaError(configured, token)

const CAPTCHA_400 = { status: 400, code: 'captcha_failed', message: 'captcha protection: request disallowed (invalid-input-response)' }
const CAPTCHA_400_NO_CODE = { status: 400, message: 'captcha protection: request disallowed (timeout-or-duplicate)' }

test('a missing CAPTCHA with every field valid marks no input — not even the passwords', () => {
  const error = signUp(VALID, true, null)
  assert.deepEqual(error, { owner: 'captcha', message: CAPTCHA_PROMPT })
  assert.equal(error?.message, 'Please complete the security check.')
  assert.deepEqual(marked(error), [])
  assert.equal(fieldInvalid(error, 'password'), false)
  assert.equal(fieldInvalid(error, 'confirmPassword'), false)
  assert.equal(captchaInvalid(error), true)
})

test('every CAPTCHA error, on every form, marks no input at all', () => {
  const errors: (FormError | null)[] = [
    signUp(VALID, true, null),
    signUp(VALID, true, ''),
    captchaError(true, null), // sign-in, magic link, reset
    signUpFailure(CAPTCHA_400),
    signUpFailure(CAPTCHA_400_NO_CODE),
    signInFailure(CAPTCHA_400),
    signInFailure(CAPTCHA_400_NO_CODE),
    resetFailure(CAPTCHA_400),
    resetFailure(CAPTCHA_400_NO_CODE),
  ]
  for (const error of errors) {
    assert.ok(error, 'an error is reported')
    assert.equal(error.owner, 'captcha', error.message)
    assert.deepEqual(marked(error), [], error.message)
    assert.equal(captchaInvalid(error), true)
  }
  // The refusal keeps its one generic message.
  assert.equal(signUpFailure(CAPTCHA_400)?.message, CAPTCHA_FAILED)
  assert.equal(signInFailure(CAPTCHA_400)?.message, CAPTCHA_FAILED)
  assert.equal(resetFailure(CAPTCHA_400)?.message, CAPTCHA_FAILED)
})

test('no site key: registration stays closed, and that is the form’s error, not an input’s', () => {
  const error = signUp(VALID, false, null)
  assert.equal(error?.owner, 'form')
  assert.match(error?.message ?? '', /not open yet/)
  assert.deepEqual(marked(error), [])
  assert.equal(captchaInvalid(error), false)
  // Sign-in and reset still need nothing without a key.
  assert.equal(captchaError(false, null), null)
})

test('a token passes the check; the prompt is the only thing a new token clears', () => {
  assert.equal(signUp(VALID, true, 'token'), null)
  assert.equal(captchaError(true, 'token'), null)
  assert.equal(answeredByToken({ owner: 'captcha', message: CAPTCHA_PROMPT }), true)
  // A refusal must stay on screen when the widget hands over a fresh token.
  assert.equal(answeredByToken({ owner: 'captcha', message: CAPTCHA_FAILED }), false)
  assert.equal(answeredByToken({ owner: 'email', message: 'Enter a valid email address.' }), false)
  assert.equal(answeredByToken(null), false)
})

test('field errors come before the security check, as before', () => {
  // With no token and a bad email, the email is what is reported and marked.
  const error = signUp({ ...VALID, email: 'nope' }, true, null)
  assert.deepEqual(error, { owner: 'email', message: 'Enter a valid email address.' })
  assert.deepEqual(marked(error), ['email'])
  assert.equal(captchaInvalid(error), false)
})

test('a password problem marks only Password', () => {
  for (const password of ['', 'short', 'x'.repeat(LIMITS.passwordMax + 1)]) {
    const error = signUp({ ...VALID, password, confirm: password }, true, 'token')
    assert.equal(error?.owner, 'password', JSON.stringify(password))
    assert.deepEqual(marked(error), ['password'])
  }
  // Too short and different: length is reported first, and it is the password's.
  const both = newPasswordProblem('short', 'other')
  assert.equal(both?.owner, 'password')
  assert.deepEqual(marked(both), ['password'])
})

test('a confirmation that does not match marks only Confirm password', () => {
  const error = signUp({ ...VALID, confirm: 'a different password' }, true, 'token')
  assert.deepEqual(error, { owner: 'confirmPassword', message: 'The two passwords do not match.' })
  assert.deepEqual(marked(error), ['confirmPassword'])
  assert.deepEqual(marked(newPasswordProblem('a good password', '')), ['confirmPassword'])
})

test('an invalid email marks only Email', () => {
  for (const email of ['', 'student', 'student@', 'student@example', 'a b@example.com']) {
    const error = signUp({ ...VALID, email }, true, 'token')
    assert.equal(error?.owner, 'email', email)
    assert.deepEqual(marked(error), ['email'])
  }
})

test('an invalid name or phone marks only that field', () => {
  for (const fullName of ['', '   ', 'x'.repeat(LIMITS.name + 1)]) {
    assert.deepEqual(marked(signUp({ ...VALID, fullName }, true, 'token')), ['name'])
  }
  for (const phone of ['', 'call me', '123', '1'.repeat(40)]) {
    assert.deepEqual(marked(signUp({ ...VALID, phone }, true, 'token')), ['phone'])
  }
})

test('sign-up says exactly what it said before, in the same order', () => {
  // The previous inline chain, kept here as the reference.
  const before = (v: typeof VALID) => {
    const name = v.fullName.trim()
    return (
      (!name ? 'Enter your full name.' : null) ??
      (name.length > LIMITS.name ? `Keep your name under ${LIMITS.name} characters.` : null) ??
      phoneProblem(v.phone) ??
      (!looksLikeEmail(v.email) ? 'Enter a valid email address.' : null) ??
      passwordProblem(v.password, v.confirm)
    )
  }
  const names = ['', ' ', 'Test Student', 'x'.repeat(LIMITS.name + 1)]
  const phones = ['', 'abc', '+20 100 000 0000']
  const emails = ['', 'bad', 'student@example.com']
  const passwords: [string, string][] = [
    ['', ''],
    ['short', 'short'],
    ['a good password', 'a good password'],
    ['a good password', 'different one'],
  ]
  let cases = 0
  for (const fullName of names)
    for (const phone of phones)
      for (const email of emails)
        for (const [password, confirm] of passwords) {
          const values = { fullName, phone, email, password, confirm }
          const now = signUpFieldProblem(values)
          assert.equal(now?.message ?? null, before(values), JSON.stringify(values))
          // Whatever is reported marks at most one input.
          assert.ok(marked(now).length <= 1)
          cases++
        }
  assert.equal(cases, 144)
})

test('server answers about the request as a whole mark no input', () => {
  const requestErrors = [
    { status: 422, code: 'signup_disabled', message: 'Signups not allowed' },
    { status: 500, code: 'unexpected_failure', message: 'Database error saving new user' },
    { status: 429, code: 'over_request_rate_limit', message: 'rate limit' },
    { status: 503, message: 'upstream down' },
  ]
  for (const error of requestErrors) {
    const refused = signUpFailure(error)
    assert.equal(refused?.owner, 'form', error.message)
    assert.deepEqual(marked(refused), [])
  }
  // "That email and password do not match" is about the pair: neither is marked,
  // so the screen cannot hint at which one was wrong.
  const wrong = signInFailure({ status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' })
  assert.equal(wrong?.owner, 'form')
  assert.deepEqual(marked(wrong), [])
  for (const error of [
    { status: 400, code: 'email_not_confirmed', message: 'Email not confirmed' },
    { status: 429, message: 'rate limit' },
    { status: 500, message: 'x' },
  ]) {
    assert.deepEqual(marked(signInFailure(error)), [], error.message)
  }
  assert.deepEqual(marked(resetFailure({ status: 500, message: 'x' })), [])
  assert.deepEqual(marked(updatePasswordFailure({ status: 401, message: 'expired' })), [])
})

test('server answers about one field mark only that field', () => {
  const weak = signUpFailure({ status: 422, code: 'weak_password', message: 'Password is too weak' })
  assert.deepEqual(marked(weak), ['password'])
  for (const code of ['email_address_invalid', 'validation_failed']) {
    assert.deepEqual(marked(signUpFailure({ status: 400, code, message: 'x' })), ['email'], code)
  }
  for (const code of ['weak_password', 'same_password']) {
    assert.deepEqual(marked(updatePasswordFailure({ status: 422, code, message: 'x' })), ['password'], code)
  }
})

test('success is still success, and the non-disclosure answers are unchanged', () => {
  assert.equal(signUpFailure(null), null)
  assert.equal(signUpFailure({ status: 422, code: 'user_already_exists', message: 'User already registered' }), null)
  assert.equal(signInFailure(null), null)
  for (const error of [null, { status: 400, message: 'x' }, { status: 422, message: 'x' }, { status: 429, message: 'x' }]) {
    assert.equal(resetFailure(error), null)
  }
  assert.equal(updatePasswordFailure(null), null)
  const unknown = signInFailure({ status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' })
  const wrong = signInFailure({ status: 400, message: 'Invalid login credentials' })
  assert.deepEqual(unknown, wrong)
})
