'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { Turnstile, type TurnstileHandle } from '@/components/auth/Turnstile'
import { IS_CAPTCHA_CONFIGURED, answeredByToken, captchaError } from '@/lib/auth/captcha'
import { recoveryUrl, resolveDestination, loginFor } from '@/lib/auth/destinations'
import {
  LIMITS,
  captchaInvalid,
  fieldInvalid,
  looksLikeEmail,
  newPasswordProblem,
  resetFailure,
  updatePasswordFailure,
  type FormError,
} from '@/lib/auth/errors'
import { IS_SUPABASE_CONFIGURED, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env'
import {
  AuthAlert,
  AuthCard,
  AuthField,
  AuthSubmit,
  AuthSuccess,
  CardFoot,
  CardHeading,
  ContactLine,
  NotConfigured,
  PasswordField,
  PasswordRules,
} from './AuthCard'
import { AuthStage, StageIntro, StagePoints } from './AuthStage'

const RECOVERY_POINTS = [
  'The link works once, on this device, then expires',
  'Your new password works straight away',
  'Your account, your portal and your progress are untouched',
]

/** Which portal the reset was started from, read from `?for=` in the browser. */
function portalFromQuery(): '/student' | '/parent' {
  const value = new URLSearchParams(window.location.search).get('for')
  return value === 'parent' ? '/parent' : '/student'
}

/**
 * Step 1 — ask for a reset email.
 *
 * Always ends on the same "check your inbox" screen, whether or not the
 * address has an account (see resetOutcome). The link returns through the
 * callback, which sends it on to step 2.
 */
export function RequestPasswordReset() {
  const id = useId()
  const errorId = `${id}-error`
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  // The message and the one part of the form it is about (lib/auth/errors).
  const [error, setError] = useState<FormError | null>(null)
  const [done, setDone] = useState(false)
  const [back, setBack] = useState('/login/student')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captcha = useRef<TurnstileHandle>(null)

  useEffect(() => {
    // Deferred so no state is set synchronously while the effect runs.
    void Promise.resolve().then(() => setBack(loginFor(portalFromQuery())))
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!IS_SUPABASE_CONFIGURED || sending) return
    if (!looksLikeEmail(email)) {
      return setError({ owner: 'email', message: 'Enter the email address your account uses.' })
    }
    const missing = captchaError(IS_CAPTCHA_CONFIGURED, captchaToken)
    if (missing) return setError(missing)

    setError(null)
    setSending(true)
    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { error: failure } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: recoveryUrl(window.location.origin, portalFromQuery()),
      captchaToken: captchaToken ?? undefined,
    })
    captcha.current?.reset()
    setSending(false)
    const refused = resetFailure(failure)
    if (refused) return setError(refused)
    setDone(true)
  }

  return (
    <AuthStage
      intro={
        <StageIntro
          eyebrow="Account recovery"
          title="Back in, in two steps."
          lead="We email you a link. Open it on this device and choose a new password — that is all."
        />
      }
      detail={<StagePoints points={RECOVERY_POINTS} />}
    >
      <AuthCard>
        {!IS_SUPABASE_CONFIGURED ? (
          <>
            <CardHeading eyebrow="Step 1 of 2" title="Reset your password" />
            <NotConfigured what="Password reset" />
          </>
        ) : done ? (
          <>
            <AuthSuccess title="Check your inbox" tone="sky">
              If that address has an account, a reset link is on its way. Open it on this device — it
              works once and expires. If you asked a moment ago, wait a minute before asking again.
            </AuthSuccess>
            <CardFoot>
              <ContactLine lead="Nothing arrived? Check spam, then message" />
            </CardFoot>
          </>
        ) : (
          <>
            <CardHeading
              eyebrow="Step 1 of 2"
              title="Reset your password"
              lead="Enter the email address your account uses."
            />
            <form onSubmit={onSubmit} noValidate className="mt-6">
              <AuthField
                id={`${id}-email`}
                label="Email address"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                disabled={sending}
                invalid={fieldInvalid(error, 'email')}
                errorId={errorId}
                placeholder="you@example.com"
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (error) setError(null)
                }}
              />
              {IS_CAPTCHA_CONFIGURED ? (
                <Turnstile
                  ref={captcha}
                  action="recover"
                  className="mt-5"
                  invalid={captchaInvalid(error)}
                  errorId={errorId}
                  onToken={(value) => {
                    setCaptchaToken(value)
                    // Only the prompt is answered by a new token; see SignUpForm.
                    if (value) setError((current) => (answeredByToken(current) ? null : current))
                  }}
                />
              ) : null}
              <AuthAlert id={errorId} message={error?.message ?? null} />
              <AuthSubmit busy={sending} busyLabel="Sending…">
                Send reset link
              </AuthSubmit>
            </form>
          </>
        )}
        {done ? null : (
          <CardFoot>
            Remembered it?{' '}
            <Link href={back} className="link-underline font-semibold text-sky-700">
              Back to sign in
            </Link>
          </CardFoot>
        )}
      </AuthCard>
    </AuthStage>
  )
}

