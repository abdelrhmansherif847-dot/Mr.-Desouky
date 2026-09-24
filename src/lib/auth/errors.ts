/**
 * What the account forms say when Supabase refuses something.
 *
 * The rule is non-disclosure: no message may differ depending on whether an
 * email address has an account. So "no such user" and "wrong password" read
 * the same, and a sign-up for an address that already exists reads exactly
 * like a new one (Supabase itself returns a look-alike success in that case,
 * and user_already_exists is folded into the same answer below for when
 * email confirmation is turned off).
 *
 * Messages that are about the request rather than the address — a weak
 * password, an invalid email format, a global rate limit, registration being
 * closed — are safe to show and are shown, because hiding them only makes the
 * form look broken.
 */

export type AuthFailure = { status?: number; code?: string; message: string } | null

/** Supabase's answer when the token is missing, expired, reused or invalid. */
export function isCaptchaFailure(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return error.code === 'captcha_failed' || /captcha/i.test(error.message ?? '')
}

export const CAPTCHA_FAILED = 'The security check did not go through. Please try it again.'

export type Outcome = { ok: true } | { ok: false; message: string }

const TRY_AGAIN = 'Something went wrong on our side. Please try again in a moment.'

/** Password sign-in. */
export function signInOutcome(error: AuthFailure): Outcome {
  if (!error) return { ok: true }
  // Checked first: Supabase refuses a bad CAPTCHA with a 400 too, before it
  // has looked at the address, so it must not read as a credential failure.
  if (isCaptchaFailure(error)) return { ok: false, message: CAPTCHA_FAILED }
  if (error.code === 'invalid_credentials' || error.status === 400) {
    return { ok: false, message: 'That email and password do not match an account.' }
  }
  // Only reachable with the right password, so it tells nobody anything new.
  if (error.code === 'email_not_confirmed') {
    return {
      ok: false,
      message: 'Confirm your email address first, using the link we sent when you signed up.',
    }
  }
  if (error.status === 429) {
    return { ok: false, message: 'Too many attempts. Please wait a few minutes and try again.' }
  }
  return { ok: false, message: TRY_AGAIN }
}

/** Account creation. `ok` means "tell them to check their inbox". */
export function signUpOutcome(error: AuthFailure): Outcome {
  if (isCaptchaFailure(error)) return { ok: false, message: CAPTCHA_FAILED }
  if (!error || error.code === 'user_already_exists') return { ok: true }
  // Closed at the dashboard (signup_disabled) or in the database, where the
  // trigger's refusal surfaces as a generic 500 "Database error saving new
  // user". Both are global, so saying so reveals nothing about the address.
  if (
    error.code === 'signup_disabled' ||
    (error.status === 500 && /database error saving new user/i.test(error.message))
  ) {
    return { ok: false, message: 'Registration is not open yet. Please check back soon.' }
  }
  if (error.code === 'weak_password') {
    return { ok: false, message: 'Choose a stronger password — longer, and less predictable.' }
  }
  if (error.code === 'email_address_invalid' || error.code === 'validation_failed') {
    return { ok: false, message: 'Enter a valid email address.' }
  }
  if (error.status === 429) {
    return { ok: false, message: 'Too many attempts. Please wait a few minutes and try again.' }
  }
  return { ok: false, message: TRY_AGAIN }
}

/**
 * Password-reset request. Always "check your inbox", including for a rate
 * limit: Supabase's 60-second limit on a repeat request is per account, so
 * reporting it would confirm that the address has one.
 */
export function resetOutcome(error: AuthFailure): Outcome {
  // Before the 400 rule below: a refused CAPTCHA means no email was sent,
  // and it is decided before the address is looked at, so saying so is safe.
  if (isCaptchaFailure(error)) return { ok: false, message: CAPTCHA_FAILED }
  if (!error || error.status === 400 || error.status === 422 || error.status === 429) {
    return { ok: true }
  }
  return { ok: false, message: TRY_AGAIN }
}

/** Setting a new password with a recovery session. */
export function updatePasswordOutcome(error: AuthFailure): Outcome {
  if (!error) return { ok: true }
  if (error.code === 'weak_password') {
    return { ok: false, message: 'Choose a stronger password — longer, and less predictable.' }
  }
  if (error.code === 'same_password') {
    return { ok: false, message: 'Choose a password different from your current one.' }
  }
  if (error.status === 401 || error.code === 'session_not_found' || error.code === 'session_expired') {
    return {
      ok: false,
      message: 'This reset link has expired. Request a new one and open it a single time.',
    }
  }
  return { ok: false, message: TRY_AGAIN }
}

/**
 * Field checks before anything is sent. The database caps name and phone
 * again (migration 0005); these exist to give a clear message first.
 */
export const LIMITS = { name: 120, phone: 32, passwordMin: 8, passwordMax: 72 } as const

export function passwordProblem(password: string, confirm: string): string | null {
  if (password.length < LIMITS.passwordMin) {
    return `Use at least ${LIMITS.passwordMin} characters for your password.`
  }
  // bcrypt, which Supabase uses, ignores everything past 72 bytes.
  if (new TextEncoder().encode(password).length > LIMITS.passwordMax) {
    return 'That password is too long. Use 72 characters or fewer.'
  }
  if (password !== confirm) return 'The two passwords do not match.'
  return null
}

