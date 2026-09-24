'use client'

import { useId, useRef, useState } from 'react'
import Link from 'next/link'
import { Turnstile, type TurnstileHandle } from '@/components/auth/Turnstile'
import { CAPTCHA_PROMPT, IS_CAPTCHA_CONFIGURED, captchaProblem } from '@/lib/auth/captcha'
import { callbackUrl } from '@/lib/auth/destinations'
import { CAPTCHA_FAILED, isCaptchaFailure, looksLikeEmail, signInOutcome } from '@/lib/auth/errors'
import { IS_SUPABASE_CONFIGURED, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env'
import type { Audience } from './audience'
import { AUDIENCE } from './audience'
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
} from './AuthCard'

type Status = 'idle' | 'sending' | 'sent' | 'error'
type Mode = 'password' | 'link'

/**
 * The sign-in card.
 *
 * Email and password first. The emailed one-time link stays available one
 * click away, for anyone without a password yet and as a fallback; the owner
 * signs in with it from /admin/login, which is unchanged.
 *
 * After a password sign-in the browser goes to this portal's address and
 * middleware decides from there — approved accounts land in their portal,
 * pending and suspended ones on their notice, the owner in /admin. The card
 * never decides access itself.
 *
 * Behaviours that must not be "tidied":
 *
 *   A wrong password and an unknown address produce the same message (see
 *   lib/auth/errors), so this screen cannot be used to discover who has an
 *   account.
 *
 *   shouldCreateUser: false — the link form never creates an account. Sign-up
 *   has its own screen, and the database decides whether it is open.
 *
 *   For the link, a 400 is reported as success — that is how an unknown
 *   address answers. A rate limit or an outage is shown, because it says
 *   nothing about any particular address.
 */
