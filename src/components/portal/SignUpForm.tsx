'use client'

import { useId, useRef, useState } from 'react'
import Link from 'next/link'
import { Turnstile, type TurnstileHandle } from '@/components/auth/Turnstile'
import { CAPTCHA_PROMPT, IS_CAPTCHA_CONFIGURED, signUpCaptchaProblem } from '@/lib/auth/captcha'
import { callbackUrl } from '@/lib/auth/destinations'
import {
  LIMITS,
  looksLikeEmail,
  passwordProblem,
  phoneProblem,
  signUpOutcome,
} from '@/lib/auth/errors'
import { IS_SUPABASE_CONFIGURED, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env'
import { AccountPath } from './AccountPath'
import { AUDIENCE, type Audience } from './audience'
import { AudienceSwap } from './AudienceSwap'
import { AudienceSwitch } from './AudienceSwitch'
import {
  AuthAlert,
  AuthCard,
  AuthField,
  AuthSubmit,
  AuthSuccess,
  CardFoot,
  ContactLine,
  NotConfigured,
  PasswordField,
  PasswordRules,
} from './AuthCard'
import { AuthStage, StageIntro } from './AuthStage'

/**
 * Create an account.
 *
 * What this form sends is a request, not a grant. `intended_role` is only a
 * preference: the database (migration 0005) turns anything but the exact
 * string 'parent' into 'student', never creates owner or assistant, and
 * always writes status 'pending'. Nothing opens until the owner approves the
 * account and, for a parent, links it to a student. Whether sign-up is open
 * at all is decided in the database too (private.auth_settings), not here.
 *
 * A CAPTCHA result is required before anything is sent (lib/auth/captcha):
 * with no site key configured, or no token yet, the request is never made.
 * Supabase then verifies the token itself, so the check cannot be skipped by
 * calling the API directly.
 *
 * Every successful submission shows the same "check your inbox" screen,
 * including for an address that already has an account, so the form cannot
 * be used to discover who is registered.
 *
 * Student / Parent is state, exactly as on the sign-in screen: one form, never
 * keyed or remounted, so everything typed survives a change of mind. The
 * address stays where it was for the same measured reason (see PortalAuth).
 * Whichever is selected when the form is sent is what is requested.
 */
export function SignUpForm({ audience: initial }: { audience: Audience }) {
  const [audience, setAudience] = useState<Audience>(initial)
  const copy = AUDIENCE[audience]
  const id = useId()
  const errorId = `${id}-error`

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captcha = useRef<TurnstileHandle>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!IS_SUPABASE_CONFIGURED || sending) return

    const name = fullName.trim()
    const problem =
      (!name ? 'Enter your full name.' : null) ??
      (name.length > LIMITS.name ? `Keep your name under ${LIMITS.name} characters.` : null) ??
      phoneProblem(phone) ??
      (!looksLikeEmail(email) ? 'Enter a valid email address.' : null) ??
      passwordProblem(password, confirm) ??
      signUpCaptchaProblem(IS_CAPTCHA_CONFIGURED, captchaToken)
    if (problem) return setError(problem)

    setError(null)
    setSending(true)

    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { error: failure } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // The confirmation link comes back through the callback, then to this
        // portal's address, where middleware shows the pending notice.
        emailRedirectTo: callbackUrl(window.location.origin, copy.destination),
        data: {
          full_name: name,
          phone: phone.trim(),
          intended_role: audience,
        },
        // Verified by Supabase before it looks at anything else.
        captchaToken: captchaToken ?? undefined,
      },
    })

    // A token works once, whatever the outcome.
    captcha.current?.reset()
    setSending(false)
    const outcome = signUpOutcome(failure)
    if (!outcome.ok) return setError(outcome.message)
    setPassword('')
    setConfirm('')
    setDone(true)
  }

  const invalid = Boolean(error)
  const clear = () => {
    if (error) setError(null)
  }

  return (
    <AuthStage
      intro={
        <AudienceSwap
          audience={audience}
          render={(value) => (
            <StageIntro
              eyebrow={AUDIENCE[value].signup.eyebrow}
              title={AUDIENCE[value].signup.heading}
              lead={AUDIENCE[value].signup.lead}
            />
          )}
        />
      }
      detail={
        <div className="border-t border-white/10 pt-7">
          <p className="eyebrow text-sky-300">What happens next</p>
          <AudienceSwap
            audience={audience}
            className="mt-5"
            render={(value) => <AccountPath audience={value} current={done ? 1 : 0} />}
          />
        </div>
      }
    >
      <AuthCard>
        {done ? (
          <>
            <AuthSuccess title="Check your inbox">
              If this address can be registered, a confirmation link is on its way. Open it on this
              device. Once confirmed, your account waits for approval — you can sign in as soon as it
              has been approved.
            </AuthSuccess>
            <CardFoot>
              <ContactLine lead="Nothing arrived? Check spam, then message" />
            </CardFoot>
          </>
        ) : (
          <>
            <AudienceSwitch audience={audience} onChange={setAudience} />
            <AudienceSwap
              audience={audience}
              className="mt-6"
              render={(value) => (
                <>
                  <p className="eyebrow text-sky-700">{AUDIENCE[value].eyebrow}</p>
                  <h2 className="mt-2 font-display text-xl font-bold text-deep-700">
                    {AUDIENCE[value].signup.cardTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-deep-500">
                    {AUDIENCE[value].signup.cardLead}
                  </p>
                </>
              )}
            />

            {!IS_SUPABASE_CONFIGURED ? (
              <NotConfigured what="Registration" />
            ) : (
              <form onSubmit={onSubmit} noValidate className="mt-6">
                <fieldset disabled={sending} className="space-y-4">
                  <legend className="sr-only">About you</legend>
                  <AuthField
                    id={`${id}-name`}
                    label="Full name"
                    name="name"
                    autoComplete="name"
                    maxLength={LIMITS.name}
                    required
                    value={fullName}
                    invalid={invalid}
                    errorId={errorId}
                    onChange={(event) => {
                      setFullName(event.target.value)
                      clear()
                    }}
                  />
                  <AuthField
                    id={`${id}-phone`}
                    label="Phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={LIMITS.phone}
                    required
                    value={phone}
                    invalid={invalid}
                    errorId={errorId}
                    hint="So Mr. Desouky can reach you. It is never used to sign in."
                    onChange={(event) => {
                      setPhone(event.target.value)
                      clear()
                    }}
                  />
                </fieldset>

                <fieldset disabled={sending} className="mt-6 space-y-4 border-t border-deep-100 pt-6">
                  <legend className="sr-only">Your sign-in</legend>
                  <AuthField
                    id={`${id}-email`}
                    label="Email address"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    invalid={invalid}
                    errorId={errorId}
                    placeholder="you@example.com"
                    onChange={(event) => {
                      setEmail(event.target.value)
                      clear()
                    }}
                  />
                  <PasswordField
                    id={`${id}-password`}
                    label="Password"
                    name="new-password"
                    autoComplete="new-password"
                    required
                    value={password}
                    invalid={invalid}
                    errorId={errorId}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      clear()
                    }}
                  />
                  <PasswordField
                    id={`${id}-confirm`}
                    label="Confirm password"
                    name="confirm-password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    invalid={invalid}
                    errorId={errorId}
                    hint={<PasswordRules password={password} confirm={confirm} min={LIMITS.passwordMin} />}
                    onChange={(event) => {
                      setConfirm(event.target.value)
                      clear()
                    }}
                  />
                </fieldset>

                {IS_CAPTCHA_CONFIGURED ? (
                  <Turnstile
                    ref={captcha}
                    action="signup"
                    className="mt-6 border-t border-deep-100 pt-6"
                    onToken={(token) => {
                      setCaptchaToken(token)
                      // A fresh token answers the prompt, and nothing else: it
                      // also arrives right after a refused request, whose
                      // message must stay on screen.
                      if (token) setError((current) => (current === CAPTCHA_PROMPT ? null : current))
                    }}
                  />
                ) : null}

                <AuthAlert id={errorId} message={error} />

                <AuthSubmit busy={sending} busyLabel="Creating your account…">
                  Create account
                </AuthSubmit>
              </form>
            )}

            <CardFoot>
              Already have an account?{' '}
              <Link href={`/login/${audience}`} className="link-underline font-semibold text-sky-700">
                Sign in
              </Link>
            </CardFoot>
          </>
        )}
      </AuthCard>
    </AuthStage>
  )
}