export function phoneProblem(phone: string): string | null {
  const trimmed = phone.trim()
  if (!trimmed) return 'Enter a phone number Mr. Desouky can reach you on.'
  if (trimmed.length > LIMITS.phone || !/^\+?[\d\s()-]+$/.test(trimmed)) {
    return 'Enter the phone number using digits only (a leading + is fine).'
  }
  const digits = trimmed.replace(/\D/g, '').length
  if (digits < 7 || digits > 15) return 'That phone number looks too short or too long.'
  return null
}

export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/**
 * Emailed sign-in link. A 400 is how an unknown address answers, so it is
 * reported as sent; a refused CAPTCHA is not, because nothing was sent and
 * the refusal happened before the address was looked at.
 */
export function magicLinkOutcome(error: AuthFailure): Outcome | 'sent' {
  if (isCaptchaFailure(error)) return { ok: false, message: CAPTCHA_FAILED }
  if (!error || error.status === 400) return 'sent'
  return { ok: false, message: error.message }
}

/*
 * Who an error belongs to.
 *
 * Every form shows one error line, and that line always has an owner: the
 * one input it is about, the security check, or the form as a whole. Only
 * the input that owns the error is marked invalid (red border, aria-invalid).
 * A missing or refused CAPTCHA, and anything the server says about the
 * request as a whole, never marks an input — the name, email and passwords
 * were fine, and painting them red says otherwise.
 *
 * The words are unchanged; the functions below only decide who owns them.
 */

/** Inputs that can be marked invalid. */
export type FieldName = 'name' | 'phone' | 'email' | 'password' | 'confirmPassword'

/** Everything an error can belong to. 'captcha' and 'form' never mark an input. */
export type ErrorOwner = FieldName | 'captcha' | 'form'

export type FormError = { owner: ErrorOwner; message: string }

/** Whether this input is the one the current error is about. */
export function fieldInvalid(error: FormError | null, field: FieldName): boolean {
  return error !== null && error.owner === field
}

/** Whether the current error is about the security check. */
export function captchaInvalid(error: FormError | null): boolean {
  return error !== null && error.owner === 'captcha'
}

/**
 * A new password and its confirmation, with passwordProblem's words. Length
 * belongs to the password; a mismatch belongs to the confirmation, because
 * the password itself is fine.
 */
export function newPasswordProblem(password: string, confirm: string): FormError | null {
  const message = passwordProblem(password, confirm)
  if (!message) return null
  // Compared with itself, the password only fails on its own length. Whatever
  // is left is the two not matching.
  const own = passwordProblem(password, password)
  return { owner: own ? 'password' : 'confirmPassword', message }
}

/**
 * Sign-up's own fields, in the order and with the words the form always
 * used. The security check comes after these (lib/auth/captcha).
 */
export function signUpFieldProblem(values: {
  fullName: string
  phone: string
  email: string
  password: string
  confirm: string
}): FormError | null {
  const name = values.fullName.trim()
  if (!name) return { owner: 'name', message: 'Enter your full name.' }
  if (name.length > LIMITS.name) {
    return { owner: 'name', message: `Keep your name under ${LIMITS.name} characters.` }
  }
  const phone = phoneProblem(values.phone)
  if (phone) return { owner: 'phone', message: phone }
  if (!looksLikeEmail(values.email)) return { owner: 'email', message: 'Enter a valid email address.' }
  return newPasswordProblem(values.password, values.confirm)
}

/** signUpOutcome with an owner. Null means "check your inbox". */
export function signUpFailure(error: AuthFailure): FormError | null {
  const outcome = signUpOutcome(error)
  if (outcome.ok) return null
  if (isCaptchaFailure(error)) return { owner: 'captcha', message: outcome.message }
  if (error?.code === 'weak_password') return { owner: 'password', message: outcome.message }
  if (error?.code === 'email_address_invalid' || error?.code === 'validation_failed') {
    return { owner: 'email', message: outcome.message }
  }
  return { owner: 'form', message: outcome.message }
}

/**
 * signInOutcome with an owner. "That email and password do not match" is
 * about the pair — marking either one alone would hint at which was wrong —
 * so it belongs to the form.
 */
export function signInFailure(error: AuthFailure): FormError | null {
  const outcome = signInOutcome(error)
  if (outcome.ok) return null
  return { owner: isCaptchaFailure(error) ? 'captcha' : 'form', message: outcome.message }
}

/** resetOutcome with an owner. Null means "check your inbox". */
export function resetFailure(error: AuthFailure): FormError | null {
  const outcome = resetOutcome(error)
  if (outcome.ok) return null
  return { owner: isCaptchaFailure(error) ? 'captcha' : 'form', message: outcome.message }
}

/** updatePasswordOutcome with an owner. */
export function updatePasswordFailure(error: AuthFailure): FormError | null {
  const outcome = updatePasswordOutcome(error)
  if (outcome.ok) return null
  const aboutPassword = error?.code === 'weak_password' || error?.code === 'same_password'
  return { owner: aboutPassword ? 'password' : 'form', message: outcome.message }
}
