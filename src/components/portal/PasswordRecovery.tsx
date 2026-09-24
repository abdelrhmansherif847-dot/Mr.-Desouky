'use client'

import { useEffect, useId, useState } from 'react'
import { Button, ArrowRight } from '@/components/ui/Button'
import { recoveryUrl, resolveDestination, loginFor } from '@/lib/auth/destinations'
import {
  LIMITS,
  looksLikeEmail,
  passwordProblem,
  resetOutcome,
  updatePasswordOutcome,
} from '@/lib/auth/errors'
import { IS_SUPABASE_CONFIGURED, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env'
import { AccountFormShell, Done, Field, FormError, NotConfigured, TextLink } from './AccountForm'

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
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [back, setBack] = useState('/login/student')

  useEffect(() => {
    // Deferred so no state is set synchronously while the effect runs.
    void Promise.resolve().then(() => setBack(loginFor(portalFromQuery())))
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!IS_SUPABASE_CONFIGURED || sending) return
    if (!looksLikeEmail(email)) return setError('Enter the email address your account uses.')

    setError(null)
    setSending(true)
    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { error: failure } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: recoveryUrl(window.location.origin, portalFromQuery()),
    })
    setSending(false)
    const outcome = resetOutcome(failure)
    if (!outcome.ok) return setError(outcome.message)
    setDone(true)
  }

  return (
    <AccountFormShell
      eyebrow="Account"
      title="Reset your password"
      lead="Enter the email address your account uses and we will send you a link to choose a new password."
      footer={
        <>
          Remembered it? <TextLink href={back}>Back to sign in</TextLink>
        </>
      }
    >
      {!IS_SUPABASE_CONFIGURED ? (
        <NotConfigured />
      ) : done ? (
        <Done title="Check your inbox">
          If that address has an account, a reset link is on its way. Open it on this device — it
          works once and expires. If you asked a moment ago, wait a minute before asking again.
        </Done>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <Field
            id={`${id}-email`}
            label="Email address"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            disabled={sending}
            invalid={Boolean(error)}
            describedBy={errorId}
            onChange={(event) => setEmail(event.target.value)}
          />
          <FormError id={errorId} message={error} />
          <Button type="submit" size="lg" disabled={sending} className="mt-6 w-full">
            {sending ? 'Sending…' : 'Send reset link'}
            {sending ? null : <ArrowRight />}
          </Button>
        </form>
      )}
    </AccountFormShell>
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
  const [error, setError] = useState<string | null>(null)
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
    const problem = passwordProblem(password, confirm)
    if (problem) return setError(problem)

    setError(null)
    setSending(true)
    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { error: failure } = await supabase.auth.updateUser({ password })
    const outcome = updatePasswordOutcome(failure)
    if (!outcome.ok) {
      setSending(false)
      return setError(outcome.message)
    }
    window.location.replace(
      resolveDestination(new URLSearchParams(window.location.search).get('next')),
    )
  }

  return (
    <AccountFormShell
      eyebrow="Account"
      title="Choose a new password"
      footer={
        <>
          Link expired? <TextLink href="/account/reset-password">Request a new one</TextLink>
        </>
      }
    >
      {!IS_SUPABASE_CONFIGURED ? (
        <NotConfigured />
      ) : hasSession === null ? (
        <p className="text-sm text-deep-500">One moment…</p>
      ) : !hasSession ? (
        <Done title="This reset link has expired">
          Reset links work once and expire. Request a new one and open it a single time.
        </Done>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <Field
            id={`${id}-password`}
            label="New password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            disabled={sending}
            invalid={Boolean(error)}
            describedBy={errorId}
            hint={`At least ${LIMITS.passwordMin} characters.`}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Field
            id={`${id}-confirm`}
            label="Confirm new password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            disabled={sending}
            invalid={Boolean(error)}
            describedBy={errorId}
            onChange={(event) => setConfirm(event.target.value)}
          />
          <FormError id={errorId} message={error} />
          <Button type="submit" size="lg" disabled={sending} className="mt-6 w-full">
            {sending ? 'Saving…' : 'Save new password'}
            {sending ? null : <ArrowRight />}
          </Button>
        </form>
      )}
    </AccountFormShell>
  )
}