/**
 * Step 2 — choose the new password.
 *
 * Reached from the callback once the reset link has produced a session. That
 * session is what authorises the change; without one there is nothing to
 * update and the page says the link has expired. Afterwards the browser goes
 * to the allowlisted destination and middleware routes the account from
 * there, exactly as after any sign-in.
 */
export function UpdatePassword() {
  const id = useId()
  const errorId = `${id}-error`
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [sending, setSending] = useState(false)
  // The message and the one part of the form it is about (lib/auth/errors).
  const [error, setError] = useState<FormError | null>(null)
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    if (!IS_SUPABASE_CONFIGURED) return
    let cancelled = false
    void (async () => {
      const { createBrowserClient } = await import('@supabase/ssr')
      const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      // Verified with the auth server, not read from the cookie.
      const { data } = await supabase.auth.getUser()
      if (!cancelled) setHasSession(Boolean(data.user))
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!IS_SUPABASE_CONFIGURED || sending) return
    const problem = newPasswordProblem(password, confirm)
    if (problem) return setError(problem)

    setError(null)
    setSending(true)
    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { error: failure } = await supabase.auth.updateUser({ password })
    const refused = updatePasswordFailure(failure)
    if (refused) {
      setSending(false)
      return setError(refused)
    }
    window.location.replace(
      resolveDestination(new URLSearchParams(window.location.search).get('next')),
    )
  }

  return (
    <AuthStage
      intro={
        <StageIntro
          eyebrow="Account recovery"
          title="Choose a new password."
          lead="Something you will remember and nobody could guess. It replaces your old password as soon as you save it."
        />
      }
      detail={<StagePoints points={RECOVERY_POINTS} />}
    >
      <AuthCard>
        <CardHeading eyebrow="Step 2 of 2" title="Your new password" />
        {!IS_SUPABASE_CONFIGURED ? (
          <NotConfigured what="Password reset" />
        ) : hasSession === null ? (
          <p className="mt-6 flex items-center gap-2 text-sm text-deep-500" role="status">
            Checking your reset link…
          </p>
        ) : !hasSession ? (
          <div className="mt-6 rounded-card border border-deep-100 bg-mist px-4 py-4" role="status">
            <p className="font-display text-base font-bold text-deep-700">This reset link has expired</p>
            <p className="mt-1.5 text-sm leading-relaxed text-deep-600">
              Reset links work once and expire. Request a new one and open it a single time.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
            <PasswordField
              id={`${id}-password`}
              label="New password"
              name="new-password"
              autoComplete="new-password"
              required
              value={password}
              disabled={sending}
              invalid={fieldInvalid(error, 'password')}
              errorId={errorId}
              onChange={(event) => {
                setPassword(event.target.value)
                if (error) setError(null)
              }}
            />
            <PasswordField
              id={`${id}-confirm`}
              label="Confirm new password"
              name="confirm-password"
              autoComplete="new-password"
              required
              value={confirm}
              disabled={sending}
              invalid={fieldInvalid(error, 'confirmPassword')}
              errorId={errorId}
              hint={<PasswordRules password={password} confirm={confirm} min={LIMITS.passwordMin} />}
              onChange={(event) => {
                setConfirm(event.target.value)
                if (error) setError(null)
              }}
            />
            <AuthAlert id={errorId} message={error?.message ?? null} />
            <AuthSubmit busy={sending} busyLabel="Saving…">
              Save new password
            </AuthSubmit>
          </form>
        )}
        <CardFoot>
          Link expired?{' '}
          <Link href="/account/reset-password" className="link-underline font-semibold text-sky-700">
            Request a new one
          </Link>
        </CardFoot>
      </AuthCard>
    </AuthStage>
  )
}