export function PortalSignInCard({
  audience,
  onAudienceChange,
}: {
  audience: Audience
  onAudienceChange: (next: Audience) => void
}) {
  const copy = AUDIENCE[audience]
  const fieldId = useId()
  const passwordId = `${fieldId}-password`
  const errorId = `${fieldId}-error`

  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [notice, setNotice] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captcha = useRef<TurnstileHandle>(null)

  const invalid = status === 'error'

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!IS_SUPABASE_CONFIGURED || status === 'sending') return

    const address = email.trim()
    if (!looksLikeEmail(address)) {
      setNotice('Enter the email address your account uses.')
      setStatus('error')
      inputRef.current?.focus()
      return
    }
    if (mode === 'password' && !password) {
      setNotice('Enter your password.')
      setStatus('error')
      passwordRef.current?.focus()
      return
    }
    // Only when a site key is configured: then Supabase requires a token too.
    const missing = captchaProblem(IS_CAPTCHA_CONFIGURED, captchaToken)
    if (missing) {
      setNotice(missing)
      setStatus('error')
      return
    }

    setNotice(null)
    setStatus('sending')
    const token = captchaToken ?? undefined
    // A token works once, whatever the outcome; ask for a fresh one now.
    captcha.current?.reset()

    // Loaded on submit, not on render. The auth library is ~260KB raw and is
    // useless until someone actually signs in, so keeping it out of the
    // initial payload leaves these public pages as light as the rest of the
    // site. The wait is hidden by the sending state that is already showing.
    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    if (mode === 'password') {
      const { error } = await supabase.auth.signInWithPassword({
        email: address,
        password,
        options: { captchaToken: token },
      })
      const outcome = signInOutcome(error)
      if (outcome.ok) {
        // A full navigation, so the request carries the new session cookies
        // and middleware routes this account to where it belongs.
        window.location.replace(copy.destination)
        return
      }
      setPassword('')
      setNotice(outcome.message)
      setStatus('error')
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: address,
      options: {
        emailRedirectTo: callbackUrl(window.location.origin, copy.destination),
        shouldCreateUser: false,
        captchaToken: token,
      },
    })

    // Before the 400 rule: a refused CAPTCHA means nothing was sent, and it is
    // decided before the address is looked at, so it reveals nothing.
    if (isCaptchaFailure(error)) {
      setNotice(CAPTCHA_FAILED)
      setStatus('error')
      return
    }
    if (!error || error.status === 400) {
      setStatus('sent')
      return
    }

    setNotice(
      error.status === 429
        ? `${error.message.replace(/[.\s]*$/, '')}. The sign-in sender allows only a few emails per hour.`
        : error.message,
    )
    setStatus('error')
  }

  const switchMode = () => {
    setMode(mode === 'password' ? 'link' : 'password')
    setNotice(null)
    setStatus('idle')
  }

  return (
    <AuthCard>
      {status === 'sent' ? (
        <SentState audience={audience} email={email} onReset={() => setStatus('idle')} />
      ) : (
        <>
          <AudienceSwitch audience={audience} onChange={onAudienceChange} />

          {/* Only the words are handed over. The form below sits outside this
              wrapper on purpose: it is never keyed and never remounted, so
              whatever has been typed survives the switch. */}
          <AudienceSwap
            audience={audience}
            className="mt-6"
            render={(value) => (
              <>
                <p className="eyebrow text-sky-700">{AUDIENCE[value].eyebrow}</p>
                <h2 className="mt-2 font-display text-xl font-bold text-deep-700">Sign in</h2>
                <p className="mt-2 text-sm leading-relaxed text-deep-500">{AUDIENCE[value].cardLead}</p>
              </>
            )}
          />

          {!IS_SUPABASE_CONFIGURED ? (
            <NotConfigured />
          ) : (
            <form onSubmit={onSubmit} noValidate className="mt-6">
              <AuthField
                ref={inputRef}
                id={fieldId}
                label="Email address"
                name="email"
                type="email"
                inputMode="email"
                autoComplete={mode === 'password' ? 'username' : 'email'}
                enterKeyHint={mode === 'password' ? 'next' : 'go'}
                required
                value={email}
                invalid={invalid}
                errorId={errorId}
                disabled={status === 'sending'}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (status === 'error') setStatus('idle')
                }}
                placeholder="you@example.com"
              />

              {/* The password row folds away rather than vanishing, so
                  choosing the emailed link does not make the card jump. */}
              <div
                className={
                  'grid transition-[grid-template-rows,opacity] duration-[420ms] ease-calm motion-reduce:transition-none ' +
                  (mode === 'password' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')
                }
                inert={mode !== 'password'}
              >
                <div className="overflow-hidden">
                  {mode === 'password' ? (
                    <PasswordField
                      ref={passwordRef}
                      id={passwordId}
                      label="Password"
                      name="password"
                      autoComplete="current-password"
                      enterKeyHint="go"
                      required
                      value={password}
                      invalid={invalid}
                      errorId={errorId}
                      disabled={status === 'sending'}
                      className="mt-4"
                      aside={
                        <Link
                          href={`/account/reset-password?for=${audience}`}
                          className="link-underline text-xs font-semibold text-sky-700"
                        >
                          Forgot password?
                        </Link>
                      }
                      onChange={(event) => {
                        setPassword(event.target.value)
                        if (status === 'error') setStatus('idle')
                      }}
                    />
                  ) : null}
                </div>
              </div>

              {IS_CAPTCHA_CONFIGURED ? (
                <Turnstile
                  ref={captcha}
                  action="login"
                  className="mt-5"
                  onToken={(value) => {
                    setCaptchaToken(value)
                    // Only the prompt is answered by a new token; see SignUpForm.
                    if (value && status === 'error' && notice === CAPTCHA_PROMPT) setStatus('idle')
                  }}
                />
              ) : null}

              <AuthAlert id={errorId} message={invalid ? notice : null} />

              <AuthSubmit
                busy={status === 'sending'}
                busyLabel={mode === 'password' ? 'Signing you in…' : 'Sending your link…'}
              >
                {mode === 'password' ? 'Sign in' : 'Email me a sign-in link'}
              </AuthSubmit>

              <p className="mt-4 text-xs leading-relaxed text-deep-500">
                {mode === 'password'
                  ? 'No password yet, or prefer not to type it? '
                  : 'A one-time link is sent to your inbox. It works once and expires. '}
                <button
                  type="button"
                  disabled={status === 'sending'}
                  onClick={switchMode}
                  className="link-underline font-semibold text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                >
                  {mode === 'password' ? 'Email me a sign-in link instead' : 'Use my password instead'}
                </button>
              </p>
            </form>
          )}

          <Footnote audience={audience} />
        </>
      )}
    </AuthCard>
  )
}

/** The emailed link is on its way. */
function SentState({
  audience,
  email,
  onReset,
}: {
  audience: Audience
  email: string
  onReset: () => void
}) {
  return (
    <>
      <AuthSuccess title="Check your inbox">
        If <span className="font-semibold text-deep-700">{email}</span> can sign in, a one-time link is
        on its way. Open it on this device — it works once and expires.
      </AuthSuccess>
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onReset}
          className="link-underline text-sm font-semibold text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        >
          Use a different address
        </button>
      </div>
      <CardFoot>
        <ContactLine lead="Nothing arrived? Check spam, then message" />
      </CardFoot>
      <p className="sr-only" role="status">
        Sign-in link requested for {audience} portal.
      </p>
    </>
  )
}

/** Honest about how accounts come to exist, without making it the headline. */
function Footnote({ audience }: { audience: Audience }) {
  const copy = AUDIENCE[audience]
  return (
    <CardFoot>
      <p>
        New here?{' '}
        <Link href={`/signup/${audience}`} className="link-underline font-semibold text-sky-700">
          Create a {audience} account
        </Link>
        . Every account is approved by Eng. Abdelrhman Desouky before it opens.
      </p>
      <Link
        href={copy.previewHref}
        className="link-underline mt-3 inline-block py-1 text-xs font-semibold text-deep-600 hover:text-sky-700"
      >
        Explore the {audience} portal with sample data
      </Link>
    </CardFoot>
  )
}
